import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { addXP } from '../services/gamificationService';
import ReportButton from '../components/ReportButton';

const SentencePuzzlePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [userSelections, setUserSelections] = useState<string[]>([]);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [currentLevel, setCurrentLevel] = useState('N5');
    const [preferredLang, setPreferredLang] = useState('English');
    const [overallProgress, setOverallProgress] = useState({ learned: 0, total: 0 });
    const [totalDueToday, setTotalDueToday] = useState(0);
    const [reviewedTodayCount, setReviewedTodayCount] = useState(0);
    const [failedIdsInSession] = useState<Set<string>>(new Set());
    const [lastGainedXP, setLastGainedXP] = useState<number | null>(null);
    const [xpNotificationKey, setXpNotificationKey] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        initQuiz();
    }, [searchParams]);

    const initQuiz = async () => {
        setLoading(true);
        const mode = searchParams.get('mode');
        setIsReviewMode(mode === 'review');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/');
            return;
        }

        const { data: profile } = await supabase.from('profiles').select('current_level, preferred_language, daily_puzzle_goal, show_puzzle_distractors, puzzle_category').eq('id', user.id).single();
        const level = profile?.current_level || 'N5';
        const goal = profile?.daily_puzzle_goal || 10;
        const showDistractors = profile?.show_puzzle_distractors !== false;
        const category = profile?.puzzle_category || '综合';

        // Fetch reporting threshold
        const { data: config } = await supabase.from('system_config').select('value').eq('key', 'report_hide_threshold').single();
        const threshold = parseInt(config?.value as string) || 50;

        setCurrentLevel(level);
        setPreferredLang(profile?.preferred_language || 'English');

        const now = new Date().toISOString();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        let questionData: any[] = [];

        if (mode === 'review') {
            const { data: dueProgress } = await supabase
                .from('user_sentence_puzzle_progress')
                .select('puzzle_id, next_review_at')
                .eq('user_id', user.id)
                .lte('next_review_at', now);

            const { count: completedToday } = await supabase
                .from('user_sentence_puzzle_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('last_reviewed_at', todayStart.toISOString())
                .gt('next_review_at', now);

            setReviewedTodayCount(completedToday || 0);
            setTotalDueToday((dueProgress?.length || 0) + (completedToday || 0));

            if (dueProgress && dueProgress.length > 0) {
                const ids = dueProgress.map(p => p.puzzle_id);
                const { data } = await supabase
                    .from('sentence_puzzles')
                    .select('*')
                    .eq('level', level)
                    .in('id', ids);
                questionData = data || [];
            }
        } else {
            const { data: learnedProgress } = await supabase
                .from('user_sentence_puzzle_progress')
                .select('puzzle_id')
                .eq('user_id', user.id)
                .gt('correct_count', 0);

            const learnedIds = learnedProgress?.map(p => p.puzzle_id) || [];
            let query = supabase.from('sentence_puzzles').select('*').eq('level', level);
            if (category !== '综合') {
                query = query.eq('category', category);
            }
            if (learnedIds.length > 0) {
                query = query.not('id', 'in', `(${learnedIds.join(',')})`);
            }

            // Filter by report threshold
            const { data } = await query.lt('report_count', threshold).limit(goal);
            questionData = data || [];
        }

        if (questionData.length > 0) {
            const processed = questionData.map(q => {
                // Parse template: split by spaces, handle ___
                const templateParts = (q.template || '').split(' ');
                const puzzleSegments = templateParts
                    .filter((p: string) => p.trim().length > 0)
                    .map((part: string) => ({
                        text: part === '___' ? '___' : part,
                        isFixed: part !== '___'
                    }));

                // The correct sequence for slots
                const selectableTexts = q.correct_sequence || [];
                const uniqueCorrect = new Set(selectableTexts);

                // Find indices where text is '___'
                const placeholderIndices = puzzleSegments
                    .map((s: any, i: number) => !s.isFixed ? i : -1)
                    .filter((i: number) => i !== -1);

                // Filter distractors to avoid overlapping with correct ones
                const filteredDistractors = (q.distractors || []).filter((d: string) => !uniqueCorrect.has(d));

                // Final options pool (unique strings)
                let optionsList = showDistractors
                    ? Array.from(new Set([...selectableTexts, ...filteredDistractors]))
                    : Array.from(new Set([...selectableTexts]));

                // Robust Fischer-Yates Shuffle
                for (let i = optionsList.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [optionsList[i], optionsList[j]] = [optionsList[j], optionsList[i]];
                }

                return { ...q, puzzleSegments, placeholderIndices, options: optionsList, selectableTexts };
            });
            setQuestions(processed.sort(() => Math.random() - 0.5));
        }

        // Global progress
        const { count: total } = await supabase.from('sentence_puzzles').select('*', { count: 'exact', head: true }).eq('level', level);
        const { count: learned } = await supabase.from('user_sentence_puzzle_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gt('correct_count', 0)
            .in('puzzle_id', (await supabase.from('sentence_puzzles').select('id').eq('level', level)).data?.map(p => p.id) || []);

        setOverallProgress({ learned: learned || 0, total: total || 0 });
        setLoading(false);
    };

    const updateSRS = async (isCorrect: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const currentQuestion = questions[currentIdx];
        const { data: existing } = await supabase
            .from('user_sentence_puzzle_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('puzzle_id', currentQuestion.id)
            .single();

        let srs_stage = existing?.srs_stage || 0;
        let ease_factor = existing?.ease_factor || 2.5;
        let interval = existing?.interval || 0;

        if (isCorrect) {
            if (failedIdsInSession.has(currentQuestion.id)) {
                interval = 1;
                srs_stage = 1;
            } else {
                if (srs_stage === 0) interval = 1;
                else if (srs_stage === 1) interval = 6;
                else interval = Math.round(interval * ease_factor);
                srs_stage++;
                ease_factor = Math.min(2.5, ease_factor + 0.1);
            }
        } else {
            srs_stage = 1;
            interval = 0;
            ease_factor = Math.max(1.3, ease_factor - 0.2);
        }

        const next_review_at = new Date();
        next_review_at.setDate(next_review_at.getDate() + interval);

        const updateData = {
            user_id: user.id,
            puzzle_id: currentQuestion.id,
            srs_stage,
            ease_factor,
            interval,
            next_review_at: next_review_at.toISOString(),
            last_reviewed_at: new Date().toISOString(),
            [isCorrect ? 'correct_count' : 'incorrect_count']: (existing?.[isCorrect ? 'correct_count' : 'incorrect_count'] || 0) + 1
        };

        if (existing) {
            await supabase.from('user_sentence_puzzle_progress').update(updateData).eq('id', existing.id);
        } else {
            await supabase.from('user_sentence_puzzle_progress').insert(updateData);
        }

        if (isCorrect && !failedIdsInSession.has(currentQuestion.id)) {
            if (isReviewMode) setReviewedTodayCount(prev => prev + 1);
        }
    };

    const handleOptionSelect = (opt: string, idxInOptions: number) => {
        if (answered || userSelections.length >= questions[currentIdx].placeholderIndices.length) return;
        setUserSelections(prev => [...prev, opt]);

        // After selecting, if we reached the count, evaluate
        if (userSelections.length + 1 === questions[currentIdx].placeholderIndices.length) {
            const final = [...userSelections, opt];
            const current = questions[currentIdx];
            const isCorrect = final.every((val, i) => val === current.selectableTexts[i]);

            setAnswered(true);
            updateSRS(isCorrect);
            if (isCorrect) {
                addXP('GRAMMAR', 5).then(res => {
                    if (res) {
                        setLastGainedXP(res.xpGained);
                        setXpNotificationKey(prev => prev + 1);
                    }
                });
            } else {
                failedIdsInSession.add(current.id);
                // Re-queue
                setQuestions(prev => [...prev, current]);
            }
        }
    };

    const handleReset = () => {
        setUserSelections([]);
        setAnswered(false);
    };

    const handleNext = () => {
        setCurrentIdx(prev => prev + 1);
        setUserSelections([]);
        setAnswered(false);
        setLastGainedXP(null);
    };

    const handleReport = () => {
        // Skip current question
        handleNext();
    };

    const playAudio = () => {
        if (questions[currentIdx]?.audio_url && audioRef.current) {
            audioRef.current.src = questions[currentIdx].audio_url;
            audioRef.current.play();
        }
    };

    if (loading) return <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 text-charcoal dark:text-white font-black">Loading Puzzle...</div>;

    if (!questions[currentIdx]) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="size-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                        <span className="material-symbols-outlined !text-6xl text-emerald-600 dark:text-emerald-400">celebration</span>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-charcoal dark:text-white tracking-tight">
                            {isReviewMode ? 'All Puzzles Solved!' : 'Level Mastered!'}
                        </h2>
                        <p className="text-ghost-grey dark:text-slate-400 font-medium text-lg leading-relaxed">
                            {isReviewMode
                                ? "You've finished all your sentence puzzles for today."
                                : "You've mastered all puzzles in this level. Great job!"}
                        </p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="w-full py-5 bg-primary text-white font-black rounded-[24px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const current = questions[currentIdx];

    // Construct display sentence based on userSelections
    let fillCounter = 0;
    const puzzleDisplayRows = current.puzzleSegments.map((seg: any) => {
        if (seg.isFixed) return seg.text;
        const selection = userSelections[fillCounter];
        fillCounter++;
        return selection || '___';
    });

    return (
        <div className="bg-background-light dark:bg-background-dark text-charcoal dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
            <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: isReviewMode ? `${totalDueToday > 0 ? (reviewedTodayCount / totalDueToday) * 100 : 0}%` : `${questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0}%` }}></div>
                </div>
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-ghost-grey hover:text-primary transition-colors font-bold text-sm">
                        <span className="material-symbols-outlined !text-xl">arrow_back</span>
                        <span>Exit</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost-grey">Sentence Puzzle</div>
                        <div className="text-[10px] font-bold text-primary">
                            {isReviewMode ? `${reviewedTodayCount} / ${totalDueToday}` : `${currentIdx + 1} / ${questions.length}`} items
                        </div>
                    </div>
                    <div className="size-10 flex items-center justify-end relative">
                        {lastGainedXP && (
                            <div key={xpNotificationKey} className="absolute -top-4 right-0 pointer-events-none">
                                <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/20 animate-float-up-fade whitespace-nowrap border border-amber-200 dark:border-amber-500/30">
                                    +{lastGainedXP} XP
                                </div>
                            </div>
                        )}
                        <span className="material-symbols-outlined text-primary">extension</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24">
                <div className="w-full max-w-3xl space-y-12 relative">

                    {/* Main content wrapper with relative positioning for the report button */}
                    <div className="text-center space-y-8 relative">
                        <div className="flex items-center justify-center gap-4">
                            <p className="text-xl md:text-2xl text-ghost-grey dark:text-gray-400 font-bold max-w-lg">
                                {preferredLang === 'Chinese' ? current.meaning_zh : current.meaning}
                            </p>
                            {current.audio_url && (
                                <button onClick={playAudio} className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                                    <span className="material-symbols-outlined !text-xl">volume_up</span>
                                </button>
                            )}
                        </div>

                        {/* Top-right Report Button */}
                        <ReportButton
                            itemType="puzzle"
                            itemId={current.id}
                            onReported={handleReport}
                            className="absolute -top-12 right-0 sm:-right-8 size-10 z-20"
                        />

                        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-4 text-3xl md:text-5xl font-black text-charcoal dark:text-white leading-relaxed">
                            {current.puzzleSegments.map((seg: any, idx: number) => {
                                if (seg.isFixed) {
                                    return <span key={idx}>{seg.text}</span>;
                                }
                                // Find which placeholder this is
                                const placeholderIdx = current.puzzleSegments.slice(0, idx).filter((s: any) => !s.isFixed).length;
                                const selection = userSelections[placeholderIdx];
                                const isCorrect = answered && selection === current.selectableTexts[placeholderIdx];
                                const isIncorrect = answered && selection !== current.selectableTexts[placeholderIdx];

                                let statusClass = selection
                                    ? 'border-primary text-primary animate-in fade-in slide-in-from-bottom-2'
                                    : 'border-slate-200 dark:border-slate-700 text-transparent';

                                if (answered) {
                                    if (isCorrect) statusClass = 'border-emerald-500 text-emerald-500';
                                    else statusClass = 'border-rose-500 text-rose-500';
                                }

                                return (
                                    <div
                                        key={idx}
                                        className={`min-w-[80px] px-4 py-1 border-b-4 transition-all duration-300 ${statusClass}`}
                                    >
                                        {selection || '___'}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {current.options.map((option: string, idx: number) => {
                            const isUsed = userSelections.includes(option);
                            return (
                                <button
                                    key={idx}
                                    disabled={isUsed || answered}
                                    onClick={() => handleOptionSelect(option, idx)}
                                    className={`p-4 rounded-2xl font-bold text-lg transition-all border-2 flex items-center justify-center ${isUsed
                                        ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed scale-95'
                                        : 'bg-white dark:bg-slate-900 border-black/5 dark:border-white/5 hover:border-primary hover:bg-primary/5 shadow-sm active:scale-95'
                                        }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-charcoal dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined !text-lg">restart_alt</span>
                            Clear
                        </button>

                        {answered && (
                            <button
                                onClick={handleNext}
                                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all animate-in slide-in-from-right-4"
                            >
                                Next Puzzle
                            </button>
                        )}
                    </div>
                </div>
            </main>
            <audio ref={audioRef} className="hidden" />
        </div>
    );
};

export default SentencePuzzlePage;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { addXP } from '../services/gamificationService';

const ListeningQuizPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [overallProgress, setOverallProgress] = useState({ learned: 0, total: 0 });
    const [totalDueToday, setTotalDueToday] = useState(0);
    const [reviewedTodayCount, setReviewedTodayCount] = useState(0);
    const [failedIdsInSession] = useState(new Set<string>());
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [lastGainedXP, setLastGainedXP] = useState<number | null>(null);
    const [xpNotificationKey, setXpNotificationKey] = useState(0);
    const [searchParams] = useSearchParams();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [voiceMode, setVoiceMode] = useState<'default' | 'sakura' | 'sakura07' | 'sakura07reading'>('default');

    useEffect(() => {
        initQuiz();
    }, [searchParams]);

    useEffect(() => {
        if (questions.length > 0 && questions[currentIdx] && !answered) {
            playAudio();
        }
    }, [currentIdx, questions, voiceMode]); // Re-play when voice mode changes

    const initQuiz = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/');
            return;
        }

        const { data: profile } = await supabase.from('profiles').select('current_level, daily_goal').eq('id', user.id).single();
        const currentLevel = profile?.current_level || 'N5';
        const goal = profile?.daily_goal || 20;
        const levelNumber = parseInt(currentLevel.replace('N', '')) || 5;
        const difficulty = 6 - levelNumber;

        const mode = searchParams.get('mode');
        const isReview = mode === 'review';
        setIsReviewMode(isReview);

        let questionData: any[] = [];
        const now = new Date().toISOString();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        if (isReview) {
            const { data: dueProgress } = await supabase
                .from('user_listening_progress')
                .select('listening_question_id')
                .eq('user_id', user.id)
                .lte('next_review_at', now)
                .gt('correct_count', 0);

            const dueIds = dueProgress?.map(p => p.listening_question_id) || [];
            const { count: completedToday } = await supabase
                .from('user_listening_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('last_reviewed_at', todayStart.toISOString())
                .gt('next_review_at', now);

            setReviewedTodayCount(completedToday || 0);
            setTotalDueToday(dueIds.length + (completedToday || 0));

            if (dueIds.length > 0) {
                const { data } = await supabase
                    .from('listening_questions')
                    .select('*')
                    .in('id', dueIds);
                questionData = data || [];
            }
        } else {
            // Learning mode: exclude learned and filter by level
            const { data: learnedProgress } = await supabase
                .from('user_listening_progress')
                .select('listening_question_id')
                .eq('user_id', user.id)
                .gt('correct_count', 0);

            const learnedIds = learnedProgress?.map(p => p.listening_question_id) || [];
            let query = supabase.from('listening_questions').select('*').eq('difficulty', difficulty);
            if (learnedIds.length > 0) {
                query = query.not('id', 'in', `(${learnedIds.join(',')})`);
            }
            const { data } = await query.limit(goal);
            questionData = data || [];
        }

        if (questionData.length > 0) {
            // Generate distractors for each question
            const allSentences = (await supabase.from('listening_questions').select('sentence')).data?.map(q => q.sentence) || [];
            const formatted = questionData.map(q => {
                let distractors = [];
                if (q.distractors && q.distractors.length > 0) {
                    distractors = q.distractors.sort(() => Math.random() - 0.5).slice(0, 3);
                } else {
                    distractors = allSentences
                        .filter(s => s !== q.sentence)
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 3);
                }
                const options = [...distractors, q.sentence].sort(() => Math.random() - 0.5);
                return { ...q, options };
            });
            setQuestions(formatted.sort(() => Math.random() - 0.5));
        }

        // Fetch overall progress filtered by level
        const lLevelIds = (await supabase.from('listening_questions').select('id').eq('difficulty', difficulty)).data?.map(q => q.id) || [];

        const { count: learnedCount } = await supabase
            .from('user_listening_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gt('correct_count', 0)
            .in('listening_question_id', lLevelIds);

        const { count: totalCount } = await supabase
            .from('listening_questions')
            .select('*', { count: 'exact', head: true })
            .eq('difficulty', difficulty);

        setOverallProgress({
            learned: learnedCount || 0,
            total: totalCount || 0
        });

        setOverallProgress({
            learned: learnedCount || 0,
            total: totalCount || 0
        });

        setLoading(false);
    };

    const getAudioUrl = (originalUrl: string) => {
        if (voiceMode === 'default') return originalUrl;
        // We replace '/n5/' with the target directory. 
        // Note: This logic assumes the original URL follows the structure /audio/listening/n5/...
        if (!originalUrl.includes('/n5/')) return originalUrl;

        switch (voiceMode) {
            case 'sakura': return originalUrl.replace('/n5/', '/n5_sakura/');
            case 'sakura07': return originalUrl.replace('/n5/', '/n5_sakura_07/');
            case 'sakura07reading': return originalUrl.replace('/n5/', '/n5_sakura_07_reading/');
            default: return originalUrl;
        }
    };

    const playAudio = () => {
        if (questions[currentIdx]?.audio_url) {
            if (audioRef.current) {
                const url = getAudioUrl(questions[currentIdx].audio_url);
                audioRef.current.src = url;
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        }
    };

    const updateSRS = async (isCorrect: boolean) => {
        const currentQuestion = questions[currentIdx];
        if (!currentQuestion) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const progressTable = 'user_listening_progress';
        const idField = 'listening_question_id';

        const { data: existing } = await supabase
            .from(progressTable)
            .select('*')
            .eq('user_id', user.id)
            .eq(idField, currentQuestion.id)
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
            setReviewedTodayCount(prev => prev + 1);
        } else {
            srs_stage = 0;
            interval = 0;
            ease_factor = Math.max(1.3, ease_factor - 0.2);
            failedIdsInSession.add(currentQuestion.id);
        }

        const next_review_at = new Date();
        next_review_at.setDate(next_review_at.getDate() + interval);

        const updateData = {
            user_id: user.id,
            [idField]: currentQuestion.id,
            srs_stage,
            ease_factor,
            interval,
            next_review_at: next_review_at.toISOString(),
            last_reviewed_at: new Date().toISOString(),
            [isCorrect ? 'correct_count' : 'incorrect_count']: (existing?.[isCorrect ? 'correct_count' : 'incorrect_count'] || 0) + 1
        };

        if (existing) {
            await supabase.from(progressTable).update(updateData).eq('id', existing.id);
        } else {
            await supabase.from(progressTable).insert(updateData);
        }
    };

    const handleSelect = async (idx: number) => {
        if (answered) return;
        const currentQuestion = questions[currentIdx];
        const isCorrect = currentQuestion.options[idx] === currentQuestion.sentence;
        setSelectedIdx(idx);
        setAnswered(true);

        await updateSRS(isCorrect);

        if (isCorrect) {
            addXP('LISTENING', 0).then(res => {
                if (res) {
                    setLastGainedXP(res.xpGained);
                    setXpNotificationKey(prev => prev + 1);
                }
            });
            // First time correct?
            const { data: learnedCheck } = await supabase
                .from('user_listening_progress')
                .select('correct_count')
                .eq('listening_question_id', currentQuestion.id)
                .single();
            if (learnedCheck && learnedCheck.correct_count <= 1) {
                setOverallProgress(prev => ({ ...prev, learned: prev.learned + 1 }));
            }
        }
    };

    const handleNext = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setAnswered(false);
            setSelectedIdx(null);
        } else {
            navigate('/dashboard');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="size-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                        <span className="material-symbols-outlined !text-6xl text-emerald-600 dark:text-emerald-400">celebration</span>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-charcoal dark:text-white tracking-tight">
                            {isReviewMode ? 'All Caught Up!' : 'Level Mastered!'}
                        </h2>
                        <p className="text-ghost-grey dark:text-slate-400 font-medium text-lg leading-relaxed">
                            {isReviewMode
                                ? "You've finished all your listening reviews for now."
                                : "You've learned every listening question in this level. Great job!"}
                        </p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="w-full py-5 bg-primary text-white font-black rounded-[24px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                        Return to Dashboard
                    </button>
                    {!isReviewMode && (
                        <button
                            onClick={async () => {
                                const { data: { user } } = await supabase.auth.getUser();
                                if (user) {
                                    await supabase.from('profiles').update({ current_level: 'N5' }).eq('id', user.id);
                                    window.location.reload();
                                }
                            }}
                            className="text-primary font-bold text-sm hover:underline mt-4"
                        >
                            Not seeing questions? Reset to N5
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIdx];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-charcoal dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300 overflow-x-hidden">
            <audio ref={audioRef} />
            <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(isReviewMode ? (reviewedTodayCount / (totalDueToday || 1)) : ((currentIdx + 1) / questions.length)) * 100}%` }}
                    ></div>
                </div>
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-ghost-grey hover:text-primary transition-colors font-bold text-sm">
                        <span className="material-symbols-outlined !text-xl">arrow_back</span>
                        <span>Exit</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost-grey">
                            {isReviewMode ? 'Listening Review' : 'Listening Practice'}
                        </div>
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
                        <span className="material-symbols-outlined text-primary">hearing</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-12 w-full">
                <div className="w-full max-w-2xl">


                    <div className="flex flex-col items-center mb-16">
                        <div className="mb-6 flex gap-2 items-center">
                            <label className="text-xs font-bold uppercase tracking-widest text-ghost-grey dark:text-slate-400">Voice:</label>
                            <select
                                value={voiceMode}
                                onChange={(e) => setVoiceMode(e.target.value as any)}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-charcoal dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="default">Default (Gemini/Google)</option>
                                <option value="sakura">Sakura (Normal)</option>
                                <option value="sakura07">Sakura (0.7x Speed)</option>
                                <option value="sakura07reading">Sakura (Reading, 0.7x)</option>
                            </select>
                        </div>
                        <button
                            onClick={playAudio}
                            className="size-32 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all mb-8"
                        >
                            <span className="material-symbols-outlined !text-6xl text-white">volume_up</span>
                        </button>
                        <p className="text-ghost-grey dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Listen and select the correct text</p>
                    </div>

                    <div className="grid gap-4">
                        {currentQuestion.options.map((opt: string, i: number) => {
                            const isCorrect = opt === currentQuestion.sentence;
                            const isSelected = selectedIdx === i;
                            let bgColor = "bg-white dark:bg-slate-900 border-2 border-transparent";

                            if (answered) {
                                if (isCorrect) bgColor = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                                else if (isSelected) bgColor = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
                                else bgColor = "bg-white dark:bg-slate-900 opacity-40";
                            } else {
                                bgColor = "bg-white dark:bg-slate-900 hover:border-primary shadow-lg";
                            }

                            return (
                                <button
                                    key={i}
                                    disabled={answered}
                                    onClick={() => handleSelect(i)}
                                    className={`w-full p-6 rounded-2xl text-left font-bold text-lg transition-all ${bgColor}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {answered && (
                        <button
                            onClick={handleNext}
                            className="w-full mt-12 py-5 bg-primary text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ListeningQuizPage;

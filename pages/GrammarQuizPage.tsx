
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { addXP } from '../services/gamificationService';

const GrammarQuizPage: React.FC = () => {
    const navigate = useNavigate();
    const [answered, setAnswered] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentLevel, setCurrentLevel] = useState('N5');
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [overallProgress, setOverallProgress] = useState({ learned: 0, total: 0 });
    const [totalDueToday, setTotalDueToday] = useState(0);
    const [reviewedTodayCount, setReviewedTodayCount] = useState(0);
    const [failedIdsInSession] = useState<Set<string>>(new Set());
    const [lastGainedXP, setLastGainedXP] = useState<number | null>(null);
    const [xpNotificationKey, setXpNotificationKey] = useState(0);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const initQuiz = async () => {
            setLoading(true);
            const mode = searchParams.get('mode');
            setIsReviewMode(mode === 'review');

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('profiles').select('current_level, daily_grammar_goal').eq('id', user.id).single();
            const level = profile?.current_level || 'N5';
            const goal = profile?.daily_grammar_goal || 10;
            setCurrentLevel(level);

            await fetchGlobalProgress(level, user.id);
            await fetchQuestions(level, goal, mode === 'review', user.id);
            setLoading(false);
        };
        initQuiz();
    }, [searchParams]);

    const fetchGlobalProgress = async (level: string, userId: string) => {
        // 1. Get all grammar point IDs for this level
        const { data: points } = await supabase.from('grammar_points').select('id').eq('level', level);
        const pointIds = points?.map(p => p.id) || [];

        if (pointIds.length === 0) {
            setOverallProgress({ learned: 0, total: 0 });
            return;
        }

        // 2. Count all examples for these points
        const { count: total } = await supabase
            .from('grammar_examples')
            .select('id', { count: 'exact', head: true })
            .in('grammar_point_id', pointIds);

        // 3. Count learned examples from these pointIds
        const { data: levelExamples } = await supabase.from('grammar_examples').select('id').in('grammar_point_id', pointIds);
        const exampleIds = levelExamples?.map(ex => ex.id) || [];

        const { count: learned } = await supabase
            .from('user_grammar_example_progress')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gt('correct_count', 0)
            .in('grammar_example_id', exampleIds);

        setOverallProgress({ learned: learned || 0, total: total || 0 });
    };

    const fetchQuestions = async (level: string, goal: number, isReview: boolean, userId: string) => {
        const now = new Date().toISOString();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: points } = await supabase.from('grammar_points').select('id, title').eq('level', level);
        const pointIds = points?.map(p => p.id) || [];
        const pointTitles = points?.map(p => p.title) || [];

        if (isReview) {
            const { data: dueProgress } = await supabase
                .from('user_grammar_example_progress')
                .select('grammar_example_id, next_review_at, srs_stage')
                .eq('user_id', userId)
                .lte('next_review_at', now);

            const { count: completedToday } = await supabase
                .from('user_grammar_example_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('last_reviewed_at', todayStart.toISOString())
                .gt('next_review_at', now);

            setReviewedTodayCount(completedToday || 0);
            setTotalDueToday((dueProgress?.length || 0) + (completedToday || 0));

            if (dueProgress && dueProgress.length > 0) {
                const ids = dueProgress.map(p => p.grammar_example_id);
                const { data: examples } = await supabase
                    .from('grammar_examples')
                    .select('*, grammar_points(title)')
                    .in('id', ids);

                if (examples) {
                    const combined = examples.map(ex => {
                        const progress = dueProgress.find(p => p.grammar_example_id === ex.id);
                        const title = (ex.grammar_points as any).title;
                        const distractors = pointTitles.filter(t => t !== title).sort(() => Math.random() - 0.5).slice(0, 3);
                        return {
                            ...ex,
                            word: title,
                            options: [...distractors, title].sort(() => Math.random() - 0.5),
                            next_review_at: progress?.next_review_at,
                            srs_stage: progress?.srs_stage
                        };
                    });
                    combined.sort((a, b) => new Date(a.next_review_at).getTime() - new Date(b.next_review_at).getTime());
                    setQuestions(combined);
                }
            }
        } else {
            // Learning Mode
            // 1. Get all example IDs for this level
            const { data: levelExamples } = await supabase
                .from('grammar_examples')
                .select('id')
                .in('grammar_point_id', pointIds);

            const levelExampleIds = levelExamples?.map(ex => ex.id) || [];

            // 2. Get learned examples for THIS level only
            const { data: learnedProgress } = await supabase
                .from('user_grammar_example_progress')
                .select('grammar_example_id')
                .eq('user_id', userId)
                .in('grammar_example_id', levelExampleIds)
                .gt('correct_count', 0);

            const learnedIds = learnedProgress?.map(p => p.grammar_example_id) || [];
            console.log(`Debug Grammar: Level=${level}, LvlExamples=${levelExampleIds.length}, LearnedInLvl=${learnedIds.length}`);

            let query = supabase.from('grammar_examples')
                .select('*, grammar_points(title)')
                .in('grammar_point_id', pointIds);

            if (learnedIds.length > 0) {
                // Safeguard against URL length limits
                const exclusionList = learnedIds.slice(0, 400);
                query = query.not('id', 'in', `(${exclusionList.join(',')})`);
            }

            const { data: examples, error } = await query.limit(goal);
            if (error) {
                console.error('Supabase Grammar Query Error:', error);
            }

            if (examples && examples.length > 0) {
                setQuestions(examples.map(ex => {
                    const title = (ex.grammar_points as any).title;
                    const distractors = pointTitles.filter(t => t !== title).sort(() => Math.random() - 0.5).slice(0, 3);
                    return {
                        ...ex,
                        word: title,
                        options: [...distractors, title].sort(() => Math.random() - 0.5)
                    };
                }));
            } else {
                console.log('No grammar questions found for criteria.');
            }
        }
    };

    const updateSRS = async (isCorrect: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const currentQuestion = questions[currentQuestionIdx];
        const { data: existing } = await supabase
            .from('user_grammar_example_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('grammar_example_id', currentQuestion.id)
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
            grammar_example_id: currentQuestion.id,
            srs_stage,
            ease_factor,
            interval,
            next_review_at: next_review_at.toISOString(),
            last_reviewed_at: new Date().toISOString(),
            [isCorrect ? 'correct_count' : 'incorrect_count']: (existing?.[isCorrect ? 'correct_count' : 'incorrect_count'] || 0) + 1
        };

        if (existing) {
            await supabase.from('user_grammar_example_progress').update(updateData).eq('id', existing.id);
        } else {
            await supabase.from('user_grammar_example_progress').insert(updateData);
        }

        if (isCorrect && !failedIdsInSession.has(currentQuestion.id)) {
            if (isReviewMode) setReviewedTodayCount(prev => prev + 1);
        }
    };

    const handleSelect = async (idx: number) => {
        if (answered) return;
        setAnswered(true);
        setSelectedIdx(idx);

        const isCorrect = questions[currentQuestionIdx].options[idx] === questions[currentQuestionIdx].word;
        await updateSRS(isCorrect);

        if (isCorrect) {
            const res = await addXP('GRAMMAR', 0);
            if (res) {
                setLastGainedXP(res.xpGained);
                setXpNotificationKey(prev => prev + 1);
            }
        } else {
            failedIdsInSession.add(questions[currentQuestionIdx].id);
            setQuestions(prev => [...prev, questions[currentQuestionIdx]]);
        }
    };

    const handleNext = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setAnswered(false);
            setSelectedIdx(null);
        } else {
            navigate('/dashboard');
        }
    };

    const currentQuestion = questions[currentQuestionIdx];

    if (loading) return <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 text-charcoal dark:text-white">Loading...</div>;

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="size-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                        <span className="material-symbols-outlined !text-6xl text-emerald-600 dark:text-emerald-400">celebration</span>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-charcoal dark:text-white tracking-tight">
                            {isReviewMode ? 'All Caught Up!' : `${currentLevel || 'Level'} Mastered!`}
                        </h2>
                        <p className="text-ghost-grey dark:text-slate-400 font-medium text-lg leading-relaxed">
                            {isReviewMode
                                ? "You've finished all your grammar reviews for today. Check back later!"
                                : `You've mastered all grammar examples in ${currentLevel || 'this level'}. Great job!`}
                        </p>
                        <div className="pt-2 text-[10px] font-mono text-slate-400">
                            Version: 2026-01-21-V5 | Level: {currentLevel} | Items: {questions.length}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
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
                                    } else {
                                        alert('Please log in first.');
                                    }
                                }}
                                className="text-primary font-bold text-sm hover:underline"
                            >
                                Not seeing questions? Click here to Reset to N5
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Format the sentence to hide the grammar point
    let displaySentence = currentQuestion.question_sentence;

    if (!displaySentence) {
        displaySentence = currentQuestion.sentence;
        // Split title by slash (e.g., "は/が") and try each variation
        const variations = currentQuestion.word.split(/[/／]/).map(v => v.replace(/[～~]/g, '').trim());

        for (const variation of variations) {
            if (variation && displaySentence.includes(variation)) {
                // Replace ONLY the first occurrence to avoid over-masking
                displaySentence = displaySentence.replace(variation, '（　　）');
                break;
            }
        }
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-charcoal dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
            <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: isReviewMode ? `${totalDueToday > 0 ? (reviewedTodayCount / totalDueToday) * 100 : 0}%` : `${questions.length > 0 ? ((currentQuestionIdx + 1) / questions.length) * 100 : 0}%` }}></div>
                </div>
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-ghost-grey hover:text-primary transition-colors font-bold text-sm">
                        <span className="material-symbols-outlined !text-xl">arrow_back</span>
                        <span>Exit</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost-grey">
                            {isReviewMode ? 'Reviewing Grammar' : 'Learning Grammar'}
                        </div>
                        <div className="text-[10px] font-bold text-primary">
                            {isReviewMode ? `${reviewedTodayCount} / ${totalDueToday}` : `${currentQuestionIdx + 1} / ${questions.length}`} items
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
                        <span className="material-symbols-outlined text-primary">architecture</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24">
                <div className="w-full max-w-2xl space-y-8">
                    <div className="text-center space-y-6">
                        <h1 className="text-4xl md:text-5xl font-black text-charcoal dark:text-white leading-tight">
                            {displaySentence}
                        </h1>
                        <p className="text-xl text-ghost-grey dark:text-gray-400 font-medium">
                            {currentQuestion.translation}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option: string, idx: number) => {
                            const isCorrect = option === currentQuestion.word;
                            const isSelected = selectedIdx === idx;

                            let buttonClass = "w-full p-6 text-left rounded-3xl font-bold transition-all border-2 ";
                            if (!answered) {
                                buttonClass += "bg-white dark:bg-slate-900 border-transparent hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 shadow-sm";
                            } else {
                                if (isCorrect) buttonClass += "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30";
                                else if (isSelected) buttonClass += "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30";
                                else buttonClass += "bg-white dark:bg-slate-900 border-transparent opacity-40";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(idx)}
                                    disabled={answered}
                                    className={buttonClass}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="size-8 rounded-full border-2 border-current flex items-center justify-center text-xs">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="text-lg">{option}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {answered && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[32px] border border-emerald-100 dark:border-emerald-500/20">
                                <p className="text-emerald-700 dark:text-emerald-300 font-black mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined">lightbulb</span>
                                    Correct Sentence
                                </p>
                                <p className="text-2xl font-black text-charcoal dark:text-white">{currentQuestion.sentence}</p>
                            </div>
                            <button
                                onClick={handleNext}
                                className="w-full py-5 bg-charcoal dark:bg-white text-white dark:text-charcoal rounded-3xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Next Step
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GrammarQuizPage;

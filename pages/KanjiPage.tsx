
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { addXP } from '../services/gamificationService';

const KanjiPage: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [overallProgress, setOverallProgress] = useState({ learned: 0, total: 0 });
    const [totalDueToday, setTotalDueToday] = useState(0);
    const [reviewedTodayCount, setReviewedTodayCount] = useState(0);
    const [failedIdsInSession] = useState(new Set<string>());
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [preferredLang, setPreferredLang] = useState('English');
    const [lastGainedXP, setLastGainedXP] = useState<number | null>(null);
    const [xpNotificationKey, setXpNotificationKey] = useState(0);

    // Canvas drawing state
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const initPractice = async () => {
            setLoading(true);
            const mode = searchParams.get('mode');
            const isReview = mode === 'review';
            setIsReviewMode(isReview);

            const { level, goal } = await fetchUserLevel();
            await fetchQuestions(level, goal, isReview);
            setLoading(false);
        };
        initPractice();
    }, [searchParams]);

    const fetchUserLevel = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('current_level, preferred_language, daily_goal')
                .eq('id', user.id)
                .single();
            const lang = data?.preferred_language || 'English';
            const goal = data?.daily_goal || 20;
            setPreferredLang(lang);
            return { level: data?.current_level || 'N3', goal };
        }
        return { level: 'N3', goal: 20 };
    };

    const fetchQuestions = async (level: string, goal: number, isReview: boolean = false) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let questionData: any[] = [];
        const now = new Date().toISOString();

        if (isReview) {
            const { data: dueProgress } = await supabase
                .from('user_kanji_progress')
                .select('vocabulary_id')
                .eq('user_id', user.id)
                .lte('next_review_at', now);

            const dueIds = dueProgress?.map(p => p.vocabulary_id) || [];
            setTotalDueToday(dueIds.length);

            if (dueIds.length > 0) {
                const { data } = await supabase
                    .from('vocabulary')
                    .select('*')
                    .in('id', dueIds)
                    .limit(goal);
                questionData = data || [];
            }
        } else {
            // Learning mode: exclude learned
            const { data: learnedProgress } = await supabase
                .from('user_kanji_progress')
                .select('vocabulary_id')
                .eq('user_id', user.id)
                .gt('correct_count', 0);

            const learnedIds = learnedProgress?.map(p => p.vocabulary_id) || [];
            let query = supabase.from('vocabulary').select('*').eq('level', level);
            if (learnedIds.length > 0) {
                query = query.not('id', 'in', learnedIds);
            }
            const { data } = await query.limit(goal);
            questionData = data || [];
        }

        if (questionData.length > 0) {
            setQuestions(questionData);
            setCurrentQuestion(questionData[0]);
        }

        // Fetch overall progress
        const { count: learnedCount } = await supabase
            .from('user_kanji_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gt('correct_count', 0);

        const { data: levelVocab } = await supabase.from('vocabulary').select('id').eq('level', level);
        setOverallProgress({
            learned: learnedCount || 0,
            total: levelVocab?.length || 0
        });

        // Fetch items already completed today for session tracking parity
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count: completedToday } = await supabase
            .from('user_kanji_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('last_reviewed_at', todayStart.toISOString())
            .gt('next_review_at', now);

        setReviewedTodayCount(completedToday || 0);
    };

    const updateSRS = async (isCorrect: boolean) => {
        if (!currentQuestion) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const progressTable = 'user_kanji_progress';
        const idField = 'vocabulary_id';

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
            srs_stage = 1;
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

    const handleSrsResponse = async (isCorrect: boolean) => {
        await updateSRS(isCorrect);

        if (isCorrect) {
            const res = await addXP('KANJI', 0);
            if (res) {
                setLastGainedXP(res.xpGained);
                setXpNotificationKey(prev => prev + 1);
            }
        }

        if (currentIdx < questions.length - 1) {
            const nextIdx = currentIdx + 1;
            setCurrentIdx(nextIdx);
            setCurrentQuestion(questions[nextIdx]);
            setShowAnswer(false);
            clearCanvas();
        } else {
            navigate('/dashboard');
        }
    };

    const handleCheckAnswer = () => {
        setShowAnswer(true);
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (showAnswer) return;
        setIsDrawing(true);
        const pos = getCoordinates(e);
        lastPos.current = pos;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || showAnswer) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const pos = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPos.current = pos;
    };

    const stopDrawing = () => setIsDrawing(false);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        // Precise scaling
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setShowAnswer(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="loader !size-12 border-primary border-t-transparent"></span>
                    <p className="font-black text-ghost-grey animate-pulse">Preparing Rice Paper...</p>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
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
                                ? "You've finished all your Kanji handwriting reviews for today."
                                : "You've practiced all Kanji in this level. Excellent focus!"}
                        </p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="w-full py-5 bg-primary text-white font-black rounded-[24px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const kanjiCount = currentQuestion?.word?.length || 0;
    const squareSize = 240;
    const canvasWidth = squareSize * kanjiCount;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-charcoal dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300 overflow-x-hidden">
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
                            {isReviewMode ? 'Handwriting Review' : 'Kanji Practice'}
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
                        <span className="material-symbols-outlined text-primary">workspace_premium</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-12 w-full">

                {/* Question Area */}
                <div className="w-full text-center mb-10 animate-in fade-in zoom-in-95 duration-500">
                    <h1 className="text-4xl md:text-6xl font-black leading-[1.4] mb-3 text-charcoal dark:text-white tracking-tight">
                        {(currentQuestion?.sentence || '').split('（　　）').map((part: string, i: number, arr: any[]) => (
                            <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <span className={`transition-colors duration-500 ${showAnswer ? 'text-emerald-500 underline decoration-emerald-500/30' : 'text-primary underline decoration-primary/30'} mx-2`}>
                                        {showAnswer ? currentQuestion?.word : (currentQuestion?.word || '').split('').map(() => '　').join('')}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </h1>
                    <p className="text-ghost-grey dark:text-slate-500 text-base md:text-lg font-medium italic">
                        "{preferredLang === 'Chinese' ? (currentQuestion.sentence_translation_zh || currentQuestion.sentence_translation) : currentQuestion.sentence_translation}"
                    </p>
                </div>

                {/* Dynamic Multi-Kanji Grid */}
                <div className="w-full flex flex-col items-center">
                    <div className="max-w-full overflow-x-auto pb-6 px-4 no-scrollbar scroll-smooth">
                        <div className="inline-block">
                            <div className="relative p-10 md:p-14 bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 transition-all">
                                {/* Grid Label inside card flow */}
                                <div className="mb-10 pl-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Writing Area</span>
                                </div>

                                <div
                                    className="relative flex"
                                    style={{ width: `${canvasWidth}px`, height: `${squareSize}px` }}
                                >
                                    {/* Background Grid Layer (Traditional Red Genkouyoushi) */}
                                    <div className="absolute inset-0 flex">
                                        {(currentQuestion?.word || '').split('').map((char: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`relative flex-shrink-0 border-2 border-red-500/60 dark:border-red-600/40 ${idx !== 0 ? 'border-l-0' : 'rounded-l-2xl'} ${idx === kanjiCount - 1 ? 'rounded-r-2xl' : ''}`}
                                                style={{ width: `${squareSize}px`, height: `${squareSize}px` }}
                                            >
                                                {/* Correct Kanji Hint Layer (Shown on Check) */}
                                                {showAnswer && (
                                                    <div className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-700">
                                                        <span
                                                            className="text-[170px] text-emerald-500/15 dark:text-emerald-500/10 font-display select-none pointer-events-none"
                                                            style={{ fontFamily: 'var(--preferred-font)' }}
                                                        >
                                                            {char}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Rice Grid Helper Lines (Red Dashed) */}
                                                <div className="absolute top-1/2 left-0 w-full h-[1px] border-t border-dashed border-red-400/40 dark:border-red-800/30"></div>
                                                <div className="absolute top-0 left-1/2 w-[1px] h-full border-l border-dashed border-red-400/40 dark:border-red-800/30"></div>
                                                <svg className="absolute inset-0 w-full h-full text-red-300/30 dark:text-red-900/20" viewBox="0 0 100 100">
                                                    <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4" />
                                                    <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4" />
                                                </svg>
                                            </div>
                                        ))}
                                    </div>

                                    <canvas
                                        ref={canvasRef}
                                        width={canvasWidth}
                                        height={squareSize}
                                        className="relative z-20 cursor-crosshair touch-none"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 w-full max-w-lg px-4">
                        {!showAnswer ? (
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={clearCanvas}
                                    className="px-8 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-ghost-grey hover:bg-slate-50 dark:hover:bg-slate-800/50 font-black text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">restart_alt</span>
                                    {preferredLang === 'Chinese' ? '清除' : 'Clear'}
                                </button>
                                <button
                                    onClick={handleCheckAnswer}
                                    className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/30"
                                >
                                    <span>{preferredLang === 'Chinese' ? '检查答案' : 'Check Answer'}</span>
                                    <span className="material-symbols-outlined">verified</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 w-full animate-in slide-in-from-bottom duration-500">
                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={() => handleSrsResponse(false)}
                                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-ghost-grey dark:text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border-2 border-slate-200 dark:border-slate-700"
                                    >
                                        {preferredLang === 'Chinese' ? '没记住' : 'Forgot It'}
                                    </button>
                                    <button
                                        onClick={() => handleSrsResponse(true)}
                                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-500/20"
                                    >
                                        {preferredLang === 'Chinese' ? '记住了' : 'Got It Right'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-12 text-ghost-grey dark:text-slate-500 italic px-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined !text-base">info</span>
                        <span className="text-xs md:text-sm font-medium">
                            {preferredLang === 'Chinese' ? '书写:' : 'Draw:'}
                            <span className="font-black text-charcoal dark:text-white not-italic text-lg ml-1">{currentQuestion.word}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined !text-base">lightbulb</span>
                        <span className="text-xs md:text-sm font-medium">{preferredLang === 'Chinese' ? '含义:' : 'Meaning:'} {preferredLang === 'Chinese' ? (currentQuestion.meaning_zh || currentQuestion.meaning) : currentQuestion.meaning}</span>
                    </div>
                </div>
            </main>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-ghost-grey text-xs font-bold hover:text-primary transition-all flex items-center gap-2 shadow-lg"
                >
                    <span className="material-symbols-outlined !text-sm">arrow_back</span>
                    Quit Practice
                </button>
            </div>
        </div>
    );
};

export default KanjiPage;

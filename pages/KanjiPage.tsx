
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { supabase } from '../services/supabaseClient';

const KanjiPage: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [preferredLang, setPreferredLang] = useState('English');

    // Canvas drawing state
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const initPractice = async () => {
            setLoading(true);
            const level = await fetchUserLevel();
            await fetchQuestions(level);
            setLoading(false);
        };
        initPractice();
    }, []);

    const fetchUserLevel = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('current_level')
                .eq('id', user.id)
                .single();
            return data?.current_level || 'N3';
        }
        return 'N3';
    };

    const fetchQuestions = async (level: string) => {
        const { data, error } = await supabase
            .from('vocabulary')
            .select('*')
            .eq('level', level)
            .limit(15);

        if (data && !error) {
            setQuestions(data);
            setCurrentQuestion(data[0]);
        }
    };

    const handleCheckAnswer = () => {
        if (showAnswer) {
            if (currentIdx < questions.length - 1) {
                const nextIdx = currentIdx + 1;
                setCurrentIdx(nextIdx);
                setCurrentQuestion(questions[nextIdx]);
                setShowAnswer(false);
                clearCanvas();
            } else {
                navigate('/dashboard');
            }
        } else {
            setShowAnswer(true);
        }
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
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 text-center">
                <div className="max-w-md flex flex-col items-center gap-6">
                    <span className="material-symbols-outlined !text-7xl text-slate-300">brush</span>
                    <h2 className="text-2xl font-black">No Kanji found for your level</h2>
                    <p className="text-ghost-grey font-medium">Please select a level with seeded vocabulary to start practicing your handwriting.</p>
                    <button onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-primary text-white rounded-2xl font-black">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const kanjiCount = currentQuestion?.word?.length || 0;
    const squareSize = 240;
    const canvasWidth = squareSize * kanjiCount;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col transition-colors duration-300 overflow-x-hidden">
            <Header />

            <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-12 w-full">
                {/* Progress indicator */}
                <div className="w-full max-w-md mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-ghost-grey dark:text-slate-500">Practice Session</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{currentIdx + 1} / {questions.length} Kanji</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
                    </div>
                </div>

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
                        "{currentQuestion.sentence_translation}"
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

                    <div className="mt-8 flex gap-4 w-full max-w-lg px-4">
                        <button
                            onClick={clearCanvas}
                            className="px-8 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-ghost-grey hover:bg-slate-50 dark:hover:bg-slate-800/50 font-black text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">restart_alt</span>
                            Clear
                        </button>
                        <button
                            onClick={handleCheckAnswer}
                            className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/30 ${showAnswer ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary hover:bg-primary-hover'} text-white`}
                        >
                            <span>{showAnswer ? (currentIdx < questions.length - 1 ? 'Next Kanji' : 'Finish') : 'Check Answer'}</span>
                            <span className="material-symbols-outlined">{showAnswer ? 'arrow_forward' : 'verified'}</span>
                        </button>
                    </div>
                </div>

                <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-12 text-ghost-grey dark:text-slate-500 italic px-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined !text-base">info</span>
                        <span className="text-xs md:text-sm font-medium">Draw: <span className="font-black text-charcoal dark:text-white not-italic text-lg ml-1">{currentQuestion.word}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined !text-base">lightbulb</span>
                        <span className="text-xs md:text-sm font-medium">Meaning: {currentQuestion.meaning}</span>
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

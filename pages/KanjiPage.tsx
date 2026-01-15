
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { supabase } from '../services/supabaseClient';

const KanjiPage: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState({
        sentence: "道に（　　）が立っています。",
        translation: "A sign is standing by the road.",
        targetKanji: "看板",
        kanjiMeaning: "Signboard / Poster",
        level: "N3"
    });

    // Canvas drawing state
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#2d3436';
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const pos = getCoordinates(e);
        lastPos.current = pos;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
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
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col transition-colors duration-300">
            <Header />

            <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-12 max-w-4xl mx-auto w-full">
                {/* Progress indicator */}
                <div className="w-full max-w-md mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-ghost-grey dark:text-slate-500">Practice Session</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">3 / 15 Kanji</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: '20%' }}></div>
                    </div>
                </div>

                {/* Question Area */}
                <div className="w-full text-center mb-12 animate-in fade-in zoom-in-95 duration-500">
                    <h1 className="text-3xl md:text-5xl font-black leading-[1.4] mb-4 text-charcoal dark:text-white tracking-tight">
                        {currentQuestion.sentence.split('（　　）').map((part, i, arr) => (
                            <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <span className="text-primary underline decoration-4 underline-offset-8 decoration-primary/30 mx-2">
                                        {currentQuestion.targetKanji.split('').map(() => '　').join('')}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </h1>
                    <p className="text-ghost-grey dark:text-slate-500 text-lg font-medium italic">
                        "{currentQuestion.translation}"
                    </p>
                </div>

                {/* Rice Grid Drawing Area */}
                <div className="relative group p-4 bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800">
                    <div className="absolute top-8 left-8 z-10">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">Drawing Board</span>
                    </div>

                    <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
                        {/* Rice Grid Helper Lines */}
                        <div className="absolute inset-0 pointer-events-none border-4 border-slate-100 dark:border-slate-800 rounded-2xl">
                            {/* Horizontal line */}
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                            {/* Vertical line */}
                            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-slate-100 dark:bg-slate-800/50"></div>
                            {/* Diagonals */}
                            <svg className="absolute inset-0 w-full h-full text-slate-50/50 dark:text-slate-800/20" viewBox="0 0 100 100">
                                <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2" />
                                <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2" />
                            </svg>
                        </div>

                        <canvas
                            ref={canvasRef}
                            width={400}
                            height={400}
                            className="relative z-20 w-full h-full cursor-crosshair touch-none"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={clearCanvas}
                            className="flex-1 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-ghost-grey hover:bg-slate-50 dark:hover:bg-slate-800/50 font-black text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">restart_alt</span>
                            Clear
                        </button>
                        <button
                            className="flex-[2] py-4 rounded-2xl bg-primary text-white font-black text-sm hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2"
                        >
                            Check Answer
                            <span className="material-symbols-outlined">verified</span>
                        </button>
                    </div>
                </div>

                <div className="mt-12 flex items-center gap-8 text-ghost-grey dark:text-slate-500 italic">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">info</span>
                        <span className="text-xs font-medium">Draw the kanji: <span className="font-black text-charcoal dark:text-white not-italic">{currentQuestion.targetKanji}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">lightbulb</span>
                        <span className="text-xs font-medium">Meaning: {currentQuestion.kanjiMeaning}</span>
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

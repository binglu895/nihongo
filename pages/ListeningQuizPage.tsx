
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        initQuiz();
    }, []);

    useEffect(() => {
        if (questions.length > 0 && questions[currentIdx] && !answered) {
            playAudio();
        }
    }, [currentIdx, questions]);

    const initQuiz = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/');
            return;
        }

        // Fetch questions and progress
        const [qRes, pRes, tRes] = await Promise.all([
            supabase.from('listening_questions').select('*'),
            supabase.from('user_listening_progress').select('*').eq('user_id', user.id).gt('correct_count', 0),
            supabase.from('listening_questions').select('id', { count: 'exact', head: true })
        ]);

        if (qRes.data) {
            // Generate distractors for each question
            const allSentences = qRes.data.map(q => q.sentence);
            const formatted = qRes.data.map(q => {
                let distractors = [];
                if (q.distractors && q.distractors.length > 0) {
                    // Use specific distractors if provided
                    distractors = q.distractors.sort(() => Math.random() - 0.5).slice(0, 3);
                } else {
                    // Fallback to random distractors from other questions
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

        setOverallProgress({
            learned: pRes.count || 0,
            total: tRes.count || 0
        });
        setLoading(false);
    };

    const playAudio = () => {
        if (questions[currentIdx]?.audio_url) {
            if (audioRef.current) {
                audioRef.current.src = questions[currentIdx].audio_url;
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        }
    };

    const handleSelect = async (idx: number) => {
        if (answered) return;
        const currentQuestion = questions[currentIdx];
        const isCorrect = currentQuestion.options[idx] === currentQuestion.sentence;
        setSelectedIdx(idx);
        setAnswered(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Update SRS
        const { data: existing } = await supabase
            .from('user_listening_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('listening_question_id', currentQuestion.id)
            .single();

        const updateData = {
            user_id: user.id,
            listening_question_id: currentQuestion.id,
            correct_count: (existing?.correct_count || 0) + (isCorrect ? 1 : 0),
            incorrect_count: (existing?.incorrect_count || 0) + (isCorrect ? 0 : 1),
            last_reviewed_at: new Date().toISOString(),
            next_review_at: new Date(Date.now() + (isCorrect ? 86400000 : 0)).toISOString() // Simple 1 day jump for now
        };

        if (existing) {
            await supabase.from('user_listening_progress').update(updateData).eq('id', existing.id);
        } else {
            await supabase.from('user_listening_progress').insert(updateData);
        }

        if (isCorrect) {
            await addXP('LISTENING', 0);
            if (!existing || existing.correct_count === 0) {
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
    if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center">No questions found.</div>;

    const currentQuestion = questions[currentIdx];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-charcoal dark:text-white flex flex-col items-center p-6 pt-24">
            <audio ref={audioRef} />

            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-12">
                    <button onClick={() => navigate('/dashboard')} className="material-symbols-outlined">arrow_back</button>
                    <div className="text-sm font-black uppercase tracking-widest text-ghost-grey">
                        Listening Practice {currentIdx + 1} / {questions.length}
                    </div>
                    <div className="size-8"></div>
                </div>

                <div className="flex flex-col items-center mb-16">
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
        </div>
    );
};

export default ListeningQuizPage;

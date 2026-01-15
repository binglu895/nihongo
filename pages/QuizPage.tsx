
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExplanation } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState('N3');
  const [preferredLang, setPreferredLang] = useState('English');

  React.useEffect(() => {
    const initQuiz = async () => {
      setLoading(true);
      const { level, goal } = await fetchUserLevel();
      await fetchQuestions(level, goal);
      setLoading(false);
    };
    initQuiz();
  }, []);

  const fetchUserLevel = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('current_level, preferred_language, daily_goal')
        .eq('id', user.id)
        .single();
      const level = data?.current_level || 'N3';
      const lang = data?.preferred_language || 'English';
      const goal = data?.daily_goal || 20;
      setCurrentLevel(level);
      setPreferredLang(lang);
      return { level, goal };
    }
    return { level: 'N3', goal: 20 };
  };

  const fetchQuestions = async (level: string, goal: number) => {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('level', level)
      .limit(goal);

    if (data && !error) {
      // Shuffle distractors and include correct answer
      const formatted = data.map(q => {
        const distractors = Array.isArray(q.distractors) ? q.distractors : [];
        const allOptions = [...distractors, q.word].sort(() => Math.random() - 0.5);
        return {
          ...q,
          options: allOptions
        };
      });
      setQuestions(formatted);
    }
  };

  const currentQuestion = questions[currentQuestionIdx];


  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
  };

  const handleExplain = async () => {
    if (!currentQuestion) return;
    setIsExplaining(true);
    const text = await getExplanation(currentQuestion.sentence, currentQuestion.options, currentQuestion.word, preferredLang);
    setExplanation(text);
    setIsExplaining(false);
  };

  const handleNext = async (isCorrect: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Log quiz history
      await supabase.from('quiz_history').insert({
        user_id: user.id,
        level: currentLevel,
        score: isCorrect ? 1 : 0
      });

      // Update stats and progress
      if (isCorrect) {
        const { data: statsData } = await supabase
          .from('stats')
          .select('vocab_count')
          .eq('user_id', user.id)
          .single();

        if (statsData) {
          await supabase.from('stats').update({
            vocab_count: statsData.vocab_count + 1
          }).eq('user_id', user.id);
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('completion_percentage')
          .eq('id', user.id)
          .single();

        if (profileData) {
          const nextPercentage = Math.min(100, (profileData.completion_percentage || 0) + 1);
          await supabase.from('profiles').update({
            completion_percentage: nextPercentage
          }).eq('id', user.id);
        }
      }

      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setAnswered(false);
        setSelectedIdx(null);
        setExplanation(null);
      } else {
        // Quiz complete
        navigate('/progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loader !size-12 border-primary border-t-transparent"></span>
          <p className="font-black text-ghost-grey animate-pulse">Summoning Sensei...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 text-center">
        <div className="max-w-md flex flex-col items-center gap-6">
          <span className="material-symbols-outlined !text-7xl text-slate-300">sentiment_dissatisfied</span>
          <h2 className="text-2xl font-black">No questions found for {currentLevel}</h2>
          <p className="text-ghost-grey font-medium">It seems our library is empty for this level. Please try another one.</p>
          <button onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-primary text-white rounded-2xl font-black">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-charcoal dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}></div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-primary material-symbols-outlined text-3xl">auto_stories</span>
            <span className="font-black tracking-[0.2em] text-xs uppercase">{currentLevel} Vocabulary</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-xs font-black text-ghost-grey dark:text-slate-500 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">Item {currentQuestionIdx + 1} / {questions.length}</span>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center size-10 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-ghost-grey hover:text-red-500 transition-all"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-32 pb-48 max-w-4xl mx-auto w-full">
        <div className="w-full text-center mb-16 animate-in fade-in zoom-in-95 duration-500">
          <h1
            className="text-3xl md:text-5xl font-black leading-[1.4] mb-6 text-charcoal dark:text-white tracking-tight"
            dangerouslySetInnerHTML={{ __html: (currentQuestion?.sentence || '').replace('（　　）', `<span class="text-primary px-3 italic">（　　）</span>`) }}
          />
          <p className="text-ghost-grey dark:text-slate-500 text-sm font-bold tracking-[0.1em] uppercase">
            {preferredLang === 'Chinese' ? (currentQuestion.sentence_translation_zh || currentQuestion.sentence_translation) : currentQuestion.sentence_translation}
          </p>
        </div>

        <div className="w-full max-w-xl space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {(currentQuestion?.options || []).map((opt: string, i: number) => {
            const isCorrect = opt === currentQuestion.word;
            const isSelected = selectedIdx === i;

            let buttonClass = "group w-full flex items-center justify-between px-8 py-5 rounded-2xl border-2 transition-all duration-300 ";

            if (!answered) {
              buttonClass += "border-transparent bg-white dark:bg-slate-900 shadow-lg hover:border-primary hover:scale-[1.02] active:scale-95";
            } else {
              if (isCorrect) {
                buttonClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 shadow-emerald-500/10";
              } else if (isSelected) {
                buttonClass += "border-red-500 bg-red-50 dark:bg-red-950/20 shadow-red-500/10";
              } else {
                buttonClass += "border-transparent bg-white dark:bg-slate-900 opacity-40";
              }
            }

            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => handleSelect(i)}
                className={buttonClass}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${!answered ? 'bg-gray-100 dark:bg-white/10' : (isCorrect ? 'bg-emerald-500 text-white' : (isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-white/10'))}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={`text-xl font-bold ${answered && isCorrect ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
                    {opt}
                  </span>
                </div>
                {answered && isCorrect && <span className="text-[10px] font-black tracking-widest text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1.5 rounded-lg uppercase">Correct</span>}
                {answered && isSelected && !isCorrect && <span className="text-[10px] font-black tracking-widest text-red-600 bg-red-100 dark:bg-red-900/40 px-3 py-1.5 rounded-lg uppercase">Mistake</span>}
              </button>
            );
          })}
        </div>
      </main>

      {answered && (
        <div className="fixed bottom-0 left-0 w-full p-6 flex justify-center z-50 animate-in slide-in-from-bottom-full duration-500 cubic-bezier(0.16, 1, 0.3, 1)">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-[32px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] p-8 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-center md:text-left">
                <div className={`size-16 shrink-0 rounded-full flex items-center justify-center shadow-inner ${(currentQuestion?.options || [])[selectedIdx!] === currentQuestion?.word ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                  <span className="material-symbols-outlined font-black !text-4xl">
                    {(currentQuestion?.options || [])[selectedIdx!] === currentQuestion?.word ? 'check_circle' : 'cancel'}
                  </span>
                </div>
                <div>
                  <h3 className={`text-2xl font-black mb-1 ${(currentQuestion?.options || [])[selectedIdx!] === currentQuestion?.word ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(currentQuestion?.options || [])[selectedIdx!] === currentQuestion?.word ? 'Splendid!' : 'Not quite...'}
                  </h3>
                  <p className="text-base text-ghost-grey dark:text-slate-400 font-medium">
                    {preferredLang === 'Chinese' ? '正确答案是' : 'The correct answer is'}{' '}
                    <span className="font-black text-charcoal dark:text-white underline decoration-emerald-500 decoration-2 underline-offset-4">{currentQuestion.word} ({currentQuestion.reading})</span>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleExplain}
                  disabled={isExplaining}
                  className="flex-1 md:flex-none h-14 px-8 rounded-2xl text-sm font-black text-primary border-2 border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  {isExplaining ? <span className="loader border-primary border-t-transparent"></span> : <span className="material-symbols-outlined !text-xl">psychology</span>}
                  Sensei Explains
                </button>
                <button
                  onClick={() => handleNext((currentQuestion?.options || [])[selectedIdx!] === currentQuestion?.word)}
                  className="flex-1 md:flex-none h-14 px-12 rounded-2xl bg-primary text-white text-sm font-black hover:bg-primary-hover transition-all shadow-xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-2"
                >
                  {currentQuestionIdx < questions.length - 1 ? 'Next' : 'Finish'}
                  <span className="material-symbols-outlined !text-xl">arrow_forward</span>
                </button>
              </div>
            </div>

            {explanation && (
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <span className="material-symbols-outlined">lightbulb</span>
                  <span className="text-xs font-black uppercase tracking-widest">Sensei's Commentary</span>
                </div>
                <div className="text-charcoal dark:text-slate-200 prose dark:prose-invert max-w-none text-sm font-medium leading-relaxed">
                  {explanation.split('\n').map((line, i) => (
                    <p key={i} className="mb-2" dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;

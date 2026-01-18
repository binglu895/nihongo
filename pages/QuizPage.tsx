
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getExplanation } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { addXP, XP_VALUES } from '../services/gamificationService';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessionStartTime] = useState(Date.now());
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState('N3');
  const [preferredLang, setPreferredLang] = useState('English');
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [overallProgress, setOverallProgress] = useState({ learned: 0, total: 0 });
  const [quizType, setQuizType] = useState('vocabulary');
  const [totalInitialDue, setTotalInitialDue] = useState(0);
  const [correctlyReviewedIds, setCorrectlyReviewedIds] = useState<Set<string>>(new Set());
  const [failedIdsInSession, setFailedIdsInSession] = useState<Set<string>>(new Set());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastGainedXP, setLastGainedXP] = useState<number | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const location = useLocation();

  // Handwriting canvas state (from KanjiPage)
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = React.useRef({ x: 0, y: 0 });
  const [showKanjiAnswer, setShowKanjiAnswer] = useState(false);

  React.useEffect(() => {
    const initQuiz = async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const mode = params.get('mode');
      const type = params.get('type') || 'vocabulary';
      setQuizType(type);
      setIsReviewMode(mode === 'review');

      const { level, goal } = await fetchUserLevel(type === 'grammar');
      await fetchQuestions(level, goal, mode === 'review', type);
      await fetchGlobalProgress(level, type);
      setLoading(false);
    };
    initQuiz();
  }, [location.search]);

  const fetchUserLevel = async (isGrammar: boolean = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('current_level, preferred_language, daily_goal, daily_grammar_goal, streak')
        .eq('id', user.id)
        .single();
      const level = data?.current_level || 'N3';
      const lang = data?.preferred_language || 'English';
      const goal = isGrammar ? (data?.daily_grammar_goal || 10) : (data?.daily_goal || 20);
      setCurrentLevel(level);
      setPreferredLang(lang);
      setCurrentStreak(data?.streak || 0);
      return { level, goal };
    }
    return { level: 'N3', goal: 20 };
  };

  const fetchGlobalProgress = async (level: string, type: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let learnedCount = 0;
    let totalCount = 0;

    if (type === 'all') {
      const { data: vLevelData } = await supabase.from('vocabulary').select('id').eq('level', level);
      const { data: gLevelData } = await supabase.from('grammar_points').select('id').eq('level', level);
      const vLevelIds = vLevelData?.map(v => v.id) || [];
      const gLevelIds = gLevelData?.map(g => g.id) || [];

      const [vProg, gProg, kProg, lProg] = await Promise.all([
        supabase.from('user_vocabulary_progress').select('vocabulary_id', { count: 'exact', head: true }).eq('user_id', user.id).gt('correct_count', 0).in('vocabulary_id', vLevelIds),
        supabase.from('user_grammar_progress').select('grammar_point_id', { count: 'exact', head: true }).eq('user_id', user.id).gt('correct_count', 0).in('grammar_point_id', gLevelIds),
        supabase.from('user_kanji_progress').select('vocabulary_id', { count: 'exact', head: true }).eq('user_id', user.id).gt('correct_count', 0).in('vocabulary_id', vLevelIds),
        supabase.from('user_listening_progress').select('vocabulary_id', { count: 'exact', head: true }).eq('user_id', user.id).gt('correct_count', 0).in('vocabulary_id', vLevelIds)
      ]);

      learnedCount = (vProg.count || 0) + (gProg.count || 0) + (kProg.count || 0) + (lProg.count || 0);
      totalCount = (vLevelIds.length * 3) + gLevelIds.length;
    } else if (type === 'grammar') {
      const { data: levelPoints } = await supabase.from('grammar_points').select('id').eq('level', level);
      const levelIds = levelPoints?.map(p => p.id) || [];
      if (levelIds.length > 0) {
        const { count } = await supabase.from('user_grammar_progress').select('grammar_point_id', { count: 'exact', head: true }).eq('user_id', user.id).in('grammar_point_id', levelIds).gt('correct_count', 0);
        learnedCount = count || 0;
        const { count: total } = await supabase.from('grammar_points').select('id', { count: 'exact', head: true }).eq('level', level);
        totalCount = total || 0;
      }
    } else {
      const table = type === 'kanji' ? 'user_kanji_progress' : type === 'listening' ? 'user_listening_progress' : 'user_vocabulary_progress';
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('user_id', user.id).gt('correct_count', 0).in('vocabulary_id',
        (await supabase.from('vocabulary').select('id').eq('level', level)).data?.map(v => v.id) || []
      );
      learnedCount = count || 0;
      const { count: total } = await supabase.from('vocabulary').select('id', { count: 'exact', head: true }).eq('level', level);
      totalCount = total || 0;
    }

    setOverallProgress({ learned: learnedCount, total: totalCount });
  };

  const fetchQuestions = async (level: string, goal: number, isReview: boolean, type: string = 'vocabulary') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Determine which types and progress tables to fetch from
    const typeConfigs = [];
    if (type === 'all' || type === 'vocabulary') typeConfigs.push({ type: 'vocabulary', table: 'user_vocabulary_progress', idField: 'vocabulary_id' });
    if (type === 'all' || type === 'grammar') typeConfigs.push({ type: 'grammar', table: 'user_grammar_progress', idField: 'grammar_point_id' });
    if (type === 'all' || type === 'kanji') typeConfigs.push({ type: 'kanji', table: 'user_kanji_progress', idField: 'vocabulary_id' });
    if (type === 'all' || type === 'listening') typeConfigs.push({ type: 'listening', table: 'user_listening_progress', idField: 'vocabulary_id' });

    let combinedQuestions: any[] = [];
    const now = new Date().toISOString();

    for (const config of typeConfigs) {
      let learnedIds: string[] = [];
      if (!isReview) {
        const { data: progressData } = await supabase.from(config.table).select(config.idField).eq('user_id', user.id).gt('correct_count', 0);
        if (progressData) {
          learnedIds = progressData.map(p => String(p[config.idField as keyof typeof p]));
        }
      }

      if (config.type === 'grammar') {
        let query = supabase.from('grammar_points').select('*, grammar_examples(*)').eq('level', level);
        if (isReview) {
          const { data: progress } = await supabase.from(config.table).select(config.idField).eq('user_id', user.id).lte('next_review_at', now);
          if (progress && progress.length > 0) query = query.in('id', progress.map(p => p[config.idField as keyof typeof p]));
          else continue;
        } else if (learnedIds.length > 0) {
          query = query.not('id', 'in', `(${learnedIds.join(',')})`);
        }

        const { data } = await query.limit(goal);
        if (data) combinedQuestions.push(...data.map(gp => {
          const ex = (gp.grammar_examples || [])[0] || gp;
          return {
            id: gp.id,
            word: gp.title,
            reading: gp.reading,
            sentence: ex.sentence,
            sentence_translation: ex.translation,
            sentence_translation_zh: ex.translation_zh,
            options: [],
            type: 'grammar'
          };
        }));
      } else {
        let query = supabase.from('vocabulary').select('*');
        if (isReview) {
          const { data: progress } = await supabase.from(config.table).select(config.idField).eq('user_id', user.id).lte('next_review_at', now);
          if (progress && progress.length > 0) query = query.in('id', progress.map(p => p[config.idField as keyof typeof p]));
          else continue;
        } else {
          query = query.eq('level', level);
          if (learnedIds.length > 0) {
            query = query.not('id', 'in', `(${learnedIds.join(',')})`);
          }
        }

        const { data } = await query.limit(goal);
        if (data) combinedQuestions.push(...data.map(q => ({ ...q, type: config.type, options: [...(q.distractors || []), q.word].sort(() => Math.random() - 0.5) })));
      }
    }

    // Grammar questions formatting helper
    const formatted = combinedQuestions.map(q => {
      if (q.type === 'grammar') {
        const distractors = combinedQuestions.filter(d => d.type === 'grammar' && d.id !== q.id).map(d => d.word).slice(0, 3);
        const options = [...distractors, q.word].sort(() => Math.random() - 0.5);
        let sentence = q.sentence;
        const targets = q.word.split(/[/／]/).map((t: string) => t.replace('～', '').trim()).filter(Boolean);
        for (const t of targets) if (sentence.includes(t)) { sentence = sentence.replace(t, '（　　）'); break; }
        return { ...q, sentence, options };
      }
      return q;
    });

    setQuestions(isReview ? formatted.sort(() => Math.random() - 0.5) : formatted.sort(() => Math.random() - 0.5).slice(0, goal));
    setTotalInitialDue(isReview ? formatted.length : Math.min(formatted.length, goal));
  };

  const currentQuestion = questions[currentQuestionIdx];


  const handleSelect = async (idx: number) => {
    if (answered) return;
    const isCorrect = (currentQuestion?.options || [])[idx] === currentQuestion?.word;
    setSelectedIdx(idx);
    setAnswered(true);

    if (isCorrect) {
      await updateSRS(true);
      setCorrectlyReviewedIds(prev => {
        const next = new Set(prev);
        next.add(currentQuestion.id);
        return next;
      });
      // Award XP
      const xpCategoryMap: Record<string, keyof typeof XP_VALUES> = {
        'vocabulary': 'VOCABULARY',
        'grammar': 'GRAMMAR',
        'kanji': 'KANJI',
        'listening': 'LISTENING'
      };
      const category = xpCategoryMap[quizType] || 'VOCABULARY';
      const result = await addXP(category, currentStreak);
      if (result) {
        setLastGainedXP(result.xpGained);
        if (result.newLevel) setShowLevelUp(true);
      }
    } else {
      await updateSRS(false);
      // Re-queue incorrect answer
      setQuestions(prev => [...prev, { ...currentQuestion }]);
      setFailedIdsInSession(prev => {
        const next = new Set(prev);
        next.add(currentQuestion.id);
        return next;
      });
    }

    // Log quiz history
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('quiz_history').insert({
        user_id: user.id,
        level: currentLevel,
        score: isCorrect ? 1 : 0
      });

      if (isCorrect) {
        // Update stats and profile
        const isGrammar = currentQuestion.type === 'grammar';
        const statsField = isGrammar ? 'grammar_score' : 'vocab_count';
        const { data: statsData } = await supabase.from('stats').select(statsField).eq('user_id', user.id).single();
        if (statsData) {
          await supabase.from('stats').update({ [statsField]: (statsData[statsField] || 0) + 1 }).eq('user_id', user.id);
        }

        const { data: profileData } = await supabase.from('profiles').select('completion_percentage').eq('id', user.id).single();
        if (profileData) {
          const nextPercentage = Math.min(100, (profileData.completion_percentage || 0) + 1);
          await supabase.from('profiles').update({ completion_percentage: nextPercentage }).eq('id', user.id);
        }
      }
    }
  };

  // Handwriting Canvas Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (showKanjiAnswer) return;
    setIsDrawing(true);
    const pos = getCoordinates(e);
    lastPos.current = pos;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || showKanjiAnswer) return;
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setShowKanjiAnswer(false);
  };

  const handleKanjiCheck = async () => {
    setShowKanjiAnswer(true);
    setAnswered(true);
    await updateSRS(true);
    setCorrectlyReviewedIds(prev => {
      const next = new Set(prev);
      next.add(currentQuestion.id);
      return next;
    });
    // Award XP
    const xpCategoryMap: Record<string, keyof typeof XP_VALUES> = {
      'vocabulary': 'VOCABULARY',
      'grammar': 'GRAMMAR',
      'kanji': 'KANJI',
      'listening': 'LISTENING'
    };
    const category = xpCategoryMap[quizType] || 'VOCABULARY';
    addXP(category, currentStreak);
  };

  const handleLevelComplete = async () => {
    try {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      const { updateActivityStats } = await import('../services/gamificationService');
      await updateActivityStats(duration);
    } catch (err) {
      console.error('Error updating activity stats:', err);
    }
    navigate('/progress');
  };

  const handleExplain = async () => {
    if (!currentQuestion) return;
    setIsExplaining(true);
    const text = await getExplanation(currentQuestion.sentence, currentQuestion.options, currentQuestion.word, preferredLang);
    setExplanation(text);
    setIsExplaining(false);
  };

  const updateSRS = async (isCorrect: boolean) => {
    if (!currentQuestion) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isGrammar = currentQuestion.type === 'grammar';
    const isKanji = currentQuestion.type === 'kanji';
    const isListening = currentQuestion.type === 'listening';

    const progressTable = isGrammar ? 'user_grammar_progress' : isKanji ? 'user_kanji_progress' : isListening ? 'user_listening_progress' : 'user_vocabulary_progress';
    const idField = isGrammar ? 'grammar_point_id' : 'vocabulary_id';

    // Fetch existing progress
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
        interval = 0; // Keep it due for review if it was failed earlier in this session
      } else {
        if (srs_stage === 0) {
          interval = 1;
        } else if (srs_stage === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * ease_factor);
        }
        srs_stage++;
        ease_factor = Math.min(2.5, ease_factor + 0.1);
      }
    } else {
      srs_stage = 1;
      interval = 0; // Immediate re-review
      ease_factor = Math.max(1.3, ease_factor - 0.2);
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
      // Increment global learned count if it's the FIRST correct answer
      if (isCorrect && (existing.correct_count || 0) === 0) {
        setOverallProgress(prev => ({ ...prev, learned: prev.learned + 1 }));
      }
    } else {
      await supabase.from(progressTable).insert(updateData);
      // Increment global learned count if it's correct on the first try
      if (isCorrect) {
        setOverallProgress(prev => ({ ...prev, learned: prev.learned + 1 }));
      }
    }
  };

  const handleNext = async (isCorrect: boolean) => {
    try {
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setAnswered(false);
        setSelectedIdx(null);
        setExplanation(null);
        setShowKanjiAnswer(false);
        setLastGainedXP(null);
        setShowLevelUp(false);
      } else {
        handleLevelComplete();
      }
    } catch (error) {
      console.error('Error in next:', error);
    }
  };

  React.useEffect(() => {
    if (showLevelUp) {
      const timer = setTimeout(() => setShowLevelUp(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp]);

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
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(overallProgress.learned / overallProgress.total) * 100}%` }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-primary material-symbols-outlined text-3xl">{isReviewMode ? 'auto_awesome' : 'auto_stories'}</span>
            <div className="flex flex-col">
              <span className="font-black tracking-[0.2em] text-[10px] uppercase text-ghost-grey dark:text-slate-500">
                {isReviewMode ? 'SRS Priority Review' : `${currentLevel} ${quizType === 'grammar' ? 'Grammar' : 'Vocabulary'}`}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Mastery</span>
                <span className="text-xs font-black text-charcoal dark:text-white">
                  {overallProgress.learned} / {overallProgress.total}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-primary/10 dark:bg-primary/20 px-5 py-2.5 rounded-2xl border border-primary/20 shadow-sm">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Session Progress</span>
              <span className="text-base font-black text-primary leading-none">
                {currentQuestionIdx + 1} / {questions.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center size-12 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 text-ghost-grey hover:text-red-500 transition-all border border-black/5 dark:border-white/5"
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

        {/* Question Area - Conditional Rendering */}
        {currentQuestion.type === 'kanji' ? (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-white/10 shadow-xl mb-8">
              <div className="relative" style={{ width: `${currentQuestion.word.length * 200}px`, height: '200px' }}>
                <div className="absolute inset-0 flex border-2 border-red-500/20 rounded-xl overflow-hidden">
                  {currentQuestion.word.split('').map((char: string, i: number) => (
                    <div key={i} className="flex-1 border-r border-red-500/10 last:border-0 relative">
                      {showKanjiAnswer && <span className="absolute inset-0 flex items-center justify-center text-8xl text-emerald-500/20 font-display">{char}</span>}
                      <div className="absolute top-1/2 left-0 w-full h-[1px] border-t border-dashed border-red-400/20"></div>
                      <div className="absolute top-0 left-1/2 w-[1px] h-full border-l border-dashed border-red-400/20"></div>
                    </div>
                  ))}
                </div>
                <canvas
                  ref={canvasRef}
                  width={currentQuestion.word.length * 200}
                  height={200}
                  className="relative z-10 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={() => setIsDrawing(false)}
                />
              </div>
            </div>
            {!answered ? (
              <div className="flex gap-4">
                <button onClick={clearCanvas} className="px-6 py-3 rounded-xl border border-slate-200 text-ghost-grey font-bold">Clear</button>
                <button onClick={handleKanjiCheck} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Check</button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="w-full max-w-xl space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {currentQuestion.type === 'listening' && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(currentQuestion.sentence.replace('（　　）', currentQuestion.word));
                    utterance.lang = 'ja-JP';
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="size-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined !text-4xl">volume_up</span>
                </button>
              </div>
            )}
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
        )}
      </main>

      {
        answered && (
          <div className="fixed bottom-0 left-0 w-full p-6 flex justify-center z-50 animate-in slide-in-from-bottom-full duration-500 cubic-bezier(0.16, 1, 0.3, 1)">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-[32px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] p-8 flex flex-col gap-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 text-center md:text-left">
                  <div className={`size-16 shrink-0 rounded-full flex items-center justify-center shadow-inner ${((currentQuestion.type === 'kanji' && showKanjiAnswer) || (currentQuestion?.options || [])[selectedIdx!] === currentQuestion?.word) ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    <span className="material-symbols-outlined font-black !text-4xl">
                      {((currentQuestion.type === 'kanji' && showKanjiAnswer) || (currentQuestion?.options || [])[selectedIdx!] === currentQuestion?.word) ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black mb-1 ${((currentQuestion.type === 'kanji' && showKanjiAnswer) || (currentQuestion?.options || [])[selectedIdx!] === currentQuestion?.word) ? 'text-emerald-600' : 'text-red-600'}`}>
                      {((currentQuestion.type === 'kanji' && showKanjiAnswer) || (currentQuestion?.options || [])[selectedIdx!] === currentQuestion?.word) ? 'Splendid!' : 'Not quite...'}
                      {lastGainedXP && <span className="ml-3 px-2 py-0.5 bg-amber-100 text-amber-600 text-sm rounded-lg animate-bounce inline-block">+{lastGainedXP} XP</span>}
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
                    onClick={() => handleNext(currentQuestion.type === 'kanji' ? true : (currentQuestion?.options || [])[selectedIdx!] === currentQuestion?.word)}
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
        )
      }

      {showLevelUp && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-[32px] shadow-2xl animate-in fade-in slide-in-from-top-full duration-700 font-black flex items-center gap-4 border-4 border-white">
          <span className="material-symbols-outlined !text-4xl text-white fill-white animate-bounce-subtle">military_tech</span>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest opacity-80">Achievement Unlocked</span>
            <span className="text-xl">Level Up! You're getting stronger.</span>
          </div>
        </div>
      )}
    </div >
  );
};

export default QuizPage;

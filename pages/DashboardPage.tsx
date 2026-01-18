
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { JLPTLevel } from '../types';
import { supabase } from '../services/supabaseClient';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState<JLPTLevel>('N3');
  const [loading, setLoading] = useState(true);
  const [dueCount, setDueCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [stats, setStats] = useState({
    kanji: { learned: 0, total: 0 },
    vocabulary: { learned: 0, total: 0 },
    grammar: { learned: 0, total: 0 },
    listening: { learned: 0, total: 0 }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('current_level, daily_goal')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setLevel(data.current_level as JLPTLevel);
        setDailyGoal(data.daily_goal || 20);
      }

      // Fetch due items count from all categories
      const now = new Date().toISOString();
      const [vocabDue, grammarDue, kanjiDue, listeningDue] = await Promise.all([
        supabase.from('user_vocabulary_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('next_review_at', now),
        supabase.from('user_grammar_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('next_review_at', now),
        supabase.from('user_kanji_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('next_review_at', now),
        supabase.from('user_listening_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('next_review_at', now)
      ]);

      const totalDue = (vocabDue.count || 0) + (grammarDue.count || 0) + (kanjiDue.count || 0) + (listeningDue.count || 0);
      setDueCount(totalDue);

      // Fetch Global Progress
      await fetchGlobalStats(data?.current_level || 'N3', user.id);

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStats = async (currentLevel: string, userId: string) => {
    // Vocational Stats
    const { count: vocabLearned } = await supabase
      .from('user_vocabulary_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('vocabulary_id', (await supabase.from('vocabulary').select('id').eq('level', currentLevel)).data?.map(v => v.id) || []);

    const { count: vocabTotal } = await supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('level', currentLevel);

    // Grammar Stats
    const levelGrammarIds = (await supabase.from('grammar_points').select('id').eq('level', currentLevel)).data?.map(g => g.id) || [];
    const { count: grammarLearned } = await supabase
      .from('user_grammar_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('grammar_point_id', levelGrammarIds);

    const { count: grammarTotal } = await supabase
      .from('grammar_examples')
      .select('*', { count: 'exact', head: true })
      .in('grammar_point_id', levelGrammarIds);

    setStats({
      kanji: { learned: 0, total: 0 },
      vocabulary: { learned: vocabLearned || 0, total: vocabTotal || 0 },
      grammar: { learned: grammarLearned || 0, total: grammarTotal || 0 },
      listening: { learned: 0, total: 0 }
    });
  };

  const updateLevel = async (newLevel: JLPTLevel) => {
    setLevel(newLevel);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          current_level: newLevel,
          completion_percentage: 0
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating level:', error);
    }
  };

  const categories = [
    { title: "Kanji", icon: "draw", desc: "Master characters.", btn: "Start Practice", path: "/kanji", stats: stats.kanji },
    { title: "Vocabulary", icon: "menu_book", desc: "Build your lexicon.", btn: "Start Practice", path: "/quiz", stats: stats.vocabulary },
    { title: "Grammar", icon: "architecture", desc: "Understand particles.", btn: "Start Practice", path: "/quiz?type=grammar", stats: stats.grammar },
    { title: "Listening", icon: "hearing", desc: "Native audio.", btn: "Start Practice", path: "/quiz?type=listening", stats: stats.listening }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header />
      <main className="flex-1 flex flex-col items-center py-16 px-4">
        <div className="w-full max-w-[960px] flex flex-col items-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-ghost-grey dark:text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-6">Select Proficiency Level</p>
          <div className="flex w-full max-w-lg h-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl border border-gray-100 dark:border-white/10">
            {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map((l) => (
              <label
                key={l}
                className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-xl px-2 text-sm font-black transition-all ${level === l ? 'bg-primary text-white shadow-lg' : 'text-ghost-grey dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                <span className="truncate">{l}</span>
                <input
                  className="hidden"
                  name="jlpt-level"
                  type="radio"
                  value={l}
                  checked={level === l}
                  onChange={() => updateLevel(l)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* SRS Review / Learning Card - Always Persistent */}
        <div className="w-full max-w-[960px] mb-20 animate-in fade-in zoom-in-95 duration-1000">
          <div className="bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-[48px] p-12 md:p-16 flex flex-col items-center text-center shadow-[0_32px_64px_-16px_rgba(99,102,241,0.2)] dark:shadow-none relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <div className="absolute -top-24 -right-24 size-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>

            <h2 className="text-4xl md:text-5xl font-black text-charcoal dark:text-white mb-4 tracking-tight">Ready for today?</h2>
            <p className="text-ghost-grey dark:text-gray-400 text-lg font-medium mb-12 max-w-lg leading-relaxed">
              Consistent daily practice is the key to Japanese language retention.
            </p>

            <button
              onClick={() => navigate(dueCount > 0 ? '/quiz?mode=review&type=all' : '/quiz')}
              className="group relative flex items-center justify-center gap-4 bg-primary text-white font-black py-6 px-12 rounded-[28px] text-xl shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined !text-2xl">{dueCount > 0 ? 'fact_check' : 'auto_stories'}</span>
              </div>
              <span>{dueCount > 0 ? `Review ${dueCount} items` : 'Start Learning'}</span>
            </button>

            <p className="mt-8 text-[10px] font-black text-ghost-grey/60 dark:text-gray-500 uppercase tracking-[0.3em]">
              {dueCount > 0 ? `APPROX. ${Math.ceil(dueCount * 0.5)} MINUTES` : 'NO REVIEWS DUE'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-[1200px] px-4">
          {categories.map((card, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-[32px] p-8 md:p-10 flex flex-col items-center transition-all hover:shadow-2xl hover:-translate-y-2 group animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-6 md:mb-8 text-primary group-hover:scale-125 transition-transform duration-500">
                <span className="material-symbols-outlined !text-5xl md:text-6xl">{card.icon}</span>
              </div>
              <h3 className="text-charcoal dark:text-white text-xl md:text-2xl font-black mb-2 md:mb-3">{card.title}</h3>
              {card.stats && (
                <div className="flex items-center justify-center mb-10 text-xs font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
                  <span>{card.stats.learned}</span>
                  <span className="mx-1.5 opacity-40">/</span>
                  <span className="opacity-40">{card.stats.total} {card.title}</span>
                </div>
              )}
              <p className="text-ghost-grey dark:text-gray-400 text-center text-xs md:text-sm mb-8 md:mb-10 leading-relaxed font-medium">
                {card.desc}
              </p>
              <button
                onClick={() => navigate(card.path)}
                className="w-full py-3.5 md:py-4 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95"
              >
                <span>{card.btn}</span>
                <span className="material-symbols-outlined !text-xl">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-ghost-grey dark:text-gray-500 text-sm font-semibold tracking-wide flex items-center gap-3">
          <span className="material-symbols-outlined !text-lg">timer</span>
          Focus: {level} Proficiency / SRS Priority Mode
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;

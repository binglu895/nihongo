
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
      <main className="flex-1 flex flex-col items-center py-8 md:py-12 px-4">
        <div className="w-full max-w-[960px] flex flex-col items-center mb-10 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-ghost-grey dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Select Proficiency Level</p>
          <div className="flex w-full max-w-lg h-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 p-1 shadow-xl border border-gray-100 dark:border-white/10">
            {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map((l) => (
              <label
                key={l}
                className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-xl px-2 text-xs font-black transition-all ${level === l ? 'bg-primary text-white shadow-lg' : 'text-ghost-grey dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
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

        {/* SRS Review / Learning Card */}
        <div className="w-full max-w-[960px] mb-10 md:mb-12 animate-in fade-in zoom-in-95 duration-1000">
          {dueCount > 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-[40px] p-8 md:p-12 flex flex-col items-center text-center shadow-xl dark:shadow-none relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <h2 className="text-3xl md:text-4xl font-black text-charcoal dark:text-white mb-2 tracking-tight">Ready for today?</h2>
              <p className="text-ghost-grey dark:text-gray-400 text-sm font-medium mb-8 max-w-md leading-relaxed">
                Consistency is key. You have items waiting for review.
              </p>
              <button
                onClick={() => navigate('/quiz?mode=review&type=all')}
                className="group relative flex items-center justify-center gap-3 bg-primary text-white font-black py-4 px-10 rounded-2xl text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <span className="material-symbols-outlined !text-xl">fact_check</span>
                <span>Review {dueCount} items</span>
              </button>
              <p className="mt-6 text-[10px] font-black text-ghost-grey/60 dark:text-gray-500 uppercase tracking-[0.3em]">
                APPROX. {Math.ceil(dueCount * 0.5)} MINUTES
              </p>
            </div>
          ) : (
            <div className="bg-slate-50/50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-[32px] p-8 flex flex-col items-center text-center">
              <div className="size-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined !text-2xl">done_all</span>
              </div>
              <h2 className="text-xl font-black text-charcoal dark:text-white mb-1">All Caught Up!</h2>
              <p className="text-ghost-grey dark:text-gray-400 text-xs font-medium mb-6">No reviews due right now. Perfect time to start a new lesson.</p>
              <button
                onClick={() => navigate('/quiz')}
                className="text-primary text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2"
              >
                Start New Lesson <span className="material-symbols-outlined !text-sm">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-[1200px] px-2">
          {categories.map((card, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-black/[0.03] dark:border-white/5 rounded-[28px] p-6 flex flex-col items-center transition-all hover:shadow-xl hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined !text-4xl">{card.icon}</span>
              </div>
              <h3 className="text-charcoal dark:text-white text-lg font-black mb-1">{card.title}</h3>
              {card.stats && (
                <div className="flex items-center justify-center mb-4 text-[11px] font-medium tracking-wide text-ghost-grey dark:text-gray-400 opacity-60">
                  <span>{card.stats.learned}</span>
                  <span className="mx-1">/</span>
                  <span>{card.stats.total} {card.title}</span>
                </div>
              )}
              <p className="text-ghost-grey dark:text-gray-400 text-center text-[11px] mb-6 leading-relaxed font-medium">
                {card.desc}
              </p>
              <button
                onClick={() => navigate(card.path)}
                className="w-full py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>{card.btn}</span>
                <span className="material-symbols-outlined !text-sm">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-ghost-grey dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined !text-sm">verified</span>
          SRS Mode Active
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;

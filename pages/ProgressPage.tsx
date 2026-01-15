
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../services/supabaseClient';

const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ kanji: 0, vocab: 0, grammar: 0 });
  const [profile, setProfile] = useState({ streak: 0, completion: 0, level: 'N3' });
  const [dueCount, setDueCount] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('streak, completion_percentage, current_level')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('stats')
        .select('kanji_count, vocab_count, grammar_score')
        .eq('user_id', user.id)
        .single();

      if (statsError) throw statsError;

      setProfile({
        streak: profileData.streak,
        completion: profileData.completion_percentage,
        level: profileData.current_level
      });

      setStats({
        kanji: statsData.kanji_count,
        vocab: statsData.vocab_count,
        grammar: statsData.grammar_score
      });

      // Fetch due items count
      const { count: due } = await supabase
        .from('user_vocabulary_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lte('next_review_at', new Date().toISOString());

      // Fetch total learned items count
      const { count: learned } = await supabase
        .from('user_vocabulary_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setDueCount(due || 0);
      setLearnedCount(learned || 0);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header />
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 py-12 animate-in fade-in duration-700">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-charcoal dark:text-white">Your Journey</h1>
            <p className="text-ghost-grey dark:text-slate-400 text-lg md:text-xl font-medium">Daily mastery and JLPT {profile.level} preparation</p>
          </div>
          <div className="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 shadow-sm animate-bounce-subtle">
            <span className="material-symbols-outlined text-orange-500 fill-orange-500 text-3xl">local_fire_department</span>
            <span className="text-2xl font-black text-primary">{profile.streak} Day Streak</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 md:p-12 bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl">
            <div className="relative flex items-center justify-center">
              <svg className="w-64 h-64 md:w-72 md:h-72 transform -rotate-90" viewBox="0 0 288 288">
                <circle
                  className="text-slate-100 dark:text-slate-800"
                  cx="144"
                  cy="144"
                  fill="transparent"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="16"
                ></circle>
                <circle
                  className="text-primary transition-all duration-1000 ease-out"
                  cx="144"
                  cy="144"
                  fill="transparent"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeDasharray="753.98"
                  strokeDashoffset={753.98 * (1 - profile.completion / 100)}
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl md:text-6xl font-black text-charcoal dark:text-white tracking-tighter">{profile.completion}%</span>
                <span className="text-ghost-grey dark:text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2">JLPT {profile.level}</span>
              </div>
            </div>
            <div className="mt-8 md:mt-10 text-center">
              <p className="text-charcoal dark:text-white text-lg md:text-xl font-black">Overall Completion</p>
              <p className="text-ghost-grey dark:text-slate-500 text-xs md:text-sm mt-2 font-medium italic">
                {profile.completion >= 100 ? 'Mastered!' : 'Almost there! Keep pushing.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            <div className="p-8 md:p-12 bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col items-center text-center">
              <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3">Ready for today?</h3>
              <button
                onClick={() => navigate('/quiz?mode=review')}
                className="w-full max-w-md bg-primary hover:bg-primary-hover text-white shadow-2xl shadow-primary/30 font-black py-4 md:py-6 px-8 md:px-10 rounded-2xl transition-all flex items-center justify-center gap-4 active:scale-95 group"
              >
                <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">quiz</span>
                <span className="text-lg md:text-xl">{learnedCount > 0 ? `Review ${learnedCount} items` : 'Start Learning'}</span>
              </button>
              <p className="mt-6 text-[10px] font-black text-ghost-grey dark:text-slate-500 uppercase tracking-[0.2em]">
                {learnedCount > 0 ? `Approx. ${Math.ceil(learnedCount * 0.5)} minutes` : 'No words learned yet'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {[
                { label: "Kanji", value: stats.kanji.toString(), detail: "Total items", color: "text-emerald-500" },
                { label: "Vocab", value: (stats.vocab / 1000).toFixed(1) + 'k', detail: "Total items", color: "text-emerald-500" },
                { label: "Grammar", value: stats.grammar.toString(), detail: "Mastery points", color: "text-slate-400" }
              ].map((s, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-hover hover:shadow-md">
                  <p className="text-ghost-grey dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                  <p className="text-2xl md:text-3xl font-black text-charcoal dark:text-white">{s.value}</p>
                  <p className={`${s.color} text-xs font-bold flex items-center gap-1.5`}>
                    {s.detail.includes('+') && <span className="material-symbols-outlined !text-sm">trending_up</span>}
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-20 pt-10 md:pt-12 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-ghost-grey dark:text-slate-500 mb-8 md:mb-10">JLPT Milestones</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
            {(['N5', 'N4', 'N3', 'N2', 'N1']).map((l, i) => {
              const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
              const currentIdx = levels.indexOf(profile.level);
              const milestoneIdx = levels.indexOf(l);

              let percentage = 0;
              if (milestoneIdx < currentIdx) percentage = 100;
              else if (milestoneIdx === currentIdx) percentage = profile.completion;

              const isCompleted = percentage === 100;
              const isCurrent = milestoneIdx === currentIdx;
              const opacity = milestoneIdx > currentIdx ? 'opacity-40' : '';

              return (
                <div key={l} className={`flex flex-col gap-2 md:gap-3 group ${opacity}`}>
                  <div className={`flex justify-between text-[10px] md:text-xs font-black uppercase ${isCompleted ? 'text-emerald-500' : isCurrent ? 'text-primary' : 'text-slate-400'}`}>
                    <span>{l}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="h-2 md:h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                    <div
                      className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-primary'} transition-all duration-1000 group-hover:brightness-110`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProgressPage;

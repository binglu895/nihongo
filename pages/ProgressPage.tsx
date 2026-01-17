
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ShareCard from '../components/ShareCard';
import Leaderboard from '../components/Leaderboard';
import { supabase } from '../services/supabaseClient';
import { getReferralInfo, generateShareLink, getDailyStatsSnapshot } from '../services/sharingService';

const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ kanji: 0, vocab: 0, grammar: 0 });
  const [profile, setProfile] = useState({ streak: 0, completion: 0, level: 'N3' });
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    kanji: { learned: 0, total: 0 },
    vocabulary: { learned: 0, total: 0 },
    grammar: { learned: 0, total: 0 }
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({
    referralLink: '',
    todayStats: { reviews: 0, streak: 0, level: 1, completion: 0 }
  });

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

      // Fetch sharing/referral info
      const refInfo = await getReferralInfo();
      const dailySnapshot = await getDailyStatsSnapshot(user.id);

      if (refInfo) {
        setShareData({
          referralLink: generateShareLink(refInfo.code),
          todayStats: {
            reviews: dailySnapshot.reviews,
            streak: profileData.streak,
            level: (profileData as any).level || 1,
            completion: profileData.completion_percentage
          }
        });
      }

      // Fetch due items count from all categories
      const now = new Date().toISOString();
      const [vDue, gDue, kDue, lDue] = await Promise.all([
        supabase.from('user_vocabulary_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('next_review_at', now),
        supabase.from('user_grammar_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('next_review_at', now),
        supabase.from('user_kanji_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('next_review_at', now),
        supabase.from('user_listening_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('next_review_at', now)
      ]);

      setDueCount((vDue.count || 0) + (gDue.count || 0) + (kDue.count || 0) + (lDue.count || 0));

      // Fetch Global Stats for ratios
      await fetchGlobalStats(profileData.current_level, user.id);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStats = async (level: string, userId: string) => {
    // Vocab
    const { count: vLearned } = await supabase
      .from('user_vocabulary_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('vocabulary_id', (await supabase.from('vocabulary').select('id').eq('level', level)).data?.map(v => v.id) || []);

    const { count: vTotal } = await supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('level', level);

    // Grammar
    const levelGrammarIds = (await supabase.from('grammar_points').select('id').eq('level', level)).data?.map(g => g.id) || [];
    const { count: gLearned } = await supabase
      .from('user_grammar_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('grammar_point_id', levelGrammarIds);

    const { count: gTotal } = await supabase
      .from('grammar_examples')
      .select('*', { count: 'exact', head: true })
      .in('grammar_point_id', levelGrammarIds);

    setGlobalStats({
      kanji: { learned: 0, total: 0 },
      vocabulary: { learned: vLearned || 0, total: vTotal || 0 },
      grammar: { learned: gLearned || 0, total: gTotal || 0 }
    });
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
                onClick={() => navigate('/quiz?mode=review&type=all')}
                className="w-full max-w-md bg-primary hover:bg-primary-hover text-white shadow-2xl shadow-primary/30 font-black py-4 md:py-6 px-8 md:px-10 rounded-2xl transition-all flex items-center justify-center gap-4 active:scale-95 group"
              >
                <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">quiz</span>
                <span className="text-lg md:text-xl">{dueCount > 0 ? `Review ${dueCount} items` : 'Start Learning'}</span>
              </button>
              <p className="mt-6 text-[10px] font-black text-ghost-grey dark:text-slate-500 uppercase tracking-[0.2em]">
                {dueCount > 0 ? `Approx. ${Math.ceil(dueCount * 0.5)} minutes` : 'No reviews due'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {[
                { label: 'Kanji', stats: globalStats.kanji, color: 'text-emerald-500', icon: 'brush' },
                { label: 'Vocabulary', stats: globalStats.vocabulary, color: 'text-emerald-500', icon: 'menu_book' },
                { label: 'Grammar', stats: globalStats.grammar, color: 'text-amber-500', icon: 'architecture' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-hover hover:shadow-md">
                  <p className="text-ghost-grey dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{s.label} Mastered</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl md:text-3xl font-black text-charcoal dark:text-white">{s.stats.learned}</p>
                    <p className="text-sm font-bold text-ghost-grey dark:text-slate-500">/ {s.stats.total}</p>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${(s.stats.learned / (s.stats.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <Leaderboard />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="p-10 bg-gradient-to-br from-primary to-indigo-600 rounded-[40px] text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-125 transition-transform duration-500">
                <span className="material-symbols-outlined !text-9xl">share</span>
              </div>
              <h3 className="text-3xl font-black mb-4">Share the Mastery</h3>
              <p className="text-white/80 font-medium mb-8 leading-relaxed">
                Invite fellow Senseis to the journey. Unlock exclusive themes and badges for every milestone.
              </p>
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full py-4 bg-white text-primary rounded-2xl font-black shadow-lg hover:bg-slate-50 transition-all active:scale-95"
              >
                Generate Share Card
              </button>
            </div>

            <div className="p-10 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-amber-500">verified</span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost-grey">Recently Unlocked</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: 'fire_extinguisher', label: '7 Day Streak' },
                  { icon: 'auto_stories', label: 'Vocab Master' },
                  { icon: 'new_releases', label: 'Early Adopter' }
                ].map((badge, i) => (
                  <div key={i} className="group relative">
                    <div className="size-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:border-primary transition-colors">
                      <span className="material-symbols-outlined text-ghost-grey group-hover:text-primary">{badge.icon}</span>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[8px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {badge.label}
                    </div>
                  </div>
                ))}
              </div>
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

      {showShareModal && (
        <ShareCard
          stats={shareData.todayStats}
          referralLink={shareData.referralLink}
          onClose={() => setShowShareModal(false)}
        />
      )}
      <Footer />
    </div>
  );
};

export default ProgressPage;

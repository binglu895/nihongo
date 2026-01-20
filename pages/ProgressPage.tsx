
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
  const [stats, setStats] = useState({ kanji: 0, vocab: 0, grammar: 0, listening: 0 });
  const [profile, setProfile] = useState<any>({ streak: 0, completion: 0, level: 'N5', display_name: '', avatar_id: 'samurai' });
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    kanji: { learned: 0, total: 0 },
    vocabulary: { learned: 0, total: 0 },
    grammar: { learned: 0, total: 0 },
    listening: { learned: 0, total: 0 }
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
        .select('streak, completion_percentage, current_level, display_name, avatar_id')
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


      // Fetch Global Stats for ratios
      const allGlobalStats = await fetchGlobalStats(profileData.current_level || 'N5', user.id);

      // Real-time Overall Completion calculation
      const totalLearnedItems = allGlobalStats.kanji.learned + allGlobalStats.vocabulary.learned + allGlobalStats.grammar.learned + allGlobalStats.listening.learned;
      const totalItems = allGlobalStats.kanji.total + allGlobalStats.vocabulary.total + allGlobalStats.grammar.total + allGlobalStats.listening.total;
      const calculatedCompletion = totalItems > 0 ? Math.round((totalLearnedItems / totalItems) * 100) : 0;

      setProfile({
        streak: profileData.streak,
        completion: calculatedCompletion,
        level: profileData.current_level,
        display_name: profileData.display_name,
        avatar_id: profileData.avatar_id
      });

      setStats({
        kanji: allGlobalStats.kanji.learned,
        vocab: allGlobalStats.vocabulary.learned,
        grammar: allGlobalStats.grammar.learned
      });

      // Fetch sharing/referral info
      const refInfo = await getReferralInfo();
      const dailySnapshot = await getDailyStatsSnapshot(user.id);

      if (refInfo) {
        setShareData({
          referralLink: generateShareLink(refInfo.code),
          todayStats: {
            reviews: dailySnapshot.reviews || 0,
            totalDueToday: dailySnapshot.totalDueToday || 50,
            mastered: dailySnapshot.mastered || 0,
            vocab: allGlobalStats.vocabulary.learned,
            grammar: allGlobalStats.grammar.learned,
            kanji: allGlobalStats.kanji.learned,
            listening: allGlobalStats.listening.learned,
            today_vocab: dailySnapshot.today_vocab || 0,
            today_grammar: dailySnapshot.today_grammar || 0,
            today_kanji: dailySnapshot.today_kanji || 0,
            today_listening: dailySnapshot.today_listening || 0,
            target_vocab: allGlobalStats.vocabulary.total || 100,
            target_grammar: allGlobalStats.grammar.total || 100,
            target_kanji: allGlobalStats.kanji.total || 100,
            target_listening: allGlobalStats.listening.total || 100,
            likes: dailySnapshot.likes || 0,
            streak: dailySnapshot.streak || profileData.streak || 0,
            level: profileData.current_level || 1,
            completion: calculatedCompletion,
            studyTimeToday: dailySnapshot.studyTimeToday
          }
        });
      }

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

    // Kanji Total (proxy from vocab table for now or specific kanji table if exists)
    const { count: kTotal } = await supabase.from('vocabulary').select('id', { count: 'exact', head: true }).eq('level', level);
    const { count: kLearned } = await supabase.from('user_kanji_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId).gt('correct_count', 0).in('vocabulary_id', (await supabase.from('vocabulary').select('id').eq('level', level)).data?.map(v => v.id) || []);

    // Listening Total
    const { count: lTotal } = await supabase.from('vocabulary').select('id', { count: 'exact', head: true }).eq('level', level);
    const { count: lLearned } = await supabase.from('user_listening_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId).gt('correct_count', 0).in('vocabulary_id', (await supabase.from('vocabulary').select('id').eq('level', level)).data?.map(v => v.id) || []);

    const newGlobalStats = {
      kanji: { learned: kLearned || 0, total: kTotal || 0 },
      vocabulary: { learned: vLearned || 0, total: vTotal || 0 },
      grammar: { learned: gLearned || 0, total: gTotal || 0 },
      listening: { learned: lLearned || 0, total: lTotal || 0 }
    };

    setGlobalStats(newGlobalStats);
    return newGlobalStats;
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header />
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 py-8 animate-in fade-in duration-700">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-charcoal dark:text-white">Your Journey</h1>
            <p className="text-ghost-grey dark:text-slate-400 text-lg md:text-xl font-medium">Daily mastery and JLPT {profile.level} preparation</p>
          </div>
          <div className="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 shadow-sm animate-bounce-subtle">
            <span className="material-symbols-outlined text-orange-500 fill-orange-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            <span className="text-2xl font-black text-primary">{profile.streak} Day Streak</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl">
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
                  strokeDashoffset={753.98 * (1 - (profile.completion || 0) / 100)}
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

          <div className="lg:col-span-8 flex flex-col gap-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'Kanji', stats: globalStats.kanji, color: 'text-emerald-500', icon: 'brush' },
                { label: 'Vocabulary', stats: globalStats.vocabulary, color: 'text-emerald-500', icon: 'menu_book' },
                { label: 'Grammar', stats: globalStats.grammar, color: 'text-amber-500', icon: 'architecture' },
                { label: 'Listening', stats: globalStats.listening, color: 'text-indigo-500', icon: 'hearing' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-hover hover:shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined !text-lg opacity-40">{s.icon}</span>
                    <p className="text-ghost-grey dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{s.label} Mastered</p>
                  </div>
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

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
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
          todayStats={shareData.todayStats}
          profile={profile}
          referralLink={shareData.referralLink}
          onClose={() => setShowShareModal(false)}
        />
      )}
      <Footer />
    </div>
  );
};

export default ProgressPage;

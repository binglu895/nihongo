import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../services/supabaseClient';

const fonts = [
  { id: 'Outfit', name: 'Outfit (Modern)', family: "'Outfit', sans-serif" },
  { id: 'Inter', name: 'Inter (Clean UI)', family: "'Inter', sans-serif" },
  { id: 'Noto Sans JP', name: 'Noto Sans (Standard)', family: "'Noto Sans JP', sans-serif" },
  { id: 'Zen Maru Gothic', name: 'Zen Maru (Rounded)', family: "'Zen Maru Gothic', sans-serif" },
  { id: 'Sawarabi Mincho', name: 'Sawarabi (Mincho)', family: "'Sawarabi Mincho', serif" },
];

const colors = [
  { id: 'Indigo', hex: '#6366f1', name: 'Modern Indigo' },
  { id: 'Sakura', hex: '#ed64a6', name: 'Sakura Pink' },
  { id: 'Matcha', hex: '#48bb78', name: 'Matcha Green' },
  { id: 'Sky', hex: '#4299e1', name: 'Sky Blue' },
  { id: 'Midnight', hex: '#312e81', name: 'Midnight' },
];

const SettingsPage: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [selectedFont, setSelectedFont] = useState('Outfit');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [dailyGoal, setDailyGoal] = useState(20);
  const [dailyGrammarGoal, setDailyGrammarGoal] = useState(10);
  const [dailyPuzzleGoal, setDailyPuzzleGoal] = useState(10);
  const [showPuzzleDistractors, setShowPuzzleDistractors] = useState(true);
  const [puzzleCategory, setPuzzleCategory] = useState('综合');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('preferred_font, preferred_color, preferred_language, daily_goal, daily_grammar_goal, daily_puzzle_goal, show_puzzle_distractors, puzzle_category')
      .eq('id', userId)
      .single();

    if (data && !error) {
      if (data.preferred_font) setSelectedFont(data.preferred_font);
      if (data.preferred_color) setSelectedColor(data.preferred_color);
      if (data.preferred_language) setSelectedLanguage(data.preferred_language);
      if (data.daily_goal) setDailyGoal(data.daily_goal);
      if (data.daily_grammar_goal) setDailyGrammarGoal(data.daily_grammar_goal);
      if (data.daily_puzzle_goal) setDailyPuzzleGoal(data.daily_puzzle_goal);
      if (data.show_puzzle_distractors !== undefined) setShowPuzzleDistractors(data.show_puzzle_distractors);
      if (data.puzzle_category) setPuzzleCategory(data.puzzle_category);
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;

    setIsSaving(true);
    setSaveStatus('idle');

    const { error } = await supabase
      .from('profiles')
      .update({
        preferred_font: selectedFont,
        preferred_color: selectedColor,
        preferred_language: selectedLanguage,
        daily_goal: dailyGoal,
        daily_grammar_goal: dailyGrammarGoal,
        daily_puzzle_goal: dailyPuzzleGoal,
        show_puzzle_distractors: showPuzzleDistractors,
        puzzle_category: puzzleCategory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } else {
      setSaveStatus('success');
      // Apply immediately
      document.documentElement.style.setProperty('--preferred-font', `'${selectedFont}'`);
      document.documentElement.style.setProperty('--primary-color', selectedColor);
      document.documentElement.style.setProperty('--primary-hover', selectedColor + 'ee');
      document.documentElement.style.setProperty('--primary-active', selectedColor + 'dd');

      setTimeout(() => setSaveStatus('idle'), 3000);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-all duration-300">
      <Header />
      <main className="flex flex-1 justify-center py-16 px-6">
        <div className="flex flex-col max-w-[800px] w-full gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col gap-3 px-2">
            <h1 className="text-charcoal dark:text-white text-5xl font-black leading-tight tracking-tighter">Settings</h1>
            <p className="text-ghost-grey dark:text-slate-400 text-lg font-medium">Personalize your JLPT learning experience.</p>
          </div>

          {/* Vocabulary Daily Goal */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-xl transition-all">
            <h2 className="text-charcoal dark:text-white text-xs font-black p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 uppercase tracking-widest">Vocabulary Study Goal</h2>
            <div className="p-8">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-charcoal dark:text-white">Items per Session</span>
                    <span className="text-xs text-ghost-grey dark:text-slate-500 font-medium">How many words to practice in one sitting.</span>
                  </div>
                  <span className="text-4xl font-black text-primary">{dailyGoal}</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[5, 10, 20, 50].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setDailyGoal(goal)}
                      className={`py-4 rounded-2xl border-2 font-black transition-all
                        ${dailyGoal === goal
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-50 dark:border-slate-800 text-ghost-grey dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'}`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Grammar Daily Goal */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-xl transition-all">
            <h2 className="text-charcoal dark:text-white text-xs font-black p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 uppercase tracking-widest">Grammar Study Goal</h2>
            <div className="p-8">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-charcoal dark:text-white">Items per Session</span>
                    <span className="text-xs text-ghost-grey dark:text-slate-500 font-medium">How many grammar points to practice in one sitting.</span>
                  </div>
                  <span className="text-4xl font-black text-primary">{dailyGrammarGoal}</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[5, 10, 20, 30].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setDailyGrammarGoal(goal)}
                      className={`py-4 rounded-2xl border-2 font-black transition-all
                        ${dailyGrammarGoal === goal
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-50 dark:border-slate-800 text-ghost-grey dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'}`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Sentence Puzzle Daily Goal */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-xl transition-all">
            <h2 className="text-charcoal dark:text-white text-xs font-black p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 uppercase tracking-widest">Sentence Puzzle Goal</h2>
            <div className="p-8">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-charcoal dark:text-white">Items per Session</span>
                    <span className="text-xs text-ghost-grey dark:text-slate-500 font-medium">How many sentence puzzles to practice in one sitting.</span>
                  </div>
                  <span className="text-4xl font-black text-primary">{dailyPuzzleGoal}</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[5, 10, 15, 20].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setDailyPuzzleGoal(goal)}
                      className={`py-4 rounded-2xl border-2 font-black transition-all
                        ${dailyPuzzleGoal === goal
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-50 dark:border-slate-800 text-ghost-grey dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'}`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-50 dark:border-white/5">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-charcoal dark:text-white text-base font-black leading-normal">Practice Category</p>
                      <p className="text-ghost-grey dark:text-slate-400 text-sm font-medium leading-snug">Choose what to focus on in sentence puzzles.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {['格助词', '格助词以外', '综合'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setPuzzleCategory(cat)}
                          className={`py-3 rounded-xl border-2 font-bold text-sm transition-all
                            ${puzzleCategory === cat
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-50 dark:border-slate-800 text-ghost-grey dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-xl transition-all">
            <h2 className="text-charcoal dark:text-white text-xs font-black p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 uppercase tracking-widest">Account</h2>
            <div className="p-4">
              <div className="flex items-center gap-4 px-6 min-h-[96px] py-4 justify-between group">
                <div className="flex items-center gap-5">
                  <div className="text-primary flex items-center justify-center rounded-2xl bg-primary/10 shrink-0 size-14 shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined !text-3xl">mail</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-charcoal dark:text-white text-base font-black leading-normal">Email Address</p>
                    <p className="text-ghost-grey dark:text-slate-400 text-sm font-medium">{session?.user?.email || 'Guest User'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Appearance Section - Font */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-xl transition-all">
            <h2 className="text-charcoal dark:text-white text-xs font-black p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 uppercase tracking-widest">Font Preference</h2>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {fonts.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setSelectedFont(font.id)}
                  className={`flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left group
                    ${selectedFont === font.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                >
                  <span className="text-xs font-black text-ghost-grey dark:text-slate-500 mb-2 uppercase tracking-tight">{font.name}</span>
                  <span
                    className="text-2xl text-charcoal dark:text-white"
                    style={{ fontFamily: font.family }}
                  >
                    日本語の勉強
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Appearance Section - Color */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-xl transition-all">
            <h2 className="text-charcoal dark:text-white text-xs font-black p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 uppercase tracking-widest">Accent Color</h2>
            <div className="p-8 flex flex-wrap gap-6">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.hex)}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div
                    className={`size-16 rounded-2xl shadow-lg transition-all group-hover:scale-110 active:scale-95 flex items-center justify-center
                      ${selectedColor === color.hex ? 'ring-4 ring-offset-4 ring-primary dark:ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColor === color.hex && (
                      <span className="material-symbols-outlined text-white !text-3xl">check</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors
                    ${selectedColor === color.hex ? 'text-primary' : 'text-ghost-grey dark:text-slate-500'}`}>
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
          {/* Language Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-xl transition-all">
            <h2 className="text-charcoal dark:text-white text-xs font-black p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 uppercase tracking-widest">Preferred Language</h2>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {['English', 'Chinese'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all group
                    ${selectedLanguage === lang
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">language</span>
                    <span className="text-base font-black text-charcoal dark:text-white">{lang}</span>
                  </div>
                  {selectedLanguage === lang && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </button>
              ))}
            </div>
            <div className="px-8 pb-8">
              <p className="text-xs text-ghost-grey dark:text-slate-500 font-medium">This language will be used for hints, translations, and AI-powered explanations from Sensei.</p>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-xl">
            <h2 className="text-charcoal dark:text-white text-xs font-black p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 uppercase tracking-widest">Notifications</h2>
            <div className="p-2">
              {[
                { label: "Daily Study Reminder", desc: "Receive a nudge to maintain your daily streak", id: "rem", checked: true },
                { label: "Weekly Progress Report", desc: "A summary of Kanji and Grammar mastery", id: "prog", checked: false }
              ].map((n, idx) => (
                <div key={n.id} className={`flex items-center gap-4 px-6 min-h-[88px] py-6 justify-between ${idx === 0 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}>
                  <div className="flex flex-col justify-center">
                    <p className="text-charcoal dark:text-white text-base font-black leading-normal">{n.label}</p>
                    <p className="text-ghost-grey dark:text-slate-400 text-sm font-medium max-w-[240px] leading-snug">{n.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={n.checked} className="sr-only peer" id={n.id} />
                    <div className="w-14 h-8 bg-gray-100 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-primary text-white font-black py-5 rounded-3xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isSaving ? (
                <span className="loader"></span>
              ) : (
                <span className="material-symbols-outlined">save</span>
              )}
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-10 bg-slate-50 dark:bg-slate-800 text-charcoal dark:text-white font-black py-5 rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              Cancel
            </button>
          </div>

          {
            saveStatus === 'success' && (
              <div className="fixed bottom-10 right-10 bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-500 font-black flex items-center gap-3">
                <span className="material-symbols-outlined">check_circle</span>
                Settings saved successfully!
              </div>
            )
          }

          {
            saveStatus === 'error' && (
              <div className="fixed bottom-10 right-10 bg-error-red text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-500 font-black flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                Failed to save settings.
              </div>
            )
          }
        </div >
      </main >
      <Footer />
    </div >
  );
};

export default SettingsPage;

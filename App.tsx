import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import VocabularyQuizPage from './pages/VocabularyQuizPage';
import GrammarQuizPage from './pages/GrammarQuizPage';
import KanjiPage from './pages/KanjiPage';
import PublicProfilePage from './pages/PublicProfilePage';
import ListeningQuizPage from './pages/ListeningQuizPage';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        applyUserSettings(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        applyUserSettings(session.user.id);
      } else {
        // Reset to defaults on logout
        document.documentElement.style.setProperty('--preferred-font', "'Outfit'");
        document.documentElement.style.setProperty('--primary-color', '#6366f1');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const applyUserSettings = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('preferred_font, preferred_color')
      .eq('id', userId)
      .single();

    if (data && !error) {
      if (data.preferred_font) {
        document.documentElement.style.setProperty('--preferred-font', `'${data.preferred_font}'`);
      }
      if (data.preferred_color) {
        const color = data.preferred_color;
        document.documentElement.style.setProperty('--primary-color', color);

        // Generate variations
        document.documentElement.style.setProperty('--primary-hover', color + 'ee');
        document.documentElement.style.setProperty('--primary-active', color + 'dd');
      }
    }
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="fixed bottom-4 left-4 z-[9999] bg-white dark:bg-slate-800 p-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          aria-label="Toggle dark mode"
        >
          <span className="material-symbols-outlined !text-xl text-primary">
            {darkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/vocab-quiz" element={<VocabularyQuizPage />} />
          <Route path="/grammar-quiz" element={<GrammarQuizPage />} />
          <Route path="/quiz" element={<VocabularyQuizPage />} />
          <Route path="/listening-quiz" element={<ListeningQuizPage />} />
          <Route path="/kanji" element={<KanjiPage />} />
          <Route path="/profile/:referralCode" element={<PublicProfilePage />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;

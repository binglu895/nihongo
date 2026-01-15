
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import QuizPage from './pages/QuizPage';
import KanjiPage from './pages/KanjiPage';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/kanji" element={<KanjiPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;

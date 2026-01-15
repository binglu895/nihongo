
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { JLPTLevel } from '../types';
import { supabase } from '../services/supabaseClient';

import { Language, translations } from '../utils/translations';

const DashboardPage: React.FC<{ language: Language }> = ({ language }) => {
  const navigate = useNavigate();
  const t = translations[language];
  const [level, setLevel] = useState<JLPTLevel>('N3');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('current_level')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setLevel(data.current_level as JLPTLevel);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
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
    { title: t.kanji, icon: "draw", desc: t.kanji_desc, btn: t.kanji_btn, path: "/kanji" },
    { title: t.vocabulary, icon: "menu_book", desc: t.vocabulary_desc, btn: t.vocabulary_btn, path: "/quiz" },
    { title: t.grammar, icon: "architecture", desc: t.grammar_desc, btn: t.grammar_btn, path: "/quiz" },
    { title: t.listening, icon: "hearing", desc: t.listening_desc, btn: t.listening_btn, path: "/quiz" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header language={language} />
      <main className="flex-1 flex flex-col items-center py-16 px-4">
        <div className="w-full max-w-[960px] flex flex-col items-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-ghost-grey dark:text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-6">{t.proficiency_level}</p>
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
          {t.daily_goal}: 15 / 30 {t.minutes_completed}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;

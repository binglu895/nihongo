
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header title="JLPT Pro" />
      <main className="flex flex-1 justify-center py-16 px-6">
        <div className="flex flex-col max-w-[800px] w-full gap-10 animate-in fade-in duration-700">
          <div className="flex flex-col gap-4 px-2">
            <h1 className="text-charcoal dark:text-white text-5xl font-black leading-tight tracking-tighter">Settings</h1>
            <p className="text-muted-purple dark:text-gray-400 text-lg font-medium">Manage your JLPT preparation environment.</p>
          </div>

          <section className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl">
            <h2 className="text-charcoal dark:text-white text-xl font-black p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 uppercase tracking-widest">Account</h2>
            <div className="p-2">
              <div className="flex items-center gap-4 px-6 min-h-[96px] py-4 justify-between group">
                <div className="flex items-center gap-5">
                  <div className="text-primary flex items-center justify-center rounded-2xl bg-primary/10 shrink-0 size-14 shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined !text-3xl">mail</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-charcoal dark:text-white text-base font-black leading-normal">Email Address</p>
                    <p className="text-muted-purple dark:text-gray-400 text-sm font-medium">takeshi.sato@minimal.jp</p>
                  </div>
                </div>
                <button className="flex min-w-[100px] items-center justify-center rounded-xl h-11 px-6 bg-gray-100 dark:bg-slate-800 text-charcoal dark:text-white text-sm font-black hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors active:scale-95 shadow-sm">
                  Change
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl">
            <h2 className="text-charcoal dark:text-white text-xl font-black p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 uppercase tracking-widest">Notifications</h2>
            <div className="p-2">
              {[
                { label: "Daily Study Reminder", desc: "Receive a nudge to maintain your daily streak", id: "rem", checked: true },
                { label: "Weekly Progress Report", desc: "A summary of Kanji and Grammar mastery", id: "prog", checked: false }
              ].map((n, idx) => (
                <div key={n.id} className={`flex items-center gap-4 px-6 min-h-[88px] py-6 justify-between ${idx === 0 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}>
                  <div className="flex flex-col justify-center">
                    <p className="text-charcoal dark:text-white text-base font-black leading-normal">{n.label}</p>
                    <p className="text-muted-purple dark:text-gray-400 text-sm font-medium max-w-[240px] leading-snug">{n.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={n.checked} className="sr-only peer" id={n.id}/>
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="flex-1 bg-primary text-white font-black py-5 rounded-2xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/30 active:scale-[0.98]">
              Save All Changes
            </button>
            <button className="px-10 bg-gray-100 dark:bg-slate-800 text-charcoal dark:text-white font-black py-5 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all shadow-sm">
              Reset
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('password123');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('App is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment variables in Vercel.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="w-full px-6 py-8 flex justify-center">
        <div className="flex items-center gap-3">
          <div className="size-6 text-primary">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
            </svg>
          </div>
          <h1 className="text-charcoal dark:text-white text-xl font-bold tracking-tight uppercase">NIHONGO</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-2xl p-8 md:p-10 shadow-xl dark:shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-charcoal dark:text-white text-2xl font-extrabold tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-charcoal/60 dark:text-white/60 text-sm mt-2">
              {isSignUp ? 'Join Nihongo and start your journey.' : 'Log in to continue your JLPT journey.'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-lg text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-charcoal dark:text-white/80 text-xs font-bold uppercase tracking-widest px-1">Email</label>
                <input
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-3.5 text-charcoal dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-black/30 dark:placeholder:text-white/20"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-charcoal dark:text-white/80 text-xs font-bold uppercase tracking-widest">Password</label>
                  {!isSignUp && <a className="text-primary text-[10px] font-bold uppercase tracking-wider hover:underline" href="#">Forgot?</a>}
                </div>
                <input
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-3.5 text-charcoal dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-black/30 dark:placeholder:text-white/20"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              className="w-full bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] relative overflow-hidden h-[56px]"
              type="submit"
              disabled={isLoading}
            >
              {!isLoading ? (
                <span className="submit-text">{isSignUp ? 'Sign Up' : 'Sign In'}</span>
              ) : (
                <span className="loader"></span>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5 dark:border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-charcoal/40 dark:text-white/40 font-bold tracking-widest">Or</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center gap-3 border border-black/10 dark:border-white/10 rounded-xl py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              <span className="material-symbols-outlined text-charcoal dark:text-white text-xl">brand_awareness</span>
              <span className="text-sm font-bold text-charcoal dark:text-white">Google</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-3 border border-black/10 dark:border-white/10 rounded-xl py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              <span className="material-symbols-outlined text-charcoal dark:text-white text-xl">phone_iphone</span>
              <span className="text-sm font-bold text-charcoal dark:text-white">Apple</span>
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-charcoal/60 dark:text-white/60 text-sm">
              {isSignUp ? 'Already have an account?' : 'New to Nihongo?'}
              <button
                className="text-primary font-bold hover:underline ml-1"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Log in' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-[10px] text-charcoal/30 dark:text-white/20 uppercase tracking-[0.2em] font-bold">日本語 • Minimalism • Mastery</p>
      </footer>
    </div>
  );
};

export default AuthPage;

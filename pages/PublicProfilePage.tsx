import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfileByReferralCode } from '../services/sharingService';
import Footer from '../components/Footer';

const PublicProfilePage: React.FC = () => {
    const { referralCode } = useParams<{ referralCode: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const copyToClipboard = async (text: string) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                alert('Profile link copied!');
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Profile link copied!');
            }
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    useEffect(() => {
        if (referralCode) {
            getProfileByReferralCode(referralCode).then(data => {
                setProfile(data);
                setLoading(false);
            });
        }
    }, [referralCode]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="loader border-primary border-t-transparent !size-10"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6">
                <h1 className="text-4xl font-black mb-4">404</h1>
                <p className="text-ghost-grey mb-8">Sensei not found. This referral link might be invalid.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center p-6 md:p-12">
            <header className="w-full max-w-4xl flex justify-center mb-16">
                <div className="flex items-center gap-3">
                    <div className="size-8 text-primary">
                        <svg fill="currentColor" viewBox="0 0 48 48">
                            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight uppercase">NIHONGO</h1>
                </div>
            </header>

            <main className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-2xl border border-slate-100 dark:border-white/5 text-center relative overflow-hidden">
                {/* Decorative Pixel Grid */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                <div className="relative z-10">
                    <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-slate-800 shadow-xl">
                        <span className="material-symbols-outlined !text-4xl text-primary">person</span>
                    </div>

                    <h2 className="text-ghost-grey text-xs font-black uppercase tracking-[0.2em] mb-2 text-center">Mastery Profile</h2>
                    <h3 className="text-3xl font-black text-charcoal dark:text-white mb-8">Legendary Sensei</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-ghost-grey mb-1">Vocabulary</p>
                            <p className="text-2xl font-black text-primary">{profile.vocab || 0}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-ghost-grey mb-1">Grammar</p>
                            <p className="text-2xl font-black text-charcoal dark:text-white">{profile.grammar || 0}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-ghost-grey mb-1">Kanji</p>
                            <p className="text-2xl font-black text-charcoal dark:text-white">{profile.kanji || 0}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-ghost-grey mb-1">Listening</p>
                            <p className="text-2xl font-black text-charcoal dark:text-white">{profile.listening || 0}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mb-10">
                        <div className="px-6 py-2 bg-amber-400/10 text-amber-600 rounded-full flex items-center gap-2 border border-amber-400/20">
                            <span className="material-symbols-outlined !text-sm">local_fire_department</span>
                            <span className="text-xs font-black uppercase tracking-widest">{profile.streak} Day Streak</span>
                        </div>
                        <div className="px-6 py-2 bg-primary/10 text-primary rounded-full flex items-center gap-2 border border-primary/20">
                            <span className="material-symbols-outlined !text-sm">military_tech</span>
                            <span className="text-xs font-black uppercase tracking-widest">Level {profile.level}</span>
                        </div>
                    </div>

                    <div className="p-8 bg-primary rounded-[32px] text-white shadow-xl shadow-primary/30 mb-8 transform hover:scale-[1.02] transition-all duration-500">
                        <h4 className="text-xl font-black mb-2">Ready to Master Japanese?</h4>
                        <p className="text-sm opacity-90 mb-6 leading-relaxed px-4">Join this Sensei and start your own JLPT N5 mastery journey today. Gamified, minimalist, and 5x more effective.</p>
                        <button
                            onClick={() => navigate(`/?mode=signup&ref=${referralCode}`)}
                            className="w-full py-4 bg-white text-primary rounded-2xl font-black hover:bg-slate-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">rocket_launch</span>
                            Start Your Journey
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left px-2">
                        <div
                            className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => copyToClipboard(window.location.href)}
                        >
                            <span className="material-symbols-outlined text-primary mb-2">content_copy</span>
                            <h5 className="text-xs font-black uppercase tracking-widest mb-1">Share This Profile</h5>
                            <p className="text-[10px] text-ghost-grey">Click to copy the link and show off your progress.</p>
                        </div>
                        <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5">
                            <span className="material-symbols-outlined text-primary mb-2">psychology</span>
                            <h5 className="text-xs font-black uppercase tracking-widest mb-1">Grammar Mastery</h5>
                            <p className="text-[10px] text-ghost-grey">Learn N5 grammar with natural sentences and translations.</p>
                        </div>
                    </div>

                    <p className="text-[10px] text-ghost-grey font-bold uppercase tracking-[0.3em] mt-10">Minimalism • Spaced Repetition • Mastery</p>
                </div>
            </main>

            <div className="mt-12 text-center text-ghost-grey max-w-sm px-6">
                <p className="text-[10px] font-medium leading-relaxed opacity-60">
                    Trusted by 10,000+ Senseis worldwide. Built for serious learners who value focus and results.
                </p>
            </div>

            <div className="mt-auto pt-12">
                <Footer />
            </div>
        </div>
    );
};

export default PublicProfilePage;

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

interface ShareCardProps {
    todayStats: {
        reviews: number;
        streak: number;
        level: number;
        completion: number;
        studyTimeToday?: number;
    };
    profile: {
        display_name?: string;
        avatar_id?: string;
        level?: number;
    };
    referralLink: string;
    onClose: () => void;
}

const FRAME_STYLES = {
    common: 'border-slate-300 shadow-sm',
    rare: 'border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    epic: 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-pulse',
    legendary: 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)] border-[3px]'
};

type CardStyle = 'minimalist' | 'pixel' | 'japanese';

const PIXEL_AVATARS = [
    { id: 'samurai', icon: '⚔️', label: 'Bushido Samurai', seed: 'samurai' },
    { id: 'ninja', icon: '👥', label: 'Kage Ninja', seed: 'ninja' },
    { id: 'miko', icon: '⛩️', label: 'Shrine Maiden', seed: 'miko' },
    { id: 'kitsune', icon: '🦊', label: 'Inari Fox', seed: 'kitsune' },
    { id: 'tanuki', icon: '🍃', label: 'Forest Tanuki', seed: 'tanuki' },
    { id: 'daruma', icon: '🏮', label: 'Zen Daruma', seed: 'daruma' },
    { id: 'neko', icon: '🐱', label: 'Lucky Neko', seed: 'neko' },
    { id: 'ronin', icon: '🌊', label: 'Wandering Ronin', seed: 'ronin' }
];

const ShareCard: React.FC<ShareCardProps> = ({ todayStats, profile, referralLink, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                alert('Link copied to clipboard!');
            } else {
                // Fallback for non-secure contexts or unsupported browsers
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert('Link copied to clipboard!');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    const getFrameStyle = (level: number) => {
        if (level >= 21) return FRAME_STYLES.legendary;
        if (level >= 11) return FRAME_STYLES.epic;
        if (level >= 6) return FRAME_STYLES.rare;
        return FRAME_STYLES.common;
    };

    const getAvatarUrl = (id: string) => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${id}&backgroundColor=transparent`;

    const mins = Math.max(1, Math.floor((todayStats.studyTimeToday || 0) / 60));
    const displayName = profile.display_name || "Sensei's Disciple";
    const avatarId = profile.avatar_id || 'samurai';
    const userLevel = profile.level || todayStats.level || 1;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-md p-2 md:p-4 animate-in fade-in duration-300 overflow-y-auto pt-10 md:pt-20">
            <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-6 md:gap-8 items-center lg:items-start pb-20">

                {/* Preview Card */}
                <div
                    ref={cardRef}
                    className="w-full max-w-[400px] aspect-[4/5] p-6 md:p-10 flex flex-col justify-between relative overflow-hidden bg-white rounded-[40px] border border-slate-100 shadow-2xl"
                >
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-black tracking-tight text-charcoal">{displayName}</h2>
                            <p className="text-[10px] font-black tracking-widest uppercase opacity-60">Level {userLevel} • Apprentice</p>
                        </div>
                        <div className={`size-20 md:size-24 bg-white/40 dark:bg-black/20 rounded-[32px] p-4 shadow-inner border-2 backdrop-blur-sm flex items-center justify-center ${getFrameStyle(userLevel)}`}>
                            <img src={getAvatarUrl(avatarId)} alt="" className="size-full object-contain drop-shadow-xl" />
                        </div>
                    </div>

                    <div className="flex-grow flex flex-col justify-center gap-6 relative z-10 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/50 dark:bg-white/5 p-4 rounded-3xl border border-black/5 flex flex-col items-center justify-center text-center">
                                <p className="text-[9px] font-black uppercase text-ghost-grey mb-0.5 tracking-widest">Today's Focus</p>
                                <p className="text-3xl font-black text-primary leading-none">
                                    {mins}<span className="text-xs ml-1 text-primary/60 italic">min</span>
                                </p>
                            </div>
                            <div className="bg-white/50 dark:bg-white/5 p-4 rounded-3xl border border-black/5 flex flex-col items-center justify-center text-center">
                                <p className="text-[9px] font-black uppercase text-ghost-grey mb-0.5 tracking-widest">Day Streak</p>
                                <p className="text-3xl font-black text-amber-500 leading-none">
                                    {todayStats.streak}<span className="ml-1">🔥</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 px-2">
                            {[
                                { label: 'Vocabulary', key: 'vocab', color: 'bg-primary' },
                                { label: 'Grammar', key: 'grammar', color: 'bg-emerald-400' },
                                { label: 'Character', key: 'kanji', color: 'bg-indigo-400' },
                                { label: 'Listening', key: 'listening', color: 'bg-pink-400' }
                            ].map(item => {
                                const val = (todayStats as any)[item.key] || 0;
                                const progress = Math.min(100, (val / 100) * 100);
                                return (
                                    <div key={item.key} className="space-y-1.5">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-charcoal/60 dark:text-white/40">{item.label}</p>
                                            <p className="text-[10px] font-black italic text-charcoal dark:text-white">
                                                {val} <span className="text-[8px] opacity-40">/ 100</span>
                                            </p>
                                        </div>
                                        <div className="w-full h-2.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-black/5">
                                            <div
                                                className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-sm relative`}
                                                style={{ width: `${progress}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-end justify-between border-t pt-8 border-black/5 dark:border-white/10 relative z-10">
                        <div className="flex flex-col gap-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-ghost-grey italic">Scan to Study Together</p>
                            <p className="text-lg font-black text-charcoal dark:text-white tracking-tight leading-none italic">
                                Join me on <span className="text-primary italic">Nihongo Mastery</span>
                            </p>
                        </div>
                        <div className="bg-white p-2 rounded-[20px] shadow-2xl border border-black/5">
                            <QRCodeSVG
                                value={referralLink}
                                size={68}
                                level="H"
                                includeMargin={false}
                                imageSettings={{
                                    src: getAvatarUrl(avatarId),
                                    height: 22,
                                    width: 22,
                                    excavate: true,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 w-full lg:max-w-md">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black">Ready to Share</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                            <span className="material-symbols-outlined !text-2xl">close</span>
                        </button>
                    </div>

                    <div className="space-y-10">
                        <div className="flex flex-col items-center gap-4 py-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                            <div className={`size-24 rounded-[32px] border-2 p-3 bg-white dark:bg-slate-800 ${getFrameStyle(userLevel)}`}>
                                <img src={getAvatarUrl(avatarId)} alt="Avatar" className="size-full object-contain" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black">{displayName}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Level {userLevel} Sensei</p>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-ghost-grey">Personal Study Link</span>
                                <button
                                    onClick={() => copyToClipboard(referralLink)}
                                    className="text-primary text-[10px] font-black flex items-center gap-1 hover:underline uppercase tracking-widest"
                                >
                                    <span className="material-symbols-outlined !text-base">content_copy</span>
                                    Copy Link
                                </button>
                            </div>
                            <p className="text-xs font-bold truncate opacity-40">{referralLink}</p>
                        </div>

                        <button
                            onClick={async () => {
                                if (cardRef.current === null) return;
                                setIsExporting(true);
                                try {
                                    const dataUrl = await toPng(cardRef.current, { cacheBust: true });
                                    const link = document.createElement('a');
                                    link.download = `nihongo-mastery-${new Date().getTime()}.png`;
                                    link.href = dataUrl;
                                    link.click();
                                } catch (err) {
                                    console.error('Export failed', err);
                                } finally {
                                    setIsExporting(false);
                                }
                            }}
                            disabled={isExporting}
                            className="w-full py-6 bg-primary hover:bg-primary-hover text-white rounded-[24px] font-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isExporting ? <span className="loader border-white border-t-transparent !size-6"></span> : <span className="material-symbols-outlined !text-2xl">download</span>}
                            {isExporting ? 'Generating Art...' : 'Save Study Report'}
                        </button>

                        <p className="text-[10px] text-center font-bold text-ghost-grey leading-relaxed px-6 opacity-60">
                            Your report link now points to your **Public Sensei Profile**. Drive impact and earn exclusive rewards!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareCard;

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

interface ShareCardProps {
    stats: {
        reviews: number;
        streak: number;
        level: number;
        completion: number;
        mastered?: number; // New: Total mastered items
    };
    referralLink: string;
    onClose: () => void;
}

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

const ShareCard: React.FC<ShareCardProps> = ({ stats, referralLink, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [activeStyle, setActiveStyle] = useState<CardStyle>('minimalist');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(PIXEL_AVATARS[0]);

    const downloadCard = async () => {
        if (cardRef.current === null) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                style: {
                    borderRadius: activeStyle === 'minimalist' ? '40px' : '0'
                }
            });
            const link = document.createElement('a');
            link.download = `nihongo-mastery-${new Date().getTime()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setIsExporting(false);
        }
    };

    const getStyleClasses = () => {
        switch (activeStyle) {
            case 'pixel':
                return {
                    card: 'bg-[#ffeb3b] border-[6px] border-black font-mono shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]',
                    title: 'text-2xl uppercase tracking-tighter bg-black text-white px-3 py-1 inline-block mb-4',
                    statLabel: 'text-[10px] uppercase font-black text-black/40',
                    statValue: 'text-3xl font-black text-black leading-none',
                    mascot: 'text-7xl grayscale'
                };
            case 'japanese':
                return {
                    card: 'bg-[#f8f5f0] border-[1px] border-[#d4cfc3] font-serif shadow-sm relative overflow-hidden',
                    title: 'text-3xl font-serif text-[#b03a2e] writing-mode-vertical border-r border-[#d4cfc3] pr-4',
                    statLabel: 'text-[10px] uppercase tracking-widest text-[#8d8d8d] mb-1 font-bold',
                    statValue: 'text-4xl font-serif text-[#2c3e50]',
                    mascot: 'text-6xl opacity-20 absolute -right-4 -bottom-4 rotate-12'
                };
            default: // minimalist
                return {
                    card: 'bg-white rounded-[40px] border border-slate-100 shadow-2xl',
                    title: 'text-3xl font-black tracking-tight text-charcoal',
                    statLabel: 'text-[10px] uppercase font-black tracking-[0.2em] text-ghost-grey',
                    statValue: 'text-4xl font-black text-primary leading-none',
                    mascot: 'text-6xl transition-all hover:scale-110'
                };
        }
    };

    const classes = getStyleClasses();

    const getAvatarUrl = (seed: string) => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=transparent`;

    const mins = Math.max(1, Math.floor(((stats as any).studyTimeToday || 0) / 60));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
            <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-8 items-center lg:items-start py-8">

                {/* Preview Card */}
                <div
                    ref={cardRef}
                    className={`w-full max-w-[400px] aspect-[4/5] p-6 md:p-10 flex flex-col justify-between relative overflow-hidden ${classes.card}`}
                >
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex flex-col gap-1">
                            <h2 className={classes.title}>Sensei's Disciple</h2>
                            <p className="text-[10px] font-black tracking-widest uppercase opacity-60">Level {stats.level} • {selectedAvatar.label}</p>
                        </div>
                        <div className="size-20 md:size-24 bg-white/40 dark:bg-black/20 rounded-[32px] p-4 shadow-inner border border-black/5 backdrop-blur-sm flex items-center justify-center">
                            <img src={getAvatarUrl(selectedAvatar.id)} alt="" className="size-full object-contain drop-shadow-xl" />
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
                                    {stats.streak}<span className="ml-1">🔥</span>
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
                                const val = (stats as any)[item.key] || 0;
                                const progress = Math.min(100, (val / 100) * 100);
                                return (
                                    <div key={item.key} className="space-y-1.5">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-charcoal/60 dark:text-white/40">{item.label}</p>
                                            <p className="text-[10px] font-black italic text-charcoal dark:text-white">{val} mastered</p>
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
                                    src: getAvatarUrl(selectedAvatar.id),
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
                        <h3 className="text-2xl font-black">Customize Report</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                            <span className="material-symbols-outlined !text-2xl">close</span>
                        </button>
                    </div>

                    <div className="space-y-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost-grey mb-4">Choose Your Sensei Spirit</p>
                            <div className="grid grid-cols-4 gap-3">
                                {PIXEL_AVATARS.map(avatar => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => setSelectedAvatar(avatar)}
                                        className={`size-14 md:size-16 flex items-center justify-center text-3xl rounded-2xl border-2 transition-all ${selectedAvatar.id === avatar.id ? 'border-primary bg-primary/10 scale-105 shadow-lg' : 'border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-slate-200 opacity-60'}`}
                                        title={avatar.label}
                                    >
                                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatar.seed}&backgroundColor=transparent`} alt="" className="size-10 object-contain" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost-grey mb-4">Visual Aesthetic</p>
                            <div className="grid grid-cols-3 gap-3">
                                {(['minimalist', 'pixel', 'japanese'] as CardStyle[]).map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setActiveStyle(style)}
                                        className={`py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${activeStyle === style ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-white/5'}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-ghost-grey">Personal Study Link</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(referralLink)}
                                    className="text-primary text-[10px] font-black flex items-center gap-1 hover:underline uppercase tracking-widest"
                                >
                                    <span className="material-symbols-outlined !text-base">content_copy</span>
                                    Copy Link
                                </button>
                            </div>
                            <p className="text-xs font-bold truncate opacity-40">{referralLink}</p>
                        </div>

                        <button
                            onClick={downloadCard}
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

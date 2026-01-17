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
    { id: 'kitsune', icon: '🦊', label: 'Swift Fox' },
    { id: 'tanuki', icon: '🍃', label: 'Trickster Tanuki' },
    { id: 'daruma', icon: '🏮', label: 'Zen Daruma' },
    { id: 'cat', icon: '🐱', label: 'Lucky Neko' }
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
            <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-8 items-center lg:items-start py-8">

                {/* Preview Card */}
                <div
                    ref={cardRef}
                    className={`w-[400px] shrink-0 aspect-[4/5] p-10 flex flex-col justify-between relative overflow-hidden ${classes.card}`}
                >
                    {activeStyle === 'japanese' && (
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                    )}

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex flex-col gap-1">
                            <h2 className={classes.title}>Sensei's Disciple</h2>
                            <p className="text-sm font-black opacity-60">Level {stats.level} • {selectedAvatar.label}</p>
                        </div>
                        <div className={`text-6xl ${classes.mascot} flex items-center justify-center bg-white/40 dark:bg-black/20 w-16 h-16 rounded-2xl shadow-inner border border-black/5`}>
                            {selectedAvatar.icon}
                        </div>
                    </div>

                    <div className="flex-grow flex flex-col justify-center gap-10 relative z-10">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                            <div>
                                <p className={classes.statLabel}>Growth Today</p>
                                <p className={classes.statValue}>+{stats.reviews}</p>
                            </div>
                            <div>
                                <p className={classes.statLabel}>Day Streak</p>
                                <p className={classes.statValue}>{stats.streak}🔥</p>
                            </div>
                            <div>
                                <p className={classes.statLabel}>Total Mastery</p>
                                <p className={classes.statValue}>{stats.mastered || 0}</p>
                            </div>
                            <div>
                                <p className={classes.statLabel}>N5 Progress</p>
                                <p className={classes.statValue}>{stats.completion}%</p>
                            </div>
                        </div>

                        <div className="w-full h-4 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden border border-black/5 p-0.5">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-1000 shadow-sm"
                                style={{ width: `${stats.completion}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-end justify-between border-t pt-8 border-black/5 dark:border-white/10 relative z-10">
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost-grey">Scan to Study Together</p>
                            <p className="text-[11px] font-black text-charcoal dark:text-white">Join me on Nihongo Mastery</p>
                        </div>
                        <div className="bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/5 relative">
                            <QRCodeSVG
                                value={referralLink}
                                size={72}
                                level="H"
                                includeMargin={false}
                                imageSettings={{
                                    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">${selectedAvatar.icon}</text></svg>`,
                                    x: undefined,
                                    y: undefined,
                                    height: 20,
                                    width: 20,
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
                                        className={`size-16 flex items-center justify-center text-3xl rounded-2xl border-2 transition-all ${selectedAvatar.id === avatar.id ? 'border-primary bg-primary/10 scale-110 shadow-lg' : 'border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-slate-200 opacity-60'}`}
                                        title={avatar.label}
                                    >
                                        {avatar.icon}
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

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

interface ShareCardProps {
    stats: {
        reviews: number;
        streak: number;
        level: number;
        completion: number;
    };
    referralLink: string;
    onClose: () => void;
}

type CardStyle = 'minimalist' | 'pixel' | 'japanese';

const ShareCard: React.FC<ShareCardProps> = ({ stats, referralLink, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [activeStyle, setActiveStyle] = useState<CardStyle>('minimalist');
    const [isExporting, setIsExporting] = useState(false);

    const downloadCard = async () => {
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
    };

    const getStyleClasses = () => {
        switch (activeStyle) {
            case 'pixel':
                return {
                    card: 'bg-[#ffeb3b] border-4 border-black font-mono shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
                    title: 'text-2xl uppercase tracking-tighter bg-black text-white px-2 py-1 inline-block mb-4',
                    statLabel: 'text-[10px] uppercase font-bold text-black/60',
                    statValue: 'text-3xl font-black text-black',
                    mascot: 'text-6xl grayscale'
                };
            case 'japanese':
                return {
                    card: 'bg-[#f8f5f0] border-[1px] border-[#d4cfc3] font-serif shadow-sm relative overflow-hidden',
                    title: 'text-3xl font-serif text-[#b03a2e] writing-mode-vertical border-r border-[#d4cfc3] pr-4',
                    statLabel: 'text-xs text-[#8d8d8d] mb-1',
                    statValue: 'text-4xl font-serif text-[#2c3e50]',
                    mascot: 'text-6xl opacity-20 absolute -right-4 -bottom-4 rotate-12'
                };
            default: // minimalist
                return {
                    card: 'bg-white rounded-[40px] border border-slate-100 shadow-2xl',
                    title: 'text-3xl font-black tracking-tight text-charcoal',
                    statLabel: 'text-[10px] uppercase font-black tracking-[0.2em] text-ghost-grey',
                    statValue: 'text-4xl font-black text-primary',
                    mascot: 'text-6xl transition-all hover:scale-110'
                };
        }
    };

    const classes = getStyleClasses();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8 items-start">

                {/* Preview Card */}
                <div
                    ref={cardRef}
                    className={`w-[400px] aspect-[4/5] p-10 flex flex-col justify-between ${classes.card}`}
                >
                    {activeStyle === 'japanese' && (
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                    )}

                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <h2 className={classes.title}>Sensei's Disciple</h2>
                            <p className="text-sm font-medium opacity-60">Mastery Journey · Level {stats.level}</p>
                        </div>
                        <span className={`material-symbols-outlined ${classes.mascot}`}>
                            {activeStyle === 'minimalist' ? 'auto_awesome' : activeStyle === 'pixel' ? 'videogame_asset' : 'self_improvement'}
                        </span>
                    </div>

                    <div className="flex-grow flex flex-col justify-center gap-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className={classes.statLabel}>Today's Wins</p>
                                <p className={classes.statValue}>+{stats.reviews}</p>
                            </div>
                            <div>
                                <p className={classes.statLabel}>Current Streak</p>
                                <p className={classes.statValue}>{stats.streak}</p>
                            </div>
                        </div>

                        <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000"
                                style={{ width: `${stats.completion}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-end justify-between border-t pt-8 border-black/5 dark:border-white/5">
                        <div className="flex flex-col gap-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Scan to Study</p>
                            <p className="text-[10px] font-black tracking-tight">{stats.completion}% of JLPT N5 Mastered</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl shadow-inner border border-black/5">
                            <QRCodeSVG value={referralLink} size={64} />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-slate-800 w-full">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black">Share Your Victory</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost-grey mb-4">Choose Your Aesthetic</p>
                            <div className="grid grid-cols-3 gap-3">
                                {(['minimalist', 'pixel', 'japanese'] as CardStyle[]).map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setActiveStyle(style)}
                                        className={`py-3 rounded-xl border-2 transition-all font-black text-sm capitalize ${activeStyle === style ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-white/5 hover:border-slate-200'}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-ghost-grey">Referral Link</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(referralLink)}
                                    className="text-primary text-xs font-black flex items-center gap-1 hover:underline"
                                >
                                    <span className="material-symbols-outlined !text-sm">content_copy</span>
                                    Copy
                                </button>
                            </div>
                            <p className="text-sm font-medium truncate opacity-60">{referralLink}</p>
                        </div>

                        <button
                            onClick={downloadCard}
                            disabled={isExporting}
                            className="w-full py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                        >
                            {isExporting ? <span className="loader border-white border-t-transparent !size-5"></span> : <span className="material-symbols-outlined">download</span>}
                            {isExporting ? 'Exporting...' : 'Download Share Image'}
                        </button>

                        <p className="text-[10px] text-center font-bold text-ghost-grey leading-relaxed px-4">
                            Share your daily progress on WeChat, TikTok or XiaoHongShu to inspire others and unlock exclusive Sensei Skins!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareCard;

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
    const [isPrinting, setIsPrinting] = useState(false);
    const [copied, setCopied] = useState(false);

    const triggerCopyFeedback = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyToClipboard = async (text: string) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                triggerCopyFeedback();
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    triggerCopyFeedback();
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

    // Review Target (e.g., 50 per day as a fixed target for the progress bar, or just show mastery)
    const reviewTarget = 50;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[32px] p-4 md:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors z-20">
                    <span className="material-symbols-outlined !text-lg">close</span>
                </button>

                <div className="flex flex-col gap-3">
                    <div className="text-center">
                        <h3 className="text-lg font-black tracking-tight">Mastery Report</h3>
                    </div>

                    {/* Unified Preview Card - The Export Target */}
                    <div
                        ref={cardRef}
                        className={`w-full aspect-[4/5] p-5 md:p-6 flex flex-col justify-between relative overflow-hidden bg-white rounded-[24px] border border-slate-100 shadow-xl mx-auto ${isPrinting ? '' : 'max-h-[380px]'}`}
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex flex-col gap-0">
                                <h2 className="text-xl font-black tracking-tight text-charcoal leading-tight">{displayName}</h2>
                                <p className="text-[8px] font-black tracking-widest uppercase opacity-60">Level {userLevel} • Apprentice</p>
                            </div>
                            <div className={`size-12 md:size-14 bg-white/40 rounded-xl p-2 shadow-inner border-2 backdrop-blur-sm flex items-center justify-center ${getFrameStyle(userLevel)}`}>
                                <img src={getAvatarUrl(avatarId)} alt="" className="size-full object-contain drop-shadow-lg" />
                            </div>
                        </div>

                        <div className="flex-grow flex flex-col justify-center gap-2 relative z-10 py-1">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-slate-50 p-2 rounded-xl border border-black/[0.02] flex flex-col items-center justify-center text-center">
                                    <p className="text-[7px] font-black uppercase text-ghost-grey mb-0.5 tracking-tight">Time</p>
                                    <p className="text-lg font-black text-primary leading-none">
                                        {mins}<span className="text-[8px] ml-0.5 text-primary/60 italic">m</span>
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl border border-black/[0.02] flex flex-col items-center justify-center text-center">
                                    <p className="text-[7px] font-black uppercase text-ghost-grey mb-0.5 tracking-tight">Streak</p>
                                    <p className="text-lg font-black text-amber-500 leading-none">
                                        {todayStats.streak}<span className="ml-0.5 text-[10px]">🔥</span>
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl border border-black/[0.02] flex flex-col items-center justify-center text-center">
                                    <p className="text-[7px] font-black uppercase text-ghost-grey mb-0.5 tracking-tight">Review</p>
                                    <p className="text-lg font-black text-emerald-500 leading-none">
                                        {todayStats.reviews || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1.5 md:space-y-2 px-0.5">
                                {[
                                    { label: 'Vocabulary', key: 'vocab', color: 'bg-primary' },
                                    { label: 'Grammar', key: 'grammar', color: 'bg-emerald-400' },
                                    { label: 'Character', key: 'kanji', color: 'bg-indigo-400' },
                                    { label: 'Listening', key: 'listening', color: 'bg-pink-400' },
                                    { label: 'Retention', key: 'reviews', color: 'bg-amber-400', isReview: true }
                                ].map(item => {
                                    const total = item.isReview ? (todayStats.reviews || 0) : ((todayStats as any)[item.key] || 0);
                                    const todayCount = item.isReview ? (todayStats.reviews || 0) : ((todayStats as any)[`today_${item.key}`] || 0);
                                    const target = item.isReview ? reviewTarget : ((todayStats as any)[`target_${item.key}`] || 100);

                                    const prevCount = Math.max(0, total - todayCount);
                                    const prevProgress = (prevCount / target) * 100;
                                    const todayProgress = (todayCount / target) * 100;

                                    return (
                                        <div key={item.key} className="space-y-0.5">
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-1">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-charcoal/60">{item.label}</p>
                                                    {todayCount > 0 && !item.isReview && <span className="text-[6px] font-black text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded leading-none">+{todayCount}</span>}
                                                </div>
                                                <p className="text-[8px] font-black italic text-charcoal leading-none">
                                                    {total} <span className="text-[7px] opacity-40">/ {target}</span>
                                                </p>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden p-[1.5px] border border-black/5 flex">
                                                {/* Previous Progress */}
                                                <div
                                                    className={`h-full ${item.color} opacity-30 rounded-l-full transition-all duration-1000`}
                                                    style={{ width: `${prevProgress}%` }}
                                                />
                                                {/* Today's Progress */}
                                                <div
                                                    className={`h-full ${item.color} rounded-r-full transition-all duration-1000 shadow-sm relative`}
                                                    style={{ width: `${todayProgress}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* QR Code Section - Only visible in export */}
                        {isPrinting && (
                                </div>
                    <div className="bg-white p-2 rounded-[20px] shadow-2xl border border-black/5">
                        <QRCodeSVG
                            value={referralLink}
                            size={60}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: getAvatarUrl(avatarId),
                                height: 18,
                                width: 18,
                                excavate: true,
                            }}
                        />
                    </div>
                </div>
                        )}
            </div>

            {/* Actions */}
            <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 relative">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-ghost-grey">Personal Study Link</span>
                        <button
                            onClick={() => copyToClipboard(referralLink)}
                            className="text-primary text-[10px] font-black flex items-center gap-1 hover:underline uppercase tracking-widest relative"
                        >
                            <span className="material-symbols-outlined !text-base">content_copy</span>
                            {copied ? <span className="text-emerald-500">Copied!</span> : 'Copy Link'}
                            {copied && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-3 py-1.5 rounded-full animate-bounce-subtle shadow-lg whitespace-nowrap">
                                    Copied to clipboard!
                                </div>
                            )}
                        </button>
                    </div>
                    <p className="text-xs font-bold truncate opacity-40">{referralLink}</p>
                </div>

                <button
                    onClick={async () => {
                        if (cardRef.current === null) return;
                        setIsExporting(true);
                        setIsPrinting(true);
                        // Give React time to render the QR code before capturing
                        setTimeout(async () => {
                            try {
                                const dataUrl = await toPng(cardRef.current!, { cacheBust: true });
                                const link = document.createElement('a');
                                link.download = `nihongo-mastery-${new Date().getTime()}.png`;
                                link.href = dataUrl;
                                link.click();
                            } catch (err) {
                                console.error('Export failed', err);
                            } finally {
                                setIsPrinting(false);
                                setIsExporting(false);
                            }
                        }, 100);
                    }}
                    disabled={isExporting}
                    className="w-full py-6 bg-primary hover:bg-primary-hover text-white rounded-[24px] font-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isExporting ? <span className="loader border-white border-t-transparent !size-6"></span> : <span className="material-symbols-outlined !text-2xl">download</span>}
                    {isExporting ? 'Generating Art...' : 'Save Study Report'}
                </button>
            </div>

            <p className="text-[10px] text-center font-bold text-ghost-grey leading-relaxed px-6 opacity-60">
                Your report link points to your **Public Profile**. Drive impact and earn rewards!
            </p>
        </div>
            </div >
        </div >
    );
};

export default ShareCard;

import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface ReportButtonProps {
    itemType: 'vocabulary' | 'listening' | 'grammar' | 'puzzle';
    itemId: string;
    onReported?: () => void;
    className?: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({ itemType, itemId, onReported, className = "" }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'reported' | 'error'>('idle');
    const [showMenu, setShowMenu] = useState(false);

    const handleReport = async (reason: string) => {
        if (status !== 'idle') return;

        setStatus('loading');
        setShowMenu(false);
        try {
            const { data, error } = await supabase.rpc('report_item', {
                p_item_type: itemType,
                p_item_id: itemId,
                p_reason_type: reason
            });

            if (error) throw error;

            if (data?.success) {
                setStatus('reported');
                if (onReported) onReported();
            } else {
                if (data?.error === 'Already reported') {
                    setStatus('reported');
                } else {
                    setStatus('error');
                    console.error('Report error:', data?.error);
                }
            }
        } catch (err) {
            console.error('Failed to report:', err);
            setStatus('error');
        }
    };

    if (status === 'reported') {
        return (
            <div className={`flex items-center gap-1 text-rose-500/50 cursor-default ${className}`} title="Already Reported">
                <span className="material-symbols-outlined !text-xl">check_circle</span>
            </div>
        );
    }

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={status === 'loading'}
                title="Report Problem"
                className={`flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all shadow-sm active:scale-95 disabled:opacity-50 ${className}`}
            >
                {status === 'loading' ? (
                    <span className="loader !size-4 border-rose-500 border-t-transparent"></span>
                ) : (
                    <span className="material-symbols-outlined !text-xl">report</span>
                )}
            </button>

            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 z-40 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => handleReport('wrong_question')}
                            className="px-4 py-2.5 text-left text-sm font-bold text-charcoal dark:text-white hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined !text-base">quiz</span>
                            Wrong Question
                        </button>
                        <button
                            onClick={() => handleReport('wrong_answer')}
                            className="px-4 py-2.5 text-left text-sm font-bold text-charcoal dark:text-white hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined !text-base">check_circle</span>
                            Wrong Answer
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportButton;

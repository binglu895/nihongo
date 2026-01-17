import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface LeaderboardUser {
    id: string;
    display_name: string;
    xp: number;
    level: number;
    avatar_url: string;
}

const Leaderboard: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select('id, xp, level')
            .order('xp', { ascending: false })
            .limit(10);

        if (data) {
            // Mocking some display names for privacy/simulation since profile might not have them yet
            const mapped = data.map((u, i) => ({
                ...u,
                display_name: `Sensei ${i + 1}`, // Placeholder
                avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id}`
            }));
            setLeaderboard(mapped as any);
        }
        setLoading(false);
    };

    if (loading) return <div className="p-8 text-center animate-pulse font-black text-ghost-grey uppercase tracking-widest text-xs">Calibrating Ranks...</div>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                <div>
                    <h3 className="text-xl font-black">Top Senseis</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-ghost-grey mt-1">Global Rankings</p>
                </div>
                <span className="material-symbols-outlined text-amber-500 fill-amber-500">military_tech</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5">
                {leaderboard.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div className="size-8 flex items-center justify-center font-black italic text-lg text-primary/40 shrink-0">
                            #{index + 1}
                        </div>
                        <img src={user.avatar_url} alt="" className="size-10 rounded-full bg-slate-100 dark:bg-white/10" />
                        <div className="flex-grow">
                            <p className="text-sm font-black text-charcoal dark:text-white truncate">User_{user.id.substring(0, 5)}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-ghost-grey">Level {user.level}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-primary">{user.xp.toLocaleString()}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-ghost-grey">XP</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;

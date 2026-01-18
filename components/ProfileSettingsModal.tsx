import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface ProfileSettingsModalProps {
    onClose: () => void;
    onUpdate?: () => void;
}

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

const FRAME_STYLES = {
    common: 'border-slate-300 shadow-sm',
    rare: 'border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    epic: 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-pulse',
    legendary: 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)] border-[3px]'
};

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ onClose, onUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>({
        display_name: '',
        birthday_month: '',
        birthday_day: '',
        hobbies: '',
        avatar_id: 'samurai',
        level: 1
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                setProfile({
                    ...data,
                    birthday_month: data.birthday_month || '',
                    birthday_day: data.birthday_day || '',
                    display_name: data.display_name || '',
                    hobbies: data.hobbies || '',
                    avatar_id: data.avatar_id || 'samurai',
                    level: data.level || 1
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: profile.display_name,
                    birthday_month: profile.birthday_month ? parseInt(profile.birthday_month) : null,
                    birthday_day: profile.birthday_day ? parseInt(profile.birthday_day) : null,
                    hobbies: profile.hobbies,
                    avatar_id: profile.avatar_id,
                })
                .eq('id', user.id);

            if (error) throw error;
            if (onUpdate) onUpdate();
            onClose();
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const getFrameStyle = (level: number) => {
        if (level >= 21) return FRAME_STYLES.legendary;
        if (level >= 11) return FRAME_STYLES.epic;
        if (level >= 6) return FRAME_STYLES.rare;
        return FRAME_STYLES.common;
    };

    const getAvatarUrl = (id: string) => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${id}&backgroundColor=transparent`;

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-charcoal dark:text-white">Account Settings</h2>
                        <p className="text-xs font-bold text-ghost-grey uppercase tracking-widest mt-1">Customize Your Sensei Identity</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined !text-2xl">close</span>
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    {/* Visual Preview */}
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className={`size-32 rounded-[40px] border-4 p-4 bg-slate-50 dark:bg-white/5 relative transition-all duration-500 ${getFrameStyle(profile.level)}`}>
                            <img src={getAvatarUrl(profile.avatar_id)} alt="Avatar" className="size-full object-contain" />
                            <div className="absolute -bottom-3 -right-3 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                                Lvl {profile.level}
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">
                            {profile.level >= 21 ? 'Legendary Frame' : profile.level >= 11 ? 'Epic Frame' : profile.level >= 6 ? 'Rare Frame' : 'Common Frame'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-ghost-grey mb-2 block">Display Name</label>
                                <input
                                    type="text"
                                    value={profile.display_name}
                                    onChange={e => setProfile({ ...profile, display_name: e.target.value })}
                                    placeholder="Your Sensei Name"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-5 py-3 font-bold focus:outline-none focus:border-primary transition-colors text-charcoal dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-ghost-grey mb-2 block">Birthday (Optional)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={profile.birthday_month}
                                        onChange={e => setProfile({ ...profile, birthday_month: e.target.value })}
                                        className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3 font-bold focus:outline-none focus:border-primary text-charcoal dark:text-white"
                                    >
                                        <option value="">Month</option>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={profile.birthday_day}
                                        onChange={e => setProfile({ ...profile, birthday_day: e.target.value })}
                                        className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3 font-bold focus:outline-none focus:border-primary text-charcoal dark:text-white"
                                    >
                                        <option value="">Day</option>
                                        {Array.from({ length: 31 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-ghost-grey mb-2 block">Hobbies & Bio</label>
                            <textarea
                                value={profile.hobbies}
                                onChange={e => setProfile({ ...profile, hobbies: e.target.value })}
                                placeholder="What do you love? (Reading, Gaming, etc.)"
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:border-primary transition-colors text-charcoal dark:text-white h-[124px] resize-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-ghost-grey mb-4 block text-center">Select Your Spirit Avatar</label>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                            {PIXEL_AVATARS.map(avatar => (
                                <button
                                    key={avatar.id}
                                    onClick={() => setProfile({ ...profile, avatar_id: avatar.id })}
                                    className={`aspect-square flex items-center justify-center rounded-2xl border-2 transition-all ${profile.avatar_id === avatar.id ? 'border-primary bg-primary/10 scale-105 shadow-lg' : 'border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-white/5 opacity-60'}`}
                                >
                                    <img src={getAvatarUrl(avatar.id)} alt={avatar.label} className="size-10 object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-50 dark:border-white/5 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-charcoal dark:text-white rounded-[24px] font-black hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-[2] py-4 bg-primary hover:bg-primary-hover text-white rounded-[24px] font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                    >
                        {saving ? <span className="loader border-white border-t-transparent !size-5"></span> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;

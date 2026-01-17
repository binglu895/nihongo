import { supabase } from './supabaseClient';

export interface LevelInfo {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    progress: number;
}

export const XP_VALUES = {
    VOCABULARY: 10,
    GRAMMAR: 20,
    KANJI: 15,
    LISTENING: 15,
    STREAK_BONUS: 5
};

export const calculateLevelInfo = (xp: number): LevelInfo => {
    // Base XP for level 1: 100, then increases
    // Level 2: 100 + 150 = 250
    // Level 3: 250 + 200 = 450
    // Formula: XP for Level L = 50 * L * (L + 1)

    let level = 1;
    while (xp >= 50 * level * (level + 1)) {
        level++;
    }

    const currentLevelBaseXP = 50 * (level - 1) * level;
    const nextLevelBaseXP = 50 * level * (level + 1);
    const xpInCurrentLevel = xp - currentLevelBaseXP;
    const xpNeededForLevel = nextLevelBaseXP - currentLevelBaseXP;

    return {
        level,
        currentXP: xp,
        nextLevelXP: nextLevelBaseXP,
        progress: (xpInCurrentLevel / xpNeededForLevel) * 100
    };
};

export const addXP = async (type: keyof typeof XP_VALUES, streak: number = 0) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const baseXP = XP_VALUES[type] || 0;
    const streakBonus = streak * XP_VALUES.STREAK_BONUS;
    const totalGain = baseXP + streakBonus;

    const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', user.id)
        .single();

    if (profile) {
        const newXP = (profile.xp || 0) + totalGain;
        const levelInfo = calculateLevelInfo(newXP);

        await supabase.from('profiles').update({
            xp: newXP,
            level: levelInfo.level
        }).eq('id', user.id);

        return { xpGained: totalGain, newLevel: levelInfo.level > profile.level };
    }
};

export const checkBadges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
        .from('profiles')
        .select('badges, unlocked_skins, streak, xp, id')
        .eq('id', user.id)
        .single();

    if (!profile) return [];

    const currentBadges = new Set(profile.badges || []);
    const currentSkins = new Set(profile.unlocked_skins || ['default']);
    const newBadges: string[] = [];
    const newSkins: string[] = [];

    // Badge Logic
    if (profile.streak >= 7 && !currentBadges.has('streak_7')) {
        newBadges.push('streak_7');
    }
    if (profile.xp >= 1000 && !currentBadges.has('xp_1000')) {
        newBadges.push('xp_1000');
    }

    // Skin Logic (Referral based skins would be in sharingService, but let's do XP ones here)
    if (profile.xp >= 5000 && !currentSkins.has('cyberpunk')) {
        newSkins.push('cyberpunk');
    }

    if (newBadges.length > 0 || newSkins.length > 0) {
        const updatedBadges = [...Array.from(currentBadges), ...newBadges];
        const updatedSkins = [...Array.from(currentSkins), ...newSkins];

        await supabase.from('profiles').update({
            badges: updatedBadges,
            unlocked_skins: updatedSkins
        }).eq('id', user.id);

        return { newBadges, newSkins };
    }

    return { newBadges: [], newSkins: [] };
};
export const updateActivityStats = async (durationSeconds: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
        .from('profiles')
        .select('streak, last_activity_at, total_study_time, daily_study_time')
        .eq('id', user.id)
        .single();

    if (!profile) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const lastActivity = profile.last_activity_at ? new Date(profile.last_activity_at) : null;

    let newStreak = profile.streak || 0;

    if (lastActivity) {
        const lastDate = lastActivity.toISOString().split('T')[0];
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === today) {
            // Already active today, don't increment streak
        } else if (lastDate === yesterdayStr) {
            newStreak += 1;
        } else {
            newStreak = 1; // Streak broken
        }
    } else {
        newStreak = 1;
    }

    const currentDaily = profile.daily_study_time || {};
    const updatedDaily = {
        ...currentDaily,
        [today]: (currentDaily[today] || 0) + durationSeconds
    };

    await supabase.from('profiles').update({
        streak: newStreak,
        last_activity_at: now.toISOString(),
        total_study_time: (profile.total_study_time || 0) + durationSeconds,
        daily_study_time: updatedDaily
    }).eq('id', user.id);

    return { streak: newStreak, studyTime: updatedDaily[today] };
};

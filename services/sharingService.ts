import { supabase } from './supabaseClient';

export const getReferralInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, id')
        .eq('id', user.id)
        .single();

    if (profile && !profile.referral_code) {
        // Generate code if missing (viamigrating old users)
        const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        await supabase.from('profiles').update({ referral_code: newCode }).eq('id', user.id);
        return { code: newCode, userId: user.id };
    }

    return { code: profile?.referral_code, userId: user.id };
};

export const generateShareLink = (code: string) => {
    const base = window.location.origin;
    // Use HashRouter compatible link
    return `${base}/#/profile/${code}`;
};

export const getDailyStatsSnapshot = async (userId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const categories = [
        { key: 'vocab', table: 'user_vocabulary_progress', field: 'vocabulary_id' },
        { key: 'grammar', table: 'user_grammar_progress', field: 'grammar_point_id' },
        { key: 'kanji', table: 'user_kanji_progress', field: 'vocabulary_id' },
        { key: 'listening', table: 'user_listening_progress', field: 'vocabulary_id' }
    ];

    // Reviews today
    const reviewResults = await Promise.all(categories.map(c =>
        supabase.from(c.table)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('last_reviewed_at', todayStr)
    ));

    // Total mastered per category (Historical + Today)
    const masteryResults = await Promise.all(categories.map(c =>
        supabase.from(c.table)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gt('correct_count', 0)
    ));

    // Items mastered TODAY
    const todayMasteryResults = await Promise.all(categories.map(c =>
        supabase.from(c.table)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gt('correct_count', 0)
            .gte('last_reviewed_at', todayStr)
    ));

    const { data: profile } = await supabase
        .from('profiles')
        .select('daily_study_time, referral_views')
        .eq('id', userId)
        .single();

    const stats: any = {
        reviews: reviewResults.reduce((acc, r) => acc + (r.count || 0), 0),
        mastered: masteryResults.reduce((acc, r) => acc + (r.count || 0), 0),
        likes: profile?.referral_views || 0,
        date: today.toLocaleDateString(),
        studyTimeToday: (profile?.daily_study_time || {})[today.toISOString().split('T')[0]] || 0
    };

    categories.forEach((c, i) => {
        stats[c.key] = masteryResults[i].count || 0;
        stats[`today_${c.key}`] = todayMasteryResults[i].count || 0;
    });

    return stats;
};

export const incrementProfileViews = async (referralCode: string) => {
    try {
        // We use a simple update increment. 
        // In a real production app, you might use a Supabase RPC or a more atomic operation.
        const { data: profile } = await supabase
            .from('profiles')
            .select('referral_views, id')
            .eq('referral_code', referralCode.toUpperCase())
            .single();

        if (profile) {
            await supabase
                .from('profiles')
                .update({ referral_views: (profile.referral_views || 0) + 1 })
                .eq('id', profile.id);
        }
    } catch (err) {
        console.error('Error incrementing views:', err);
    }
};

export const getProfileByReferralCode = async (code: string) => {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('xp, level, streak, referral_code, badges, id, referral_views')
        .eq('referral_code', code.toUpperCase())
        .single();

    if (error || !profile) return null;

    const categories = [
        { key: 'vocab', table: 'user_vocabulary_progress' },
        { key: 'grammar', table: 'user_grammar_progress' },
        { key: 'kanji', table: 'user_kanji_progress' },
        { key: 'listening', table: 'user_listening_progress' }
    ];

    const counts = await Promise.all(categories.map(c =>
        supabase.from(c.table).select('*', { count: 'exact', head: true }).eq('user_id', profile.id).gt('correct_count', 0)
    ));

    const categoryStats: any = {};
    counts.forEach((c, i) => {
        categoryStats[categories[i].key] = c.count || 0;
    });

    const totalMastery = counts.reduce((acc, c) => acc + (c.count || 0), 0);

    return { ...profile, ...categoryStats, totalMastery };
};

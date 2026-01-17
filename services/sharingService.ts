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

    const tables = [
        { name: 'user_vocabulary_progress', field: 'vocabulary_id' },
        { name: 'user_grammar_progress', field: 'grammar_point_id' },
        { name: 'user_kanji_progress', field: 'vocabulary_id' },
        { name: 'user_listening_progress', field: 'vocabulary_id' }
    ];

    const results = await Promise.all(tables.map(t =>
        supabase.from(t.name)
            .select(t.field, { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('last_reviewed_at', todayStr)
    ));

    // Get total mastered (SRS stage >= 4)
    const masteredResults = await Promise.all(tables.map(t =>
        supabase.from(t.name)
            .select(t.field, { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('srs_stage', 4)
    ));

    const totalReviews = results.reduce((acc, r) => acc + (r.count || 0), 0);
    const totalMastered = masteredResults.reduce((acc, r) => acc + (r.count || 0), 0);

    return {
        reviews: totalReviews,
        mastered: totalMastered,
        date: today.toLocaleDateString()
    };
};

export const getProfileByReferralCode = async (code: string) => {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('xp, level, streak, referral_code, badges, id')
        .eq('referral_code', code.toUpperCase())
        .single();

    if (error || !profile) return null;

    // Get total mastery across categories
    const tables = ['user_vocabulary_progress', 'user_grammar_progress', 'user_kanji_progress', 'user_listening_progress'];
    const counts = await Promise.all(tables.map(table =>
        supabase.from(table).select('*', { count: 'exact', head: true }).eq('user_id', profile.id).gte('srs_stage', 4)
    ));
    const totalMastery = counts.reduce((acc, c) => acc + (c.count || 0), 0);

    return { ...profile, totalMastery };
};

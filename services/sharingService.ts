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
    return `${base}/signup?ref=${code}`;
};

export const getDailyStatsSnapshot = async (userId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Fetch counts from progress tables for today
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

    const totalReviews = results.reduce((acc, r) => acc + (r.count || 0), 0);

    // Also get newly learned today (correct_count was 0 before today, but now > 0)
    // This is harder without a history table, but we can approximate by last_reviewed_at 
    // and srs_stage = 1 if we assume they just started.
    // For now let's just show total reviews today.

    return {
        reviews: totalReviews,
        date: today.toLocaleDateString()
    };
};

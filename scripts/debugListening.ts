
import { supabase } from '../services/supabaseClient';

async function checkListening() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.log("No user");
        return;
    }

    const { count: totalQuestions } = await supabase.from('listening_questions').select('*', { count: 'exact', head: true });
    console.log("Total listening questions in DB:", totalQuestions);

    const { data: levels } = await supabase.from('listening_questions').select('difficulty');
    const counts: Record<number, number> = {};
    levels?.forEach(l => {
        counts[l.difficulty] = (counts[l.difficulty] || 0) + 1;
    });
    console.log("Difficulty counts:", counts);

    const { data: progress } = await supabase.from('user_listening_progress').select('*').eq('user_id', user.id);
    console.log("User listening progress count:", progress?.length);
    console.log("Samples:", progress?.slice(0, 3));

    const now = new Date().toISOString();
    const { count: dueCount } = await supabase.from('user_listening_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).lte('next_review_at', now);
    console.log("Due listening count (global):", dueCount);
}

checkListening();

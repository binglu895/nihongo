
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: questions, error } = await supabase.from('listening_questions').select('id, difficulty, sentence');
    if (error) { console.error(error); return; }

    console.log(`Total questions in listening_questions: ${questions.length}`);
    const dist: Record<number, number> = {};
    questions.forEach(q => {
        dist[q.difficulty] = (dist[q.difficulty] || 0) + 1;
    });
    console.log('Difficulty distribution:', dist);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { count: learnedCount } = await supabase
            .from('user_listening_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gt('correct_count', 0);
        console.log(`User learned count (correct_count > 0): ${learnedCount}`);
    } else {
        console.log('No active user session (using anon key).');
    }
}

check();

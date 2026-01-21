
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    // 1. Check vocabulary table
    const { data: vocab, error: vocabError } = await supabase
        .from('vocabulary')
        .select('id, level, word');

    if (vocabError) {
        console.error('Vocab Error:', vocabError);
    } else {
        console.log(`Total records in vocabulary: ${vocab?.length || 0}`);
        const levelDist: Record<string, number> = {};
        vocab?.forEach(v => {
            levelDist[v.level] = (levelDist[v.level] || 0) + 1;
        });
        console.log('Level distribution in vocabulary:', levelDist);
    }

    // 2. Check current user profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('current_level')
            .eq('id', user.id)
            .single();
        console.log(`User ID: ${user.id}`);
        console.log(`User current_level: ${profile?.current_level || 'Not set'}`);

        // 3. Check progress
        const { count: learnedCount } = await supabase
            .from('user_kanji_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gt('correct_count', 0);
        console.log(`User learned Kanji count: ${learnedCount || 0}`);
    } else {
        console.log('No active user session.');
    }
}

check();

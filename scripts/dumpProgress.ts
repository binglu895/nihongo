
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function dump() {
    const tables = [
        'user_vocabulary_progress',
        'user_kanji_progress',
        'user_grammar_example_progress',
        'user_listening_progress'
    ];

    console.log('--- Progress Dump ---');
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.error(`Error ${table}:`, error.message);
        } else {
            console.log(`${table}: ${data?.length || 0} records`);
            if (data && data.length > 0) {
                data.forEach(r => {
                    console.log(`  - ID: ${r.vocabulary_id || r.grammar_example_id || r.listening_question_id}, Due: ${r.next_review_at}`);
                });
            }
        }
    }
}

dump();

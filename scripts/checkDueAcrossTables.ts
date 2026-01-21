
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDue() {
    const now = new Date().toISOString();

    // Check all progress tables
    const tables = [
        { name: 'user_vocabulary_progress', idField: 'vocabulary_id' },
        { name: 'user_kanji_progress', idField: 'vocabulary_id' },
        { name: 'user_grammar_example_progress', idField: 'grammar_example_id' },
        { name: 'user_listening_progress', idField: 'listening_question_id' }
    ];

    console.log('--- Checking Due Items ---');
    for (const table of tables) {
        const { count, error } = await supabase
            .from(table.name)
            .select('*', { count: 'exact', head: true })
            .lte('next_review_at', now);

        if (error) {
            console.error(`Error checking ${table.name}:`, error.message);
        } else {
            console.log(`${table.name}: ${count || 0} due`);
        }
    }
}

checkDue();

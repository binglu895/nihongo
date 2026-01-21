
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpUserProgress() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // Try to get the first user in the system if no session
        const { data: users } = await supabase.from('profiles').select('id').limit(1);
        if (users && users.length > 0) {
            console.log(`No active session. Testing with first user ID: ${users[0].id}`);
            await runDump(users[0].id);
        } else {
            console.log('No users found.');
        }
    } else {
        console.log(`Active session for user: ${user.id}`);
        await runDump(user.id);
    }
}

async function runDump(userId: string) {
    const now = new Date().toISOString();
    console.log(`Current Time (now): ${now}`);

    const tables = [
        { name: 'user_vocabulary_progress', id: 'vocabulary_id' },
        { name: 'user_kanji_progress', id: 'vocabulary_id' },
        { name: 'user_grammar_example_progress', id: 'grammar_example_id' },
        { name: 'user_listening_progress', id: 'listening_question_id' }
    ];

    for (const table of tables) {
        const { data, error } = await supabase
            .from(table.name)
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error(`Error ${table.name}:`, error.message);
            continue;
        }

        console.log(`\nTable: ${table.name} (${data.length} records)`);
        data.forEach(r => {
            const isDue = r.next_review_at && r.next_review_at <= now;
            console.log(`  - Ref ID: ${r[table.id]}, Due At: ${r.next_review_at}, Is Due Now: ${isDue ? 'YES' : 'NO'}`);
        });
    }
}

dumpUserProgress();

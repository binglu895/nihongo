
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .limit(1);

    console.log('Test vocabulary query status:', error ? error.message : 'OK');

    // Attempt to list tables using a query to information_schema if possible
    // Note: This often requires high privileges, but let's try a common trick
    const { data: tables, error: tableError } = await supabase.rpc('get_tables');
    if (tableError) {
        console.log('RPC get_tables failed, trying manual list...');
        const knownTables = [
            'grammar_points',
            'grammar_examples',
            'vocabulary',
            'listening_questions',
            'profiles'
        ];
        for (const t of knownTables) {
            const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
            console.log(`Table ${t}: ${count} rows${error ? ' (Error: ' + error.message + ')' : ''}`);
        }
    } else {
        console.log('Tables:', tables);
    }
}

listTables();

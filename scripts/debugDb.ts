
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    const { data: tables, error: tableError } = await supabase.from('listening_questions').select('*').limit(1);
    if (tableError) {
        console.error('Error fetching from listening_questions:', tableError);
    } else {
        console.log('Fetching from listening_questions successful. Row count:', tables?.length);
        if (tables && tables.length > 0) {
            console.log('Sample row:', tables[0]);
        }
    }

    // Check if there are ANY records at all
    const { data: all, error: allError } = await supabase.from('listening_questions').select('id');
    console.log('Total records in listening_questions:', all?.length || 0);
}

debug();

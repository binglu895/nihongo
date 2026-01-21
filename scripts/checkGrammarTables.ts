
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGrammar() {
    const { count: count1, error: error1 } = await supabase.from('user_grammar_progress').select('*', { count: 'exact', head: true });
    console.log(`user_grammar_progress count: ${count1 ?? 'Error/None'} ${error1?.message ?? ''}`);

    const { count: count2, error: error2 } = await supabase.from('user_grammar_example_progress').select('*', { count: 'exact', head: true });
    console.log(`user_grammar_example_progress count: ${count2 ?? 'Error/None'} ${error2?.message ?? ''}`);
}

checkGrammar();

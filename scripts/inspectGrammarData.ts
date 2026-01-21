
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectGrammar() {
    const { data: examples, error } = await supabase
        .from('grammar_examples')
        .select(`
            sentence,
            translation,
            grammar_points (
                title,
                meaning
            )
        `)
        .limit(10);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.dir(examples, { depth: null });
    }
}

inspectGrammar();

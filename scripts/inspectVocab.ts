
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const { data, error } = await supabase.from('vocabulary').select('*').limit(1);
    if (error) {
        console.error(error);
    } else {
        console.log('Sample Vocabulary Row:', JSON.stringify(data[0], null, 2));
    }
}

inspect();

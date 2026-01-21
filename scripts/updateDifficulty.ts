
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function update() {
    console.log('Updating all listening questions to difficulty 1...');

    // Update difficulty for all rows
    const { data, error } = await supabase
        .from('listening_questions')
        .update({ difficulty: 1 })
        .neq('difficulty', 1); // Only update those that aren't already 1

    if (error) {
        console.error('Error updating difficulty:', error);
        return;
    }

    console.log('Update successful.');

    // Verify count
    const { count, error: countError } = await supabase
        .from('listening_questions')
        .select('*', { count: 'exact', head: true })
        .eq('difficulty', 1);

    if (countError) {
        console.error('Error counting questions:', countError);
    } else {
        console.log(`Verified: ${count} questions now have difficulty 1.`);
    }
}

update();

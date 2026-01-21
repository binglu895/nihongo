
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrphans() {
    const now = new Date().toISOString();

    // 1. Check Vocabulary Orphans
    const { data: vProg } = await supabase.from('user_vocabulary_progress').select('vocabulary_id').lte('next_review_at', now);
    if (vProg && vProg.length > 0) {
        const ids = vProg.map(p => p.vocabulary_id);
        const { data: vMatch } = await supabase.from('vocabulary').select('id').in('id', ids);
        const matchIds = new Set(vMatch?.map(m => m.id) || []);
        const orphans = ids.filter(id => !matchIds.has(id));
        console.log(`Vocab Due: ${ids.length}, Found in table: ${matchIds.size}, Orphans: ${orphans.length}`);
        if (orphans.length > 0) console.log('Orphaned IDs:', orphans);
    } else {
        console.log('No Vocab items due.');
    }

    // 2. Check Kanji Orphans
    const { data: kProg } = await supabase.from('user_kanji_progress').select('vocabulary_id').lte('next_review_at', now);
    if (kProg && kProg.length > 0) {
        const ids = kProg.map(p => p.vocabulary_id);
        const { data: kMatch } = await supabase.from('vocabulary').select('id').in('id', ids);
        const matchIds = new Set(kMatch?.map(m => m.id) || []);
        const orphans = ids.filter(id => !matchIds.has(id));
        console.log(`Kanji Due: ${ids.length}, Found in table: ${matchIds.size}, Orphans: ${orphans.length}`);
    } else {
        console.log('No Kanji items due.');
    }

    // 3. Check Grammar Orphans
    const { data: gProg } = await supabase.from('user_grammar_example_progress').select('grammar_example_id').lte('next_review_at', now);
    if (gProg && gProg.length > 0) {
        const ids = gProg.map(p => p.grammar_example_id);
        const { data: gMatch } = await supabase.from('grammar_examples').select('id').in('id', ids);
        const matchIds = new Set(gMatch?.map(m => m.id) || []);
        const orphans = ids.filter(id => !matchIds.has(id));
        console.log(`Grammar Due: ${ids.length}, Found in table: ${matchIds.size}, Orphans: ${orphans.length}`);
    } else {
        console.log('No Grammar items due.');
    }
}

checkOrphans();

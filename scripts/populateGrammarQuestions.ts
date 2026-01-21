
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateGrammarQuestions() {
    console.log('Fetching grammar examples...');
    const { data: examples, error } = await supabase
        .from('grammar_examples')
        .select('id, sentence, grammar_points(title)');

    if (error) {
        console.error('Error fetching:', error.message);
        return;
    }

    console.log(`Processing ${examples.length} examples...`);

    for (const ex of examples) {
        const title = (ex.grammar_points as any).title;
        // Split title by slash (e.g., "は/が") and try each variation
        const variations = title.split(/[/／]/).map((v: string) => v.replace(/[～~]/g, '').trim());

        let questionSentence = ex.sentence;
        for (const variation of variations) {
            if (variation && questionSentence.includes(variation)) {
                questionSentence = questionSentence.replace(variation, '（　　）');
                break;
            }
        }

        if (questionSentence !== ex.sentence) {
            const { error: updateError } = await supabase
                .from('grammar_examples')
                .update({ question_sentence: questionSentence })
                .eq('id', ex.id);

            if (updateError) {
                console.error(`Error updating ${ex.id}:`, updateError.message);
            } else {
                console.log(`Updated: ${ex.sentence} -> ${questionSentence}`);
            }
        } else {
            console.log(`Skipped (no match): ${ex.sentence} (Point: ${title})`);
        }
    }

    console.log('Done!');
}

updateGrammarQuestions();

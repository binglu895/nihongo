
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const grammarPoints = [
    "は/が", "の", "を", "に/へ", "で", "も", "と/や",
    "あります/います", "～がほしい", "～たいです",
    "～てください", "～ないでください", "～てもいいです", "～てはいけません",
    "～なければならない", "～なくてもいい",
    "～ている", "～てから", "～たことがある",
    "～ましょう(か)", "～つもりです",
    "～から/～ので", "～とき", "～前に",
    "～より～ほうが", "一番", "～すぎます",
    "～になります", "～方(かた)",
    "～でしょう/だろう", "～ね/～よ"
];

async function generateExamples() {
    const allExamples = [];

    for (const point of grammarPoints) {
        console.log(`Generating examples for: ${point}`);
        const prompt = `Generate 6 Japanese sentences for the JLPT N5 grammar point "${point}".
    For each sentence, provide:
    1. The Japanese sentence (using appropriate Kanji for N5 level).
    2. The reading in Romaji.
    3. The English translation.
    4. The Chinese translation.
    5. Difficulty level (1 = Simple, 2 = Medium, 3 = Complex). Provide 2 sentences for each difficulty level.

    Return the result as a JSON array of objects with keys: sentence, reading, translation, translation_zh, difficulty.
    Do not include markdown formatting in the output, just the raw JSON.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            // Remove possible markdown JSON block
            text = text.replace(/```json|```/g, "").trim();
            const examples = JSON.parse(text);
            allExamples.push({ point, examples });
        } catch (error) {
            console.error(`Error for ${point}:`, error);
        }
    }

    // Generate SQL
    let sql = "";
    for (const group of allExamples) {
        sql += `-- Examples for ${group.point}\n`;
        for (const ex of group.examples) {
            const escapedSentence = ex.sentence.replace(/'/g, "''");
            const escapedReading = ex.reading.replace(/'/g, "''");
            const escapedTranslation = ex.translation.replace(/'/g, "''");
            const escapedTranslationZh = ex.translation_zh.replace(/'/g, "''");

            sql += `INSERT INTO grammar_examples (grammar_point_id, sentence, reading, translation, translation_zh, difficulty)
SELECT id, '${escapedSentence}', '${escapedReading}', '${escapedTranslation}', '${escapedTranslationZh}', ${ex.difficulty}
FROM grammar_points WHERE title = '${group.point}' LIMIT 1;\n`;
        }
    }

    fs.writeFileSync("supabase/grammar_examples_seed.sql", sql);
    console.log("Done! SQL saved to supabase/grammar_examples_seed.sql");
}

generateExamples();

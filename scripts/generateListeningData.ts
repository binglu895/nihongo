
import { generateAudio } from "./generateAudio.js";
import * as fs from "fs";
import * as path from "path";

const questions = [
    {
        sentence: "私は宿題の後でシャワーを浴びます",
        reading: "わたしはしゅくだいのあとでしゃわーをあびます",
        translation: "I take a shower after doing my homework.",
        translation_zh: "我做完作业后洗澡。",
        difficulty: 1,
        filename: "listening_shower"
    },
    {
        sentence: "私は歯を磨いた後で寝ます",
        reading: "わたしははをみがいたあとでねます",
        translation: "I go to sleep after brushing my teeth.",
        translation_zh: "我刷完牙后睡觉。",
        difficulty: 1,
        filename: "listening_sleep"
    },
    {
        sentence: "ここに来て",
        reading: "ここにきて",
        translation: "Come here.",
        translation_zh: "来这里。",
        difficulty: 1,
        filename: "listening_come_here"
    }
];

const AUDIO_DIR = "listening"; // inside public/audio/

async function main() {
    console.log("Starting listening data generation...");

    let sql = "-- Seed data for listening_questions\n";

    for (const q of questions) {
        try {
            // Generate Audio
            const audioFilename = `${AUDIO_DIR}/${q.filename}`;
            await generateAudio(q.sentence, audioFilename);

            // Add to SQL
            const audioUrl = `/audio/${audioFilename}.mp3`;
            const escapedSentence = q.sentence.replace(/'/g, "''");
            const escapedReading = q.reading.replace(/'/g, "''");
            const escapedTranslation = q.translation.replace(/'/g, "''");
            const escapedTranslationZh = q.translation_zh.replace(/'/g, "''");

            sql += `INSERT INTO listening_questions (sentence, reading, translation, translation_zh, audio_url, difficulty)
VALUES ('${escapedSentence}', '${escapedReading}', '${escapedTranslation}', '${escapedTranslationZh}', '${audioUrl}', ${q.difficulty});\n`;

        } catch (error) {
            console.error(`Failed to process: ${q.sentence}`, error);
        }
    }

    fs.writeFileSync("supabase/listening_seed.sql", sql);
    console.log("Generation complete! Seed file saved to supabase/listening_seed.sql");
}

main();

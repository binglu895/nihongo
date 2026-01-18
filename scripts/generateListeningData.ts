
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
        filename: "listening_shower",
        distractors: [
            "私は宿題の前にシャワーを浴びます",
            "私は仕事の後でシャワーを浴びます",
            "私は宿题の後で料理を作ります"
        ]
    },
    {
        sentence: "私は歯を磨いた後で寝ます",
        reading: "わたしははをみがいたあとでねます",
        translation: "I go to sleep after brushing my teeth.",
        translation_zh: "我刷完牙后睡觉。",
        difficulty: 1,
        filename: "listening_sleep",
        distractors: [
            "私は歯を磨く前に寝ます",
            "私は顔を洗った後で寝ます",
            "私は歯を磨いた後で起きます"
        ]
    },
    {
        sentence: "ここに来て",
        reading: "ここにきて",
        translation: "Come here.",
        translation_zh: "来这里。",
        difficulty: 1,
        filename: "listening_come_here",
        distractors: [
            "そこに来て",
            "あそこに来て",
            "ここに行って"
        ]
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
            const escapedDistractors = q.distractors.map(d => `'${d.replace(/'/g, "''")}'`).join(",");

            sql += `INSERT INTO listening_questions (sentence, reading, translation, translation_zh, audio_url, distractors, difficulty)
VALUES ('${escapedSentence}', '${escapedReading}', '${escapedTranslation}', '${escapedTranslationZh}', '${audioUrl}', ARRAY[${escapedDistractors}], ${q.difficulty});\n`;

        } catch (error) {
            console.error(`Failed to process: ${q.sentence}`, error);
        }
    }

    fs.writeFileSync("supabase/listening_seed.sql", sql);
    console.log("Generation complete! Seed file saved to supabase/listening_seed.sql");
}

main();

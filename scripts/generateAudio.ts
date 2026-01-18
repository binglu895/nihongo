
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "YOUR_API_KEY";
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "GxxMAMfQkDlnqjpzjLHH"; // Default to Kozy (Tokyo Standard)

const OUTPUT_DIR = path.join(process.cwd(), "public", "audio");

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateAudio(text: string, filename: string) {
    console.log(`Generating audio for: "${text}"`);

    try {
        const response = await axios({
            method: "POST",
            url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            data: {
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            },
            headers: {
                Accept: "audio/mpeg",
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
            responseType: "stream",
        });

        const outputPath = path.join(OUTPUT_DIR, `${filename}.mp3`);
        const targetDir = path.dirname(outputPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const writer = fs.createWriteStream(outputPath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => {
                console.log(`Audio saved to: ${outputPath}`);
                resolve(outputPath);
            });
            writer.on("error", reject);
        });
    } catch (error: any) {
        if (error.response) {
            console.error(`Error status: ${error.response.status}`);
            const errorData = await streamToString(error.response.data);
            console.error(`Error details: ${errorData}`);
        } else {
            console.error(`Error: ${error.message}`);
        }
        throw error;
    }
}

async function streamToString(stream: any): Promise<string> {
    const chunks: any[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err: any) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
}

// Example usage / Test
async function main() {
    if (ELEVENLABS_API_KEY === "YOUR_API_KEY") {
        console.warn("Please set ELEVENLABS_API_KEY in .env.local");
        return;
    }

    const testText = "私は宿題の後でシャワーを浴びます";
    const testFilename = "homework_shower";

    try {
        await generateAudio(testText, testFilename);
        console.log("Success!");
    } catch (error) {
        console.error("Failed to generate audio.");
    }
}

import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}

export { generateAudio };

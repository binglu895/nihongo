
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const OUTPUT_DIR = path.join(process.cwd(), "public", "audio");

if (!API_KEY || API_KEY === "PLACEHOLDER_API_KEY") {
    console.error("Please set VITE_GEMINI_API_KEY in .env.local");
    process.exit(1);
}

/**
 * Generates audio using Gemini's Text-to-Speech capability (Kore voice).
 * Using direct API call to Gemini 2.0 Flash (Preview) or Pro which supports speech.
 */
export async function generateGeminiKoreAudio(text: string, filename: string) {
    console.log(`Generating Gemini Kore audio for: "${text}"`);

    // Note: Gemini 2.0 Flash TTS API structure
    // We use the Multimodal Live API style or the standard TTS if available.
    // Given the current state, we use the text-to-speech task.

    try {
        const response = await axios({
            method: "POST",
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent?key=${API_KEY}`,
            data: {
                contents: [{
                    parts: [{ text: text }],
                    role: "user"
                }],
                generationConfig: {
                    response_modalities: ["audio"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: "Kore"
                            }
                        }
                    }
                }
            }
        });

        let audioData: string | undefined;
        if (response.data.candidates && response.data.candidates.length > 0) {
            const parts = response.data.candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData) {
                    audioData = part.inlineData.data;
                    break;
                }
            }
        }

        if (!audioData) {
            console.error("No audio data found in response");
            console.error(JSON.stringify(response.data, null, 2));
            throw new Error("No audio data in response");
        }

        const outputPath = path.join(OUTPUT_DIR, `${filename}.mp3`);
        const targetDir = path.dirname(outputPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, Buffer.from(audioData, 'base64'));
        console.log(`Audio saved to: ${outputPath}`);
        return outputPath;
    } catch (error: any) {
        if (error.response) {
            console.error(`Error status: ${error.response.status}`);
            const data = Buffer.isBuffer(error.response.data)
                ? error.response.data.toString()
                : JSON.stringify(error.response.data);
            console.error(`Error details: ${data}`);
        } else {
            console.error(`Error: ${error.message}`);
        }
        // console.error(error); // Don't dump the whole object
        throw error;
    }
}

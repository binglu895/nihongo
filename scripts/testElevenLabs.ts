import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "xwDy9oDEtzWzFo6FqAI9"; // User provided voice
const OUTPUT_DIR = path.join(process.cwd(), "public", "audio");

if (!API_KEY) {
    console.error("Please set ELEVENLABS_API_KEY in .env.local");
    process.exit(1);
}

// A long Japanese sentence for testing (N4/N3 level complexity)
const TEST_SENTENCE = "昨日の夜、私は友達と一緒に美味しい寿司を食べに行きましたが、店がとても混んでいて、一時間も待たなければなりませんでした。";

async function testElevenLabs() {
    console.log(`Using Voice ID: ${VOICE_ID}`);

    try {
        // 1. Get Voice Details (Optional, to verify)
        try {
            const voiceResponse = await axios.get(`https://api.elevenlabs.io/v1/voices/${VOICE_ID}`, {
                headers: { "xi-api-key": API_KEY }
            });
            console.log(`Voice Name: ${voiceResponse.data.name}`);
            console.log(`Voice Labels:`, voiceResponse.data.labels);
        } catch (e) {
            console.log("Could not fetch voice details (possibly custom voice), proceeding with generation...");
        }

        // 2. Generate Audio
        console.log(`Generating audio for: "${TEST_SENTENCE}"`);
        const response = await axios({
            method: "POST",
            url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            headers: {
                "xi-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            data: {
                text: TEST_SENTENCE,
                model_id: "eleven_multilingual_v2", // Best for Japanese
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    speed: 0.7
                }
            },
            responseType: "arraybuffer"
        });

        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        const outputPath = path.join(OUTPUT_DIR, "test_elevenlabs_sakura_07.mp3");
        fs.writeFileSync(outputPath, Buffer.from(response.data));
        console.log(`Audio saved to: ${outputPath}`);

    } catch (error: any) {
        if (error.response) {
            console.error(`Error status: ${error.response.status}`);
            console.error(`Error details: ${Buffer.isBuffer(error.response.data) ? error.response.data.toString() : JSON.stringify(error.response.data)}`);
        } else {
            console.error(`Error: ${error.message}`);
        }
    }
}

testElevenLabs();


import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.ELEVENLABS_API_KEY;
// Sakura voice ID provided by user
const VOICE_ID = "xwDy9oDEtzWzFo6FqAI9";
const OUTPUT_DIR = path.join(process.cwd(), "public", "audio", "listening", "n5_sakura_07_reading");

if (!API_KEY) {
    console.error("Please set ELEVENLABS_API_KEY in .env.local");
    process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Data from generateListeningData.ts
const questions = [
    {
        sentence: "私は宿題の後でシャワーを浴びます",
        reading: "わたしはしゅくだいのあとでしゃわーをあびます",
        filename: "listening_shower"
    },
    {
        sentence: "私は歯を磨いた後で寝ます",
        reading: "わたしははをみがいたあとでねます",
        filename: "listening_sleep"
    },
    {
        sentence: "ここに来て",
        reading: "ここにきて",
        filename: "listening_come_here"
    },
    {
        sentence: "そこから駅までどのくらいかかりますか？",
        reading: "そこからえきまでどのくらいかかりますか？",
        filename: "listening_station_time"
    },
    {
        sentence: "あそこを見て",
        reading: "あそこをみて",
        filename: "listening_look_over_there"
    },
    {
        sentence: "どこで会いますか？",
        reading: "どこであいますか？",
        filename: "listening_meet_where"
    },
    {
        sentence: "これは箱です",
        reading: "これははこです",
        filename: "listening_this_is_box"
    },
    {
        sentence: "それをとってください",
        reading: "それをとってください",
        filename: "listening_take_that"
    },
    {
        sentence: "あれは誰の車ですか？",
        reading: "あれはだれのくるまですか？",
        filename: "listening_whose_car"
    },
    {
        sentence: "私は京都に行ったことがあります",
        reading: "わたしはきょうとにいったことがあります",
        filename: "listening_been_kyoto"
    },
    {
        sentence: "私は明日手紙を書いたり勉強したりします",
        reading: "わたしはあしたてがみをかいたりべんきょうしたりします",
        filename: "listening_tomorrow_study"
    },
    {
        sentence: "日本人は箸でご飯を食べます",
        reading: "にほんじんははしでごはんをたべます",
        filename: "listening_eat_chopsticks"
    },
    {
        sentence: "私は部屋で音楽を聴きます",
        reading: "わたしはへやでおんがくをききます",
        filename: "listening_listen_music"
    },
    {
        sentence: "彼は料理ができます",
        reading: "かれはりょうりができます",
        filename: "listening_he_can_cook"
    },
    {
        sentence: "佐藤さんは英語を話すことができます",
        reading: "さとうさんはえいごをはなすことができます",
        filename: "listening_sato_english"
    },
    {
        sentence: "私は今彼女を待っています",
        reading: "わたしはいまかのじょをまっています",
        filename: "listening_waiting_her"
    },
    {
        sentence: "私は朝起きて朝ごはんを食べます",
        reading: "わたしはあさおきてあさごはんをたべます",
        filename: "listening_morning_routine"
    },
    {
        sentence: "中華料理は安くて美味しいです",
        reading: "ちゅうかりょうりはやすくておいしいです",
        filename: "listening_chinese_food"
    },
    {
        sentence: "私は買い物してから家に帰ります",
        reading: "わたしはかいものしてからいえにかえります",
        filename: "listening_shopping_home"
    },
    {
        sentence: "黒板を見てください",
        reading: "こくばんをみてください",
        filename: "listening_look_blackboard"
    },
    {
        sentence: "ちょっと手伝ってください",
        reading: "ちょっとてつだってください",
        filename: "listening_help_me"
    },
    {
        sentence: "どうぞ食べてください",
        reading: "どうぞたべてください",
        filename: "listening_please_eat"
    },
    {
        sentence: "図書館で寝てはいけません",
        reading: "としょかんでねてはいけません",
        filename: "listening_no_sleep_library"
    },
    {
        sentence: "犬と猫とどちらが好きですか",
        reading: "いぬとねことどちらがすきですか",
        filename: "listening_dog_cat_pref"
    },
    {
        sentence: "犬の方が好きです",
        reading: "いぬのほうがすきです",
        filename: "listening_dog_pref_ans"
    },
    {
        sentence: "明日、雨が降ると思います",
        reading: "あした、あめがふるとおもいます",
        filename: "listening_rain_tomorrow"
    },
    {
        sentence: "この料理は辛いと思います",
        reading: "このりょうりはからいとおもいます",
        filename: "listening_dish_spicy"
    },
    {
        sentence: "彼、日本語が上手だと思います",
        reading: "かれ、にほんごがじょうずだとおもいます",
        filename: "listening_he_good_jp"
    },
    {
        sentence: "彼は日本人だと思います",
        reading: "かれはにほんじんだとおもいます",
        filename: "listening_he_japanese"
    },
    {
        sentence: "私は暇なとき映画を見ます",
        reading: "わたしはひまなときえいがをみます",
        filename: "listening_free_movie"
    },
    {
        sentence: "私は寝るとき電気を消します",
        reading: "わたしはねるときでんきをけします",
        filename: "listening_sleep_light_off"
    },
    {
        sentence: "先生は眠いときコーヒーを飲みます",
        reading: "せんせいはねむいときこーひーをのみます",
        filename: "listening_teacher_sleepy"
    },
    {
        sentence: "あなたのカバンはどれですか？",
        reading: "あなたのかばんはどれですか？",
        filename: "listening_which_bag"
    },
    {
        sentence: "山田さんはどの人ですか",
        reading: "やまださんはどのひとですか",
        filename: "listening_which_person_yamada"
    },
    {
        sentence: "あなたのお母さんはどんな人ですか",
        reading: "あなたのおかあさんはどんなひとですか",
        filename: "listening_what_kind_mother"
    },
    {
        sentence: "体調はどうですか？",
        reading: "たいちょうはどうですか？",
        filename: "listening_how_condition"
    },
    {
        sentence: "私はゲームをしないで勉強します",
        reading: "わたしはげーむをしないでべんきょうします",
        filename: "listening_study_no_game"
    },
    {
        sentence: "写真を撮らないでください",
        reading: "しゃしんをとらないでください",
        filename: "listening_no_photo"
    },
    {
        sentence: "私は音楽を聴きながら走ります",
        reading: "わたしはおんがくをききながらはしります",
        filename: "listening_run_music"
    },
    {
        sentence: "私は明日朝7時に起きなければなりません",
        reading: "わたしはあしたあさななじにおきなければなりません",
        filename: "listening_must_wake_up"
    },
    {
        sentence: "私はビールを飲むと顔が赤くなる",
        reading: "わたしはびーるをのむとかおがあかくなる",
        filename: "listening_beer_red_face"
    },
    {
        sentence: "もうすぐ5月になります",
        reading: "もうすぐごがつになります",
        filename: "listening_almost_may"
    },
    {
        sentence: "服はユニクロで买います",
        reading: "ふくはゆにくるでかいます",
        filename: "listening_uniqlo_clothes"
    },
    {
        sentence: "彼女は髪が長いですね",
        reading: "かのじょはかみがながいですね",
        filename: "listening_long_hair"
    },
    {
        sentence: "中国は日本より大きいです",
        reading: "ちゅうごくはにほんよりおおきいです",
        filename: "listening_china_japan_size"
    },
    {
        sentence: "私はテストの前に勉強します",
        reading: "わたしはてすとのまえにべんきょうします",
        filename: "listening_study_before_test"
    },
    {
        sentence: "私は寝る前にシャワーを浴びます",
        reading: "わたしはねるまえにしゃわーをあびます",
        filename: "listening_shower_before_sleep"
    },
    {
        sentence: "荷物を持ちましょうか",
        reading: "にもつをもちましょうか",
        filename: "listening_carry_luggage"
    },
    {
        sentence: "一緒に映画を見ませんか",
        reading: "いっしょにえいがをみませんか",
        filename: "listening_watch_movie_together"
    },
    {
        sentence: "私は夜9時まで寝ます",
        reading: "わたしはやきゅうじまでねます",
        filename: "listening_sleep_until_9"
    },
    {
        sentence: "私は夜9時までに寝ます",
        reading: "わたしはやきゅうじまでにねます",
        filename: "listening_sleep_by_9"
    },
    {
        sentence: "これは私の花です",
        reading: "これはわたしのはなです",
        filename: "listening_my_flower"
    },
    {
        sentence: "これは高い花です",
        reading: "これはたかいはなです",
        filename: "listening_expensive_flower"
    },
    {
        sentence: "これは綺麗な花です",
        reading: "これはきれいなはなです",
        filename: "listening_beautiful_flower"
    },
    {
        sentence: "これは私が買った花です",
        reading: "これはわたしがかったはなです",
        filename: "listening_bought_flower"
    },
    {
        sentence: "私は図書館で借りた本を読みます",
        reading: "わたしはとしょかんでかりたほんをよみます",
        filename: "listening_borrowed_book_read"
    },
    {
        sentence: "私は図書館で借りた本が読みたいです",
        reading: "わたしはとしょかんでかりたほんがよみたいです",
        filename: "listening_borrowed_book_want"
    },
    {
        sentence: "2月14日はバレンタインデーです",
        reading: "にがつじゅうよっかはばれんたいんでーです",
        filename: "listening_valentine"
    },
    {
        sentence: "私は7時半に起きます",
        reading: "わたしはしちじはんにおきます",
        filename: "listening_up_7_30"
    }
];

async function generateSakuraAudio(text: string, filename: string) {
    console.log(`Generating Sakura audio (Speed 0.7) for Reading: "${text}"`);

    try {
        const response = await axios({
            method: "POST",
            url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            headers: {
                "xi-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            data: {
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    speed: 0.7 // Set speed to 0.7
                }
            },
            responseType: "arraybuffer"
        });

        const outputPath = path.join(OUTPUT_DIR, `${filename}.mp3`);
        fs.writeFileSync(outputPath, Buffer.from(response.data));
        console.log(`Audio saved to: ${outputPath}`);
        return true;

    } catch (error: any) {
        if (error.response) {
            console.error(`Error status: ${error.response.status}`);
            console.error(`Error details: ${Buffer.isBuffer(error.response.data) ? error.response.data.toString() : JSON.stringify(error.response.data)}`);
        } else {
            console.error(`Error: ${error.message}`);
        }
        return false;
    }
}

async function main() {
    console.log("Starting N5 Sakura audio generation (Reading, Speed 0.7)...");
    console.log(`Output Directory: ${OUTPUT_DIR}`);

    let successCount = 0;

    for (const q of questions) {
        const outputPath = path.join(OUTPUT_DIR, `${q.filename}.mp3`);
        if (fs.existsSync(outputPath)) {
            console.log(`Skipping existing: ${q.filename}`);
            successCount++;
            continue;
        }

        // Use q.reading instead of q.sentence
        const success = await generateSakuraAudio(q.reading, q.filename);
        if (success) {
            successCount++;
        }
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Generation complete! ${successCount}/${questions.length} files available.`);
}

main();

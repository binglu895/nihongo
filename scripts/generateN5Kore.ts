
import * as fs from "fs";
import * as path from "path";
import { generateGeminiKoreAudio } from "./generateGeminiAudio";

const questions = [
    { sentence: "私は宿題の後でシャワーを浴びます", filename: "listening_shower" },
    { sentence: "私は歯を磨いた後で寝ます", filename: "listening_sleep" },
    { sentence: "ここに来て", filename: "listening_come_here" },
    { sentence: "そこから駅までどのくらいかかりますか？", filename: "listening_station_time" },
    { sentence: "あそこを見て", filename: "listening_look_over_there" },
    { sentence: "どこで会いますか？", filename: "listening_meet_where" },
    { sentence: "これは箱です", filename: "listening_this_is_box" },
    { sentence: "それをとってください", filename: "listening_take_that" },
    { sentence: "あれは誰の車ですか？", filename: "listening_whose_car" },
    { sentence: "私は京都に行ったことがあります", filename: "listening_been_kyoto" },
    { sentence: "私は明日手紙を書いたり勉強したりします", filename: "listening_tomorrow_study" },
    { sentence: "日本人は箸でご飯を食べます", filename: "listening_eat_chopsticks" },
    { sentence: "私は部屋で音楽を聴きます", filename: "listening_listen_music" },
    { sentence: "彼は料理ができます", filename: "listening_he_can_cook" },
    { sentence: "佐藤さんは英語を话すことができます", filename: "listening_sato_english" },
    { sentence: "私は今彼女を待っています", filename: "listening_waiting_her" },
    { sentence: "私は朝起きて朝ごはんを食べます", filename: "listening_morning_routine" },
    { sentence: "中華料理は安くて美味しいです", filename: "listening_chinese_food" },
    { sentence: "私は買い物してから家に帰ります", filename: "listening_shopping_home" },
    { sentence: "黒板を見てください", filename: "listening_look_blackboard" },
    { sentence: "ちょっと手伝ってください", filename: "listening_help_me" },
    { sentence: "どうぞ食べてください", filename: "listening_please_eat" },
    { sentence: "図書館で寝てはいけません", filename: "listening_no_sleep_library" },
    { sentence: "犬と猫とどちらが好きですか", filename: "listening_dog_cat_pref" },
    { sentence: "犬の方が好きです", filename: "listening_dog_pref_ans" },
    { sentence: "明日、雨が降ると思います", filename: "listening_rain_tomorrow" },
    { sentence: "この料理は辛いと思います", filename: "listening_dish_spicy" },
    { sentence: "彼、日本語が上手だと思います", filename: "listening_he_good_jp" },
    { sentence: "彼は日本人だと思います", filename: "listening_he_japanese" },
    { sentence: "私は暇なとき映画を見ます", filename: "listening_free_movie" },
    { sentence: "私は寝るとき電気を消します", filename: "listening_sleep_light_off" },
    { sentence: "先生は眠いときコーヒーを飲みます", filename: "listening_teacher_sleepy" },
    { sentence: "あなたのカバンはどれですか？", filename: "listening_which_bag" },
    { sentence: "山田さんはどの人ですか", filename: "listening_which_person_yamada" },
    { sentence: "あなたのお母さんはどんな人ですか", filename: "listening_what_kind_mother" },
    { sentence: "体調はどうですか？", filename: "listening_how_condition" },
    { sentence: "私はゲームをしないで勉強します", filename: "listening_study_no_game" },
    { sentence: "写真を撮らないでください", filename: "listening_no_photo" },
    { sentence: "私は音楽を聴きながら走ります", filename: "listening_run_music" },
    { sentence: "私は明日朝7時に起きなければなりません", filename: "listening_must_wake_up" },
    { sentence: "私はビールを飲むと顔が赤くなる", filename: "listening_beer_red_face" },
    { sentence: "もうすぐ5月になります", filename: "listening_almost_may" },
    { sentence: "服はユニクロで买います", filename: "listening_uniqlo_clothes" },
    { sentence: "彼女は髪が長いですね", filename: "listening_long_hair" },
    { sentence: "中国は日本より大きいです", filename: "listening_china_japan_size" },
    { sentence: "私はテストの前に勉強します", filename: "listening_study_before_test" },
    { sentence: "私は寝る前にシャワーを浴びます", filename: "listening_shower_before_sleep" },
    { sentence: "荷物を持ちましょうか", filename: "listening_carry_luggage" },
    { sentence: "一緒に映画を見ませんか", filename: "listening_watch_movie_together" },
    { sentence: "私は夜9時まで寝ます", filename: "listening_sleep_until_9" },
    { sentence: "私は夜9時までに寝ます", filename: "listening_sleep_by_9" },
    { sentence: "これは私の花です", filename: "listening_my_flower" },
    { sentence: "これは高い花です", filename: "listening_expensive_flower" },
    { sentence: "これは綺麗な花です", filename: "listening_beautiful_flower" },
    { sentence: "これは私が買った花です", filename: "listening_bought_flower" },
    { sentence: "私は図書館で借りた本を読みます", filename: "listening_borrowed_book_read" },
    { sentence: "私は図書館で借りた本が読みたいです", filename: "listening_borrowed_book_want" },
    { sentence: "2月14日はバレンタインデーです", filename: "listening_valentine" },
    { sentence: "私は7時半に起きます", filename: "listening_up_7_30" }
];

async function main() {
    console.log("Starting N5 Kore audio generation...");
    // for (const q of questions) {
    for (const q of questions.slice(0, 1)) {
        try {
            await generateGeminiKoreAudio(q.sentence, `listening/n5_kore/${q.filename}`);
            // Add delay to avoid rate limits (429)
            await new Promise(resolve => setTimeout(resolve, 10000));
        } catch (error: any) {
            console.error(`Failed: ${q.sentence}`);
            // Error details are already logged by the called function
        }
    }
    console.log("All done!");
}

main();

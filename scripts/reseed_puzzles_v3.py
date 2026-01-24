import json
import os

base_dir = r'd:\Downloads\nihongo---jlpt-minimalist-mastery'
files = {
    '格助词以外': os.path.join(base_dir, 'N5_puzzle_q1.json'),
    '格助词': os.path.join(base_dir, 'N5_puzzle_q2.json'),
    '综合': os.path.join(base_dir, 'N5_puzzle_q3.json')
}
output_file = os.path.join(base_dir, 'supabase', 'reseed_puzzles_v3.sql')

def escape_sql(text):
    if text is None:
        return 'NULL'
    if isinstance(text, list):
        items = ["'" + str(i).replace("'", "''") + "'" for i in text]
        return "ARRAY[" + ", ".join(items) + "]"
    return "'" + str(text).replace("'", "''") + "'"

def process():
    sql_statements = [
        "TRUNCATE TABLE sentence_puzzles CASCADE;",
        "-- Migration to add missing columns just in case",
        "ALTER TABLE sentence_puzzles ADD COLUMN IF NOT EXISTS template TEXT;",
        "ALTER TABLE sentence_puzzles ADD COLUMN IF NOT EXISTS correct_sequence TEXT[];",
        "ALTER TABLE sentence_puzzles ADD COLUMN IF NOT EXISTS category TEXT;"
    ]
    
    total_count = 0
    for category, file_path in files.items():
        if not os.path.exists(file_path):
            print(f"Warning: {file_path} not found. Skipping {category}.")
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        for item in data:
            level = 'N5'
            template = item.get('template', '')
            correct_sequence = item.get('correct_sequence', [])
            distractors = item.get('distractors', [])
            meaning_zh = item.get('translation_cn', '')
            meaning_en = item.get('translation_en', '') # Might not exist in all
            
            # Reconstruct segments for backward compatibility
            template_parts = template.split(' ')
            segments = []
            cs_idx = 0
            for part in template_parts:
                if not part: continue
                if part == '___' and cs_idx < len(correct_sequence):
                    segments.append(correct_sequence[cs_idx])
                    cs_idx += 1
                else:
                    segments.append(part)

            audio_url = item.get('audio_url', None)
            
            # Using placeholders for other fields
            stmt = (
                f"INSERT INTO sentence_puzzles (level, template, correct_sequence, distractors, meaning, meaning_zh, category, segments, audio_url) "
                f"VALUES ("
                f"{escape_sql(level)}, "
                f"{escape_sql(template)}, "
                f"{escape_sql(correct_sequence)}, "
                f"{escape_sql(distractors)}, "
                f"{escape_sql(meaning_en)}, "
                f"{escape_sql(meaning_zh)}, "
                f"{escape_sql(category)}, "
                f"{escape_sql(segments)}, "
                f"{escape_sql(audio_url)}"
                f");"
            )
            sql_statements.append(stmt)
            total_count += 1

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))
    
    print(f"Successfully generated {total_count} items in {output_file}")

if __name__ == "__main__":
    process()

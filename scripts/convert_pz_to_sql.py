import json
import os

input_file = r'd:\Downloads\nihongo---jlpt-minimalist-mastery\pz.json'
output_file = r'd:\Downloads\nihongo---jlpt-minimalist-mastery\supabase\sentence_puzzle_v2_seed.sql'

def escape_sql(text):
    if not text:
        return 'NULL'
    return "'" + text.replace("'", "''") + "'"

def process():
    if not os.path.exists(input_file):
        # try the other path if the first one fails
        alt_path = r'd:\Downloads\nihongo---jlpt-minimalist-mastery\utils\pz.json'
        if os.path.exists(alt_path):
            input_file_path = alt_path
        else:
            print(f"Error: {input_file} not found")
            return
    else:
        input_file_path = input_file

    with open(input_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sql_statements = []
    
    for item in data:
        template = item.get('template', '')
        correct_sequence = item.get('correct_sequence', [])
        distractors = item.get('distractors', [])
        
        # Split template by single space
        template_parts = template.split(' ')
        segments = []
        seq_idx = 0
        
        for part in template_parts:
            if not part: continue # Handle double spaces if any
            if part == '___':
                if seq_idx < len(correct_sequence):
                    segments.append(correct_sequence[seq_idx])
                    seq_idx += 1
                else:
                    segments.append('___') # Missing info
            else:
                segments.append(part)
        
        # SQL array format: ARRAY['a', 'b', 'c']
        segments_sql = "ARRAY[" + ", ".join([escape_sql(s) for s in segments]) + "]"
        distractors_sql = "ARRAY[" + ", ".join([escape_sql(s) for s in distractors if s]) + "]"
        
        meaning = escape_sql(item.get('translation_en', ''))
        meaning_zh = escape_sql(item.get('translation_cn', ''))
        audio_url = escape_sql(item.get('audio_url', ''))
        
        stmt = f"INSERT INTO sentence_puzzles (level, segments, meaning, meaning_zh, audio_url, distractors) VALUES ('N5', {segments_sql}, {meaning}, {meaning_zh}, {audio_url}, {distractors_sql});"
        sql_statements.append(stmt)

    # First delete existing seed data (optional but cleaner for re-seeding)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("TRUNCATE TABLE sentence_puzzles CASCADE;\n")
        f.write("\n".join(sql_statements))
    
    print(f"Successfully generated {len(sql_statements)} items in {output_file}")

if __name__ == "__main__":
    process()

-- Remove duplicate vocabulary entries
-- This script identifies duplicates based on the 'word' and 'sentence' columns
-- and keeps only the most recently created version.

DELETE FROM vocabulary
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (
            PARTITION BY word, sentence, level 
            ORDER BY created_at DESC
        ) as row_num
        FROM vocabulary
    ) t
    WHERE t.row_num > 1
);

-- Verification: Count of words per level after cleanup
SELECT level, count(*) 
FROM vocabulary 
GROUP BY level 
ORDER BY level;

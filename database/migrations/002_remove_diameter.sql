BEGIN TRANSACTION;

-- Check if the column exists before trying to remove it
SELECT CASE 
    WHEN EXISTS (
        SELECT 1 FROM pragma_table_info('filaments') WHERE name='diameter'
    )
    THEN ALTER TABLE filaments DROP COLUMN diameter
END;

COMMIT;
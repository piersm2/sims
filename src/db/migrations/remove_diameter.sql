-- Check if the column exists before trying to remove it
SELECT CASE 
    WHEN EXISTS (
        SELECT 1 FROM pragma_table_info('filaments') WHERE name='diameter'
    )
    THEN (
        SELECT sql FROM sqlite_master WHERE type='table' AND name='filaments'
    )
END;

-- Only drop the column if it exists
DROP TABLE IF EXISTS filaments_temp;
CREATE TABLE IF NOT EXISTS filaments_temp AS 
SELECT id, name, material, color, quantity, manufacturer, notes, created_at, updated_at
FROM filaments;

DROP TABLE filaments;

CREATE TABLE filaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    material TEXT,
    color TEXT,
    quantity INTEGER DEFAULT 0,
    manufacturer TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO filaments 
SELECT id, name, material, color, quantity, manufacturer, notes, created_at, updated_at
FROM filaments_temp;

DROP TABLE IF EXISTS filaments_temp;
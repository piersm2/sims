BEGIN TRANSACTION;

-- Create new table without diameter column
CREATE TABLE filaments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    material TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    manufacturer TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO filaments_new (
    id, name, material, color, quantity,
    manufacturer, notes, created_at, updated_at
)
SELECT 
    id, name, material, color, quantity,
    manufacturer, notes, created_at, updated_at
FROM filaments;

-- Drop old table
DROP TABLE filaments;

-- Rename new table to old name
ALTER TABLE filaments_new RENAME TO filaments;

-- Update schema version
INSERT INTO schema_versions (version) VALUES (3);

COMMIT;

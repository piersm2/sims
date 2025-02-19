-- Add gradient colors support
CREATE TABLE filaments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    material TEXT NOT NULL,
    color TEXT NOT NULL,
    color2 TEXT,
    color3 TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    minimum_quantity INTEGER NOT NULL DEFAULT 1,
    manufacturer TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data
INSERT INTO filaments_new (id, name, material, color, quantity, minimum_quantity, manufacturer, notes, created_at, updated_at)
SELECT id, name, material, color, quantity, minimum_quantity, manufacturer, notes, created_at, updated_at
FROM filaments;

-- Drop old table and rename new one
DROP TABLE filaments;
ALTER TABLE filaments_new RENAME TO filaments;

-- Update schema version
INSERT INTO schema_versions (version) VALUES (8); 
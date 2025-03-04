-- Add link field to parts table
INSERT INTO schema_versions (version) VALUES (12);

-- Create a temporary table with the new schema
CREATE TABLE parts_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    minimum_quantity INTEGER NOT NULL DEFAULT 0,
    supplier TEXT,
    part_number TEXT,
    price REAL,
    link TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from the old table to the new one
INSERT INTO parts_temp SELECT id, name, description, quantity, minimum_quantity, supplier, part_number, price, NULL as link, notes, created_at, updated_at FROM parts;

-- Drop the old table
DROP TABLE parts;

-- Rename the new table to the original name
ALTER TABLE parts_temp RENAME TO parts; 
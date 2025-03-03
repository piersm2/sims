-- Update parts table to set minimum_quantity default to 0
INSERT INTO schema_versions (version) VALUES (10);

-- Create a temporary table with the new schema
CREATE TABLE parts_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    minimum_quantity INTEGER NOT NULL DEFAULT 0,
    printer_id INTEGER,
    supplier TEXT,
    part_number TEXT,
    price REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (printer_id) REFERENCES printers (id)
);

-- Copy data from the old table to the new one
INSERT INTO parts_temp SELECT * FROM parts;

-- Drop the old table
DROP TABLE parts;

-- Rename the new table to the original name
ALTER TABLE parts_temp RENAME TO parts; 
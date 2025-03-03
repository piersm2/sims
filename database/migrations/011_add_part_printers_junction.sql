-- Add part_printers junction table to support many-to-many relationship
INSERT INTO schema_versions (version) VALUES (11);

-- Create the junction table
CREATE TABLE part_printers (
    part_id INTEGER NOT NULL,
    printer_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (part_id, printer_id),
    FOREIGN KEY (part_id) REFERENCES parts (id) ON DELETE CASCADE,
    FOREIGN KEY (printer_id) REFERENCES printers (id) ON DELETE CASCADE
);

-- Migrate existing relationships
INSERT INTO part_printers (part_id, printer_id)
SELECT id, printer_id FROM parts
WHERE printer_id IS NOT NULL;

-- Create a temporary table without printer_id
CREATE TABLE parts_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    minimum_quantity INTEGER NOT NULL DEFAULT 0,
    supplier TEXT,
    part_number TEXT,
    price REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from the old table to the new one
INSERT INTO parts_temp (id, name, description, quantity, minimum_quantity, supplier, part_number, price, notes, created_at, updated_at)
SELECT id, name, description, quantity, minimum_quantity, supplier, part_number, price, notes, created_at, updated_at FROM parts;

-- Drop the old table
DROP TABLE parts;

-- Rename the new table to the original name
ALTER TABLE parts_temp RENAME TO parts; 
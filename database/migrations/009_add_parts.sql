-- Add parts table for tracking replacement parts
INSERT INTO schema_versions (version) VALUES (9);

CREATE TABLE parts (
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
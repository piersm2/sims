-- Create a temporary table with the new structure
CREATE TABLE products_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    business TEXT NOT NULL,
    filament_used REAL NOT NULL,
    filament_spool_price REAL NOT NULL DEFAULT 18.0,
    print_prep_time INTEGER NOT NULL,
    post_processing_time INTEGER NOT NULL,
    list_price REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from the old table to the new one
INSERT INTO products_new (
    id, name, business, filament_used, filament_spool_price, 
    print_prep_time, post_processing_time, list_price, notes, 
    created_at, updated_at
)
SELECT 
    id, name, business, filament_used, filament_spool_price, 
    print_prep_time, post_processing_time, list_price, notes, 
    created_at, updated_at
FROM products;

-- Drop the old table
DROP TABLE products;

-- Rename the new table to the original name
ALTER TABLE products_new RENAME TO products;

-- Add a trigger to update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_products_timestamp
AFTER UPDATE ON products
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update schema version
INSERT INTO schema_versions (version) VALUES (16); 
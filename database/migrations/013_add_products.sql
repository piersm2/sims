-- Add products table for profit margin tracking
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    business TEXT NOT NULL,
    filament_used REAL NOT NULL,
    filament_spool_price REAL NOT NULL DEFAULT 18.0,
    print_prep_time INTEGER NOT NULL,
    post_processing_time INTEGER NOT NULL,
    desired_markup REAL NOT NULL,
    platform_fees REAL NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add a trigger to update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_products_timestamp
AFTER UPDATE ON products
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 
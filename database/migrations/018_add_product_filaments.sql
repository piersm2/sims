-- Add product_filaments junction table
CREATE TABLE IF NOT EXISTS product_filaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    filament_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (filament_id) REFERENCES filaments (id) ON DELETE CASCADE,
    UNIQUE(product_id, filament_id)
);

-- Add triggers to update the products updated_at timestamp when filaments are added/removed
CREATE TRIGGER IF NOT EXISTS update_product_timestamp_on_filament_insert
AFTER INSERT ON product_filaments
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.product_id;
END;

CREATE TRIGGER IF NOT EXISTS update_product_timestamp_on_filament_delete
AFTER DELETE ON product_filaments
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.product_id;
END; 
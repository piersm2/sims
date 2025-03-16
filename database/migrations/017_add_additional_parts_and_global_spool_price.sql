-- Add additional_parts_cost to products
ALTER TABLE products ADD COLUMN additional_parts_cost REAL DEFAULT 0;

-- Add filament_spool_price to settings if it doesn't exist
INSERT OR IGNORE INTO settings (key, value) VALUES ('filament_spool_price', '18.0');

-- Update schema version
INSERT INTO schema_versions (version) VALUES (17); 
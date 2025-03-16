-- Add list_price column to products table
ALTER TABLE products ADD COLUMN list_price REAL DEFAULT 0;

-- Update schema version
INSERT INTO schema_versions (version) VALUES (15); 
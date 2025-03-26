-- Add minimum_quantity_override column
ALTER TABLE filaments ADD COLUMN minimum_quantity_override INTEGER;

-- Update schema version
INSERT INTO schema_versions (version) VALUES (24); 
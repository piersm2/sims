-- Add minimum_quantity column
INSERT INTO schema_versions (version) VALUES (4);

ALTER TABLE filaments ADD COLUMN minimum_quantity INTEGER NOT NULL DEFAULT 0; 
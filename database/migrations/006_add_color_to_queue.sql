-- Add color column to print queue
INSERT INTO schema_versions (version) VALUES (6);

ALTER TABLE print_queue ADD COLUMN color TEXT; 
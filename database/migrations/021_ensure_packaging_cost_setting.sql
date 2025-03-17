-- Ensure packaging_cost setting exists
INSERT OR IGNORE INTO settings (key, value) VALUES ('packaging_cost', '0.5');

-- Update any existing packaging_cost setting that might have been added incorrectly
UPDATE settings SET value = '0.5' WHERE key = 'packaging_cost' AND value = '';

-- Update schema version
INSERT INTO schema_versions (version) VALUES (21); 
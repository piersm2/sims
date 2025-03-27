-- Remove default value enforcement for packaging_cost
UPDATE settings SET value = '0' WHERE key = 'packaging_cost' AND value = '0.5';

-- Update schema version
INSERT INTO schema_versions (version) VALUES (40); 
-- Add desired_profit_margin setting
INSERT INTO settings (key, value) VALUES ('desired_profit_margin', '55');

-- Update schema version
INSERT INTO schema_versions (version) VALUES (19); 
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES ('spool_weight', '1000');
INSERT INTO settings (key, value) VALUES ('filament_markup', '20');
INSERT INTO settings (key, value) VALUES ('hourly_rate', '20');
INSERT INTO settings (key, value) VALUES ('wear_tear_markup', '5');
INSERT INTO settings (key, value) VALUES ('desired_markup', '150');
INSERT INTO settings (key, value) VALUES ('platform_fees', '7');

-- Update schema version
INSERT INTO schema_versions (version) VALUES (14); 
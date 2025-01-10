-- Add purchase list table
INSERT INTO schema_versions (version) VALUES (7);

CREATE TABLE purchase_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filament_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filament_id) REFERENCES filaments (id) ON DELETE CASCADE
); 
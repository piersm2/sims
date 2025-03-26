-- Log current schema versions
SELECT version, applied_at FROM schema_versions ORDER BY version;

-- Log the highest version number
SELECT MAX(version) as highest_version FROM schema_versions;

-- Log any duplicate versions
SELECT version, COUNT(*) as count 
FROM schema_versions 
GROUP BY version 
HAVING count > 1;

-- Update schema version (only if it doesn't exist)
INSERT OR IGNORE INTO schema_versions (version) VALUES (32); 
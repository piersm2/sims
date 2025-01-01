BEGIN TRANSACTION;

-- Drop the diameter column if it exists
ALTER TABLE filaments DROP COLUMN IF EXISTS diameter;

COMMIT;
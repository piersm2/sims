-- Drop existing trigger
DROP TRIGGER IF EXISTS update_purchase_list_on_quantity_change;

-- Create updated trigger for quantity changes
CREATE TRIGGER update_purchase_list_on_quantity_change
AFTER UPDATE OF quantity ON filaments
BEGIN
    INSERT OR REPLACE INTO purchase_list (filament_id, quantity, notes)
    SELECT 
        NEW.id,
        CASE 
            WHEN needed_quantity > 0 THEN needed_quantity
            ELSE NULL  -- This will cause the row to be deleted
        END,
        CASE 
            WHEN needed_quantity > 0 THEN 'Auto-added: Below minimum quantity'
            ELSE NULL
        END
    FROM filament_minimum_quantities
    WHERE id = NEW.id;
END;

-- Update schema version
INSERT OR IGNORE INTO schema_versions (version) VALUES (42); 
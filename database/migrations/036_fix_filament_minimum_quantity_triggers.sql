-- Drop and recreate the triggers to use minimum_quantity instead of calculated_minimum
DROP TRIGGER IF EXISTS update_filament_minimum_quantity_insert;
CREATE TRIGGER update_filament_minimum_quantity_insert
AFTER INSERT ON product_filaments
BEGIN
    UPDATE filaments 
    SET minimum_quantity = (
        SELECT minimum_quantity 
        FROM filament_minimum_quantities 
        WHERE id = NEW.filament_id
    )
    WHERE id = NEW.filament_id;
END;

DROP TRIGGER IF EXISTS update_filament_minimum_quantity_delete;
CREATE TRIGGER update_filament_minimum_quantity_delete
AFTER DELETE ON product_filaments
BEGIN
    UPDATE filaments 
    SET minimum_quantity = (
        SELECT minimum_quantity 
        FROM filament_minimum_quantities 
        WHERE id = OLD.filament_id
    )
    WHERE id = OLD.filament_id;
END;

DROP TRIGGER IF EXISTS update_filament_minimum_quantity_override;
CREATE TRIGGER update_filament_minimum_quantity_override
AFTER UPDATE OF minimum_quantity_override ON filaments
BEGIN
    UPDATE filaments 
    SET minimum_quantity = (
        SELECT minimum_quantity 
        FROM filament_minimum_quantities 
        WHERE id = NEW.id
    )
    WHERE id = NEW.id;
END;

-- Update existing filaments to trigger the updates
UPDATE filaments 
SET minimum_quantity_override = minimum_quantity_override;

-- Update schema version
INSERT OR IGNORE INTO schema_versions (version) VALUES (36); 
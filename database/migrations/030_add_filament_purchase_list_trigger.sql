-- Create a view to calculate needed quantities
DROP VIEW IF EXISTS filament_minimum_quantities;
CREATE VIEW filament_minimum_quantities AS
SELECT 
    f.id,
    f.name,
    f.material,
    f.color,
    f.manufacturer,
    CASE 
        WHEN f.minimum_quantity_override IS NOT NULL THEN f.minimum_quantity_override
        WHEN COUNT(pf.product_id) = 0 THEN 0
        ELSE MIN(8, 2 + (COUNT(pf.product_id) + 2) / 3)
    END as minimum_quantity,
    f.quantity as current_quantity,
    MAX(0, CASE 
        WHEN f.minimum_quantity_override IS NOT NULL THEN f.minimum_quantity_override
        WHEN COUNT(pf.product_id) = 0 THEN 0
        ELSE MIN(8, 2 + (COUNT(pf.product_id) + 2) / 3)
    END - f.quantity) as needed_quantity
FROM filaments f
LEFT JOIN product_filaments pf ON f.id = pf.filament_id
GROUP BY f.id;

-- Create trigger for quantity changes
DROP TRIGGER IF EXISTS update_purchase_list_on_quantity_change;
CREATE TRIGGER update_purchase_list_on_quantity_change
AFTER UPDATE OF quantity ON filaments
BEGIN
    -- Remove any existing entries for this filament
    DELETE FROM purchase_list WHERE filament_id = NEW.id;
    
    -- If quantity is below minimum, add to purchase list
    INSERT INTO purchase_list (filament_id, quantity, notes)
    SELECT 
        NEW.id,
        needed_quantity,
        'Auto-added: Below minimum quantity'
    FROM filament_minimum_quantities
    WHERE id = NEW.id AND needed_quantity > 0;
END;

-- Create trigger for minimum quantity changes
DROP TRIGGER IF EXISTS update_purchase_list_on_minimum_change;
CREATE TRIGGER update_purchase_list_on_minimum_change
AFTER UPDATE OF minimum_quantity_override ON filaments
BEGIN
    -- Remove any existing entries for this filament
    DELETE FROM purchase_list WHERE filament_id = NEW.id;
    
    -- If quantity is below new minimum, add to purchase list
    INSERT INTO purchase_list (filament_id, quantity, notes)
    SELECT 
        NEW.id,
        needed_quantity,
        'Auto-added: Minimum quantity changed'
    FROM filament_minimum_quantities
    WHERE id = NEW.id AND needed_quantity > 0;
END;

-- Initial population of purchase list
INSERT INTO purchase_list (filament_id, quantity, notes)
SELECT 
    id,
    needed_quantity,
    'Auto-added: Initial population'
FROM filament_minimum_quantities
WHERE needed_quantity > 0
AND id NOT IN (SELECT filament_id FROM purchase_list);

-- Update schema version
INSERT OR IGNORE INTO schema_versions (version) VALUES (30); 
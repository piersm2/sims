-- This file represents the latest schema version
-- For new installations, all migrations will be run in order

-- Include initial schema
.read migrations/001_initial_schema.sql 
.read migrations/018_add_product_filaments.sql 
.read migrations/019_update_time_fields_to_real.sql
.read migrations/020_add_packaging_cost_to_products.sql
.read migrations/021_ensure_packaging_cost_setting.sql 
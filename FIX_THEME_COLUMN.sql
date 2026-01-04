-- Fix theme column to accept all color values
-- This script removes any constraints on the theme column that might be limiting the colors

-- Drop existing constraint if it exists
ALTER TABLE menus
DROP CONSTRAINT IF EXISTS theme_check;

-- Ensure theme column is VARCHAR without restrictions
ALTER TABLE menus
ALTER COLUMN theme TYPE varchar(50);

-- If the table structure doesn't allow the above, use this alternative:
-- ALTER TABLE menus MODIFY COLUMN theme VARCHAR(50);

-- Verify the fix
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'menus' AND column_name = 'theme';

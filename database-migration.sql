-- ================================================================
-- MIGRATION: Add Multiple Images Support to Portfolio Table
-- Safe to run multiple times - includes IF NOT EXISTS checks
-- ================================================================

-- Add images column to support multiple photos (safe if already exists)
ALTER TABLE portfolio 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Update the table comment to reflect the new column
COMMENT ON COLUMN portfolio.images IS 'Array of additional image URLs for the portfolio item';

-- Create index for better performance (safe if already exists)
CREATE INDEX IF NOT EXISTS idx_portfolio_images ON portfolio USING GIN (images);

-- Update existing records that might have NULL images column (optional)
UPDATE portfolio 
SET images = '{}' 
WHERE images IS NULL;

-- ================================================================
-- VERIFICATION: Check if migration was successful
-- ================================================================

-- Uncomment to verify the migration:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'portfolio' AND column_name = 'images';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- The portfolio table now supports multiple images!
-- You can now use the enhanced CMS to add multiple photos to projects.
-- ================================================================ 
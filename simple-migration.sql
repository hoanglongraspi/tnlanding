-- ================================================================
-- SIMPLE MIGRATION: Add Images Column Only
-- This script is completely safe and will not cause any conflicts
-- ================================================================

-- Add the images column if it doesn't exist
DO $$ 
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio' AND column_name = 'images'
    ) THEN
        -- Add the column
        ALTER TABLE portfolio ADD COLUMN images text[] DEFAULT '{}';
        
        -- Add comment
        COMMENT ON COLUMN portfolio.images IS 'Array of additional image URLs for the portfolio item';
        
        -- Create index for performance
        CREATE INDEX idx_portfolio_images ON portfolio USING GIN (images);
        
        -- Update any existing NULL values
        UPDATE portfolio SET images = '{}' WHERE images IS NULL;
        
        RAISE NOTICE 'Successfully added images column to portfolio table';
    ELSE
        RAISE NOTICE 'Images column already exists in portfolio table';
    END IF;
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================ 
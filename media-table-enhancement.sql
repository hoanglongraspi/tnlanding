-- ================================================================
-- MEDIA TABLE ENHANCEMENT MIGRATION
-- Add new columns to support comprehensive media management
-- ================================================================

-- Add new columns to media table
ALTER TABLE media 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for automatic updated_at timestamp
DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_featured ON media(featured);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN (tags);

-- Update existing media records to have default values
UPDATE media 
SET 
    description = NULL,
    tags = '{}',
    featured = FALSE,
    updated_at = created_at
WHERE description IS NULL; 
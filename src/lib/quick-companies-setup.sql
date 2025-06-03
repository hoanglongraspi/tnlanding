-- Quick setup for Companies feature only
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- COMPANIES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    industry VARCHAR(100),
    website VARCHAR(255),
    years_of_cooperation INTEGER,
    folder_color VARCHAR(10) DEFAULT '#FF6B35',
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- COMPANY GALLERY TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS company_gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_gallery ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now
CREATE POLICY "Allow all access to companies" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all access to company_gallery" ON company_gallery FOR ALL USING (true);

-- ================================================================
-- SAMPLE DATA
-- ================================================================
INSERT INTO companies (name, description, logo_url, industry, website, years_of_cooperation, folder_color, sort_order, status) VALUES
('PTSC', 'Petroleum Technical Services Corporation - A member of PetroVietnam Group', '/ptsc-logo.png', 'Dầu khí', 'https://ptsc.com.vn', 5, '#FF6B35', 1, 'published'),
('VietinBank', 'Ngân hàng Công thương Việt Nam', '/vietinbank-logo.png', 'Ngân hàng', 'https://vietinbank.vn', 3, '#1E40AF', 2, 'published'),
('Vingroup', 'Tập đoàn Vingroup', '/vingroup-logo.png', 'Đa ngành', 'https://vingroup.net', 2, '#059669', 3, 'published')
ON CONFLICT DO NOTHING;

-- Sample gallery items
INSERT INTO company_gallery (company_id, title, description, media_url, media_type, thumbnail_url, sort_order, featured, status)
SELECT 
    c.id,
    'Industrial Operations',
    'Hoạt động sản xuất công nghiệp chuyên nghiệp',
    '/PTSCHaiPhong7.jpg',
    'image',
    '/PTSCHaiPhong7.jpg',
    1,
    true,
    'published'
FROM companies c WHERE c.name = 'PTSC'
ON CONFLICT DO NOTHING;

-- Sample video with Google Drive link example
INSERT INTO company_gallery (company_id, title, description, media_url, media_type, thumbnail_url, sort_order, featured, status)
SELECT 
    c.id,
    'PTSC Corporate Video',
    'Video doanh nghiệp PTSC - Featured thumbnail for homepage',
    'https://drive.google.com/file/d/1Fm-rXnxqIoQfQx386_IPsFBaEzsP5VbF/view?usp=sharing',
    'video',
    'https://drive.google.com/file/d/YOUR_THUMBNAIL_FILE_ID/view?usp=sharing',
    0,
    true,
    'published'
FROM companies c WHERE c.name = 'PTSC'
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Companies and Company Gallery tables created successfully!' as result;
SELECT 'TIP: The gallery item marked as "featured=true" will appear as thumbnail on homepage Commercial Work section.' as tip;
SELECT 'GOOGLE DRIVE: You can use Google Drive sharing links for both media_url and thumbnail_url fields.' as google_drive_tip; 
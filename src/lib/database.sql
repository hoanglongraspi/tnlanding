-- ================================================================
-- TN FILMS CMS DATABASE SCHEMA
-- Simplified schema for portfolio management
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- COMPANIES TABLE
-- For managing company/partner folders in commercial work
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
-- For managing images and videos within each company folder
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
-- PORTFOLIO TABLE
-- Core table for managing personal projects, commercial work, and events
-- ================================================================
CREATE TABLE IF NOT EXISTS portfolio (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL CHECK (category IN ('personal', 'commercial', 'events')),
    image_url TEXT NOT NULL,
    video_url TEXT,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- MEDIA TABLE
-- For managing uploaded images and videos with enhanced features
-- ================================================================
CREATE TABLE IF NOT EXISTS media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('image', 'video')),
    size BIGINT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT FALSE,
    portfolio_id UUID REFERENCES portfolio(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- PAGE CONTENT TABLE
-- For basic page content management
-- ================================================================
CREATE TABLE IF NOT EXISTS page_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL,
    section VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    type VARCHAR(10) DEFAULT 'text' CHECK (type IN ('text', 'html', 'json')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_name, section)
);

-- ================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Companies updated_at trigger
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Company gallery updated_at trigger
DROP TRIGGER IF EXISTS update_company_gallery_updated_at ON company_gallery;
CREATE TRIGGER update_company_gallery_updated_at
    BEFORE UPDATE ON company_gallery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Portfolio updated_at trigger
DROP TRIGGER IF EXISTS update_portfolio_updated_at ON portfolio;
CREATE TRIGGER update_portfolio_updated_at
    BEFORE UPDATE ON portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Media updated_at trigger
DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Page content updated_at trigger
DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at
    BEFORE UPDATE ON page_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow all access to companies" ON companies;
DROP POLICY IF EXISTS "Allow all access to company_gallery" ON company_gallery;
DROP POLICY IF EXISTS "Allow all access to portfolio" ON portfolio;
DROP POLICY IF EXISTS "Allow all access to media" ON media;
DROP POLICY IF EXISTS "Allow all access to page_content" ON page_content;

-- Create policies (in production, you'd want proper auth)
CREATE POLICY "Allow all access to companies" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all access to company_gallery" ON company_gallery FOR ALL USING (true);
CREATE POLICY "Allow all access to portfolio" ON portfolio FOR ALL USING (true);
CREATE POLICY "Allow all access to media" ON media FOR ALL USING (true);
CREATE POLICY "Allow all access to page_content" ON page_content FOR ALL USING (true);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_sort_order ON companies(sort_order);
CREATE INDEX IF NOT EXISTS idx_company_gallery_company_id ON company_gallery(company_id);
CREATE INDEX IF NOT EXISTS idx_company_gallery_status ON company_gallery(status);
CREATE INDEX IF NOT EXISTS idx_company_gallery_sort_order ON company_gallery(sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_status ON portfolio(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_date ON portfolio(date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_images ON portfolio USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_media_portfolio_id ON media(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_media_featured ON media(featured);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN (tags);

-- ================================================================
-- SAMPLE DATA FOR COMPANIES
-- ================================================================
INSERT INTO companies (name, description, logo_url, industry, website, years_of_cooperation, folder_color, sort_order, status) VALUES
('PTSC', 'Petroleum Technical Services Corporation - A member of PetroVietnam Group', '/ptsc-logo.png', 'Dầu khí', 'https://ptsc.com.vn', 5, '#FF6B35', 1, 'published'),
('VietinBank', 'Ngân hàng Công thương Việt Nam', '/vietinbank-logo.png', 'Ngân hàng', 'https://vietinbank.vn', 3, '#1E40AF', 2, 'published'),
('Vingroup', 'Tập đoàn Vingroup', '/vingroup-logo.png', 'Đa ngành', 'https://vingroup.net', 2, '#059669', 3, 'published')
ON CONFLICT DO NOTHING;

-- ================================================================
-- SAMPLE DATA FOR COMPANY GALLERY
-- ================================================================
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

INSERT INTO company_gallery (company_id, title, description, media_url, media_type, thumbnail_url, sort_order, featured, status)
SELECT 
    c.id,
    'Manufacturing Process',
    'Quy trình sản xuất hiện đại',
    '/PTSCHaiPhong18.jpg',
    'image',
    '/PTSCHaiPhong18.jpg',
    2,
    false,
    'published'
FROM companies c WHERE c.name = 'PTSC'
ON CONFLICT DO NOTHING;

INSERT INTO company_gallery (company_id, title, description, media_url, media_type, thumbnail_url, sort_order, featured, status)
SELECT 
    c.id,
    'PTSC Commercial Video',
    'Video quảng cáo doanh nghiệp chuyên nghiệp',
    'https://drive.google.com/file/d/1Fm-rXnxqIoQfQx386_IPsFBaEzsP5VbF/preview',
    'video',
    '/PTSCHaiPhong7.jpg',
    0,
    true,
    'published'
FROM companies c WHERE c.name = 'PTSC'
ON CONFLICT DO NOTHING;

-- ================================================================
-- SAMPLE DATA FOR TESTING
-- ================================================================

-- Sample portfolio items
INSERT INTO portfolio (title, description, category, image_url, tags, featured, status, date) VALUES
('Wedding at Sunset Beach', 'Beautiful wedding ceremony captured during golden hour with stunning ocean views.', 'events', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', ARRAY['wedding', 'beach', 'sunset'], true, 'published', '2024-01-15'),
('Corporate Brand Video', 'Professional corporate video showcasing company culture and values.', 'commercial', 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800', ARRAY['corporate', 'branding', 'professional'], true, 'published', '2024-01-10'),
('Personal Art Project', 'Experimental photography exploring urban landscapes and human connection.', 'personal', 'https://images.unsplash.com/photo-1500287035761-cf160cbc4af8?w=800', ARRAY['art', 'urban', 'experimental'], false, 'published', '2024-01-05'),
('Tech Conference Coverage', 'Complete event coverage including keynotes, workshops, and networking sessions.', 'events', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', ARRAY['conference', 'technology', 'corporate'], true, 'published', '2023-12-20'),
('Product Launch Campaign', 'Multi-day campaign covering product launch with interviews and behind-the-scenes.', 'commercial', 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=800', ARRAY['product', 'launch', 'campaign'], false, 'published', '2023-12-15'),
('Street Photography Series', 'Documentary series capturing everyday life in the city.', 'personal', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', ARRAY['street', 'documentary', 'city'], false, 'draft', '2023-12-01')
ON CONFLICT DO NOTHING;

-- Sample page content
INSERT INTO page_content (page_name, section, title, content, type) VALUES
('home', 'hero-title', 'Tu Nguyen Film', 'Tu Nguyen Film', 'text'),
('home', 'hero-subtitle', 'Professional Photography & Videography', 'Kiến tạo giá trị hình ảnh cho doanh nghiệp qua video và nhiếp ảnh chuyên nghiệp, sáng tạo, giàu cảm xúc.', 'text'),
('home', 'portfolio-title', 'Portfolio', 'Portfolio', 'text'),
('home', 'portfolio-subtitle', 'Explore our work', 'Khám phá những dự án đã thực hiện với chất lượng và sự sáng tạo', 'text'),
('home', 'contact-title', 'Get In Touch', 'Liên hệ hợp tác', 'text'),
('home', 'contact-subtitle', 'Ready to work together?', 'Sẵn sàng biến ý tưởng của bạn thành hiện thực', 'text'),
('home', 'about-title', 'About Us', 'Về chúng tôi', 'text'),
('home', 'about-text', 'Professional team description', 'Chúng tôi là đội ngũ chuyên nghiệp trong lĩnh vực quay phim và chụp ảnh', 'text'),
('home', 'services-title', 'Our Services', 'Dịch vụ của chúng tôi', 'text'),
('home', 'commercial-thumbnail-help', 'How to set Commercial Work thumbnail', 'To set the thumbnail for Commercial Work section on homepage: 1) Go to Admin > Companies, 2) Add/edit a company, 3) Add gallery items with thumbnails, 4) Mark one item as "Featured" - this will appear on homepage. Support Google Drive sharing links for thumbnails.', 'text')
ON CONFLICT (page_name, section) 
DO UPDATE SET 
  content = EXCLUDED.content,
  updated_at = NOW();

-- ================================================================
-- STORAGE BUCKET SETUP INSTRUCTIONS
-- ================================================================
-- Run this in Supabase Storage section:
-- 1. Create a bucket named 'media'
-- 2. Make it public
-- 3. Set file size limit to 50MB
-- 4. Allow image and video uploads

-- ================================================================
-- SETUP COMPLETE
-- ================================================================
-- Your TN Films CMS database is now ready!
-- 
-- Next steps:
-- 1. Add your Supabase credentials to .env.local
-- 2. Create the 'media' storage bucket
-- 3. Start managing your portfolio through the CMS
-- ================================================================ 
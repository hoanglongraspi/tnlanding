-- ================================================================
-- PERFORMANCE OPTIMIZATION FOR TN FILMS DATABASE
-- Additional indexes and optimizations for better query speed
-- ================================================================

-- ================================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ================================================================

-- Portfolio table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_category_status_featured 
ON portfolio(category, status, featured) WHERE status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_status_date 
ON portfolio(status, date DESC) WHERE status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_featured_status 
ON portfolio(featured, status) WHERE featured = true AND status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_created_at 
ON portfolio(created_at DESC);

-- Company gallery optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_gallery_company_status_featured 
ON company_gallery(company_id, status, featured) WHERE status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_gallery_featured_status 
ON company_gallery(featured, status) WHERE featured = true AND status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_gallery_sort_order 
ON company_gallery(sort_order ASC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_gallery_date 
ON company_gallery(date DESC);

-- Companies table optimizations  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_status_sort 
ON companies(status, sort_order) WHERE status = 'published';

-- Media table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_type_featured 
ON media(type, featured) WHERE featured = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_portfolio_type 
ON media(portfolio_id, type) WHERE portfolio_id IS NOT NULL;

-- Page content optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_page_content_page_section 
ON page_content(page_name, section);

-- ================================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- ================================================================

-- Function to get featured portfolio items efficiently
CREATE OR REPLACE FUNCTION get_featured_portfolio(category_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(20),
    image_url TEXT,
    video_url TEXT,
    images TEXT[],
    tags TEXT[],
    date DATE,
    featured BOOLEAN,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL
STABLE
AS $$
    SELECT p.id, p.title, p.description, p.category, p.image_url, 
           p.video_url, p.images, p.tags, p.date, p.featured, 
           p.status, p.created_at, p.updated_at
    FROM portfolio p
    WHERE p.featured = true 
      AND p.status = 'published'
      AND (category_filter IS NULL OR p.category = category_filter)
    ORDER BY p.date DESC, p.created_at DESC
    LIMIT 6;
$$;

-- Function to get company gallery with company info efficiently
CREATE OR REPLACE FUNCTION get_company_gallery_with_info(company_id_filter UUID DEFAULT NULL)
RETURNS TABLE (
    gallery_id UUID,
    gallery_title VARCHAR(255),
    gallery_description TEXT,
    media_url TEXT,
    media_type VARCHAR(10),
    thumbnail_url TEXT,
    sort_order INTEGER,
    featured BOOLEAN,
    gallery_date DATE,
    company_id UUID,
    company_name VARCHAR(255),
    company_logo_url TEXT,
    folder_color VARCHAR(10)
)
LANGUAGE SQL
STABLE  
AS $$
    SELECT cg.id, cg.title, cg.description, cg.media_url, cg.media_type,
           cg.thumbnail_url, cg.sort_order, cg.featured, cg.date,
           c.id, c.name, c.logo_url, c.folder_color
    FROM company_gallery cg
    JOIN companies c ON cg.company_id = c.id
    WHERE cg.status = 'published' 
      AND c.status = 'published'
      AND (company_id_filter IS NULL OR cg.company_id = company_id_filter)
    ORDER BY cg.sort_order ASC, cg.date DESC;
$$;

-- Function to get dashboard statistics efficiently
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_portfolio INTEGER,
    published_portfolio INTEGER,
    featured_portfolio INTEGER,
    total_companies INTEGER,
    total_gallery_items INTEGER,
    recent_portfolio_items JSON
)
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM portfolio) as total_portfolio,
        (SELECT COUNT(*)::INTEGER FROM portfolio WHERE status = 'published') as published_portfolio,
        (SELECT COUNT(*)::INTEGER FROM portfolio WHERE featured = true AND status = 'published') as featured_portfolio,
        (SELECT COUNT(*)::INTEGER FROM companies WHERE status = 'published') as total_companies,
        (SELECT COUNT(*)::INTEGER FROM company_gallery WHERE status = 'published') as total_gallery_items,
        (SELECT COALESCE(json_agg(
            json_build_object(
                'id', id,
                'title', title,
                'category', category,
                'created_at', created_at
            ) ORDER BY created_at DESC
        ), '[]'::json)
        FROM (
            SELECT id, title, category, created_at 
            FROM portfolio 
            WHERE status = 'published'
            ORDER BY created_at DESC 
            LIMIT 5
        ) recent
        ) as recent_portfolio_items;
$$;

-- ================================================================
-- MATERIALIZED VIEWS FOR HEAVY QUERIES
-- ================================================================

-- Materialized view for featured commercial thumbnail
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_featured_commercial_thumbnail AS
SELECT cg.id, cg.title, cg.description, cg.media_url, cg.thumbnail_url,
       cg.date, c.name as company_name, c.logo_url as company_logo
FROM company_gallery cg
JOIN companies c ON cg.company_id = c.id
WHERE cg.featured = true 
  AND cg.status = 'published' 
  AND c.status = 'published'
ORDER BY cg.date DESC
LIMIT 1;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_featured_commercial_thumbnail_id 
ON mv_featured_commercial_thumbnail(id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_featured_commercial_thumbnail()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_featured_commercial_thumbnail;
END;
$$;

-- ================================================================
-- TRIGGERS TO REFRESH MATERIALIZED VIEWS
-- ================================================================

-- Trigger to refresh featured commercial when company_gallery changes
CREATE OR REPLACE FUNCTION trigger_refresh_featured_commercial()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only refresh if the change affects featured items
    IF (TG_OP = 'INSERT' AND NEW.featured = true) OR
       (TG_OP = 'UPDATE' AND (OLD.featured != NEW.featured OR OLD.status != NEW.status)) OR
       (TG_OP = 'DELETE' AND OLD.featured = true) THEN
        PERFORM refresh_featured_commercial_thumbnail();
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_company_gallery_featured_refresh ON company_gallery;
CREATE TRIGGER trigger_company_gallery_featured_refresh
    AFTER INSERT OR UPDATE OR DELETE ON company_gallery
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_featured_commercial();

-- ================================================================
-- VACUUM AND ANALYZE OPTIMIZATION
-- ================================================================

-- Vacuum and analyze all tables for optimal performance
VACUUM ANALYZE portfolio;
VACUUM ANALYZE company_gallery;
VACUUM ANALYZE companies;
VACUUM ANALYZE media;
VACUUM ANALYZE page_content;

-- ================================================================
-- CONNECTION POOLING RECOMMENDATIONS
-- ================================================================

-- Consider these settings in your Supabase dashboard:
-- shared_preload_libraries = 'pg_stat_statements'
-- max_connections = 100
-- shared_buffers = 256MB
-- effective_cache_size = 1GB
-- maintenance_work_mem = 64MB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 100

-- Enable pg_stat_statements for query monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ================================================================
-- PERFORMANCE MONITORING QUERIES
-- ================================================================

-- View to monitor slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent,
    mean_time,
    stddev_time
FROM pg_stat_statements 
WHERE calls > 5
ORDER BY total_time DESC
LIMIT 20;

-- View to monitor table sizes
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stats ps
JOIN pg_tables pt ON ps.tablename = pt.tablename
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC; 
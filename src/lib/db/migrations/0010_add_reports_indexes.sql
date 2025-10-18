-- Add indexes for reports table to improve query performance
-- Migration: 0010_add_reports_indexes

-- Index on createdAt for ORDER BY queries
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Index on projectId for filtering by project
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);

-- Index on status for filtering by status
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Index on reportType for filtering by type
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_reports_project_status_created ON reports(project_id, status, created_at DESC);

-- Index on title for search functionality
CREATE INDEX IF NOT EXISTS idx_reports_title_search ON reports USING gin(to_tsvector('english', title));

-- Add comment for documentation
COMMENT ON INDEX idx_reports_created_at IS 'Index for ORDER BY created_at DESC queries';
COMMENT ON INDEX idx_reports_project_id IS 'Index for filtering reports by project';
COMMENT ON INDEX idx_reports_status IS 'Index for filtering reports by status';
COMMENT ON INDEX idx_reports_type IS 'Index for filtering reports by type';
COMMENT ON INDEX idx_reports_project_status_created IS 'Composite index for project + status + date queries';
COMMENT ON INDEX idx_reports_title_search IS 'Full-text search index for report titles';

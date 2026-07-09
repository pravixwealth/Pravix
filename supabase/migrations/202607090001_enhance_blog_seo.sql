-- ============================================================================
-- Blog CMS Enhancement: SEO fields, focus keyword, canonical, robots
-- ============================================================================

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS focus_keyword text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS robots text NOT NULL DEFAULT 'index,follow'
    CHECK (robots IN ('index,follow', 'noindex,follow', 'noindex,nofollow'));

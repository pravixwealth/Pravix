-- ============================================================================
-- COMBINED ADMIN MIGRATIONS â€” Paste this entire file in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/ntxfcrvgjfaesedyribq/sql
-- ============================================================================

-- â•â•â• MIGRATION 1: Roles & Audit â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

INSERT INTO public.roles (name, description) VALUES
  ('super_admin', 'Full platform access including role management and system settings'),
  ('admin', 'All operations except role management'),
  ('editor', 'Content management: blog, media, site content'),
  ('viewer', 'Read-only access to admin dashboard')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON public.user_roles (role_id);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'disabled')),
  ADD COLUMN IF NOT EXISTS disabled_at timestamptz,
  ADD COLUMN IF NOT EXISTS disabled_reason text;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS roles_select_authenticated ON public.roles; CREATE POLICY roles_select_authenticated ON public.roles FOR SELECT TO authenticated USING (true);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles; CREATE POLICY user_roles_select_own ON public.user_roles FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- â•â•â• MIGRATION 2: Media Library â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.media_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  parent_folder_id uuid REFERENCES public.media_folders(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_filename text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  public_url text NOT NULL,
  thumbnail_url text,
  mime_type text NOT NULL,
  extension text NOT NULL,
  width int,
  height int,
  size_bytes bigint NOT NULL DEFAULT 0,
  alt_text text,
  caption text,
  dominant_color text,
  blur_hash text,
  checksum text,
  is_optimized boolean NOT NULL DEFAULT false,
  title text,
  deleted_at timestamptz,
  folder_id uuid REFERENCES public.media_folders(id) ON DELETE SET NULL,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.media_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  field_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS media_usage_unique_idx ON public.media_usage (media_id, entity_type, entity_id, field_name);
CREATE INDEX IF NOT EXISTS media_not_deleted_idx ON public.media (created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS media_select_authenticated ON public.media; CREATE POLICY media_select_authenticated ON public.media FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS media_folders_select_authenticated ON public.media_folders; CREATE POLICY media_folders_select_authenticated ON public.media_folders FOR SELECT TO authenticated USING (true);

-- â•â•â• MIGRATION 3: Settings Engine â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  type text NOT NULL DEFAULT 'string' CHECK (type IN ('string','text','number','boolean','color','url','image_url','json','csv')),
  group_key text NOT NULL,
  label text NOT NULL,
  description text,
  placeholder text,
  is_required boolean NOT NULL DEFAULT false,
  validation_rule text,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.business_setting_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id uuid NOT NULL REFERENCES public.business_settings(id) ON DELETE CASCADE,
  old_value text,
  new_value text,
  changed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  type text NOT NULL DEFAULT 'string' CHECK (type IN ('string','text','number','boolean','json','secret')),
  group_key text NOT NULL,
  label text NOT NULL,
  description text,
  placeholder text,
  is_sensitive boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.system_setting_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id uuid NOT NULL REFERENCES public.system_settings(id) ON DELETE CASCADE,
  old_value text,
  new_value text,
  changed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  type text NOT NULL DEFAULT 'string' CHECK (type IN ('string','text','richtext','image_url','json')),
  group_key text NOT NULL,
  label text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.site_content_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.site_content(id) ON DELETE CASCADE,
  old_value text,
  new_value text,
  changed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_setting_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_setting_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_settings_public_read ON public.business_settings; CREATE POLICY business_settings_public_read ON public.business_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS site_content_public_read ON public.site_content; CREATE POLICY site_content_public_read ON public.site_content FOR SELECT TO anon, authenticated USING (true);

-- Seed business settings
INSERT INTO public.business_settings (key, value, type, group_key, label, description, placeholder, is_required, sort_order) VALUES
  ('company_name', 'Pravix Wealth Management', 'string', 'general', 'Company Name', 'Full brand name', 'Acme Corp', true, 1),
  ('company_short_name', 'Pravix', 'string', 'general', 'Short Name', 'Abbreviated name', 'Acme', true, 2),
  ('company_tagline', 'Goal-Based Wealth Planning for Indian Families', 'string', 'general', 'Tagline', 'Primary tagline', null, false, 3),
  ('site_url', 'https://pravix.in', 'url', 'general', 'Site URL', 'Canonical URL', 'https://example.com', true, 4),
  ('copyright_text', 'Â© 2025 Pravix Wealth Management. All rights reserved.', 'string', 'general', 'Copyright', 'Footer copyright', null, false, 5),
  ('logo_url', '/image/pravix-visualmark.png', 'image_url', 'branding', 'Logo', 'Primary logo', null, true, 1),
  ('primary_color', '#2b5cff', 'color', 'branding', 'Primary Color', 'Brand color', '#2b5cff', false, 3),
  ('contact_phone', '+918796215599', 'string', 'contact', 'Phone', 'Business phone', '+91XXXXXXXXXX', true, 1),
  ('contact_email', 'info@pravix.in', 'string', 'contact', 'Email', 'Contact email', null, true, 2),
  ('contact_whatsapp', '+918796215599', 'string', 'contact', 'WhatsApp', 'WhatsApp number', null, false, 3),
  ('social_instagram', 'https://www.instagram.com/pravixwealth/', 'url', 'social', 'Instagram', null, null, false, 1),
  ('social_linkedin', 'https://www.linkedin.com/company/pravix-wealth-management/', 'url', 'social', 'LinkedIn', null, null, false, 2),
  ('social_youtube', 'https://www.youtube.com/@PRAVIXwealth', 'url', 'social', 'YouTube', null, null, false, 3),
  ('social_facebook', 'https://www.facebook.com/people/Pravix-Wealth-Management/61588755566789/', 'url', 'social', 'Facebook', null, null, false, 4)
ON CONFLICT (key) DO NOTHING;

-- Seed site content
INSERT INTO public.site_content (key, value, type, group_key, label, description, sort_order) VALUES
  ('footer_description', 'Goal-based wealth planning for Indian families, with dashboards, market context, and guided onboarding.', 'text', 'footer', 'Footer Description', 'Company description in footer', 1),
  ('footer_copyright', 'Â© 2025 Pravix Wealth Management. All rights reserved.', 'string', 'footer', 'Copyright', 'Footer copyright line', 2),
  ('footer_cta_label', 'Book a Free Call', 'string', 'footer', 'CTA Label', 'Footer CTA button text', 3),
  ('footer_cta_href', '/#contact-us', 'string', 'footer', 'CTA Link', 'Footer CTA URL', 4)
ON CONFLICT (key) DO NOTHING;

-- â•â•â• MIGRATION 4: Navigation â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.navigation_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid NOT NULL REFERENCES public.navigation_menus(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text NOT NULL,
  icon text,
  target text NOT NULL DEFAULT '_self',
  sort_order int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  requires_auth boolean NOT NULL DEFAULT false,
  required_role text,
  variant text NOT NULL DEFAULT 'link' CHECK (variant IN ('link','button','cta','heading')),
  badge text,
  media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Seed menus
INSERT INTO public.navigation_menus (id, name, location) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Main Header', 'header'),
  ('00000000-0000-0000-0000-000000000003', 'Footer â€” Quick Links', 'footer_col1'),
  ('00000000-0000-0000-0000-000000000004', 'Footer â€” Resources', 'footer_col2'),
  ('00000000-0000-0000-0000-000000000005', 'Footer â€” Support', 'footer_col3')
ON CONFLICT (id) DO NOTHING;

-- Header items
INSERT INTO public.navigation_items (menu_id, label, href, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dashboard', '/dashboard', 1),
  ('00000000-0000-0000-0000-000000000001', 'Services', '/services', 2),
  ('00000000-0000-0000-0000-000000000001', 'Marketplace', '/#insights', 3),
  ('00000000-0000-0000-0000-000000000001', 'Blog', '/#blog', 4),
  ('00000000-0000-0000-0000-000000000001', 'Team Pravix', '/#about-us', 5),
  ('00000000-0000-0000-0000-000000000001', 'Contact', '/#contact-us', 6);

-- Footer col 1
INSERT INTO public.navigation_items (menu_id, label, href, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Home', '/', 1),
  ('00000000-0000-0000-0000-000000000003', 'Dashboard', '/dashboard', 2),
  ('00000000-0000-0000-0000-000000000003', 'Learn', '/learn', 3),
  ('00000000-0000-0000-0000-000000000003', 'Team Pravix', '/about', 4),
  ('00000000-0000-0000-0000-000000000003', 'Services', '/services', 5);

-- Footer col 2
INSERT INTO public.navigation_items (menu_id, label, href, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000004', 'SIP Calculator', '/sip-calculator', 1),
  ('00000000-0000-0000-0000-000000000004', 'Investment Calculator', '/investment-calculator', 2),
  ('00000000-0000-0000-0000-000000000004', 'Financial Planning', '/financial-planning-india', 3),
  ('00000000-0000-0000-0000-000000000004', 'Wealth Planning Tool', '/wealth-planning-tool', 4);

-- Footer col 3
INSERT INTO public.navigation_items (menu_id, label, href, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000005', 'Get Started', '/onboarding', 1),
  ('00000000-0000-0000-0000-000000000005', 'Login', '/login', 2),
  ('00000000-0000-0000-0000-000000000005', 'Create Account', '/create-account', 3);

-- â•â•â• MIGRATION 5: Blog CMS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.blog_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 120),
  slug text NOT NULL UNIQUE,
  bio text,
  avatar_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  email text,
  role text,
  profile_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content_json jsonb,
  published_content_json jsonb,
  published_content_html text,
  excerpt text,
  featured_image_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','approved','scheduled','published','archived')),
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private','unlisted')),
  author_id uuid NOT NULL REFERENCES public.blog_authors(id) ON DELETE RESTRICT,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  published_at timestamptz,
  scheduled_at timestamptz,
  seo_title text,
  seo_description text,
  og_image_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.blog_post_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_json jsonb,
  excerpt text,
  saved_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blog_posts_public_read ON public.blog_posts; CREATE POLICY blog_posts_public_read ON public.blog_posts FOR SELECT TO anon, authenticated USING (status = 'published' AND visibility = 'public');
DROP POLICY IF EXISTS blog_authors_public_read ON public.blog_authors; CREATE POLICY blog_authors_public_read ON public.blog_authors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS blog_categories_public_read ON public.blog_categories; CREATE POLICY blog_categories_public_read ON public.blog_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS blog_tags_public_read ON public.blog_tags; CREATE POLICY blog_tags_public_read ON public.blog_tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS blog_post_tags_public_read ON public.blog_post_tags; CREATE POLICY blog_post_tags_public_read ON public.blog_post_tags FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.blog_authors (name, slug, role) VALUES ('Pravix Team', 'pravix-team', 'Wealth Planning Team') ON CONFLICT (slug) DO NOTHING;

-- â•â•â• ASSIGN ADMIN ROLES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

INSERT INTO public.user_roles (user_id, role_id)
SELECT au.id, r.id
FROM auth.users au CROSS JOIN public.roles r
WHERE au.email = 'usefullother6@gmail.com' AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id)
SELECT au.id, r.id
FROM auth.users au CROSS JOIN public.roles r
WHERE au.email = 'pravix10@gmail.com' AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;


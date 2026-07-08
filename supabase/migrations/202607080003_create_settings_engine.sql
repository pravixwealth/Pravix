-- ============================================================================
-- Phase 2: Settings Engine
-- ============================================================================

-- Business settings (editable by admin+)
create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  type text not null default 'string'
    check (type in ('string', 'text', 'number', 'boolean', 'color', 'url', 'image_url', 'json', 'csv')),
  group_key text not null,
  label text not null,
  description text,
  placeholder text,
  is_required boolean not null default false,
  validation_rule text,  -- optional regex or rule hint
  sort_order int not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists business_settings_group_idx
  on public.business_settings (group_key, sort_order);

-- Business settings version history
create table if not exists public.business_setting_history (
  id uuid primary key default gen_random_uuid(),
  setting_id uuid not null references public.business_settings(id) on delete cascade,
  old_value text,
  new_value text,
  changed_by uuid not null references auth.users(id) on delete set null,
  changed_at timestamptz not null default timezone('utc', now())
);

create index if not exists business_setting_history_setting_idx
  on public.business_setting_history (setting_id, changed_at desc);

-- System settings (restricted to super_admin)
create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  type text not null default 'string'
    check (type in ('string', 'text', 'number', 'boolean', 'json', 'secret')),
  group_key text not null,
  label text not null,
  description text,
  placeholder text,
  is_sensitive boolean not null default false,
  sort_order int not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists system_settings_group_idx
  on public.system_settings (group_key, sort_order);

-- System settings version history
create table if not exists public.system_setting_history (
  id uuid primary key default gen_random_uuid(),
  setting_id uuid not null references public.system_settings(id) on delete cascade,
  old_value text,
  new_value text,
  changed_by uuid not null references auth.users(id) on delete set null,
  changed_at timestamptz not null default timezone('utc', now())
);

create index if not exists system_setting_history_setting_idx
  on public.system_setting_history (setting_id, changed_at desc);

-- Editable site content (marketing copy, managed by admin/editor)
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  type text not null default 'string'
    check (type in ('string', 'text', 'richtext', 'image_url', 'json')),
  group_key text not null,
  label text not null,
  description text,
  sort_order int not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists site_content_group_idx
  on public.site_content (group_key, sort_order);

-- Site content version history
create table if not exists public.site_content_history (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.site_content(id) on delete cascade,
  old_value text,
  new_value text,
  changed_by uuid not null references auth.users(id) on delete set null,
  changed_at timestamptz not null default timezone('utc', now())
);

create index if not exists site_content_history_content_idx
  on public.site_content_history (content_id, changed_at desc);

-- ============================================================================
-- RLS — admin uses service role; public reads allowed for non-sensitive
-- ============================================================================

alter table public.business_settings enable row level security;
alter table public.business_settings force row level security;

alter table public.system_settings enable row level security;
alter table public.system_settings force row level security;

alter table public.site_content enable row level security;
alter table public.site_content force row level security;

alter table public.business_setting_history enable row level security;
alter table public.business_setting_history force row level security;

alter table public.system_setting_history enable row level security;
alter table public.system_setting_history force row level security;

alter table public.site_content_history enable row level security;
alter table public.site_content_history force row level security;

-- Public can read business_settings (for frontend rendering)
create policy business_settings_public_read on public.business_settings
  for select to anon, authenticated
  using (true);

-- Public can read site_content (for frontend rendering)
create policy site_content_public_read on public.site_content
  for select to anon, authenticated
  using (true);

-- System settings: NO public read (service role only)
-- History tables: NO public read (service role only)

-- ============================================================================
-- Seed business settings (metadata-driven)
-- ============================================================================

insert into public.business_settings (key, value, type, group_key, label, description, placeholder, is_required, sort_order) values
  -- General
  ('company_name', 'Pravix Wealth Management', 'string', 'general', 'Company Name', 'Full legal/brand name', 'Acme Corp', true, 1),
  ('company_short_name', 'Pravix', 'string', 'general', 'Short Name', 'Abbreviated brand name', 'Acme', true, 2),
  ('company_tagline', 'Goal-Based Wealth Planning for Indian Families', 'string', 'general', 'Tagline', 'Primary tagline shown in headers and SEO', null, false, 3),
  ('site_url', 'https://pravix.in', 'url', 'general', 'Site URL', 'Canonical site URL (no trailing slash)', 'https://example.com', true, 4),
  ('copyright_text', '© 2025 Pravix Wealth Management. All rights reserved.', 'string', 'general', 'Copyright Text', 'Footer copyright line', null, false, 5),

  -- Branding
  ('logo_url', '/image/pravix-visualmark.png', 'image_url', 'branding', 'Logo', 'Primary logo image', null, true, 1),
  ('favicon_url', '/image/pravix-visualmark.png', 'image_url', 'branding', 'Favicon', 'Browser tab icon', null, false, 2),
  ('primary_color', '#2b5cff', 'color', 'branding', 'Primary Color', 'Brand primary color', '#2b5cff', false, 3),
  ('accent_color', '#04bfff', 'color', 'branding', 'Accent Color', 'Secondary accent color', '#04bfff', false, 4),

  -- Contact
  ('contact_phone', '+918796215599', 'string', 'contact', 'Phone Number', 'Primary business phone (E.164 format)', '+91XXXXXXXXXX', true, 1),
  ('contact_email', 'info@pravix.in', 'string', 'contact', 'Email', 'Primary contact email', 'hello@example.com', true, 2),
  ('contact_whatsapp', '+918796215599', 'string', 'contact', 'WhatsApp Number', 'WhatsApp business number', '+91XXXXXXXXXX', false, 3),
  ('contact_address', null, 'text', 'contact', 'Business Address', 'Full postal address', null, false, 4),
  ('support_email', null, 'string', 'contact', 'Support Email', 'Customer support email (if different)', null, false, 5),

  -- SEO Defaults
  ('seo_title_template', '%s | Pravix', 'string', 'seo', 'Title Template', 'Page title template (%s = page title)', '%s | Brand', false, 1),
  ('seo_default_description', 'Pravix helps Indian families plan, track, and optimize long-term wealth goals using disciplined systems, real market context, and expert-backed guidance.', 'text', 'seo', 'Default Meta Description', 'Fallback meta description', null, false, 2),
  ('seo_default_keywords', 'Pravix,wealth management,financial planning India,SIP calculator,goal-based investing', 'csv', 'seo', 'Default Keywords', 'Comma-separated SEO keywords', null, false, 3),
  ('seo_og_image', '/image/hero-banner-3.png', 'image_url', 'seo', 'Default OG Image', 'Default social share image', null, false, 4),

  -- Analytics
  ('analytics_ga4_id', null, 'string', 'analytics', 'Google Analytics 4 ID', 'GA4 measurement ID', 'G-XXXXXXXXXX', false, 1),
  ('analytics_gtm_id', null, 'string', 'analytics', 'Google Tag Manager ID', 'GTM container ID', 'GTM-XXXXXXX', false, 2),
  ('analytics_meta_pixel', null, 'string', 'analytics', 'Meta Pixel ID', 'Facebook/Meta Pixel ID', null, false, 3),
  ('analytics_clarity_id', null, 'string', 'analytics', 'Microsoft Clarity ID', 'Clarity project ID', null, false, 4),

  -- Social
  ('social_instagram', 'https://www.instagram.com/pravixwealth/', 'url', 'social', 'Instagram', 'Instagram profile URL', 'https://instagram.com/...', false, 1),
  ('social_linkedin', 'https://www.linkedin.com/company/pravix-wealth-management/', 'url', 'social', 'LinkedIn', 'LinkedIn company page URL', 'https://linkedin.com/company/...', false, 2),
  ('social_youtube', 'https://www.youtube.com/@PRAVIXwealth', 'url', 'social', 'YouTube', 'YouTube channel URL', 'https://youtube.com/@...', false, 3),
  ('social_facebook', 'https://www.facebook.com/people/Pravix-Wealth-Management/61588755566789/', 'url', 'social', 'Facebook', 'Facebook page URL', 'https://facebook.com/...', false, 4),
  ('social_twitter', null, 'url', 'social', 'Twitter / X', 'Twitter profile URL', 'https://x.com/...', false, 5),

  -- Legal
  ('legal_privacy_url', '/privacy', 'url', 'legal', 'Privacy Policy URL', 'Link to privacy policy page', '/privacy', false, 1),
  ('legal_terms_url', '/terms', 'url', 'legal', 'Terms of Service URL', 'Link to terms page', '/terms', false, 2)

on conflict (key) do nothing;

-- Seed system settings
insert into public.system_settings (key, value, type, group_key, label, description, is_sensitive, sort_order) values
  -- AI Configuration
  ('ai_primary_model', 'openai/gpt-5.3-chat', 'string', 'ai', 'Primary AI Model', 'OpenRouter model ID for chat/advice', false, 1),
  ('ai_fallback_model', 'meta/llama-3.1-8b-instruct', 'string', 'ai', 'Fallback AI Model', 'NVIDIA NIM model for fallback', false, 2),
  ('ai_temperature', '0.7', 'number', 'ai', 'Temperature', 'Model temperature (0-1)', false, 3),
  ('ai_max_tokens', '1024', 'number', 'ai', 'Max Tokens', 'Maximum response tokens', false, 4),

  -- Calculator Defaults
  ('calc_equity_return', '12', 'number', 'calculators', 'Equity Expected Return %', 'Annual expected return for equity', false, 1),
  ('calc_debt_return', '7', 'number', 'calculators', 'Debt Expected Return %', 'Annual expected return for debt', false, 2),
  ('calc_gold_return', '8', 'number', 'calculators', 'Gold Expected Return %', 'Annual expected return for gold', false, 3),
  ('calc_inflation', '6', 'number', 'calculators', 'Inflation Assumption %', 'Default inflation rate', false, 4)

on conflict (key) do nothing;

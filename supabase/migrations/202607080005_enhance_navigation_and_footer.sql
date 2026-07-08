-- ============================================================================
-- Phase 4: Navigation & Footer — CMS Infrastructure
-- ============================================================================

-- Enhance navigation_items with variant, badge, and media reference
alter table public.navigation_items
  add column if not exists variant text not null default 'link'
    check (variant in ('link', 'button', 'cta', 'heading')),
  add column if not exists badge text,
  add column if not exists media_id uuid references public.media(id) on delete set null;

-- ============================================================================
-- Seed navigation menus
-- ============================================================================

-- Header menu
insert into public.navigation_menus (id, name, location) values
  ('00000000-0000-0000-0000-000000000001', 'Main Header', 'header'),
  ('00000000-0000-0000-0000-000000000002', 'Mobile Menu', 'mobile'),
  ('00000000-0000-0000-0000-000000000003', 'Footer — Quick Links', 'footer_col1'),
  ('00000000-0000-0000-0000-000000000004', 'Footer — Resources', 'footer_col2'),
  ('00000000-0000-0000-0000-000000000005', 'Footer — Support', 'footer_col3')
on conflict (id) do nothing;

-- Header items
insert into public.navigation_items (menu_id, label, href, sort_order, visible) values
  ('00000000-0000-0000-0000-000000000001', 'Dashboard', '/dashboard', 1, true),
  ('00000000-0000-0000-0000-000000000001', 'Services', '/services', 2, true),
  ('00000000-0000-0000-0000-000000000001', 'Marketplace', '/#insights', 3, true),
  ('00000000-0000-0000-0000-000000000001', 'Blog', '/#blog', 4, true),
  ('00000000-0000-0000-0000-000000000001', 'Team Pravix', '/#about-us', 5, true),
  ('00000000-0000-0000-0000-000000000001', 'Contact', '/#contact-us', 6, true)
on conflict do nothing;

-- Footer Quick Links (col 1)
insert into public.navigation_items (menu_id, label, href, sort_order, visible) values
  ('00000000-0000-0000-0000-000000000003', 'Home', '/', 1, true),
  ('00000000-0000-0000-0000-000000000003', 'Dashboard', '/dashboard', 2, true),
  ('00000000-0000-0000-0000-000000000003', 'Learn', '/learn', 3, true),
  ('00000000-0000-0000-0000-000000000003', 'Team Pravix', '/about', 4, true),
  ('00000000-0000-0000-0000-000000000003', 'Services', '/services', 5, true),
  ('00000000-0000-0000-0000-000000000003', 'Book Discovery Call', '/#book-discovery-call', 6, true),
  ('00000000-0000-0000-0000-000000000003', 'Get Started', '/onboarding', 7, true)
on conflict do nothing;

-- Footer Resources (col 2)
insert into public.navigation_items (menu_id, label, href, sort_order, visible) values
  ('00000000-0000-0000-0000-000000000004', 'SIP Calculator', '/sip-calculator', 1, true),
  ('00000000-0000-0000-0000-000000000004', 'Investment Calculator', '/investment-calculator', 2, true),
  ('00000000-0000-0000-0000-000000000004', 'Financial Planning India', '/financial-planning-india', 3, true),
  ('00000000-0000-0000-0000-000000000004', 'Wealth Planning Tool', '/wealth-planning-tool', 4, true),
  ('00000000-0000-0000-0000-000000000004', 'Smart Insights', '/#insights', 5, true),
  ('00000000-0000-0000-0000-000000000004', 'How It Works', '/#how-it-works', 6, true)
on conflict do nothing;

-- Footer Support (col 3)
insert into public.navigation_items (menu_id, label, href, sort_order, visible) values
  ('00000000-0000-0000-0000-000000000005', 'Get Started', '/onboarding', 1, true),
  ('00000000-0000-0000-0000-000000000005', 'Login', '/login', 2, true),
  ('00000000-0000-0000-0000-000000000005', 'Create Account', '/create-account', 3, true),
  ('00000000-0000-0000-0000-000000000005', 'Profile', '/profile', 4, true)
on conflict do nothing;

-- ============================================================================
-- Seed footer content into site_content
-- ============================================================================

insert into public.site_content (key, value, type, group_key, label, description, sort_order) values
  ('footer_description', 'Goal-based wealth planning for Indian families, with dashboards, market context, and guided onboarding.', 'text', 'footer', 'Footer Description', 'Short company description in footer', 1),
  ('footer_copyright', '© 2025 Pravix Wealth Management. All rights reserved.', 'string', 'footer', 'Copyright Text', 'Footer copyright line', 2),
  ('footer_cta_label', 'Book a Free Call', 'string', 'footer', 'CTA Button Label', 'Primary footer call-to-action text', 3),
  ('footer_cta_href', '/#contact-us', 'string', 'footer', 'CTA Button Link', 'URL for footer CTA button', 4)
on conflict (key) do nothing;

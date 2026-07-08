-- ============================================================================
-- Phase 5: Blog CMS
-- ============================================================================

-- Blog authors (decoupled from login accounts)
create table if not exists public.blog_authors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug text not null unique,
  bio text,
  avatar_id uuid references public.media(id) on delete set null,
  email text,
  role text,
  profile_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Blog categories
create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

-- Blog tags
create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

-- Blog posts
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 300),
  slug text not null unique,
  content_json jsonb,
  published_content_json jsonb,
  published_content_html text,
  excerpt text,
  featured_image_id uuid references public.media(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'approved', 'scheduled', 'published', 'archived')),
  visibility text not null default 'public'
    check (visibility in ('public', 'private', 'unlisted')),
  author_id uuid not null references public.blog_authors(id) on delete restrict,
  category_id uuid references public.blog_categories(id) on delete set null,
  published_at timestamptz,
  scheduled_at timestamptz,
  seo_title text,
  seo_description text,
  og_image_id uuid references public.media(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_author_idx on public.blog_posts (author_id);
create index if not exists blog_posts_category_idx on public.blog_posts (category_id);
create index if not exists blog_posts_slug_idx on public.blog_posts (slug);

-- Auto-update updated_at
drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row
execute function public.set_row_updated_at();

-- Blog post tags (many-to-many)
create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Blog post revisions (one-click restore)
create table if not exists public.blog_post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  title text not null,
  content_json jsonb,
  excerpt text,
  saved_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists blog_post_revisions_post_idx
  on public.blog_post_revisions (post_id, created_at desc);

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.blog_authors enable row level security;
alter table public.blog_authors force row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_categories force row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_tags force row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_posts force row level security;
alter table public.blog_post_tags enable row level security;
alter table public.blog_post_tags force row level security;
alter table public.blog_post_revisions enable row level security;
alter table public.blog_post_revisions force row level security;

-- Public can read published posts
create policy blog_posts_public_read on public.blog_posts
  for select to anon, authenticated
  using (status = 'published' and visibility = 'public');

-- Public can read authors, categories, tags
create policy blog_authors_public_read on public.blog_authors
  for select to anon, authenticated using (true);

create policy blog_categories_public_read on public.blog_categories
  for select to anon, authenticated using (true);

create policy blog_tags_public_read on public.blog_tags
  for select to anon, authenticated using (true);

create policy blog_post_tags_public_read on public.blog_post_tags
  for select to anon, authenticated using (true);

-- Revisions: admin only (via service role)
-- No public policy on blog_post_revisions

-- ============================================================================
-- Seed default author
-- ============================================================================

insert into public.blog_authors (name, slug, role) values
  ('Pravix Team', 'pravix-team', 'Wealth Planning Team')
on conflict (slug) do nothing;

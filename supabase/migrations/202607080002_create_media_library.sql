-- ============================================================================
-- Phase 2: Media Library
-- ============================================================================

-- Folders for organizing media
create table if not exists public.media_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  parent_folder_id uuid references public.media_folders(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists media_folders_parent_idx on public.media_folders (parent_folder_id);

-- Media files
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  original_filename text not null,
  storage_path text not null unique,
  public_url text not null,
  thumbnail_url text,
  mime_type text not null,
  extension text not null,
  width int,
  height int,
  size_bytes bigint not null default 0,
  alt_text text,
  caption text,
  dominant_color text,
  blur_hash text,
  checksum text,
  is_optimized boolean not null default false,
  folder_id uuid references public.media_folders(id) on delete set null,
  uploaded_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists media_folder_idx on public.media (folder_id);
create index if not exists media_uploaded_by_idx on public.media (uploaded_by);
create index if not exists media_created_at_idx on public.media (created_at desc);
create index if not exists media_checksum_idx on public.media (checksum) where checksum is not null;

-- Track where each media file is used (prevents accidental orphan deletes)
create table if not exists public.media_usage (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  field_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists media_usage_media_idx on public.media_usage (media_id);
create index if not exists media_usage_entity_idx on public.media_usage (entity_type, entity_id);

-- ============================================================================
-- RLS — Admin access via service role, no public access
-- ============================================================================

alter table public.media_folders enable row level security;
alter table public.media_folders force row level security;

alter table public.media enable row level security;
alter table public.media force row level security;

alter table public.media_usage enable row level security;
alter table public.media_usage force row level security;

-- Authenticated users can read media (for frontend rendering)
create policy media_select_authenticated on public.media
  for select to authenticated
  using (true);

create policy media_folders_select_authenticated on public.media_folders
  for select to authenticated
  using (true);

-- All mutations go through service role (admin panel)

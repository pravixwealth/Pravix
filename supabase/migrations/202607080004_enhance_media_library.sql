-- ============================================================================
-- Phase 3: Media Library Enhancements
-- ============================================================================

-- Add title and soft delete to media
alter table public.media
  add column if not exists title text,
  add column if not exists deleted_at timestamptz;

-- Unique constraint on media_usage to prevent duplicate tracking
create unique index if not exists media_usage_unique_idx
  on public.media_usage (media_id, entity_type, entity_id, field_name);

-- Index for soft-delete filtering
create index if not exists media_not_deleted_idx
  on public.media (created_at desc) where deleted_at is null;

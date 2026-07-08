-- ============================================================================
-- Phase 1: Admin Framework — Roles, Permissions, Audit
-- ============================================================================

-- Roles lookup table
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

-- Seed default roles
insert into public.roles (name, description) values
  ('super_admin', 'Full platform access including role management and system settings'),
  ('admin', 'All operations except role management'),
  ('editor', 'Content management: blog, media, site content'),
  ('viewer', 'Read-only access to admin dashboard')
on conflict (name) do nothing;

-- User role assignments (many-to-many, supports multiple roles per user)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default timezone('utc', now()),
  unique (user_id, role_id)
);

create index if not exists user_roles_user_id_idx on public.user_roles (user_id);
create index if not exists user_roles_role_id_idx on public.user_roles (role_id);

-- Add status fields to profiles
alter table public.profiles
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended', 'disabled')),
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_reason text;

-- Audit logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists audit_logs_user_id_idx on public.audit_logs (user_id);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Roles: readable by authenticated, writable by service role only
alter table public.roles enable row level security;
alter table public.roles force row level security;

create policy roles_select_authenticated on public.roles
  for select to authenticated
  using (true);

-- User Roles: users can see their own, admins see all (via service role)
alter table public.user_roles enable row level security;
alter table public.user_roles force row level security;

create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Audit Logs: admins read via service role, users cannot access
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;

-- No user-facing policy on audit_logs (admin uses service role client)

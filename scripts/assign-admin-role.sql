-- ============================================================================
-- Run this after migrations to grant yourself super_admin access.
-- Replace 'YOUR_EMAIL_HERE' with your actual login email.
-- Execute via Supabase SQL Editor or psql.
-- ============================================================================

-- Step 1: Find your user_id from auth.users
-- (Uncomment and run this first to find your ID)
-- SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';

-- Step 2: Assign super_admin role
-- Replace the UUID below with your actual auth.users.id from Step 1
INSERT INTO public.user_roles (user_id, role_id)
SELECT
  auth_user.id,
  roles.id
FROM auth.users auth_user
CROSS JOIN public.roles roles
WHERE auth_user.email = 'YOUR_EMAIL_HERE'
  AND roles.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Verify it worked:
-- SELECT ur.*, r.name as role_name
-- FROM public.user_roles ur
-- JOIN public.roles r ON r.id = ur.role_id;

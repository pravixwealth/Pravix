-- ============================================================================
-- Grant super_admin access to Pravix admin accounts.
-- Run this in Supabase SQL Editor after running all migrations.
-- ============================================================================

-- Assign super_admin to usefullother6@gmail.com
INSERT INTO public.user_roles (user_id, role_id)
SELECT
  auth_user.id,
  roles.id
FROM auth.users auth_user
CROSS JOIN public.roles roles
WHERE auth_user.email = 'usefullother6@gmail.com'
  AND roles.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign super_admin to pravix10@gmail.com
INSERT INTO public.user_roles (user_id, role_id)
SELECT
  auth_user.id,
  roles.id
FROM auth.users auth_user
CROSS JOIN public.roles roles
WHERE auth_user.email = 'pravix10@gmail.com'
  AND roles.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Verify:
-- SELECT au.email, r.name as role
-- FROM public.user_roles ur
-- JOIN auth.users au ON au.id = ur.user_id
-- JOIN public.roles r ON r.id = ur.role_id;

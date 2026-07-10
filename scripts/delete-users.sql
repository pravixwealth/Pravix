-- ============================================================================
-- DELETE USERS COMPLETELY
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ntxfcrvgjfaesedyribq/sql
-- ============================================================================

-- List of emails to delete
-- priyakumari47317@gmail.com
-- risav13087@gixpos.com
-- upkarkaur@amityonline.com
-- wigayit619@pertok.com
-- yociwes674@sixoplus.com

DO $$
DECLARE
  emails_to_delete text[] := ARRAY[
    'priyakumari47317@gmail.com',
    'risav13087@gixpos.com',
    'upkarkaur@amityonline.com',
    'wigayit619@pertok.com',
    'yociwes674@sixoplus.com'
  ];
  user_ids uuid[];
  uid uuid;
BEGIN
  -- Get user IDs
  SELECT array_agg(id) INTO user_ids
  FROM auth.users
  WHERE email = ANY(emails_to_delete);

  IF user_ids IS NULL OR array_length(user_ids, 1) IS NULL THEN
    RAISE NOTICE 'No matching users found.';
    RETURN;
  END IF;

  RAISE NOTICE 'Found % users to delete', array_length(user_ids, 1);

  -- Delete from all related tables (cascade should handle most, but be explicit)
  DELETE FROM public.user_roles WHERE user_id = ANY(user_ids);
  DELETE FROM public.audit_logs WHERE user_id = ANY(user_ids);
  DELETE FROM public.email_verification_tokens WHERE email = ANY(emails_to_delete);
  DELETE FROM public.onboarding_responses WHERE session_id IN (
    SELECT id FROM public.onboarding_sessions WHERE user_id = ANY(user_ids)
  );
  DELETE FROM public.onboarding_sessions WHERE user_id = ANY(user_ids);
  DELETE FROM public.communication_preferences WHERE user_id = ANY(user_ids);
  DELETE FROM public.alert_preferences WHERE user_id = ANY(user_ids);
  DELETE FROM public.alert_delivery_logs WHERE user_id = ANY(user_ids);
  DELETE FROM public.financial_goals WHERE user_id = ANY(user_ids);
  DELETE FROM public.risk_assessments WHERE user_id = ANY(user_ids);
  DELETE FROM public.financial_health_scores WHERE user_id = ANY(user_ids);
  DELETE FROM public.tax_profiles WHERE user_id = ANY(user_ids);
  DELETE FROM public.user_consents WHERE user_id = ANY(user_ids);
  DELETE FROM public.user_subscriptions WHERE user_id = ANY(user_ids);
  DELETE FROM public.portfolio_transactions WHERE account_id IN (
    SELECT id FROM public.portfolio_accounts WHERE user_id = ANY(user_ids)
  );
  DELETE FROM public.portfolio_holdings WHERE user_id = ANY(user_ids);
  DELETE FROM public.portfolio_accounts WHERE user_id = ANY(user_ids);
  DELETE FROM public.profiles WHERE user_id = ANY(user_ids);

  -- Delete from Supabase Auth (this is the final step)
  FOREACH uid IN ARRAY user_ids LOOP
    DELETE FROM auth.users WHERE id = uid;
  END LOOP;

  RAISE NOTICE 'Successfully deleted all traces of % users', array_length(user_ids, 1);
END $$;

-- Verify they're gone:
-- SELECT id, email FROM auth.users WHERE email IN ('priyakumari47317@gmail.com', 'risav13087@gixpos.com', 'upkarkaur@amityonline.com', 'wigayit619@pertok.com', 'yociwes674@sixoplus.com');

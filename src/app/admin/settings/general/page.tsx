import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/admin/server-auth";
import { getSettingsByGroup } from "@/lib/admin/repositories/settings.repository";
import { SettingsGroupPage } from "./SettingsGroupPage";

export default async function GeneralSettingsPage() {
  const user = await requireRole("admin");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const result = await getSettingsByGroup(supabase, "business_settings", "general");

  if (!result.success) {
    return <p className="text-sm text-red-600">Failed to load settings: {result.error}</p>;
  }

  return <SettingsGroupPage entries={result.data} groupKey="general" table="business" />;
}

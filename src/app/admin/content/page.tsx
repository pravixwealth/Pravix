import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import type { SettingEntry } from "@/lib/admin/repositories/settings.repository";
import { SiteContentFormClient } from "./SiteContentFormClient";

export default async function SiteContentPage() {
  await requireRole("admin");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from("site_content")
    .select()
    .order("group_key")
    .order("sort_order", { ascending: true });

  if (error) {
    return <p className="text-sm text-red-600">Failed to load: {error.message}</p>;
  }

  const entries: SettingEntry[] = (data ?? []).map((row) => ({
    id: row.id as string,
    key: row.key as string,
    value: (row.value as string) ?? null,
    type: row.type as SettingEntry["type"],
    groupKey: row.group_key as string,
    label: row.label as string,
    description: (row.description as string) ?? null,
    placeholder: null,
    isRequired: false,
    validationRule: null,
    sortOrder: (row.sort_order as number) ?? 0,
    updatedAt: row.updated_at as string,
    updatedBy: (row.updated_by as string) ?? null,
  }));

  return (
    <div>
      <PageHeader
        title="Site Content"
        description="Edit website marketing copy — footer text, descriptions, CTAs."
      />
      <div className="mt-8">
        <SiteContentFormClient entries={entries} />
      </div>
    </div>
  );
}

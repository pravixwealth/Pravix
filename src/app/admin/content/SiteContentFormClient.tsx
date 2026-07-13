"use client";

import { SettingsForm } from "@/components/admin/SettingsForm";
import type { SettingEntry } from "@/lib/admin/repositories/settings.repository";

export function SiteContentFormClient({ entries }: { entries: SettingEntry[] }) {
  const handleSave = async (updates: Array<{ key: string; value: string | null }>) => {
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ table: "content", updates }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error ?? "Failed to save" };
    }

    return { success: true };
  };

  return <SettingsForm entries={entries} onSave={handleSave} />;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { RepoResult } from "../types";

// ── Domain Types ─────────────────────────────────────────────────────────────

export type SettingType = "string" | "text" | "richtext" | "number" | "boolean" | "color" | "url" | "image_url" | "json" | "csv" | "secret";

export type SettingEntry = {
  id: string;
  key: string;
  value: string | null;
  type: SettingType;
  groupKey: string;
  label: string;
  description: string | null;
  placeholder: string | null;
  isRequired: boolean;
  validationRule: string | null;
  sortOrder: number;
  updatedAt: string;
  updatedBy: string | null;
};

export type SettingGroup = {
  key: string;
  label: string;
  entries: SettingEntry[];
};

export type SettingHistoryEntry = {
  id: string;
  settingId: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string;
};

// ── Table Selector ───────────────────────────────────────────────────────────

type SettingsTable = "business_settings" | "system_settings" | "site_content";
type HistoryTable = "business_setting_history" | "system_setting_history" | "site_content_history";

function historyTableFor(table: SettingsTable): HistoryTable {
  if (table === "business_settings") return "business_setting_history";
  if (table === "system_settings") return "system_setting_history";
  return "site_content_history";
}

// ── Row Mapper ───────────────────────────────────────────────────────────────

function rowToEntry(row: Record<string, unknown>): SettingEntry {
  return {
    id: row.id as string,
    key: row.key as string,
    value: (row.value as string) ?? null,
    type: row.type as SettingType,
    groupKey: row.group_key as string,
    label: row.label as string,
    description: (row.description as string) ?? null,
    placeholder: (row.placeholder as string) ?? null,
    isRequired: (row.is_required as boolean) ?? false,
    validationRule: (row.validation_rule as string) ?? null,
    sortOrder: (row.sort_order as number) ?? 0,
    updatedAt: row.updated_at as string,
    updatedBy: (row.updated_by as string) ?? null,
  };
}

// ── Repository Functions ─────────────────────────────────────────────────────

export async function getSettingsByGroup(
  supabase: SupabaseClient,
  table: SettingsTable,
  groupKey: string
): Promise<RepoResult<SettingEntry[]>> {
  const { data, error } = await supabase
    .from(table)
    .select()
    .eq("group_key", groupKey)
    .order("sort_order", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []).map(rowToEntry) };
}

export async function getAllSettings(
  supabase: SupabaseClient,
  table: SettingsTable
): Promise<RepoResult<SettingEntry[]>> {
  const { data, error } = await supabase
    .from(table)
    .select()
    .order("group_key")
    .order("sort_order", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []).map(rowToEntry) };
}

export async function getSettingValue(
  supabase: SupabaseClient,
  table: SettingsTable,
  key: string
): Promise<RepoResult<string | null>> {
  const { data, error } = await supabase
    .from(table)
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data?.value as string) ?? null };
}

export async function updateSetting(
  supabase: SupabaseClient,
  table: SettingsTable,
  key: string,
  newValue: string | null,
  changedBy: string
): Promise<RepoResult<SettingEntry>> {
  // Get current value for history
  const { data: current, error: fetchError } = await supabase
    .from(table)
    .select("id, value")
    .eq("key", key)
    .single();

  if (fetchError || !current) {
    return { success: false, error: `Setting '${key}' not found` };
  }

  const oldValue = (current.value as string) ?? null;

  // Update the setting
  const { data, error } = await supabase
    .from(table)
    .update({
      value: newValue,
      updated_at: new Date().toISOString(),
      updated_by: changedBy,
    })
    .eq("key", key)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to update setting" };
  }

  // Record history
  const historyTable = historyTableFor(table);
  const historyFkColumn = table === "site_content" ? "content_id" : "setting_id";
  await supabase.from(historyTable).insert({
    [historyFkColumn]: current.id,
    old_value: oldValue,
    new_value: newValue,
    changed_by: changedBy,
  });

  return { success: true, data: rowToEntry(data) };
}

export async function updateSettingsBatch(
  supabase: SupabaseClient,
  table: SettingsTable,
  updates: Array<{ key: string; value: string | null }>,
  changedBy: string
): Promise<RepoResult<SettingEntry[]>> {
  const results: SettingEntry[] = [];

  for (const update of updates) {
    const result = await updateSetting(supabase, table, update.key, update.value, changedBy);
    if (!result.success) {
      return { success: false, error: `Failed to update '${update.key}': ${result.error}` };
    }
    results.push(result.data);
  }

  return { success: true, data: results };
}

export async function getSettingHistory(
  supabase: SupabaseClient,
  table: SettingsTable,
  settingKey: string,
  limit = 20
): Promise<RepoResult<SettingHistoryEntry[]>> {
  const { data: setting } = await supabase
    .from(table)
    .select("id")
    .eq("key", settingKey)
    .single();

  if (!setting) {
    return { success: false, error: "Setting not found" };
  }

  const historyTable = historyTableFor(table);
  const { data, error } = await supabase
    .from(historyTable)
    .select()
    .eq("setting_id", setting.id)
    .order("changed_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id as string,
      settingId: row.setting_id as string,
      oldValue: (row.old_value as string) ?? null,
      newValue: (row.new_value as string) ?? null,
      changedBy: row.changed_by as string,
      changedAt: row.changed_at as string,
    })),
  };
}

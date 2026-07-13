"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { SettingEntry } from "@/lib/admin/repositories/settings.repository";

type SettingsFormProps = {
  entries: SettingEntry[];
  onSave: (updates: Array<{ key: string; value: string | null }>) => Promise<{ success: boolean; error?: string }>;
};

/**
 * Metadata-driven settings form.
 * Renders inputs based on setting type/metadata.
 * No UI changes needed when new settings are added to the DB.
 */
export function SettingsForm({ entries, onSave }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const entry of entries) {
      initial[entry.key] = entry.value ?? "";
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const updates = entries.map((entry) => ({
      key: entry.key,
      value: values[entry.key]?.trim() || null,
    }));

    const result = await onSave(updates);

    if (result.success) {
      setMessage({ type: "success", text: "Settings saved successfully." });
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to save settings." });
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {entries.map((entry) => (
        <div key={entry.key}>
          <label
            htmlFor={entry.key}
            className="block text-sm font-medium text-[#0f172a]"
          >
            {entry.label}
            {entry.isRequired && <span className="ml-1 text-red-500">*</span>}
          </label>
          {entry.description && (
            <p className="mt-0.5 text-xs text-[#64748b]">{entry.description}</p>
          )}
          <div className="mt-1.5">
            {renderInput(entry, values[entry.key] ?? "", (val) => handleChange(entry.key, val))}
          </div>
        </div>
      ))}

      {message && (
        <div
          className={`rounded-lg px-4 py-2.5 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2b5cff] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#224ed8] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

function renderInput(
  entry: SettingEntry,
  value: string,
  onChange: (val: string) => void
) {
  const baseClass =
    "w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20";

  switch (entry.type) {
    case "text":
    case "richtext":
      return (
        <textarea
          id={entry.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={entry.placeholder ?? undefined}
          rows={4}
          className={baseClass + " resize-y"}
        />
      );

    case "boolean":
      return (
        <label className="inline-flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            id={entry.key}
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
            className="h-4 w-4 rounded border-[#e2e8f0] text-[#2b5cff] focus:ring-[#2b5cff]/20"
          />
          <span className="text-sm text-[#475569]">Enabled</span>
        </label>
      );

    case "color":
      return (
        <div className="flex items-center gap-3">
          <input
            type="color"
            id={entry.key}
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-[#e2e8f0]"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={entry.placeholder ?? "#000000"}
            className={baseClass + " max-w-[140px]"}
          />
        </div>
      );

    case "number":
      return (
        <input
          type="number"
          id={entry.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={entry.placeholder ?? undefined}
          className={baseClass + " max-w-[200px]"}
        />
      );

    case "csv":
      return (
        <textarea
          id={entry.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={entry.placeholder ?? "value1, value2, value3"}
          rows={3}
          className={baseClass + " resize-y font-mono text-xs"}
        />
      );

    default:
      return (
        <input
          type={entry.type === "url" || entry.type === "image_url" ? "url" : "text"}
          id={entry.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={entry.placeholder ?? undefined}
          className={baseClass}
        />
      );
  }
}

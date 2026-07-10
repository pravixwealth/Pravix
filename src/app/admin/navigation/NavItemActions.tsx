"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import type { NavItem } from "@/lib/admin/repositories/navigation.repository";

export function AddNavItemButton({ menuId }: { menuId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!label.trim() || !href.trim()) return;
    setSaving(true);
    await fetch("/api/admin/navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId, label: label.trim(), href: href.trim(), sortOrder: 99 }),
    });
    setSaving(false);
    setOpen(false);
    setLabel("");
    setHref("");
    router.refresh();
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#e2e8f0] px-3 py-2 text-xs font-medium text-[#64748b] hover:border-[#2b5cff] hover:text-[#2b5cff]">
        <Plus className="h-3.5 w-3.5" />Add Item
      </button>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
      <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="flex-1 rounded border border-[#e2e8f0] px-2 py-1.5 text-xs" />
      <input value={href} onChange={(e) => setHref(e.target.value)} placeholder="/path" className="flex-1 rounded border border-[#e2e8f0] px-2 py-1.5 text-xs font-mono" />
      <button type="button" onClick={handleSave} disabled={saving} className="rounded bg-[#2b5cff] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Save</button>
      <button type="button" onClick={() => setOpen(false)} className="text-[#94a3b8] hover:text-red-500"><X className="h-4 w-4" /></button>
    </div>
  );
}

export function NavItemActionButtons({ item }: { item: NavItem }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [href, setHref] = useState(item.href);

  const toggleVisibility = async () => {
    await fetch("/api/admin/navigation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, visible: !item.visible }),
    });
    router.refresh();
  };

  const handleSave = async () => {
    if (!label.trim()) return;
    await fetch("/api/admin/navigation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, label: label.trim(), href: href.trim() }),
    });
    setEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${item.label}"?`)) return;
    await fetch(`/api/admin/navigation?id=${item.id}`, { method: "DELETE" });
    router.refresh();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-24 rounded border border-[#e2e8f0] px-2 py-1 text-xs" />
        <input value={href} onChange={(e) => setHref(e.target.value)} className="w-28 rounded border border-[#e2e8f0] px-2 py-1 text-xs font-mono" />
        <button type="button" onClick={handleSave} className="rounded bg-[#2b5cff] px-2 py-1 text-[10px] font-medium text-white">Save</button>
        <button type="button" onClick={() => { setEditing(false); setLabel(item.label); setHref(item.href); }} className="text-[10px] text-[#94a3b8] hover:text-red-500">Cancel</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => setEditing(true)} className="rounded p-1 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0f172a]" title="Edit label and URL">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={toggleVisibility} className="rounded p-1 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0f172a]" title={item.visible ? "Hide from website" : "Show on website"}>
        {item.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </button>
      <button type="button" onClick={handleDelete} className="rounded p-1 text-[#94a3b8] hover:bg-red-50 hover:text-red-600" title="Delete permanently">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

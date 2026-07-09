import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { listAuditLogs } from "@/lib/admin/repositories/audit.repository";
import { Activity, Clock, Shield } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  publish: "bg-purple-100 text-purple-700",
  login: "bg-amber-100 text-amber-700",
  role_change: "bg-indigo-100 text-indigo-700",
  restore: "bg-cyan-100 text-cyan-700",
  upload: "bg-teal-100 text-teal-700",
  status_change: "bg-orange-100 text-orange-700",
};

export default async function AuditLogsPage() {
  await requireRole("admin");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const result = await listAuditLogs(supabase, { perPage: 50 });
  const entries = result.success ? result.data.entries : [];
  const total = result.success ? result.data.total : 0;

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description={`${total} action${total !== 1 ? "s" : ""} recorded`}
      />

      <div className="mt-8">
        {entries.length === 0 ? (
          <EmptyState
            icon={<Shield className="h-6 w-6" />}
            title="No audit activity yet"
            description="Actions will be logged here as admins create, update, and publish content."
          />
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 rounded-xl border border-[#e2e8f0] bg-white px-5 py-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9]">
                  <Activity className="h-4 w-4 text-[#64748b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${ACTION_COLORS[entry.action] ?? "bg-[#f1f5f9] text-[#64748b]"}`}
                    >
                      {entry.action}
                    </span>
                    <span className="text-sm text-[#0f172a]">
                      {entry.entityType.replace(/_/g, " ")}
                    </span>
                  </div>
                  {entry.newValue && (
                    <p className="mt-1 truncate text-xs text-[#94a3b8]">
                      {JSON.stringify(entry.newValue).slice(0, 120)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-[#94a3b8]">
                  <Clock className="h-3 w-3" />
                  {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

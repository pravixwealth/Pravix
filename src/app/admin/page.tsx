import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { listPosts } from "@/lib/admin/repositories/blog.repository";
import { listMedia } from "@/lib/admin/repositories/media.repository";
import { listAuditLogs } from "@/lib/admin/repositories/audit.repository";
import { BarChart3, FileText, FolderOpen, Users, Activity, Clock } from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Parallel fetch all dashboard data
  const [postsResult, mediaResult, auditResult, usersResult, recentUsersResult] = await Promise.all([
    listPosts(supabase, { perPage: 100 }),
    listMedia(supabase, { perPage: 1 }),
    listAuditLogs(supabase, { perPage: 8 }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).neq("status", "disabled"),
    supabase.from("profiles").select("full_name, email, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const totalPosts = postsResult.success ? postsResult.data.total : 0;
  const publishedPosts = postsResult.success
    ? postsResult.data.posts.filter((p) => p.status === "published").length
    : 0;
  const draftPosts = postsResult.success
    ? postsResult.data.posts.filter((p) => p.status === "draft").length
    : 0;
  const totalMedia = mediaResult.success ? mediaResult.data.total : 0;
  const totalUsers = usersResult.count ?? 0;
  const recentActivity = auditResult.success ? auditResult.data.entries : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.email.split("@")[0]}. Here's your platform overview.`}
      />

      {/* Stats Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={totalUsers} />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Blog Posts" value={totalPosts} hint={`${publishedPosts} published, ${draftPosts} drafts`} />
        <StatCard icon={<FolderOpen className="h-5 w-5" />} label="Media Files" value={totalMedia} />
        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Platform Status" value="Healthy" isText />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-[#0f172a]">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="mt-3 divide-y divide-[#f1f5f9] rounded-xl border border-[#e2e8f0] bg-white">
            {recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9]">
                  <Activity className="h-3.5 w-3.5 text-[#64748b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#0f172a]">
                    <span className="font-medium capitalize">{entry.action}</span>
                    {" "}
                    <span className="text-[#64748b]">{entry.entityType.replace("_", " ")}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                  <Clock className="h-3 w-3" />
                  {new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-6 py-10 text-center">
            <p className="text-sm text-[#64748b]">No activity yet. Start by creating a blog post or updating settings.</p>
          </div>
        )}
      </div>

      {/* Recent Signups */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-[#0f172a]">Recent Signups</h2>
        {recentUsersResult.data && recentUsersResult.data.length > 0 ? (
          <div className="mt-3 divide-y divide-[#f1f5f9] rounded-xl border border-[#e2e8f0] bg-white">
            {recentUsersResult.data.map((u: { full_name: string; email: string; created_at: string }, i: number) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">{u.full_name || "—"}</p>
                  <p className="text-xs text-[#94a3b8]">{u.email}</p>
                </div>
                <span className="text-xs text-[#94a3b8]">{new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#94a3b8]">No signups yet.</p>
        )}
      </div>
    </div>
  );
}

// ── Inline StatCard (reuses admin design system, lightweight) ─────────────────

function StatCard({
  icon,
  label,
  value,
  hint,
  isText,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#64748b]">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-[#64748b]">{label}</p>
          <p className={`mt-0.5 text-xl font-semibold ${isText ? "text-emerald-600 text-base" : "text-[#0f172a]"}`}>
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </p>
          {hint && <p className="mt-0.5 text-[11px] text-[#94a3b8]">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

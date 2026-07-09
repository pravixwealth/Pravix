import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Users as UsersIcon } from "lucide-react";

type ProfileRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
  onboarding_completed_at: string | null;
};

export default async function UsersPage() {
  await requireRole("admin");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error, count } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, email, status, created_at, onboarding_completed_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(50);

  const users = (data ?? []) as ProfileRow[];
  const total = count ?? 0;

  // Fetch roles for all users
  const userIds = users.map((u) => u.user_id).filter(Boolean) as string[];
  let roleMap = new Map<string, string[]>();

  if (userIds.length > 0) {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("user_id, roles(name)")
      .in("user_id", userIds);

    if (roleData) {
      for (const row of roleData) {
        const rolesRelation = row.roles as Array<{ name: string }> | { name: string } | null;
        const roleName = Array.isArray(rolesRelation) ? rolesRelation[0]?.name : rolesRelation?.name;
        if (roleName && row.user_id) {
          const existing = roleMap.get(row.user_id as string) ?? [];
          existing.push(roleName);
          roleMap.set(row.user_id as string, existing);
        }
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description={`${total} registered user${total !== 1 ? "s" : ""}`}
      />

      <div className="mt-8">
        {users.length === 0 ? (
          <EmptyState
            icon={<UsersIcon className="h-6 w-6" />}
            title="No users yet"
            description="Users will appear here after they register and complete onboarding."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748b]">Name</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748b]">Email</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748b]">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748b]">Roles</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748b]">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {users.map((user) => {
                  const roles = user.user_id ? (roleMap.get(user.user_id) ?? []) : [];
                  const statusTone = user.status === "active" ? "success" : user.status === "suspended" ? "warning" : "danger";

                  return (
                    <tr key={user.id} className="hover:bg-[#f8fafc]">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#0f172a]">{user.full_name || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[#64748b]">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge label={user.status ?? "active"} tone={statusTone as "success" | "warning" | "danger"} />
                      </td>
                      <td className="px-5 py-3.5">
                        {roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {roles.map((role) => (
                              <span key={role} className="rounded bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-medium text-[#475569]">
                                {role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#94a3b8]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[#94a3b8]">
                        {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

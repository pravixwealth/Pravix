import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Download, Users as UsersIcon } from "lucide-react";

type ProfileRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone_e164: string | null;
  status: string;
  risk_appetite: string;
  monthly_income_inr: number;
  monthly_investable_surplus_inr: number;
  target_amount_inr: number;
  target_horizon_years: number;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
  city: string | null;
  occupation_title: string | null;
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
    .select("id, user_id, full_name, email, phone_e164, status, risk_appetite, monthly_income_inr, monthly_investable_surplus_inr, target_amount_inr, target_horizon_years, onboarding_completed_at, created_at, updated_at, city, occupation_title", { count: "exact" })
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
        actions={
          <Link
            href="/api/admin/users/export"
            className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#f8fafc]"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Link>
        }
      />

      <div className="mt-8">
        {users.length === 0 ? (
          <EmptyState
            icon={<UsersIcon className="h-6 w-6" />}
            title="No users yet"
            description="Users will appear here after they register and complete onboarding."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                  <th className="px-4 py-3 text-xs font-semibold text-[#64748b]">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#64748b]">Contact</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#64748b]">Financial</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#64748b]">Goal</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#64748b]">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#64748b]">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {users.map((user) => {
                  const roles = user.user_id ? (roleMap.get(user.user_id) ?? []) : [];
                  const statusTone = user.status === "active" ? "success" : user.status === "suspended" ? "warning" : "danger";
                  const hasOnboarded = Boolean(user.onboarding_completed_at);

                  return (
                    <tr key={user.id} className="hover:bg-[#f8fafc]">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-[#0f172a]">{user.full_name || "—"}</p>
                        <p className="text-xs text-[#94a3b8]">{user.occupation_title || ""}{user.city ? ` · ${user.city}` : ""}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-[#0f172a]">{user.email}</p>
                        <p className="text-xs text-[#94a3b8]">{user.phone_e164 || "No phone"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-[#0f172a]">
                          Income: ₹{user.monthly_income_inr > 0 ? (user.monthly_income_inr / 1000).toFixed(0) + "k" : "—"}/mo
                        </p>
                        <p className="text-xs text-[#94a3b8]">
                          SIP: ₹{user.monthly_investable_surplus_inr > 0 ? (user.monthly_investable_surplus_inr / 1000).toFixed(0) + "k" : "—"}/mo
                          {" · "}
                          <span className="capitalize">{user.risk_appetite}</span>
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-[#0f172a]">
                          ₹{user.target_amount_inr > 0 ? (user.target_amount_inr >= 10000000 ? (user.target_amount_inr / 10000000).toFixed(1) + "Cr" : (user.target_amount_inr / 100000).toFixed(1) + "L") : "—"}
                        </p>
                        <p className="text-xs text-[#94a3b8]">{user.target_horizon_years}yr horizon</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge label={user.status ?? "active"} tone={statusTone as "success" | "warning" | "danger"} />
                        {hasOnboarded && (
                          <span className="mt-1 block text-[10px] text-emerald-600">Onboarded</span>
                        )}
                        {roles.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {roles.map((role) => (
                              <span key={role} className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[10px] font-medium text-[#475569]">{role}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#94a3b8]">
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

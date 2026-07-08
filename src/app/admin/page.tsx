import { requireAdmin } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.email.split("@")[0]}`}
      />
      <div className="mt-8 rounded-xl border border-finance-border bg-white p-8 text-center">
        <p className="text-sm text-finance-muted">
          Admin dashboard coming in Phase 5. Build Media, Settings, and Blog first.
        </p>
      </div>
    </div>
  );
}

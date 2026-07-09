import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin/server-auth";
import AdminLayoutShell from "@/components/admin/AdminLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Pravix",
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The login page at /admin/login has its own layout that renders children directly.
  // This layout only applies to authenticated admin pages.
  // Next.js route groups handle this: /admin/login/layout.tsx overrides this for login.

  const user = await getAdminUser();

  if (!user) {
    redirect("/admin-login");
  }

  return <AdminLayoutShell user={user}>{children}</AdminLayoutShell>;
}

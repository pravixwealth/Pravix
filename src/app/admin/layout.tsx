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
  const user = await getAdminUser();

  console.log("[ADMIN LAYOUT] getAdminUser result:", user ? `${user.email} (${user.roles.join(",")})` : "null — redirecting to login");

  if (!user) {
    redirect("/admin-login");
  }

  return (
    <>
      <style>{`#public-chrome { display: none !important; } body { min-height: auto !important; }`}</style>
      <AdminLayoutShell user={user}>{children}</AdminLayoutShell>
    </>
  );
}

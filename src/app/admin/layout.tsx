import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin/server-auth";
import AdminLayoutShell from "@/components/admin/AdminLayout";

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

  if (!user) {
    redirect("/login");
  }

  return <AdminLayoutShell user={user}>{children}</AdminLayoutShell>;
}

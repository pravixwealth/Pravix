import { redirect } from "next/navigation";
import { headers } from "next/headers";
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
  // Skip auth check for the login page itself
  const headersList = await headers();
  const pathname = headersList.get("x-next-pathname") ?? "";

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const user = await getAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminLayoutShell user={user}>{children}</AdminLayoutShell>;
}

import Link from "next/link";
import { requireRole } from "@/lib/admin/server-auth";

const SETTINGS_TABS = [
  { label: "General", href: "/admin/settings/general" },
  { label: "Branding", href: "/admin/settings/branding" },
  { label: "Contact", href: "/admin/settings/contact" },
  { label: "SEO", href: "/admin/settings/seo" },
  { label: "Analytics", href: "/admin/settings/analytics" },
  { label: "Social", href: "/admin/settings/social" },
  { label: "Legal", href: "/admin/settings/legal" },
];

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#0f172a]">Settings</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Manage your website configuration and business information.
        </p>
      </div>

      <nav className="mb-8 flex flex-wrap gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-1">
        {SETTINGS_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-[#64748b] transition-colors hover:bg-white hover:text-[#0f172a] hover:shadow-sm"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}

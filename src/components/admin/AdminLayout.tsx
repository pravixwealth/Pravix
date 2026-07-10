"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileText,
  FolderOpen,
  Globe,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import type { AdminUser, RoleName } from "@/lib/admin/types";
import { hasRole } from "@/lib/admin/types";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  requiredRole: RoleName;
  children?: { label: string; href: string }[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, requiredRole: "viewer" },
      { label: "Users", href: "/admin/users", icon: Users, requiredRole: "admin" },
      { label: "Admin Guide", href: "/admin/guide", icon: BookOpen, requiredRole: "viewer" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", href: "/admin/blog", icon: FileText, requiredRole: "editor" },
    ],
  },
  {
    label: "",
    items: [
      { label: "Media", href: "/admin/media", icon: FolderOpen, requiredRole: "editor" },
    ],
  },
  {
    label: "Website",
    items: [
      { label: "Navigation", href: "/admin/navigation", icon: Globe, requiredRole: "admin" },
      { label: "Site Content", href: "/admin/content", icon: FileText, requiredRole: "admin" },
      { label: "Settings", href: "/admin/settings", icon: Settings, requiredRole: "admin" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Audit Logs", href: "/admin/audit", icon: Shield, requiredRole: "admin" },
    ],
  },
];

type AdminLayoutProps = {
  user: AdminUser;
  children: React.ReactNode;
};

export default function AdminLayoutShell({ user, children }: AdminLayoutProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafb]">
      {/* Sidebar */}
      <aside
        className="w-64 shrink-0 border-r border-[#e8edf3] bg-white"
        suppressHydrationWarning
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-[#e8edf3] px-5">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2b5cff] text-white">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-[#0f172a]">Pravix Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {NAV_GROUPS.map((group, groupIndex) => {
              const visibleItems = group.items.filter((item) =>
                hasRole(user.roles, item.requiredRole)
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={groupIndex} className={groupIndex > 0 ? "mt-5" : ""}>
                  {group.label && (
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
                      {group.label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            active
                              ? "bg-[#2b5cff]/8 text-[#2b5cff]"
                              : "text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${active ? "text-[#2b5cff]" : "text-[#94a3b8]"}`} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-[#e8edf3] px-4 py-3">
            <p className="truncate text-xs font-medium text-[#475569]">{user.email}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#94a3b8]">
              {user.roles[0]}
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-end border-b border-[#e8edf3] bg-white px-4 lg:px-8">
          <Link
            href="/"
            className="text-xs font-medium text-[#64748b] hover:text-[#0f172a]"
          >
            ← Back to site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

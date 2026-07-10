import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { listMenus, getMenuItemsAdmin } from "@/lib/admin/repositories/navigation.repository";
import type { NavMenu, NavItem } from "@/lib/admin/repositories/navigation.repository";
import { AddNavItemButton, NavItemActionButtons } from "./NavItemActions";

export default async function NavigationManagerPage() {
  await requireRole("admin");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const menusResult = await listMenus(supabase);
  const menus = menusResult.success ? menusResult.data : [];

  // Load items for each menu
  const menuData: Array<{ menu: NavMenu; items: NavItem[] }> = [];
  for (const menu of menus) {
    const itemsResult = await getMenuItemsAdmin(supabase, menu.id);
    menuData.push({
      menu,
      items: itemsResult.success ? itemsResult.data : [],
    });
  }

  return (
    <div>
      <PageHeader
        title="Navigation"
        description="Manage website menus — header, mobile, and footer navigation."
      />

      <div className="mt-8 space-y-6">
        {menuData.map(({ menu, items }) => (
          <section
            key={menu.id}
            className="rounded-xl border border-[#e2e8f0] bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#0f172a]">{menu.name}</h2>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  Location: <code className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[11px]">{menu.location}</code>
                </p>
              </div>
              <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium text-[#64748b]">
                {items.length} items
              </span>
            </div>

            {items.length > 0 ? (
              <div className="mt-4 divide-y divide-[#f1f5f9] rounded-lg border border-[#e2e8f0]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-[#f1f5f9] text-[10px] font-bold text-[#94a3b8]">
                        {item.sortOrder}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#0f172a]">{item.label}</p>
                        <p className="text-xs text-[#94a3b8]">{item.href}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                          {item.badge}
                        </span>
                      )}
                      {!item.visible && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                          Hidden
                        </span>
                      )}
                      <span className="rounded bg-[#f8fafc] px-1.5 py-0.5 text-[10px] text-[#94a3b8]">
                        {item.variant}
                      </span>
                      <NavItemActionButtons item={item} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#94a3b8]">No items in this menu yet.</p>
            )}

            <AddNavItemButton menuId={menu.id} />
          </section>
        ))}
      </div>
    </div>
  );
}

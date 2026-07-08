import { createClient } from "@supabase/supabase-js";
import SiteHeader from "./SiteHeader";
import { getMenuItems } from "@/lib/admin/repositories/navigation.repository";
import type { SiteHeaderNavItem } from "./SiteHeader";

/**
 * Server wrapper for SiteHeader.
 * Fetches navigation items from CMS and passes them as props.
 * Falls back gracefully if DB is unavailable.
 *
 * Use this in Server Components instead of <SiteHeader /> directly.
 * Client components continue importing SiteHeader (uses hardcoded fallback).
 */
export default async function SiteHeaderServer() {
  let navItems: SiteHeaderNavItem[] | undefined;

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && key) {
      const supabase = createClient(url, key, {
        auth: { persistSession: false },
      });

      const result = await getMenuItems(supabase, "header");

      if (result.success && result.data.length > 0) {
        navItems = result.data.map((item) => ({
          label: item.label,
          href: item.href,
        }));
      }
    }
  } catch {
    // DB unavailable — SiteHeader will use its internal fallback
  }

  return <SiteHeader navItems={navItems} />;
}

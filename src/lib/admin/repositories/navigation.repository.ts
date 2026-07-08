import type { SupabaseClient } from "@supabase/supabase-js";
import type { RepoResult } from "../types";

// ── Domain Types ─────────────────────────────────────────────────────────────

export type NavMenu = {
  id: string;
  name: string;
  location: string;
  createdAt: string;
};

export type NavItemVariant = "link" | "button" | "cta" | "heading";

export type NavItem = {
  id: string;
  menuId: string;
  parentId: string | null;
  label: string;
  href: string;
  icon: string | null;
  target: string;
  sortOrder: number;
  visible: boolean;
  requiresAuth: boolean;
  requiredRole: string | null;
  variant: NavItemVariant;
  badge: string | null;
  mediaId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  children?: NavItem[];
};

// ── Row Mapper ───────────────────────────────────────────────────────────────

function rowToNavItem(row: Record<string, unknown>): NavItem {
  return {
    id: row.id as string,
    menuId: row.menu_id as string,
    parentId: (row.parent_id as string) ?? null,
    label: row.label as string,
    href: row.href as string,
    icon: (row.icon as string) ?? null,
    target: (row.target as string) ?? "_self",
    sortOrder: (row.sort_order as number) ?? 0,
    visible: (row.visible as boolean) ?? true,
    requiresAuth: (row.requires_auth as boolean) ?? false,
    requiredRole: (row.required_role as string) ?? null,
    variant: (row.variant as NavItemVariant) ?? "link",
    badge: (row.badge as string) ?? null,
    mediaId: (row.media_id as string) ?? null,
    startsAt: (row.starts_at as string) ?? null,
    endsAt: (row.ends_at as string) ?? null,
    createdAt: row.created_at as string,
  };
}

/**
 * Build a nested tree from flat items.
 */
function buildTree(items: NavItem[]): NavItem[] {
  const map = new Map<string, NavItem>();
  const roots: NavItem[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ── Repository Functions ─────────────────────────────────────────────────────

export async function listMenus(
  supabase: SupabaseClient
): Promise<RepoResult<NavMenu[]>> {
  const { data, error } = await supabase
    .from("navigation_menus")
    .select()
    .order("location");

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      location: row.location as string,
      createdAt: row.created_at as string,
    })),
  };
}

/**
 * Get all visible items for a menu location, nested as a tree.
 * Filters out items outside their scheduled window.
 */
export async function getMenuItems(
  supabase: SupabaseClient,
  location: string
): Promise<RepoResult<NavItem[]>> {
  const { data: menuData, error: menuError } = await supabase
    .from("navigation_menus")
    .select("id")
    .eq("location", location)
    .single();

  if (menuError || !menuData) {
    return { success: true, data: [] };
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("navigation_items")
    .select()
    .eq("menu_id", menuData.id)
    .eq("visible", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("sort_order", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  const items = (data ?? []).map(rowToNavItem);
  return { success: true, data: buildTree(items) };
}

/**
 * Get ALL items for a menu (including hidden) — for admin editing.
 */
export async function getMenuItemsAdmin(
  supabase: SupabaseClient,
  menuId: string
): Promise<RepoResult<NavItem[]>> {
  const { data, error } = await supabase
    .from("navigation_items")
    .select()
    .eq("menu_id", menuId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data ?? []).map(rowToNavItem) };
}

export type CreateNavItemParams = {
  menuId: string;
  parentId?: string | null;
  label: string;
  href: string;
  icon?: string | null;
  target?: string;
  sortOrder?: number;
  visible?: boolean;
  requiresAuth?: boolean;
  requiredRole?: string | null;
  variant?: NavItemVariant;
  badge?: string | null;
  mediaId?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

export async function createNavItem(
  supabase: SupabaseClient,
  params: CreateNavItemParams
): Promise<RepoResult<NavItem>> {
  const { data, error } = await supabase
    .from("navigation_items")
    .insert({
      menu_id: params.menuId,
      parent_id: params.parentId ?? null,
      label: params.label,
      href: params.href,
      icon: params.icon ?? null,
      target: params.target ?? "_self",
      sort_order: params.sortOrder ?? 0,
      visible: params.visible ?? true,
      requires_auth: params.requiresAuth ?? false,
      required_role: params.requiredRole ?? null,
      variant: params.variant ?? "link",
      badge: params.badge ?? null,
      media_id: params.mediaId ?? null,
      starts_at: params.startsAt ?? null,
      ends_at: params.endsAt ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to create navigation item" };
  }

  return { success: true, data: rowToNavItem(data) };
}

export async function updateNavItem(
  supabase: SupabaseClient,
  id: string,
  params: Partial<CreateNavItemParams>
): Promise<RepoResult<NavItem>> {
  const updates: Record<string, unknown> = {};

  if (params.label !== undefined) updates.label = params.label;
  if (params.href !== undefined) updates.href = params.href;
  if (params.icon !== undefined) updates.icon = params.icon;
  if (params.target !== undefined) updates.target = params.target;
  if (params.sortOrder !== undefined) updates.sort_order = params.sortOrder;
  if (params.visible !== undefined) updates.visible = params.visible;
  if (params.requiresAuth !== undefined) updates.requires_auth = params.requiresAuth;
  if (params.requiredRole !== undefined) updates.required_role = params.requiredRole;
  if (params.variant !== undefined) updates.variant = params.variant;
  if (params.badge !== undefined) updates.badge = params.badge;
  if (params.mediaId !== undefined) updates.media_id = params.mediaId;
  if (params.parentId !== undefined) updates.parent_id = params.parentId;
  if (params.startsAt !== undefined) updates.starts_at = params.startsAt;
  if (params.endsAt !== undefined) updates.ends_at = params.endsAt;

  const { data, error } = await supabase
    .from("navigation_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to update" };
  }

  return { success: true, data: rowToNavItem(data) };
}

export async function deleteNavItem(
  supabase: SupabaseClient,
  id: string
): Promise<RepoResult<null>> {
  const { error } = await supabase
    .from("navigation_items")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: null };
}

/**
 * Reorder items within a menu. Accepts array of {id, sortOrder}.
 */
export async function reorderNavItems(
  supabase: SupabaseClient,
  items: Array<{ id: string; sortOrder: number }>
): Promise<RepoResult<null>> {
  for (const item of items) {
    const { error } = await supabase
      .from("navigation_items")
      .update({ sort_order: item.sortOrder })
      .eq("id", item.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, data: null };
}

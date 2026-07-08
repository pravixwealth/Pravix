import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { AdminUser, RoleName } from "./types";

/**
 * Server-side admin auth helper.
 * Resolves the current user and their roles from cookies/session.
 * Used in Server Components and Server Actions.
 */

function getServiceCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin credentials");
  }

  return { supabaseUrl, serviceRoleKey };
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const { supabaseUrl, serviceRoleKey } = getServiceCredentials();

  const supabaseUrl2 = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!anonKey) return null;

  // Get user session from cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Find Supabase auth token from cookies
  const accessTokenCookie = allCookies.find(
    (c) => c.name.includes("auth-token") || c.name.includes("sb-") && c.name.includes("auth")
  );

  if (!accessTokenCookie) {
    return null;
  }

  // Use service role to verify user and get roles
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Try to get user from the token
  const userClient = createClient(supabaseUrl2, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${accessTokenCookie.value}` },
    },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();

  if (userError || !userData?.user) {
    return null;
  }

  const userId = userData.user.id;

  // Fetch roles using service role (bypasses RLS)
  const { data: roleRows, error: rolesError } = await adminClient
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId);

  if (rolesError || !roleRows || roleRows.length === 0) {
    return null;
  }

  const roles: RoleName[] = roleRows
    .map((row: Record<string, unknown>) => {
      const relation = row.roles as { name: string } | null;
      return relation?.name as RoleName | undefined;
    })
    .filter((name): name is RoleName => Boolean(name));

  if (roles.length === 0) {
    return null;
  }

  return {
    id: userId,
    email: userData.user.email ?? "",
    roles,
  };
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireRole(role: RoleName): Promise<AdminUser> {
  const user = await requireAdmin();
  const { ROLE_HIERARCHY } = await import("./types");

  const userMaxLevel = Math.max(...user.roles.map((r) => ROLE_HIERARCHY[r]));
  const requiredLevel = ROLE_HIERARCHY[role];

  if (userMaxLevel < requiredLevel) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

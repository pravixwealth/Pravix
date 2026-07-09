import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { AdminUser, RoleName } from "./types";

function getCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error("Missing Supabase credentials");
  }

  return { supabaseUrl, anonKey, serviceRoleKey };
}

/**
 * Extracts the access token from Supabase cookies.
 * Supabase stores auth in cookies named like:
 *   sb-<ref>-auth-token  (older SDK)
 *   sb-<ref>-auth-token.0, sb-<ref>-auth-token.1 (chunked, newer SDK)
 */
async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();

  // Try to find the auth token cookie
  // Supabase SDK stores JSON: {"access_token":"...","refresh_token":"..."}
  // It may be split into chunks: sb-xxx-auth-token.0, .1 etc.

  const prefix = "sb-";
  const suffix = "auth-token";

  // Find all auth token cookies and sort by name to handle chunks
  const authCookies = all
    .filter((c) => c.name.startsWith(prefix) && c.name.includes(suffix))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (authCookies.length === 0) return null;

  // Combine chunked cookies
  const combined = authCookies.map((c) => c.value).join("");

  try {
    let decoded = combined;
    // Handle URL-encoded values (Next.js may encode cookie values)
    if (decoded.includes("%7B") || decoded.includes("%22")) {
      decoded = decodeURIComponent(decoded);
    }
    // Handle double-encoding
    if (decoded.includes("%7B") || decoded.includes("%22")) {
      decoded = decodeURIComponent(decoded);
    }
    const parsed = JSON.parse(decoded);
    return parsed?.access_token ?? null;
  } catch {
    // Try as plain base64 or direct token
    return combined.length > 20 ? combined : null;
  }
}

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const { supabaseUrl, anonKey, serviceRoleKey } = getCredentials();

    const accessToken = await getAccessTokenFromCookies();
    console.log("[getAdminUser] accessToken found:", accessToken ? `${accessToken.slice(0, 20)}...` : "null");

    if (!accessToken) {
      return null;
    }

    // Verify the access token
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    console.log("[getAdminUser] getUser result:", userData?.user?.email ?? "null", "error:", userError?.message ?? "none");

    if (userError || !userData?.user) {
      return null;
    }

    const userId = userData.user.id;

    // Fetch roles via service role
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: roleRows, error: rolesError } = await adminClient
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", userId);

    console.log("[getAdminUser] roleRows:", JSON.stringify(roleRows), "error:", rolesError?.message ?? "none");

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
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireRole(role: RoleName): Promise<AdminUser> {
  const user = await requireAdmin();
  const { ROLE_HIERARCHY } = await import("./types");
  const userMaxLevel = Math.max(...user.roles.map((r) => ROLE_HIERARCHY[r]));
  const requiredLevel = ROLE_HIERARCHY[role];
  if (userMaxLevel < requiredLevel) throw new Error("FORBIDDEN");
  return user;
}

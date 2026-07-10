import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { resolveAdminUser } from "@/lib/admin/repositories/auth.repository";
import { updateSettingsBatch } from "@/lib/admin/repositories/settings.repository";
import { createAuditLog } from "@/lib/admin/repositories/audit.repository";
import { config } from "@/lib/admin/configuration.service";
import { hasRole } from "@/lib/admin/types";
import type { RoleName } from "@/lib/admin/types";

export const runtime = "nodejs";

type PatchBody = {
  table?: "business" | "system" | "content";
  updates?: Array<{ key: string; value: string | null }>;
};

async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  const authCookies = all
    .filter((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (authCookies.length === 0) return null;
  const combined = authCookies.map((c) => c.value).join("");
  try {
    let decoded = combined;
    if (decoded.includes("%7B") || decoded.includes("%22")) decoded = decodeURIComponent(decoded);
    if (decoded.includes("%7B") || decoded.includes("%22")) decoded = decodeURIComponent(decoded);
    return JSON.parse(decoded)?.access_token ?? null;
  } catch { return combined.length > 20 ? combined : null; }
}

export async function PATCH(request: Request) {
  try {
    const accessToken = await getAccessTokenFromCookies();
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = userData.user;
    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const adminResult = await resolveAdminUser(adminClient, user.id);
    if (!adminResult.success) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as PatchBody;
    let tableName: string;
    if (body.table === "system") tableName = "system_settings";
    else if (body.table === "content") tableName = "site_content";
    else tableName = "business_settings";

    // System settings require super_admin
    const requiredRole: RoleName = body.table === "system" ? "super_admin" : "admin";
    if (!hasRole(adminResult.data.roles, requiredRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    if (!Array.isArray(body.updates) || body.updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const result = await updateSettingsBatch(
      adminClient,
      tableName as "business_settings" | "system_settings" | "site_content",
      body.updates,
      user.id
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await createAuditLog(adminClient, {
      userId: user.id,
      action: "update",
      entityType: "system_setting",
      newValue: { table: tableName, keys: body.updates.map((u) => u.key) },
    });

    config.invalidateAll();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

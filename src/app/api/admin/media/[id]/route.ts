import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { resolveAdminUser } from "@/lib/admin/repositories/auth.repository";
import { deleteMedia, restoreMedia } from "@/lib/admin/repositories/media.repository";
import { createAuditLog } from "@/lib/admin/repositories/audit.repository";
import { hasRole } from "@/lib/admin/types";

export const runtime = "nodejs";

async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  const authCookies = all.filter((c) => c.name.startsWith("sb-") && c.name.includes("auth-token")).sort((a, b) => a.name.localeCompare(b.name));
  if (authCookies.length === 0) return null;
  const combined = authCookies.map((c) => c.value).join("");
  try {
    let decoded = combined;
    if (decoded.includes("%7B") || decoded.includes("%22")) decoded = decodeURIComponent(decoded);
    if (decoded.includes("%7B") || decoded.includes("%22")) decoded = decodeURIComponent(decoded);
    return JSON.parse(decoded)?.access_token ?? null;
  } catch { return combined.length > 20 ? combined : null; }
}

async function verifyAdmin() {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const userClient = createClient(supabaseUrl, anonKey!, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${accessToken}` } } });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) return null;
  const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const result = await resolveAdminUser(adminClient, data.user.id);
  if (!result.success || !hasRole(result.data.roles, "editor")) return null;
  return { userId: data.user.id, adminClient };
}

// DELETE /api/admin/media/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await deleteMedia(auth.adminClient, id);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  await createAuditLog(auth.adminClient, { userId: auth.userId, action: "delete", entityType: "media", entityId: id });
  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/media/[id] — restore
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  if (body.restore) {
    const result = await restoreMedia(auth.adminClient, id);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true, media: result.data });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

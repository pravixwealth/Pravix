import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { resolveAdminUser } from "@/lib/admin/repositories/auth.repository";
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

export async function POST(request: Request) {
  try {
    const accessToken = await getAccessTokenFromCookies();
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const userClient = createClient(supabaseUrl, anonKey!, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${accessToken}` } } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const adminResult = await resolveAdminUser(adminClient, userData.user.id);
    if (!adminResult.success || !hasRole(adminResult.data.roles, "editor")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const slug = body.slug || body.name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

    const { data, error } = await adminClient
      .from("blog_categories")
      .insert({ name: body.name.trim(), slug, description: body.description ?? null, sort_order: 99 })
      .select()
      .single();

    if (error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        return NextResponse.json({ error: "Category already exists" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, category: { id: data.id, name: data.name, slug: data.slug, description: data.description, sortOrder: data.sort_order, createdAt: data.created_at } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

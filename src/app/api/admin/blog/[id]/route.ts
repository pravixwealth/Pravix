import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { resolveAdminUser } from "@/lib/admin/repositories/auth.repository";
import { deletePost, getPostById, updatePost, publishPost } from "@/lib/admin/repositories/blog.repository";
import { createAuditLog } from "@/lib/admin/repositories/audit.repository";
import { hasRole } from "@/lib/admin/types";

export const runtime = "nodejs";

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

async function verifyAdmin() {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const userClient = createClient(supabaseUrl, anonKey!, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data: userData, error } = await userClient.auth.getUser();
  if (error || !userData?.user) return null;

  const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const adminResult = await resolveAdminUser(adminClient, userData.user.id);
  if (!adminResult.success || !hasRole(adminResult.data.roles, "editor")) return null;

  return { userId: userData.user.id, adminClient };
}

// DELETE /api/admin/blog/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { adminClient, userId } = auth;

  // Get post title for audit
  const postResult = await getPostById(adminClient, id);
  const postTitle = postResult.success ? postResult.data.title : "Unknown";

  const result = await deletePost(adminClient, id);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await createAuditLog(adminClient, {
    userId,
    action: "delete",
    entityType: "blog_post",
    entityId: id,
    oldValue: { title: postTitle },
  });

  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/blog/[id] — Update post
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { adminClient, userId } = auth;
  const body = await request.json();

  // If publishing
  if (body.publish && body.contentHtml) {
    const result = await publishPost(adminClient, id, body.contentHtml, userId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await createAuditLog(adminClient, {
      userId,
      action: "publish",
      entityType: "blog_post",
      entityId: id,
      newValue: { title: result.data.title },
    });

    return NextResponse.json({ ok: true, post: result.data });
  }

  // Regular update
  const updateParams: Record<string, unknown> = {};
  if (body.title !== undefined) updateParams.title = body.title;
  if (body.slug !== undefined) updateParams.slug = body.slug;
  if (body.excerpt !== undefined) updateParams.excerpt = body.excerpt;
  if (body.contentJson !== undefined) updateParams.contentJson = body.contentJson;
  if (body.categoryId !== undefined) updateParams.categoryId = body.categoryId;
  if (body.seoTitle !== undefined) updateParams.seoTitle = body.seoTitle;
  if (body.seoDescription !== undefined) updateParams.seoDescription = body.seoDescription;
  if (body.featuredImageId !== undefined) updateParams.featuredImageId = body.featuredImageId;
  if (body.ogImageId !== undefined) updateParams.ogImageId = body.ogImageId;
  if (body.status !== undefined) updateParams.status = body.status;

  const result = await updatePost(adminClient, id, updateParams);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await createAuditLog(adminClient, {
    userId,
    action: "update",
    entityType: "blog_post",
    entityId: id,
    newValue: { title: result.data.title },
  });

  return NextResponse.json({ ok: true, post: result.data });
}

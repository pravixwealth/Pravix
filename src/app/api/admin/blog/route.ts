import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBearerToken, resolveAuthedUser } from "@/lib/agent/server";
import { resolveAdminUser } from "@/lib/admin/repositories/auth.repository";
import { createPost, publishPost } from "@/lib/admin/repositories/blog.repository";
import { createAuditLog } from "@/lib/admin/repositories/audit.repository";
import { hasRole } from "@/lib/admin/types";

export const runtime = "nodejs";

type CreatePostBody = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  authorId?: string;
  categoryId?: string | null;
  contentJson?: Record<string, unknown> | null;
  contentHtml?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  robots?: string;
  featuredImageId?: string | null;
  ogImageId?: string | null;
  tags?: string[];
  publish?: boolean;
  scheduledAt?: string | null;
};

export async function POST(request: Request) {
  try {
    const accessToken = getBearerToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!anonKey) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const user = await resolveAuthedUser(userClient);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const adminResult = await resolveAdminUser(adminClient, user.id);
    if (!adminResult.success || !hasRole(adminResult.data.roles, "editor")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as CreatePostBody;

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!body.slug?.trim()) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }
    if (!body.authorId) {
      return NextResponse.json({ error: "Author is required" }, { status: 400 });
    }

    // Create the post
    const createResult = await createPost(adminClient, {
      title: body.title.trim(),
      slug: body.slug.trim(),
      excerpt: body.excerpt ?? null,
      authorId: body.authorId,
      categoryId: body.categoryId ?? null,
      contentJson: body.contentJson ?? null,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
      status: body.scheduledAt ? "scheduled" : "draft",
      featuredImageId: body.featuredImageId ?? null,
      ogImageId: body.ogImageId ?? null,
    });

    if (!createResult.success) {
      return NextResponse.json({ error: createResult.error }, { status: 400 });
    }

    const post = createResult.data;

    // If publishing, freeze content into published fields
    if (body.publish && body.contentHtml) {
      const publishResult = await publishPost(adminClient, post.id, body.contentHtml, user.id);
      if (!publishResult.success) {
        return NextResponse.json({ error: publishResult.error }, { status: 400 });
      }

      await createAuditLog(adminClient, {
        userId: user.id,
        action: "publish",
        entityType: "blog_post",
        entityId: post.id,
        newValue: { title: post.title, slug: post.slug },
      });

      return NextResponse.json({ ok: true, post: publishResult.data }, { status: 201 });
    }

    // Audit draft creation
    await createAuditLog(adminClient, {
      userId: user.id,
      action: "create",
      entityType: "blog_post",
      entityId: post.id,
      newValue: { title: post.title, slug: post.slug, status: "draft" },
    });

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

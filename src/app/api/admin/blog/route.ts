import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { resolveAdminUser } from "@/lib/admin/repositories/auth.repository";
import { createPost, publishPost } from "@/lib/admin/repositories/blog.repository";
import { trackUsage } from "@/lib/admin/repositories/media.repository";
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
    const accessToken = await getAccessTokenFromCookies();
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

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = userData.user;
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
      focusKeyword: body.focusKeyword ?? null,
      canonicalUrl: body.canonicalUrl ?? null,
      robots: body.robots ?? "index,follow",
      status: body.scheduledAt ? "scheduled" : "draft",
      scheduledAt: body.scheduledAt ?? null,
      featuredImageId: body.featuredImageId ?? null,
      ogImageId: body.ogImageId ?? null,
    });

    if (!createResult.success) {
      // Friendly slug duplicate error
      if (createResult.error.includes("duplicate") || createResult.error.includes("unique")) {
        return NextResponse.json({ error: "This URL slug already exists. Choose a different one." }, { status: 400 });
      }
      return NextResponse.json({ error: createResult.error }, { status: 400 });
    }

    const post = createResult.data;

    // Save tags
    if (Array.isArray(body.tags) && body.tags.length > 0) {
      for (const tagName of body.tags) {
        // Find or create tag
        let tagId: string | null = null;
        const { data: existingTag } = await adminClient
          .from("blog_tags")
          .select("id")
          .eq("name", tagName)
          .single();

        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const slug = tagName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
          const { data: newTag } = await adminClient
            .from("blog_tags")
            .insert({ name: tagName, slug })
            .select("id")
            .single();
          tagId = newTag?.id ?? null;
        }

        if (tagId) {
          await adminClient
            .from("blog_post_tags")
            .upsert({ post_id: post.id, tag_id: tagId }, { onConflict: "post_id,tag_id" });
        }
      }
    }

    // Track featured image usage
    if (body.featuredImageId) {
      await trackUsage(adminClient, body.featuredImageId, "blog_post", post.id, "featured_image");
    }
    if (body.ogImageId && body.ogImageId !== body.featuredImageId) {
      await trackUsage(adminClient, body.ogImageId, "blog_post", post.id, "og_image");
    }

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

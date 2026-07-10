import { createClient } from "@supabase/supabase-js";
import type { RepoResult } from "../types";

/**
 * Public blog repository — reads published blog posts for the public website.
 * Uses anon/publishable key (respects RLS: only published + public posts visible).
 * No admin auth required.
 */

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedContentHtml: string | null;
  contentJson: Record<string, unknown> | null;
  featuredImageUrl: string | null;
  authorName: string;
  authorRole: string | null;
  authorAvatarUrl: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  robots: string;
  tags: string[];
};

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getPublishedPosts(): Promise<RepoResult<PublicBlogPost[]>> {
  try {
    const supabase = getPublicClient();

    const { data, error } = await supabase
      .from("blog_posts")
      .select(`
        id, title, slug, excerpt, published_content_html, content_json,
        featured_image_id, published_at, seo_title, seo_description, og_image_id,
        canonical_url, robots,
        blog_authors(name, role, avatar_id),
        blog_categories(name, slug),
        media!blog_posts_featured_image_id_fkey(public_url)
      `)
      .eq("status", "published")
      .eq("visibility", "public")
      .order("published_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const posts: PublicBlogPost[] = (data ?? []).map((row) => {
      const authorArr = row.blog_authors as Array<{ name: string; role: string | null; avatar_id: string | null }> | null;
      const author = Array.isArray(authorArr) ? authorArr[0] ?? null : authorArr;
      const categoryArr = row.blog_categories as Array<{ name: string; slug: string }> | null;
      const category = Array.isArray(categoryArr) ? categoryArr[0] ?? null : categoryArr;
      const mediaArr = row.media as Array<{ public_url: string }> | { public_url: string } | null;
      const media = Array.isArray(mediaArr) ? mediaArr[0] : mediaArr;

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt ?? null,
        publishedContentHtml: row.published_content_html ?? null,
        contentJson: row.content_json ?? null,
        featuredImageUrl: media?.public_url ?? null,
        authorName: author?.name ?? "Pravix Team",
        authorRole: author?.role ?? null,
        authorAvatarUrl: null,
        categoryName: category?.name ?? null,
        categorySlug: category?.slug ?? null,
        publishedAt: row.published_at ?? null,
        seoTitle: row.seo_title ?? null,
        seoDescription: row.seo_description ?? null,
        ogImageUrl: null,
        canonicalUrl: row.canonical_url ?? null,
        robots: row.robots ?? "index,follow",
        tags: [],
      };
    });

    // Fetch tags for all posts
    if (posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const { data: tagData } = await supabase
        .from("blog_post_tags")
        .select("post_id, blog_tags(name)")
        .in("post_id", postIds);

      if (tagData) {
        const tagMap = new Map<string, string[]>();
        for (const row of tagData) {
          const tagArr = row.blog_tags as Array<{ name: string }> | { name: string } | null;
          const tag = Array.isArray(tagArr) ? tagArr[0] : tagArr;
          if (tag) {
            const existing = tagMap.get(row.post_id) ?? [];
            existing.push(tag.name);
            tagMap.set(row.post_id, existing);
          }
        }
        for (const post of posts) {
          post.tags = tagMap.get(post.id) ?? [];
        }
      }
    }

    return { success: true, data: posts };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<RepoResult<PublicBlogPost | null>> {
  try {
    const supabase = getPublicClient();

    const { data, error } = await supabase
      .from("blog_posts")
      .select(`
        id, title, slug, excerpt, published_content_html, content_json,
        featured_image_id, published_at, seo_title, seo_description, og_image_id,
        canonical_url, robots,
        blog_authors(name, role, avatar_id),
        blog_categories(name, slug),
        media!blog_posts_featured_image_id_fkey(public_url)
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .eq("visibility", "public")
      .single();

    if (error || !data) {
      return { success: true, data: null };
    }

    const authorArr = data.blog_authors as Array<{ name: string; role: string | null; avatar_id: string | null }> | null;
    const author = Array.isArray(authorArr) ? authorArr[0] ?? null : authorArr;
    const categoryArr = data.blog_categories as Array<{ name: string; slug: string }> | null;
    const category = Array.isArray(categoryArr) ? categoryArr[0] ?? null : categoryArr;
    const mediaArr = data.media as Array<{ public_url: string }> | { public_url: string } | null;
    const media = Array.isArray(mediaArr) ? mediaArr[0] : mediaArr;

    const post: PublicBlogPost = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? null,
      publishedContentHtml: data.published_content_html ?? null,
      contentJson: data.content_json ?? null,
      featuredImageUrl: media?.public_url ?? null,
      authorName: author?.name ?? "Pravix Team",
      authorRole: author?.role ?? null,
      authorAvatarUrl: null,
      categoryName: category?.name ?? null,
      categorySlug: category?.slug ?? null,
      publishedAt: data.published_at ?? null,
      seoTitle: data.seo_title ?? null,
      seoDescription: data.seo_description ?? null,
      ogImageUrl: null,
      canonicalUrl: data.canonical_url ?? null,
      robots: data.robots ?? "index,follow",
      tags: [],
    };

    // Fetch tags
    const { data: tagData } = await supabase
      .from("blog_post_tags")
      .select("blog_tags(name)")
      .eq("post_id", data.id);

    if (tagData) {
      post.tags = tagData
        .map((row) => {
          const tagArr = row.blog_tags as Array<{ name: string }> | { name: string } | null;
          const tag = Array.isArray(tagArr) ? tagArr[0] : tagArr;
          return tag?.name;
        })
        .filter((name): name is string => Boolean(name));
    }

    return { success: true, data: post };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

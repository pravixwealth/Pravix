import type { SupabaseClient } from "@supabase/supabase-js";
import type { RepoResult } from "../types";

// ── Domain Types ─────────────────────────────────────────────────────────────

export type BlogPostStatus = "draft" | "review" | "approved" | "scheduled" | "published" | "archived";
export type BlogVisibility = "public" | "private" | "unlisted";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  contentJson: Record<string, unknown> | null;
  publishedContentJson: Record<string, unknown> | null;
  publishedContentHtml: string | null;
  excerpt: string | null;
  featuredImageId: string | null;
  status: BlogPostStatus;
  visibility: BlogVisibility;
  authorId: string;
  categoryId: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogAuthor = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarId: string | null;
  email: string | null;
  role: string | null;
  profileId: string | null;
  createdAt: string;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
};

export type BlogTag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type BlogRevision = {
  id: string;
  postId: string;
  title: string;
  contentJson: Record<string, unknown> | null;
  excerpt: string | null;
  savedBy: string;
  createdAt: string;
};

// ── Params ───────────────────────────────────────────────────────────────────

export type CreatePostParams = {
  title: string;
  slug: string;
  contentJson?: Record<string, unknown> | null;
  excerpt?: string | null;
  featuredImageId?: string | null;
  status?: BlogPostStatus;
  visibility?: BlogVisibility;
  authorId: string;
  categoryId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageId?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  robots?: string;
  scheduledAt?: string | null;
};

export type UpdatePostParams = Partial<Omit<CreatePostParams, "slug">> & {
  slug?: string;
};

export type ListPostsParams = {
  page?: number;
  perPage?: number;
  status?: BlogPostStatus;
  authorId?: string;
  categoryId?: string;
  search?: string;
};

export type PaginatedPosts = {
  posts: BlogPost[];
  total: number;
  page: number;
  perPage: number;
};

// ── Row Mappers ──────────────────────────────────────────────────────────────

function rowToPost(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    contentJson: (row.content_json as Record<string, unknown>) ?? null,
    publishedContentJson: (row.published_content_json as Record<string, unknown>) ?? null,
    publishedContentHtml: (row.published_content_html as string) ?? null,
    excerpt: (row.excerpt as string) ?? null,
    featuredImageId: (row.featured_image_id as string) ?? null,
    status: row.status as BlogPostStatus,
    visibility: row.visibility as BlogVisibility,
    authorId: row.author_id as string,
    categoryId: (row.category_id as string) ?? null,
    publishedAt: (row.published_at as string) ?? null,
    scheduledAt: (row.scheduled_at as string) ?? null,
    seoTitle: (row.seo_title as string) ?? null,
    seoDescription: (row.seo_description as string) ?? null,
    ogImageId: (row.og_image_id as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── Post CRUD ────────────────────────────────────────────────────────────────

export async function createPost(
  supabase: SupabaseClient,
  params: CreatePostParams
): Promise<RepoResult<BlogPost>> {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: params.title,
      slug: params.slug,
      content_json: params.contentJson ?? null,
      excerpt: params.excerpt ?? null,
      featured_image_id: params.featuredImageId ?? null,
      status: params.status ?? "draft",
      visibility: params.visibility ?? "public",
      author_id: params.authorId,
      category_id: params.categoryId ?? null,
      seo_title: params.seoTitle ?? null,
      seo_description: params.seoDescription ?? null,
      og_image_id: params.ogImageId ?? null,
      focus_keyword: params.focusKeyword ?? null,
      canonical_url: params.canonicalUrl ?? null,
      robots: params.robots ?? "index,follow",
      scheduled_at: params.scheduledAt ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to create post" };
  }

  return { success: true, data: rowToPost(data) };
}

export async function getPostById(
  supabase: SupabaseClient,
  id: string
): Promise<RepoResult<BlogPost>> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select()
    .eq("id", id)
    .single();

  if (error || !data) {
    return { success: false, error: "Post not found" };
  }

  return { success: true, data: rowToPost(data) };
}

export async function getPostBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<RepoResult<BlogPost>> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select()
    .eq("slug", slug)
    .eq("status", "published")
    .eq("visibility", "public")
    .single();

  if (error || !data) {
    return { success: false, error: "Post not found" };
  }

  return { success: true, data: rowToPost(data) };
}

export async function listPosts(
  supabase: SupabaseClient,
  params: ListPostsParams = {}
): Promise<RepoResult<PaginatedPosts>> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (params.status) query = query.eq("status", params.status);
  if (params.authorId) query = query.eq("author_id", params.authorId);
  if (params.categoryId) query = query.eq("category_id", params.categoryId);
  if (params.search) query = query.ilike("title", `%${params.search}%`);

  const { data, error, count } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      posts: (data ?? []).map(rowToPost),
      total: count ?? 0,
      page,
      perPage,
    },
  };
}

export async function updatePost(
  supabase: SupabaseClient,
  id: string,
  params: UpdatePostParams
): Promise<RepoResult<BlogPost>> {
  const updates: Record<string, unknown> = {};

  if (params.title !== undefined) updates.title = params.title;
  if (params.slug !== undefined) updates.slug = params.slug;
  if (params.contentJson !== undefined) updates.content_json = params.contentJson;
  if (params.excerpt !== undefined) updates.excerpt = params.excerpt;
  if (params.featuredImageId !== undefined) updates.featured_image_id = params.featuredImageId;
  if (params.status !== undefined) updates.status = params.status;
  if (params.visibility !== undefined) updates.visibility = params.visibility;
  if (params.authorId !== undefined) updates.author_id = params.authorId;
  if (params.categoryId !== undefined) updates.category_id = params.categoryId;
  if (params.seoTitle !== undefined) updates.seo_title = params.seoTitle;
  if (params.seoDescription !== undefined) updates.seo_description = params.seoDescription;
  if (params.ogImageId !== undefined) updates.og_image_id = params.ogImageId;

  const { data, error } = await supabase
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to update post" };
  }

  return { success: true, data: rowToPost(data) };
}

/**
 * Publish a post: freeze content_json → published_content_json/html, set status + published_at.
 * Creates a revision snapshot.
 */
export async function publishPost(
  supabase: SupabaseClient,
  id: string,
  html: string,
  publishedBy: string
): Promise<RepoResult<BlogPost>> {
  // Get current draft content
  const current = await getPostById(supabase, id);
  if (!current.success) return current;

  const post = current.data;

  // Create revision before publishing
  await supabase.from("blog_post_revisions").insert({
    post_id: id,
    title: post.title,
    content_json: post.contentJson,
    excerpt: post.excerpt,
    saved_by: publishedBy,
  });

  // Freeze content into published fields
  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      status: "published",
      published_content_json: post.contentJson,
      published_content_html: html,
      published_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to publish" };
  }

  return { success: true, data: rowToPost(data) };
}

export async function deletePost(
  supabase: SupabaseClient,
  id: string
): Promise<RepoResult<null>> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

// ── Revisions ────────────────────────────────────────────────────────────────

export async function listRevisions(
  supabase: SupabaseClient,
  postId: string
): Promise<RepoResult<BlogRevision[]>> {
  const { data, error } = await supabase
    .from("blog_post_revisions")
    .select()
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id as string,
      postId: row.post_id as string,
      title: row.title as string,
      contentJson: (row.content_json as Record<string, unknown>) ?? null,
      excerpt: (row.excerpt as string) ?? null,
      savedBy: row.saved_by as string,
      createdAt: row.created_at as string,
    })),
  };
}

// ── Authors ──────────────────────────────────────────────────────────────────

export async function listAuthors(
  supabase: SupabaseClient
): Promise<RepoResult<BlogAuthor[]>> {
  const { data, error } = await supabase
    .from("blog_authors")
    .select()
    .order("name");

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      bio: (row.bio as string) ?? null,
      avatarId: (row.avatar_id as string) ?? null,
      email: (row.email as string) ?? null,
      role: (row.role as string) ?? null,
      profileId: (row.profile_id as string) ?? null,
      createdAt: row.created_at as string,
    })),
  };
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function listCategories(
  supabase: SupabaseClient
): Promise<RepoResult<BlogCategory[]>> {
  const { data, error } = await supabase
    .from("blog_categories")
    .select()
    .order("sort_order");

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      description: (row.description as string) ?? null,
      sortOrder: row.sort_order as number,
      createdAt: row.created_at as string,
    })),
  };
}

// ── Tags ─────────────────────────────────────────────────────────────────────

export async function listTags(
  supabase: SupabaseClient
): Promise<RepoResult<BlogTag[]>> {
  const { data, error } = await supabase
    .from("blog_tags")
    .select()
    .order("name");

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      createdAt: row.created_at as string,
    })),
  };
}

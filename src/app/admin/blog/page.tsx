import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listPosts } from "@/lib/admin/repositories/blog.repository";
import type { BlogPostStatus } from "@/lib/admin/repositories/blog.repository";
import { DeletePostButton } from "./DeletePostButton";

const STATUS_TONE: Record<BlogPostStatus, "neutral" | "success" | "warning" | "info" | "danger"> = {
  draft: "neutral",
  review: "warning",
  approved: "info",
  scheduled: "info",
  published: "success",
  archived: "neutral",
};

export default async function BlogPostsPage() {
  await requireRole("editor");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const result = await listPosts(supabase, { perPage: 100 });
  const posts = result.success ? result.data.posts : [];
  const total = result.success ? result.data.total : 0;
  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;

  return (
    <div>
      <PageHeader
        title="Blog"
        description={`${total} post${total !== 1 ? "s" : ""} · ${published} published · ${drafts} draft${drafts !== 1 ? "s" : ""}`}
        actions={
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2b5cff] px-4 py-2 text-sm font-medium text-white hover:bg-[#224ed8]"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        }
      />

      <div className="mt-8">
        {posts.length === 0 ? (
          <EmptyState
            title="No blog posts yet"
            description="Create your first blog post to start publishing content."
            action={
              <Link
                href="/admin/blog/new"
                className="rounded-lg bg-[#2b5cff] px-4 py-2 text-sm font-medium text-white hover:bg-[#224ed8]"
              >
                Create First Post
              </Link>
            }
          />
        ) : (
          <div className="rounded-xl border border-[#e2e8f0] bg-white">
            <div className="divide-y divide-[#f1f5f9]">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/blog/${post.id}/edit`} className="text-sm font-medium text-[#0f172a] hover:text-[#2b5cff]">
                      {post.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#94a3b8]">
                      /{post.slug} · {new Date(post.createdAt).toLocaleDateString("en-IN")}
                      {post.publishedAt && ` · Published ${new Date(post.publishedAt).toLocaleDateString("en-IN")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge label={post.status} tone={STATUS_TONE[post.status]} />
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="rounded p-1.5 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeletePostButton postId={post.id} postTitle={post.title} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

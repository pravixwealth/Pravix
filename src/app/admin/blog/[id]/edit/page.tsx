import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { getPostById, listAuthors, listCategories, listTags } from "@/lib/admin/repositories/blog.repository";
import { EditPostForm } from "./EditPostForm";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  await requireRole("editor");
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const [postResult, authorsResult, categoriesResult, tagsResult] = await Promise.all([
    getPostById(supabase, id),
    listAuthors(supabase),
    listCategories(supabase),
    listTags(supabase),
  ]);

  if (!postResult.success) {
    notFound();
  }

  const post = postResult.data;
  const authors = authorsResult.success ? authorsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const tags = tagsResult.success ? tagsResult.data : [];

  // Get current post tags
  const { data: postTags } = await supabase
    .from("blog_post_tags")
    .select("blog_tags(name)")
    .eq("post_id", id);

  const currentTags = (postTags ?? [])
    .map((row) => {
      const t = row.blog_tags as { name: string } | Array<{ name: string }> | null;
      return Array.isArray(t) ? t[0]?.name : t?.name;
    })
    .filter((name): name is string => Boolean(name));

  return (
    <div>
      <PageHeader title="Edit Post" description={post.title} />
      <div className="mt-8">
        <EditPostForm
          post={post}
          currentTags={currentTags}
          authors={authors}
          categories={categories}
          tags={tags}
        />
      </div>
    </div>
  );
}

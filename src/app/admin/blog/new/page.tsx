import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/admin/server-auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { listAuthors, listCategories, listTags } from "@/lib/admin/repositories/blog.repository";
import { BlogPostForm } from "./BlogPostForm";

export default async function NewBlogPostPage() {
  const user = await requireRole("editor");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const [authorsResult, categoriesResult, tagsResult] = await Promise.all([
    listAuthors(supabase),
    listCategories(supabase),
    listTags(supabase),
  ]);

  const authors = authorsResult.success ? authorsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const tags = tagsResult.success ? tagsResult.data : [];

  return (
    <div>
      <PageHeader title="New Blog Post" description="Create and publish a new article." />
      <div className="mt-8">
        <BlogPostForm authors={authors} categories={categories} tags={tags} userId={user.id} />
      </div>
    </div>
  );
}

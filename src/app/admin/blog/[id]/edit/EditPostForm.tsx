"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send } from "lucide-react";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { BlogPost, BlogAuthor, BlogCategory, BlogTag } from "@/lib/admin/repositories/blog.repository";

type EditPostFormProps = {
  post: BlogPost;
  currentTags: string[];
  authors: BlogAuthor[];
  categories: BlogCategory[];
  tags: BlogTag[];
};

export function EditPostForm({ post, currentTags, authors, categories }: EditPostFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [authorId, setAuthorId] = useState(post.authorId);
  const [categoryId, setCategoryId] = useState(post.categoryId ?? "");
  const [contentJson, setContentJson] = useState<Record<string, unknown> | null>(post.contentJson);
  const [contentHtml, setContentHtml] = useState("");
  const [status, setStatus] = useState(post.status);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = useCallback(async (action: "save" | "publish" | "archive") => {
    if (!title.trim()) { setError("Title is required"); return; }
    if (action === "publish") setPublishing(true);
    else setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        authorId,
        categoryId: categoryId || null,
        contentJson,
      };

      if (action === "publish") {
        body.publish = true;
        body.contentHtml = contentHtml;
      } else if (action === "archive") {
        body.status = "archived";
      }

      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Failed to save");
        return;
      }

      if (action === "archive") {
        setStatus("archived");
        setSuccess("Archived!");
      } else if (action === "publish") {
        setStatus("published");
        setSuccess("Published!");
      } else {
        setSuccess("Saved!");
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }, [title, slug, excerpt, authorId, categoryId, contentJson, contentHtml, post.id, router]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <StatusBadge
          label={status}
          tone={status === "published" ? "success" : status === "archived" ? "neutral" : "warning"}
        />
        {post.publishedAt && (
          <span className="text-xs text-[#94a3b8]">
            Published {new Date(post.publishedAt).toLocaleDateString("en-IN")}
          </span>
        )}
        {currentTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {currentTags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#2b5cff]/10 px-2 py-0.5 text-[10px] font-medium text-[#2b5cff]">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[#0f172a]">Title</label>
        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-[#0f172a] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20" />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-[#0f172a]">Slug</label>
        <input id="slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm font-mono text-[#0f172a] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-[#0f172a]">Author</label>
          <select id="author" value={authorId} onChange={(e) => setAuthorId(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20">
            {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[#0f172a]">Category</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20">
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-[#0f172a]">Excerpt</label>
        <textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="mt-1.5 w-full resize-y rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20" />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Content</label>
        <BlogEditor content={contentJson} onChange={(json, html) => { setContentJson(json); setContentHtml(html); }} />
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{success}</div>}

      <div className="flex justify-between border-t border-[#e2e8f0] pt-5">
        {status !== "archived" && (
          <button type="button" onClick={() => handleSave("archive")} disabled={saving || publishing} className="inline-flex items-center gap-2 rounded-lg border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">
            Archive
          </button>
        )}
        <div className="flex gap-3 ml-auto">
          <button type="button" onClick={() => handleSave("save")} disabled={saving || publishing} className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] px-5 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}<Save className="h-4 w-4" />Save
          </button>
          <button type="button" onClick={() => handleSave("publish")} disabled={saving || publishing} className="inline-flex items-center gap-2 rounded-lg bg-[#2b5cff] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#224ed8] disabled:opacity-50">
            {publishing && <Loader2 className="h-4 w-4 animate-spin" />}<Send className="h-4 w-4" />{status === "published" ? "Re-publish" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

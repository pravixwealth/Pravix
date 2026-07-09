"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send } from "lucide-react";
import { BlogEditor } from "@/components/admin/BlogEditor";
import type { BlogAuthor, BlogCategory } from "@/lib/admin/repositories/blog.repository";

type BlogPostFormProps = {
  authors: BlogAuthor[];
  categories: BlogCategory[];
  userId: string;
};

export function BlogPostForm({ authors, categories, userId }: BlogPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [authorId, setAuthorId] = useState(authors[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [contentJson, setContentJson] = useState<Record<string, unknown> | null>(null);
  const [contentHtml, setContentHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 100);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }
    if (!authorId) {
      setError("Author is required");
      return;
    }

    publish ? setPublishing(true) : setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          authorId,
          categoryId: categoryId || null,
          contentJson,
          contentHtml: publish ? contentHtml : null,
          seoTitle: seoTitle.trim() || null,
          seoDescription: seoDescription.trim() || null,
          publish,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Failed to save post");
        return;
      }

      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[#0f172a]">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Your blog post title"
          className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-[#0f172a]">
          URL Slug <span className="text-red-500">*</span>
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs text-[#94a3b8]">/learn/</span>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(generateSlug(e.target.value))}
            className="flex-1 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] font-mono focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20"
          />
        </div>
      </div>

      {/* Author + Category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-[#0f172a]">Author</label>
          <select
            id="author"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20"
          >
            {authors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[#0f172a]">Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-[#0f172a]">Excerpt</label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          placeholder="Brief summary shown on the blog listing"
          className="mt-1.5 w-full resize-y rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20"
        />
      </div>

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Content</label>
        <BlogEditor
          content={contentJson}
          onChange={(json, html) => {
            setContentJson(json);
            setContentHtml(html);
          }}
        />
      </div>

      {/* SEO */}
      <details className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[#0f172a]">SEO Settings</summary>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="seoTitle" className="block text-sm font-medium text-[#64748b]">SEO Title</label>
            <input
              id="seoTitle"
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title || "Page title for search engines"}
              className="mt-1 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20"
            />
          </div>
          <div>
            <label htmlFor="seoDesc" className="block text-sm font-medium text-[#64748b]">Meta Description</label>
            <textarea
              id="seoDesc"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              placeholder={excerpt || "Description shown in search results"}
              className="mt-1 w-full resize-y rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20"
            />
          </div>
        </div>
      </details>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-[#e2e8f0] pt-5">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving || publishing}
          className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] px-5 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving || publishing}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2b5cff] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#224ed8] disabled:opacity-50"
        >
          {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
          <Send className="h-4 w-4" />
          Publish
        </button>
      </div>
    </div>
  );
}

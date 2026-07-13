"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  Heading2,
  Image as ImageIcon,
  Link2,
  Loader2,
  Save,
  Send,
  Tag,
  X,
} from "lucide-react";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { GooglePreview } from "@/components/admin/GooglePreview";
import { SEOHealthPanel } from "@/components/admin/SEOHealthPanel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  calculateSEOScore,
  countWords,
  countHeadings,
  countImages,
  countLinks,
  estimateReadingTime,
  htmlToPlainText,
} from "@/lib/admin/content-utils";
import type { BlogAuthor, BlogCategory, BlogTag } from "@/lib/admin/repositories/blog.repository";
import type { MediaFile } from "@/lib/admin/repositories/media.repository";
import type { SEOInput } from "@/lib/admin/content-utils";

type BlogPostFormProps = {
  authors: BlogAuthor[];
  categories: BlogCategory[];
  tags: BlogTag[];
  userId: string;
};

export function BlogPostForm({ authors, categories, tags: existingTags, userId }: BlogPostFormProps) {
  const router = useRouter();

  // Content state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [authorId, setAuthorId] = useState(authors[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [allCategories, setAllCategories] = useState(categories);
  const [contentJson, setContentJson] = useState<Record<string, unknown> | null>(null);
  const [contentHtml, setContentHtml] = useState("");

  // Media
  const [featuredImage, setFeaturedImage] = useState<MediaFile | null>(null);

  // Tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [robots, setRobots] = useState("index,follow");
  const [ogImageId, setOgImageId] = useState<string | null>(null);

  // Schedule
  const [scheduledAt, setScheduledAt] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Auto slug ──────────────────────────────────────────────────────────────
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
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(value));
  };

  // ── Tags ───────────────────────────────────────────────────────────────────
  const filteredTags = useMemo(() => {
    if (!tagInput.trim()) return existingTags.filter((t) => !selectedTags.includes(t.name));
    return existingTags.filter(
      (t) => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(t.name)
    );
  }, [tagInput, existingTags, selectedTags]);

  const addTag = (name: string) => {
    if (!selectedTags.includes(name)) {
      setSelectedTags([...selectedTags, name]);
    }
    setTagInput("");
  };

  const removeTag = (name: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== name));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  // ── Content metrics (real-time) ────────────────────────────────────────────
  const plainText = useMemo(() => htmlToPlainText(contentHtml), [contentHtml]);
  const wordCount = useMemo(() => countWords(plainText), [plainText]);
  const readingTime = useMemo(() => estimateReadingTime(wordCount), [wordCount]);
  const headings = useMemo(() => countHeadings(contentHtml), [contentHtml]);
  const images = useMemo(() => countImages(contentHtml), [contentHtml]);
  const links = useMemo(() => countLinks(contentHtml), [contentHtml]);

  // ── SEO Score (real-time) ──────────────────────────────────────────────────
  const seoInput: SEOInput = useMemo(() => ({
    title,
    metaTitle: seoTitle || title,
    metaDescription: seoDescription || excerpt,
    focusKeyword,
    content: contentHtml,
    slug,
    hasFeaturedImage: featuredImage !== null,
    hasCanonical: canonicalUrl.length > 0,
    hasOgImage: ogImageId !== null || featuredImage !== null,
  }), [title, seoTitle, seoDescription, focusKeyword, contentHtml, slug, featuredImage, canonicalUrl, ogImageId]);

  const seoScore = useMemo(() => calculateSEOScore(seoInput), [seoInput]);

  // ── Create Category ──────────────────────────────────────────────────────
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    const slug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    const response = await fetch("/api/admin/blog/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newCategoryName.trim(), slug }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.category) {
        setAllCategories([...allCategories, data.category]);
        setCategoryId(data.category.id);
      }
    }
    setNewCategoryName("");
    setCreatingCategory(false);
  };

  // ── Save / Publish / Schedule ──────────────────────────────────────────────
  const handleSave = useCallback(async (action: "draft" | "publish" | "schedule") => {
    if (!title.trim()) { setError("Title is required"); return; }
    if (!slug.trim()) { setError("Slug is required"); return; }
    if (!authorId) { setError("Author is required"); return; }
    if (action === "schedule" && !scheduledAt) { setError("Schedule date is required"); return; }

    if (action === "publish") setPublishing(true);
    else if (action === "schedule") setScheduling(true);
    else setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          authorId,
          categoryId: categoryId || null,
          contentJson,
          contentHtml: action === "publish" ? contentHtml : null,
          seoTitle: seoTitle.trim() || null,
          seoDescription: seoDescription.trim() || null,
          focusKeyword: focusKeyword.trim() || null,
          canonicalUrl: canonicalUrl.trim() || null,
          robots,
          featuredImageId: featuredImage?.id ?? null,
          ogImageId: ogImageId ?? featuredImage?.id ?? null,
          tags: selectedTags,
          publish: action === "publish",
          scheduledAt: action === "schedule" ? scheduledAt : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Failed to save post");
        return;
      }

      router.push("/admin/blog?saved=true");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
      setPublishing(false);
      setScheduling(false);
    }
  }, [title, slug, authorId, categoryId, contentJson, contentHtml, seoTitle, seoDescription, focusKeyword, canonicalUrl, robots, featuredImage, ogImageId, selectedTags, scheduledAt, excerpt, router]);

  // ── Character counter helper ───────────────────────────────────────────────
  const charColor = (len: number, max: number) => {
    if (len === 0) return "text-[#94a3b8]";
    if (len <= max) return "text-emerald-600";
    return "text-red-600";
  };

  return (
    <div className="flex gap-6">
      {/* ═══ LEFT: Main Content ═══ */}
      <div className="min-w-0 flex-1 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#0f172a]">Title *</label>
          <input id="title" type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Your blog post title" className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20" />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-[#0f172a]">URL Slug *</label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs text-[#94a3b8]">/learn/</span>
            <input id="slug" type="text" value={slug} onChange={(e) => handleSlugChange(e.target.value)} className="flex-1 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm font-mono text-[#0f172a] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20" />
          </div>
        </div>

        {/* Author + Category */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-[#0f172a]">Author</label>
            <select id="author" value={authorId} onChange={(e) => setAuthorId(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20">
              {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[#0f172a]">Category</label>
            <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20">
              <option value="">No category</option>
              {allCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="mt-1.5 flex items-center gap-2">
              <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateCategory(); } }} placeholder="New category name" className="flex-1 rounded border border-[#e2e8f0] px-2 py-1 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2b5cff] focus:outline-none" />
              <button type="button" onClick={handleCreateCategory} disabled={creatingCategory || !newCategoryName.trim()} className="rounded bg-[#2b5cff] px-2.5 py-1 text-[11px] font-medium text-white disabled:opacity-50">+ New</button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-[#0f172a]">Featured Image</label>
          <div className="mt-1.5">
            <MediaPicker value={featuredImage} onChange={setFeaturedImage} placeholder="Select featured image" />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-[#0f172a]">Excerpt</label>
          <textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} placeholder="Brief summary shown on the blog listing" className="mt-1.5 w-full resize-y rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20" />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-[#0f172a]">Tags</label>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 min-h-[42px]">
            {selectedTags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#2b5cff]/10 px-2.5 py-0.5 text-xs font-medium text-[#2b5cff]">
                <Tag className="h-3 w-3" />{tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-red-500"><X className="h-3 w-3" /></button>
              </span>
            ))}
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder={selectedTags.length === 0 ? "Add tags..." : ""} className="min-w-[100px] flex-1 border-none bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8]" />
          </div>
          {tagInput && filteredTags.length > 0 && (
            <div className="mt-1 rounded-lg border border-[#e2e8f0] bg-white p-1 shadow-lg">
              {filteredTags.slice(0, 5).map((tag) => (
                <button key={tag.id} type="button" onClick={() => addTag(tag.name)} className="w-full rounded px-3 py-1.5 text-left text-sm text-[#475569] hover:bg-[#f1f5f9]">{tag.name}</button>
              ))}
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Content</label>
          <BlogEditor content={contentJson} onChange={(json, html) => { setContentJson(json); setContentHtml(html); }} />
        </div>

        {/* SEO Section */}
        <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-5 space-y-4">
          <p className="text-sm font-semibold text-[#0f172a]">SEO Settings</p>

          {/* Focus Keyword */}
          <div>
            <label htmlFor="focusKeyword" className="block text-xs font-medium text-[#64748b]">Focus Keyword</label>
            <input id="focusKeyword" type="text" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="e.g. goal based investing" className="mt-1 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20" />
          </div>

          {/* Meta Title */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="seoTitle" className="text-xs font-medium text-[#64748b]">Meta Title</label>
              <span className={`text-[11px] font-mono ${charColor((seoTitle || title).length, 60)}`}>{(seoTitle || title).length}/60</span>
            </div>
            <input id="seoTitle" type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title || "Page title for search engines"} className="mt-1 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20" />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="seoDesc" className="text-xs font-medium text-[#64748b]">Meta Description</label>
              <span className={`text-[11px] font-mono ${charColor((seoDescription || excerpt).length, 160)}`}>{(seoDescription || excerpt).length}/160</span>
            </div>
            <textarea id="seoDesc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} placeholder={excerpt || "Description shown in search results"} className="mt-1 w-full resize-y rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20" />
          </div>

          {/* Canonical + Robots */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="canonical" className="text-xs font-medium text-[#64748b]">Canonical URL</label>
              <input id="canonical" type="url" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://pravix.in/learn/..." className="mt-1 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20" />
            </div>
            <div>
              <label htmlFor="robots" className="text-xs font-medium text-[#64748b]">Robots</label>
              <select id="robots" value={robots} onChange={(e) => setRobots(e.target.value)} className="mt-1 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20">
                <option value="index,follow">Index, Follow</option>
                <option value="noindex,follow">NoIndex, Follow</option>
                <option value="noindex,nofollow">NoIndex, NoFollow</option>
              </select>
            </div>
          </div>

          {/* Google Preview */}
          <GooglePreview title={seoTitle || title} url={`pravix.in/learn/${slug}`} description={seoDescription || excerpt} />
        </div>

        {/* Error */}
        {error && <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}
      </div>

      {/* ═══ RIGHT: Sidebar ═══ */}
      <div className="hidden w-72 shrink-0 space-y-4 lg:block">
        {/* Publish Controls */}
        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0f172a]">Publish</p>
            <StatusBadge label="Draft" tone="neutral" />
          </div>

          {/* Schedule */}
          <div>
            <label htmlFor="scheduleDate" className="flex items-center gap-1.5 text-xs font-medium text-[#64748b]">
              <Calendar className="h-3 w-3" />Schedule
            </label>
            <input id="scheduleDate" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="mt-1 w-full rounded border border-[#e2e8f0] px-2 py-1.5 text-xs focus:border-[#2b5cff] focus:outline-none" />
          </div>

          <div className="space-y-2 border-t border-[#f1f5f9] pt-3">
            <button type="button" onClick={() => handleSave("draft")} disabled={saving || publishing || scheduling} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] py-2 text-sm font-medium text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}<Save className="h-3.5 w-3.5" />Save Draft
            </button>
            {scheduledAt && (
              <button type="button" onClick={() => handleSave("schedule")} disabled={saving || publishing || scheduling} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50">
                {scheduling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}<Calendar className="h-3.5 w-3.5" />Schedule
              </button>
            )}
            <button type="button" onClick={() => handleSave("publish")} disabled={saving || publishing || scheduling} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2b5cff] py-2 text-sm font-medium text-white hover:bg-[#224ed8] disabled:opacity-50">
              {publishing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}<Send className="h-3.5 w-3.5" />Publish
            </button>
          </div>
        </div>

        {/* SEO Score */}
        <SEOHealthPanel result={seoScore} />

        {/* Content Stats */}
        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8]">Content Stats</p>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[#64748b]"><FileText className="mr-1.5 inline h-3 w-3" />Words</span><span className="font-medium text-[#0f172a]">{wordCount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Reading Time</span><span className="font-medium text-[#0f172a]">{readingTime}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]"><Heading2 className="mr-1.5 inline h-3 w-3" />Headings</span><span className="font-medium text-[#0f172a]">H2: {headings.h2} · H3: {headings.h3}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]"><ImageIcon className="mr-1.5 inline h-3 w-3" />Images</span><span className="font-medium text-[#0f172a]">{images}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]"><Link2 className="mr-1.5 inline h-3 w-3" />Links</span><span className="font-medium text-[#0f172a]">{links.internal} int · {links.external} ext</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

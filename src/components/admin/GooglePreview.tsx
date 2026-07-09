/**
 * Google SERP preview — shows how the post will appear in search results.
 * Reusable by Blog, Pages, or any future CMS content.
 */

type GooglePreviewProps = {
  title: string;
  url: string;
  description: string;
};

export function GooglePreview({ title, url, description }: GooglePreviewProps) {
  const displayTitle = title || "Page Title";
  const displayUrl = url || "pravix.in/blog/post-slug";
  const displayDesc = description || "Add a meta description to see how this post will appear in search results.";

  return (
    <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8]">Google Preview</p>
      <div className="mt-2.5">
        <p className="truncate text-lg text-[#1a0dab] leading-tight">{displayTitle.slice(0, 60)}</p>
        <p className="mt-0.5 truncate text-sm text-[#006621]">{displayUrl}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#545454] line-clamp-2">{displayDesc.slice(0, 160)}</p>
      </div>
    </div>
  );
}

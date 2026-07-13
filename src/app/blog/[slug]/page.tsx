import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { getPublishedPosts, getPublishedPostBySlug } from "@/lib/admin/repositories/blog-public.repository";
import { absoluteUrl, siteName } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const result = await getPublishedPosts();
  if (!result.success) return [];
  return result.data.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedPostBySlug(slug);

  if (!result.success || !result.data) {
    return { title: "Blog Not Found", robots: { index: false, follow: false } };
  }

  const post = result.data;
  const url = absoluteUrl(`/learn/${post.slug}`);

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: post.canonicalUrl || `/learn/${post.slug}` },
    robots: post.robots === "noindex,nofollow"
      ? { index: false, follow: false }
      : post.robots === "noindex,follow"
        ? { index: false, follow: true }
        : { index: true, follow: true },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "",
      url,
      siteName,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      authors: [post.authorName],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "",
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const result = await getPublishedPostBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const post = result.data;

  // Related posts: fetch all published, filter by shared tags, fallback to latest
  const allPostsResult = await getPublishedPosts();
  const relatedPosts = allPostsResult.success
    ? allPostsResult.data
        .filter((p) => p.slug !== post.slug)
        .map((p) => ({
          ...p,
          overlap: p.tags.filter((t) => post.tags.includes(t)).length,
        }))
        .sort((a, b) => b.overlap - a.overlap)
        .slice(0, 3)
    : [];

  // JSON-LD BlogPosting structured data
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(`/learn/${post.slug}`),
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.authorName },
    publisher: { "@type": "Organization", name: siteName },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/learn/${post.slug}`) },
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <div className="min-h-screen bg-finance-bg pb-16 pt-24">
        <div className="mx-auto w-full max-w-4xl px-6">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-sm font-medium text-finance-muted transition-colors hover:text-finance-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learn
          </Link>

          <article className="mt-6 rounded-2xl border border-finance-border/70 bg-finance-panel p-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-finance-muted">
              {post.publishedAt && (
                <span>{new Date(post.publishedAt).toLocaleDateString("en-IN")}</span>
              )}
              <span className="text-finance-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />5 min read
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-finance-border/60 bg-finance-surface/70 p-3.5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-finance-accent/10 text-sm font-semibold text-finance-accent">
                {post.authorName.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-finance-text">{post.authorName}</p>
                {post.authorRole && <p className="text-xs text-finance-muted">{post.authorRole}</p>}
              </div>
            </div>

            <h1 className="mt-3 text-3xl font-semibold leading-tight text-finance-text md:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-base leading-relaxed text-finance-muted md:text-lg">{post.excerpt}</p>
            )}

            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-finance-border/70 bg-finance-surface px-3 py-1 text-xs text-finance-muted">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Hero / Featured Image */}
            {post.featuredImageUrl && (
              <div className="mt-6 overflow-hidden rounded-xl border border-finance-border/60">
                <img
                  src={post.featuredImageUrl}
                  alt={post.title}
                  className="w-full max-h-[420px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            {/* Auto Table of Contents */}
            {post.publishedContentHtml && (() => {
              const headingRegex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
              const headings: Array<{ level: number; text: string; id: string }> = [];
              let match;
              while ((match = headingRegex.exec(post.publishedContentHtml!)) !== null) {
                const text = match[2].replace(/<[^>]*>/g, "").trim();
                if (text) {
                  headings.push({ level: parseInt(match[1]), text, id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
                }
              }
              if (headings.length < 3) return null;
              return (
                <nav className="mt-6 rounded-xl border border-finance-border/60 bg-finance-surface/50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-finance-muted">Table of Contents</p>
                  <ol className="mt-3 space-y-1.5">
                    {headings.map((h, i) => (
                      <li key={i} className={h.level === 3 ? "ml-4" : ""}>
                        <a href={`#${h.id}`} className="text-sm text-finance-accent hover:underline">{h.text}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              );
            })()}

            {post.publishedContentHtml ? (
              <div
                className="prose prose-lg prose-neutral mt-8 max-w-none text-finance-text prose-headings:font-semibold prose-headings:text-finance-text prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-finance-muted prose-p:leading-relaxed prose-p:mb-4 prose-li:text-finance-muted prose-li:leading-relaxed prose-ul:my-4 prose-ol:my-4 prose-a:text-[#2b5cff] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:my-6 prose-blockquote:border-[#2b5cff] prose-blockquote:bg-[#f8faff] prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:text-finance-muted"
                dangerouslySetInnerHTML={{
                  __html: post.publishedContentHtml.replace(
                    /<h([23])([^>]*)>(.*?)<\/h([23])>/gi,
                    (_, level, attrs, content) => {
                      const text = content.replace(/<[^>]*>/g, "").trim();
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
                    }
                  )
                }}
              />
            ) : (
              <p className="mt-8 text-sm text-finance-muted italic">Content coming soon.</p>
            )}
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-finance-text">Related articles</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/learn/${related.slug}`}
                    className="rounded-xl border border-finance-border/70 bg-finance-panel p-4 transition-colors hover:bg-finance-surface"
                  >
                    <p className="text-sm font-semibold text-finance-text line-clamp-2">{related.title}</p>
                    {related.excerpt && (
                      <p className="mt-2 text-xs text-finance-muted line-clamp-2">{related.excerpt}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

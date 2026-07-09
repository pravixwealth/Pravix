import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import LearnBlogGrid from "@/components/LearnBlogGrid";
import { blogPosts as fallbackPosts } from "./blog-data";
import { getPublishedPosts } from "@/lib/admin/repositories/blog-public.repository";
import { absoluteUrl } from "@/lib/seo";
import type { BlogPost } from "./blog-data";

export const metadata: Metadata = {
  title: "Learn — Personal Wealth Notes | Pravix",
  description:
    "Real-world financial planning articles from Pravix planners and analysts. Covering goal-based investing, Section 80C, market volatility, and portfolio diversification for Indian households.",
  alternates: {
    canonical: "/learn",
  },
  openGraph: {
    title: "Learn — Personal Wealth Notes | Pravix",
    description:
      "Real-world financial planning articles covering goal-based investing, tax planning, market volatility, and portfolio diversification for Indian families.",
    url: absoluteUrl("/learn"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn — Personal Wealth Notes | Pravix",
    description:
      "Real-world financial planning articles covering goal-based investing, tax planning, market volatility, and portfolio diversification for Indian families.",
  },
};

export default async function LearnPage() {
  // Try to load from CMS database
  const result = await getPublishedPosts();

  let posts: BlogPost[];

  if (result.success && result.data.length > 0) {
    // Convert DB posts to the shape LearnBlogGrid expects
    posts = result.data.map((dbPost) => ({
      slug: dbPost.slug,
      title: dbPost.title,
      excerpt: dbPost.excerpt ?? "",
      coverImage: dbPost.featuredImageUrl ?? "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=80",
      author: dbPost.authorName,
      role: dbPost.authorRole ?? "",
      publishedAt: dbPost.publishedAt ?? new Date().toISOString(),
      readTime: "5 min read",
      personalNote: "",
      whoShouldRead: "",
      keyTakeaways: [],
      tags: dbPost.tags,
      sections: [],
    }));
  } else {
    // Fallback: DB empty or unavailable — use hardcoded data
    // This fallback will be removed once blog posts are seeded in production DB
    posts = fallbackPosts;
  }

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-finance-bg pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <section id="personal-wealth-notes" className="mt-16 scroll-mt-28 rounded-2xl border border-finance-border/70 bg-finance-panel p-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-finance-muted">Knowledge Hub</p>
            <h2 className="mt-2 text-4xl font-semibold text-finance-text">Personal Wealth Notes</h2>
            <p className="mx-auto mt-3 max-w-2xl text-finance-muted">
              Real-world writing from planners and analysts who work with Indian households every day.
              Each post includes practical context, decision frameworks, and clear next steps.
            </p>

            <LearnBlogGrid posts={posts} />
          </section>
        </div>
      </div>
    </>
  );
}

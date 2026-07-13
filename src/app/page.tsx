import type { Metadata } from "next";
import HomepageWrapper from "@/components/HomepageWrapper";
import { getPublishedPosts } from "@/lib/admin/repositories/blog-public.repository";
import {
  absoluteUrl,
  defaultOgImage,
  defaultSeoKeywords,
  siteDescription,
  siteName,
  siteTagline,
  siteUrl,
  webPageJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: `Pravix � ${siteTagline}`,
  description: siteDescription,
  keywords: defaultSeoKeywords,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: absoluteUrl("/"),
    siteName,
    title: `Pravix � ${siteTagline}`,
    description: siteDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: `Pravix � ${siteTagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Pravix � ${siteTagline}`,
    description: siteDescription,
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function HomePage() {
  const postsResult = await getPublishedPosts();
  const blogPosts = postsResult.success
    ? postsResult.data.slice(0, 6).map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt ?? "",
        coverImage: p.featuredImageUrl ?? "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=80",
        author: p.authorName,
        role: p.authorRole ?? "",
        publishedAt: p.publishedAt ?? new Date().toISOString(),
        readTime: "5 min read",
        personalNote: "",
        whoShouldRead: "",
        keyTakeaways: [],
        tags: p.tags,
        sections: [],
      }))
    : [];

  return (
    <>
      {/* WebPage schema � page-specific structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd()) }}
      />

      {/* SSR hero � visible to Googlebot without JS */}
      <div className="sr-only">
        <h1>Pravix � Wealth Management Platform India</h1>
        <p>
          Pravix is India&apos;s goal-based AI wealth planning platform. We help Indian families
          plan, track, and optimize long-term wealth goals using disciplined systems, real market
          context, and expert-backed guidance. Get personalized SIP planning, portfolio analysis,
          and wealth projections tailored for India.
        </p>
        <nav>
          <a href="/services">Wealth Management Services</a>
          <a href="/blog">Financial Planning Guides</a>
          <a href="/about">About Pravix</a>
          <a href="/onboarding">Get Started</a>
          <a href="/#book-discovery-call">Book a Discovery Call</a>
        </nav>
      </div>

      {/* Full interactive homepage (client-side) */}
      <HomepageWrapper blogPosts={blogPosts} />
    </>
  );
}

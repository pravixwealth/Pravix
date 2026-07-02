import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import LearnBlogGrid from "@/components/LearnBlogGrid";
import { blogPosts } from "./blog-data";
import { absoluteUrl } from "@/lib/seo";

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

export default function LearnPage() {
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

            <LearnBlogGrid posts={blogPosts} />
          </section>
        </div>
      </div>
    </>
  );
}

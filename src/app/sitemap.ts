import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/admin/repositories/blog-public.repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: absoluteUrl("/sip-calculator"), lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: absoluteUrl("/financial-planning-india"), lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: absoluteUrl("/wealth-planning-tool"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/investment-calculator"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Blog posts from database
  const blogResult = await getPublishedPosts();
  const blogRoutes: MetadataRoute.Sitemap = blogResult.success
    ? blogResult.data.map((post) => ({
        url: absoluteUrl(`/${post.slug}`),
        lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
        changeFrequency: "monthly",
        priority: 0.7,
      }))
    : [];

  return [...staticRoutes, ...blogRoutes];
}

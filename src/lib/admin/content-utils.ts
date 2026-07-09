/**
 * Content utilities for Blog CMS.
 * Pure functions — no side effects, no server dependencies.
 * Used in both admin UI (real-time) and server (on publish).
 */

/** Count words in plain text */
export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/** Estimate reading time (avg 200 words/min) */
export function estimateReadingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

/** Extract plain text from HTML string */
export function htmlToPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Count headings in HTML */
export function countHeadings(html: string): { h2: number; h3: number } {
  const h2 = (html.match(/<h2[\s>]/gi) ?? []).length;
  const h3 = (html.match(/<h3[\s>]/gi) ?? []).length;
  return { h2, h3 };
}

/** Count images in HTML */
export function countImages(html: string): number {
  return (html.match(/<img[\s>]/gi) ?? []).length;
}

/** Count links in HTML */
export function countLinks(html: string): { internal: number; external: number } {
  const links = html.match(/<a[^>]+href="([^"]*)"[^>]*>/gi) ?? [];
  let internal = 0;
  let external = 0;
  for (const link of links) {
    if (link.includes('href="/') || link.includes("href=\"/")) {
      internal++;
    } else {
      external++;
    }
  }
  return { internal, external };
}

// ── SEO Score Engine (deterministic, no AI) ──────────────────────────────────

export type SEOCheck = {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
};

export type SEOScoreResult = {
  score: number;  // 0-100
  checks: SEOCheck[];
};

export type SEOInput = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  content: string;       // HTML content
  slug: string;
  hasFeaturedImage: boolean;
  hasCanonical: boolean;
  hasOgImage: boolean;
};

export function calculateSEOScore(input: SEOInput): SEOScoreResult {
  const plainText = htmlToPlainText(input.content).toLowerCase();
  const keyword = input.focusKeyword.toLowerCase().trim();
  const wordCount = countWords(plainText);
  const headings = countHeadings(input.content);
  const links = countLinks(input.content);

  const checks: SEOCheck[] = [
    {
      id: "meta_title",
      label: "Meta title is set",
      passed: input.metaTitle.length > 0,
      weight: 10,
    },
    {
      id: "meta_title_length",
      label: "Meta title 30-60 characters",
      passed: input.metaTitle.length >= 30 && input.metaTitle.length <= 60,
      weight: 5,
    },
    {
      id: "meta_description",
      label: "Meta description is set",
      passed: input.metaDescription.length > 0,
      weight: 10,
    },
    {
      id: "meta_desc_length",
      label: "Meta description 120-160 characters",
      passed: input.metaDescription.length >= 120 && input.metaDescription.length <= 160,
      weight: 5,
    },
    {
      id: "featured_image",
      label: "Featured image is set",
      passed: input.hasFeaturedImage,
      weight: 10,
    },
    {
      id: "keyword_set",
      label: "Focus keyword is defined",
      passed: keyword.length > 0,
      weight: 5,
    },
    {
      id: "keyword_in_title",
      label: "Keyword in title",
      passed: keyword.length > 0 && input.title.toLowerCase().includes(keyword),
      weight: 10,
    },
    {
      id: "keyword_in_meta",
      label: "Keyword in meta description",
      passed: keyword.length > 0 && input.metaDescription.toLowerCase().includes(keyword),
      weight: 5,
    },
    {
      id: "keyword_in_content",
      label: "Keyword in first paragraph",
      passed: keyword.length > 0 && plainText.slice(0, 500).includes(keyword),
      weight: 10,
    },
    {
      id: "content_length",
      label: "Content >500 words",
      passed: wordCount >= 500,
      weight: 10,
    },
    {
      id: "has_h2",
      label: "H2 headings exist",
      passed: headings.h2 > 0,
      weight: 5,
    },
    {
      id: "has_internal_links",
      label: "Has internal links",
      passed: links.internal > 0,
      weight: 5,
    },
    {
      id: "canonical",
      label: "Canonical URL set",
      passed: input.hasCanonical,
      weight: 5,
    },
    {
      id: "og_image",
      label: "OG image set",
      passed: input.hasOgImage,
      weight: 5,
    },
  ];

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earnedWeight = checks.filter((c) => c.passed).reduce((sum, c) => sum + c.weight, 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  return { score, checks };
}

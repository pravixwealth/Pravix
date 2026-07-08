import { config } from "./configuration.service";

/**
 * Server-side SEO configuration resolver.
 * Reads from ConfigurationService (cached DB reads).
 * Falls back to hardcoded defaults if DB is unavailable.
 *
 * Usage in Server Components / layouts:
 *   const seo = await getSeoConfig();
 *   // seo.siteName, seo.siteUrl, seo.socialProfiles, etc.
 */

export type SeoConfig = {
  siteName: string;
  siteShortName: string;
  siteDescription: string;
  siteTagline: string;
  siteUrl: string;
  defaultOgImage: string;
  defaultKeywords: string[];
  contactPhone: string;
  socialProfiles: {
    instagram: string | null;
    linkedin: string | null;
    youtube: string | null;
    facebook: string | null;
    twitter: string | null;
  };
  socialProfileUrls: string[];
  copyright: string;
};

// Hardcoded fallbacks (used if DB is unreachable)
const FALLBACKS = {
  siteName: "Pravix Wealth Management",
  siteShortName: "Pravix",
  siteDescription: "Pravix helps Indian families plan, track, and optimize long-term wealth goals using disciplined systems, real market context, and expert-backed guidance.",
  siteTagline: "Goal-Based Wealth Planning for Indian Families",
  siteUrl: "https://pravix.in",
  defaultOgImage: "/image/hero-banner-3.png",
  contactPhone: "+918796215599",
  copyright: "© 2025 Pravix Wealth Management. All rights reserved.",
};

export async function getSeoConfig(): Promise<SeoConfig> {
  try {
    const [general, seo, social, contact] = await Promise.all([
      config.getGroup("general"),
      config.getGroup("seo"),
      config.getGroup("social"),
      config.getGroup("contact"),
    ]);

    const siteName = general.company_name || FALLBACKS.siteName;
    const siteShortName = general.company_short_name || FALLBACKS.siteShortName;
    const siteDescription = seo.seo_default_description || FALLBACKS.siteDescription;
    const siteTagline = general.company_tagline || FALLBACKS.siteTagline;
    const siteUrl = (general.site_url || FALLBACKS.siteUrl).replace(/\/+$/, "");
    const defaultOgImage = seo.seo_og_image || FALLBACKS.defaultOgImage;
    const contactPhone = contact.contact_phone || FALLBACKS.contactPhone;
    const copyright = general.copyright_text || FALLBACKS.copyright;

    const keywordsRaw = seo.seo_default_keywords || "";
    const defaultKeywords = keywordsRaw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const socialProfiles = {
      instagram: social.social_instagram || null,
      linkedin: social.social_linkedin || null,
      youtube: social.social_youtube || null,
      facebook: social.social_facebook || null,
      twitter: social.social_twitter || null,
    };

    const socialProfileUrls = Object.values(socialProfiles).filter(
      (url): url is string => url !== null && url.length > 0
    );

    return {
      siteName,
      siteShortName,
      siteDescription,
      siteTagline,
      siteUrl,
      defaultOgImage,
      defaultKeywords,
      contactPhone,
      socialProfiles,
      socialProfileUrls,
      copyright,
    };
  } catch {
    // DB unavailable — return hardcoded fallbacks
    return {
      siteName: FALLBACKS.siteName,
      siteShortName: FALLBACKS.siteShortName,
      siteDescription: FALLBACKS.siteDescription,
      siteTagline: FALLBACKS.siteTagline,
      siteUrl: FALLBACKS.siteUrl,
      defaultOgImage: FALLBACKS.defaultOgImage,
      defaultKeywords: [],
      contactPhone: FALLBACKS.contactPhone,
      socialProfiles: { instagram: null, linkedin: null, youtube: null, facebook: null, twitter: null },
      socialProfileUrls: [],
      copyright: FALLBACKS.copyright,
    };
  }
}

/**
 * Helper to build absolute URL from the resolved siteUrl.
 */
export function buildAbsoluteUrl(siteUrl: string, path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

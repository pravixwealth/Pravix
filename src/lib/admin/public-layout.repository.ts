import { createClient } from "@supabase/supabase-js";
import { getMenuItems } from "./repositories/navigation.repository";
import type { NavItem } from "./repositories/navigation.repository";

/**
 * PublicLayoutRepository — single composition layer for public website data.
 *
 * Fetches all CMS data needed by the public layout in ONE parallel call:
 * - Header navigation items
 * - Footer navigation columns
 * - Business settings (branding, contact, social)
 * - Site content (footer text, CTAs)
 *
 * Used by the PublicLayoutProvider in the root layout.
 * All client components receive this data via React Context.
 */

export type PublicLayoutData = {
  nav: {
    header: Array<{ label: string; href: string }>;
    footerCol1: Array<{ label: string; href: string }>;
    footerCol2: Array<{ label: string; href: string }>;
    footerCol3: Array<{ label: string; href: string }>;
  };
  branding: {
    companyName: string;
    shortName: string;
    tagline: string;
    logoUrl: string;
    primaryColor: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    address: string | null;
  };
  social: {
    instagram: string | null;
    linkedin: string | null;
    youtube: string | null;
    facebook: string | null;
    twitter: string | null;
  };
  footer: {
    description: string;
    copyright: string;
    ctaLabel: string;
    ctaHref: string;
    about: string;
    socialHeading: string;
    disclaimer: string;
  };
};

// Fallback values if DB is unreachable
const FALLBACK: PublicLayoutData = {
  nav: {
    header: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Services", href: "/services" },
      { label: "Marketplace", href: "/#insights" },
      { label: "Blog", href: "/#blog" },
      { label: "Team Pravix", href: "/#about-us" },
      { label: "Contact", href: "/#contact-us" },
    ],
    footerCol1: [],
    footerCol2: [],
    footerCol3: [],
  },
  branding: {
    companyName: "Pravix Wealth Management",
    shortName: "Pravix",
    tagline: "Goal-Based Wealth Planning for Indian Families",
    logoUrl: "/image/pravix-visualmark.png",
    primaryColor: "#2b5cff",
  },
  contact: {
    phone: "+918796215599",
    email: "info@pravix.in",
    whatsapp: "+918796215599",
    address: null,
  },
  social: {
    instagram: "https://www.instagram.com/pravixwealth/",
    linkedin: "https://www.linkedin.com/company/pravix-wealth-management/",
    youtube: "https://www.youtube.com/@PRAVIXwealth",
    facebook: "https://www.facebook.com/people/Pravix-Wealth-Management/61588755566789/",
    twitter: null,
  },
  footer: {
    description: "Goal-based wealth planning for Indian families, with dashboards, market context, and guided onboarding.",
    copyright: "© 2025 Pravix Wealth Management. All rights reserved.",
    ctaLabel: "Book a Free Call",
    ctaHref: "/#contact-us",
    about: "Pravix helps households organize goals, tax planning, and investment decisions into one disciplined system.",
    socialHeading: "Follow Pravix for real financial insights",
    disclaimer: "Pravix provides educational and informational content. It is not personalized investment advice. Investments are subject to market risk. Review relevant documents carefully and consult a qualified professional before making decisions.",
  },
};

function navItemsToLinks(items: NavItem[]): Array<{ label: string; href: string }> {
  return items.map((item) => ({ label: item.label, href: item.href }));
}

export async function getPublicLayoutData(): Promise<PublicLayoutData> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return FALLBACK;
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    // Parallel fetch: navigation + settings + content
    const [headerNav, footerCol1, footerCol2, footerCol3, settingsRows, contentRows] =
      await Promise.all([
        getMenuItems(supabase, "header"),
        getMenuItems(supabase, "footer_col1"),
        getMenuItems(supabase, "footer_col2"),
        getMenuItems(supabase, "footer_col3"),
        supabase
          .from("business_settings")
          .select("key, value")
          .in("group_key", ["general", "branding", "contact", "social"]),
        supabase
          .from("site_content")
          .select("key, value")
          .eq("group_key", "footer"),
      ]);

    // Build settings map
    const settings: Record<string, string | null> = {};
    if (settingsRows.data) {
      for (const row of settingsRows.data) {
        settings[row.key as string] = (row.value as string) ?? null;
      }
    }

    // Build content map
    const content: Record<string, string | null> = {};
    if (contentRows.data) {
      for (const row of contentRows.data) {
        content[row.key as string] = (row.value as string) ?? null;
      }
    }

    return {
      nav: {
        header: headerNav.success && headerNav.data.length > 0
          ? navItemsToLinks(headerNav.data)
          : FALLBACK.nav.header,
        footerCol1: footerCol1.success ? navItemsToLinks(footerCol1.data) : [],
        footerCol2: footerCol2.success ? navItemsToLinks(footerCol2.data) : [],
        footerCol3: footerCol3.success ? navItemsToLinks(footerCol3.data) : [],
      },
      branding: {
        companyName: settings.company_name || FALLBACK.branding.companyName,
        shortName: settings.company_short_name || FALLBACK.branding.shortName,
        tagline: settings.company_tagline || FALLBACK.branding.tagline,
        logoUrl: settings.logo_url || FALLBACK.branding.logoUrl,
        primaryColor: settings.primary_color || FALLBACK.branding.primaryColor,
      },
      contact: {
        phone: settings.contact_phone || FALLBACK.contact.phone,
        email: settings.contact_email || FALLBACK.contact.email,
        whatsapp: settings.contact_whatsapp || FALLBACK.contact.whatsapp,
        address: settings.contact_address || null,
      },
      social: {
        instagram: settings.social_instagram || FALLBACK.social.instagram,
        linkedin: settings.social_linkedin || FALLBACK.social.linkedin,
        youtube: settings.social_youtube || FALLBACK.social.youtube,
        facebook: settings.social_facebook || FALLBACK.social.facebook,
        twitter: settings.social_twitter || null,
      },
      footer: {
        description: content.footer_description || FALLBACK.footer.description,
        copyright: content.footer_copyright || FALLBACK.footer.copyright,
        ctaLabel: content.footer_cta_label || FALLBACK.footer.ctaLabel,
        ctaHref: content.footer_cta_href || FALLBACK.footer.ctaHref,
        about: content.footer_about || FALLBACK.footer.about,
        socialHeading: content.footer_social_heading || FALLBACK.footer.socialHeading,
        disclaimer: content.footer_disclaimer || FALLBACK.footer.disclaimer,
      },
    };
  } catch {
    return FALLBACK;
  }
}

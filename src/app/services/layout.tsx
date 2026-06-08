import type { Metadata } from "next";
import { absoluteUrl, defaultOgImage } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Financial Planning, Tax, Insurance & Business Advisory Services | Pravix",
  description:
    "Explore Pravix financial planning, tax advisory, insurance, lending, and business consulting services designed for Indian individuals, families, and business owners.",
  keywords: [
    "Pravix services",
    "financial planning services India",
    "wealth management India",
    "tax filing and CA services India",
    "GST services India",
    "business advisory India",
    "virtual CFO services",
    "insurance solutions India",
    "home loan and business loan India",
    "lending solutions India",
  ],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Financial Planning, Tax, Insurance & Business Advisory Services | Pravix",
    description:
      "Explore Pravix financial planning, tax advisory, insurance, lending, and business consulting services designed for Indian individuals, families, and business owners.",
    url: absoluteUrl("/services"),
    type: "website",
    images: [{ url: defaultOgImage, alt: "Pravix Financial Services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Financial Planning, Tax, Insurance & Business Advisory Services | Pravix",
    description:
      "Explore Pravix financial planning, tax advisory, insurance, lending, and business consulting services designed for Indian individuals, families, and business owners.",
    images: [defaultOgImage],
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Financial Services — Pravix Wealth Management India",
  description:
    "Comprehensive financial services by Pravix: Wealth Management, Tax & CA Services, Business Advisory, Insurance Solutions, and Lending Solutions for Indian families and businesses.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Financial Services — Pravix Wealth Management India",
    description:
      "Comprehensive financial services: Wealth Management, Tax & CA, Business Advisory, Insurance, and Lending Solutions for Indian families and businesses.",
    url: absoluteUrl("/services"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Financial Services — Pravix Wealth Management India",
    description:
      "Comprehensive financial services: Wealth Management, Tax & CA, Business Advisory, Insurance, and Lending Solutions for Indian families and businesses.",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import {
  absoluteUrl,
  defaultOgImage,
  defaultSeoKeywords,
  organizationJsonLd,
  productJsonLd,
  siteDescription,
  siteName,
  siteTagline,
  siteUrl,
  websiteJsonLd,
} from "@/lib/seo";
import { getPublicLayoutData } from "@/lib/admin/public-layout.repository";
import { PublicLayoutProvider } from "@/components/PublicLayoutProvider";
import "./globals.css";

const GlobalFloatingPravixChat = dynamic(() => import("@/components/GlobalFloatingPravixChat"), {
  loading: () => null,
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: `${siteName} | ${siteTagline}`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: defaultSeoKeywords,
  authors: [{ name: "Pravix Wealth Management", url: absoluteUrl("/") }],
  creator: "Pravix Wealth Management",
  publisher: "Pravix Wealth Management",
  category: "Finance",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: absoluteUrl("/"),
    siteName,
    title: `${siteName} | ${siteTagline}`,
    description: siteDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${siteName} — ${siteTagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | ${siteTagline}`,
    description: siteDescription,
    images: [defaultOgImage],
  },
  icons: {
    icon: [
      { url: "/image/pravix-visualmark.png", type: "image/png" },
    ],
    apple: [
      { url: "/image/pravix-visualmark.png", type: "image/png" },
    ],
    shortcut: "/image/pravix-visualmark.png",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2b5cff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const layoutData = await getPublicLayoutData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${jakartaSans.variable} ${geistMono.variable} antialiased bg-finance-bg text-finance-text min-h-screen flex flex-col font-sans`}
      >
        <PublicLayoutProvider data={layoutData}>
          <GoogleAnalytics />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd()) }}
          />
          <main className="flex-grow flex flex-col">{children}</main>
          <div id="public-chrome">
            <GlobalFloatingPravixChat />
            <Footer layoutData={layoutData} />
          </div>
        </PublicLayoutProvider>
      </body>
    </html>
  );
}

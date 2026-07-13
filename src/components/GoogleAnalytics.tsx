import Script from "next/script";
import { config } from "@/lib/admin/configuration.service";

export default async function GoogleAnalytics() {
  // Read GA4 ID from CMS first, fall back to env var
  let gaId: string | null = null;

  try {
    gaId = await config.get("analytics_ga4_id");
  } catch {
    // DB unavailable — fall back to env
  }

  if (!gaId) {
    gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null;
  }

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

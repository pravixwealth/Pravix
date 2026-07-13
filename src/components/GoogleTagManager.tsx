import Script from "next/script";
import { config } from "@/lib/admin/configuration.service";

/**
 * Google Tag Manager â€” loads GTM on every page.
 * Reads GTM ID from admin settings, falls back to hardcoded ID.
 */
export async function GoogleTagManagerHead() {
  let gtmId: string | null = null;

  try {
    gtmId = await config.get("analytics_gtm_id");
  } catch {
    // DB unavailable
  }

  if (!gtmId) {
    gtmId = "GTM-T36XQM8W";
  }

  if (!gtmId) return null;

  return (
    <Script id="gtm-head" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
    </Script>
  );
}

export async function GoogleTagManagerBody() {
  let gtmId: string | null = null;

  try {
    gtmId = await config.get("analytics_gtm_id");
  } catch {
    // DB unavailable
  }

  if (!gtmId) {
    gtmId = "GTM-T36XQM8W";
  }

  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ServicesMindmap from "@/components/ServicesMindmap";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Investment Services — Pravix Wealth Management",
  description:
    "Explore Pravix investment services: HNI wealth management, curated mutual fund portfolios, corporate bonds, and alternative products like IPOs and NFOs for Indian families.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Investment Services — Pravix Wealth Management",
    description:
      "Explore Pravix investment services: HNI wealth management, curated mutual fund portfolios, corporate bonds, and alternative products for Indian families.",
    url: absoluteUrl("/services"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Investment Services — Pravix Wealth Management",
    description:
      "Explore Pravix investment services: HNI wealth management, curated mutual fund portfolios, corporate bonds, and alternative products for Indian families.",
  },
};

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f2f7ff] via-[#edf5ff] to-[#e4f0ff] pb-20 pt-28">
        {/* Creative Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[800px] w-[800px] rounded-full bg-gradient-to-b from-[#2b5cff]/10 to-[#04bfff]/5 blur-[120px]" />
          <div className="absolute -bottom-60 -left-60 h-[900px] w-[900px] rounded-full bg-gradient-to-t from-[#04bfff]/10 to-[#2b5cff]/5 blur-[150px]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+CjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSIjMmI1Y2ZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>

        <section className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-6">
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_22px_48px_rgba(16,47,103,0.12)] backdrop-blur-md md:p-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#c9daf9] bg-[#f4f8ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-finance-muted">
              <Briefcase className="h-3.5 w-3.5 text-finance-accent" />
              Investment Services
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-finance-text md:text-5xl">
              Services Mindmap
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-finance-muted md:text-base">
              Explore Pravix services through an interactive map. Click any node to view the offering, where it fits,
              and what value it adds to your portfolio plan.
            </p>

            <ServicesMindmap />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/#book-discovery-call"
                className="inline-flex items-center justify-center rounded-full bg-[#2b5cff] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(43,92,255,0.28)] hover:bg-[#224ed8]"
              >
                Book A Service Call
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center rounded-full border border-[#d1def8] bg-white px-5 py-2.5 text-sm font-semibold text-[#23467f] hover:bg-[#f5f8ff]"
              >
                Get Guided Plan
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import CalendlyBookingSection from "@/components/CalendlyBookingSection";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Pravix Wealth Management. Book a free discovery call or send us an inquiry about financial planning, investment advisory, and wealth management.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Pravix",
    description:
      "Connect with certified wealth architects at Pravix. Book a free call or send an inquiry for personalized financial planning.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <div className="pt-20">
        <CalendlyBookingSection />
      </div>
    </>
  );
}

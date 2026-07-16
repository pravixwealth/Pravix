import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
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
        {/* Contact Info Bar */}
        <section className="w-full bg-[#f8fafc] border-b border-[#e2e8f0]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
                Get in Touch
              </h1>
              <p className="mt-3 text-lg text-[#475569] max-w-2xl mx-auto">
                Have questions about wealth planning? We&apos;re here to help. Reach out through any channel below or fill the inquiry form.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Phone */}
              <a
                href="tel:+918796215599"
                className="group flex flex-col items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center transition-all hover:border-blue-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Phone</p>
                  <p className="mt-1 text-sm font-semibold text-[#0f172a]">+91 87962 15599</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:info@pravix.in"
                className="group flex flex-col items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center transition-all hover:border-blue-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Email</p>
                  <p className="mt-1 text-sm font-semibold text-[#0f172a]">info@pravix.in</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/918796215599?text=Hi%20Pravix%2C%20I%20want%20to%20connect%20regarding%20wealth%20planning."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center transition-all hover:border-green-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">WhatsApp</p>
                  <p className="mt-1 text-sm font-semibold text-[#0f172a]">+91 87962 15599</p>
                </div>
              </a>

              {/* Office Hours */}
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Office Hours</p>
                  <p className="mt-1 text-sm font-semibold text-[#0f172a]">Mon – Sat, 10 AM – 7 PM</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mt-8 flex items-start justify-center gap-3 text-center">
              <MapPin className="h-5 w-5 text-[#64748b] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Pravix Wealth Management</p>
                <p className="text-sm text-[#64748b]">India</p>
              </div>
            </div>
          </div>
        </section>

        {/* Inquiry Form — same as homepage */}
        <CalendlyBookingSection />

        {/* Google Map or additional trust section */}
        <section className="w-full bg-[#f8fafc] border-t border-[#e2e8f0] py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-[#0f172a]">Why Reach Out?</h2>
            <p className="mt-3 text-[#475569] max-w-2xl mx-auto">
              Whether you&apos;re starting your investment journey or looking to optimize an existing portfolio, our certified advisors provide personalized guidance with zero conflict of interest.
            </p>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <p className="text-3xl font-black text-[#2b5cff]">4 hrs</p>
                <p className="mt-2 text-sm text-[#64748b]">Average response time during business hours</p>
              </div>
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <p className="text-3xl font-black text-[#2b5cff]">100%</p>
                <p className="mt-2 text-sm text-[#64748b]">Fee-only advisory — zero hidden commissions</p>
              </div>
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6">
                <p className="text-3xl font-black text-[#2b5cff]">Free</p>
                <p className="mt-2 text-sm text-[#64748b]">Discovery call to understand your goals</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

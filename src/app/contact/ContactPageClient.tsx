"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react";

export default function ContactPageClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setSubmitError("Please fill in your name, email and a short message.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrejzwja";

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          page: typeof window !== "undefined" ? window.location.pathname : "/contact",
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        setIsSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
      } else {
        throw new Error(json.error || json.message || "Submission failed. Try again later.");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero + Form Section */}
      <section className="relative w-full overflow-hidden bg-white py-20 px-4 sm:px-6 lg:px-8">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-blue-50/80 to-indigo-50/40 blur-[100px]" />
          <div className="absolute top-60 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-slate-50 to-blue-50/30 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
            {/* Left: Copy + Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 text-blue-700 text-sm font-bold tracking-wide uppercase w-fit mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                Contact Pravix
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-[#0f172a] leading-[1.1] tracking-tight">
                Let&apos;s build your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                  financial future
                </span>
                .
              </h1>

              <p className="mt-5 text-lg text-[#475569] leading-relaxed max-w-lg">
                Reach out for personalized wealth advisory, portfolio reviews, or any questions about goal-based investing. We respond within 4 business hours.
              </p>

              {/* Contact Cards */}
              <div className="mt-10 space-y-4">
                <a
                  href="tel:+918796215599"
                  className="group flex items-center gap-4 rounded-2xl border border-[#e8edf3] bg-[#f8fafc] p-5 transition-all hover:bg-white hover:border-blue-200 hover:shadow-md"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
                  >
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">Call Us</p>
                    <p className="mt-0.5 text-base font-semibold text-[#0f172a] group-hover:text-blue-700 transition-colors">
                      +91 87962 15599
                    </p>
                  </div>
                </a>

                <a
                  href="mailto:info@pravix.in"
                  className="group flex items-center gap-4 rounded-2xl border border-[#e8edf3] bg-[#f8fafc] p-5 transition-all hover:bg-white hover:border-indigo-200 hover:shadow-md"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">Email</p>
                    <p className="mt-0.5 text-base font-semibold text-[#0f172a] group-hover:text-indigo-700 transition-colors">
                      info@pravix.in
                    </p>
                  </div>
                </a>

                <a
                  href="https://wa.me/918796215599?text=Hi%20Pravix%2C%20I%20want%20to%20connect%20regarding%20wealth%20planning."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-[#e8edf3] bg-[#f8fafc] p-5 transition-all hover:bg-white hover:border-green-200 hover:shadow-md"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 14px rgba(34,197,94,0.3)" }}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">WhatsApp</p>
                    <p className="mt-0.5 text-base font-semibold text-[#0f172a] group-hover:text-green-700 transition-colors">
                      +91 87962 15599
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-4 rounded-2xl border border-[#e8edf3] bg-[#f8fafc] p-5">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #475569, #1e293b)", boxShadow: "0 4px 14px rgba(71,85,105,0.3)" }}
                  >
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">Registered Office</p>
                    <p className="mt-0.5 text-base font-semibold text-[#0f172a]">BSI Business Park C51 Office 105</p>
                    <p className="text-sm text-[#64748b]">Noida 62, Uttar Pradesh 201301</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="relative"
            >
              <div className="relative rounded-[2rem] bg-white border border-[#e2e8f0] shadow-[0_24px_80px_-12px_rgba(15,23,42,0.1)] p-8 sm:p-10 overflow-hidden">
                {/* Decorative corner gradient */}
                <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-gradient-to-bl from-blue-50/60 to-transparent rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4" />

                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Send an Inquiry</h2>
                  <p className="mt-2 text-sm text-[#64748b]">
                    Fill in your details and we&apos;ll get back within 4 business hours.
                  </p>

                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                      {submitError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700 text-sm font-medium flex items-start gap-3"
                        >
                          <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span>{submitError}</span>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-[#334155]">Full Name *</label>
                          <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            type="text"
                            placeholder="John Doe"
                            className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-[#334155]">Email Address *</label>
                          <input
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            type="email"
                            placeholder="john@example.com"
                            className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-[#334155]">Phone Number</label>
                          <input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            type="tel"
                            placeholder="+91 87962 15599"
                            className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-[#334155]">Inquiry Type</label>
                          <div className="relative">
                            <select
                              value={formData.subject}
                              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                              className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm appearance-none"
                            >
                              <option>General Inquiry</option>
                              <option>Wealth Advisory</option>
                              <option>Portfolio Review</option>
                              <option>Tax Planning</option>
                              <option>Retirement Planning</option>
                              <option>Goal-Based Investing</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                              <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#334155]">How can we help? *</label>
                        <textarea
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={4}
                          placeholder="Tell us about your financial goals or questions..."
                          className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full flex justify-center items-center gap-2.5 py-4 px-8 bg-[#0f172a] text-white font-bold text-base rounded-xl overflow-hidden transition-all hover:shadow-[0_8px_30px_-5px_rgba(15,23,42,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10 flex items-center gap-2.5">
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" /> Sending...
                            </>
                          ) : (
                            <>
                              Submit Inquiry
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </>
                          )}
                        </span>
                      </button>

                      <p className="text-center text-xs text-[#94a3b8]">
                        We respect your privacy. No spam, ever.
                      </p>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-8 text-center py-14 px-4"
                    >
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-60" />
                        <div className="relative bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full w-full h-full flex items-center justify-center shadow-lg shadow-green-500/30">
                          <CheckCircle2 className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">Inquiry Received!</h3>
                      <p className="mt-3 text-[#475569] max-w-sm mx-auto leading-relaxed">
                        A Pravix wealth advisor will contact you within 4 business hours.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsSubmitted(false)}
                        className="mt-8 inline-flex items-center justify-center px-6 py-3 border-2 border-[#e2e8f0] rounded-xl text-[#0f172a] font-semibold hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section className="w-full bg-[#f8fafc] border-t border-[#e2e8f0] py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Why Families Trust Pravix</h2>
            <p className="mt-3 text-[#475569] max-w-xl mx-auto">
              Transparent, goal-driven advisory built for long-term financial peace of mind.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center">
              <p className="text-4xl font-black text-[#2b5cff]">&lt; 4 hrs</p>
              <p className="mt-3 text-sm text-[#64748b] leading-relaxed">Average response time during business hours</p>
            </div>
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center">
              <p className="text-4xl font-black text-[#2b5cff]">100%</p>
              <p className="mt-3 text-sm text-[#64748b] leading-relaxed">Fee-only advisory with zero hidden commissions</p>
            </div>
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center">
              <p className="text-4xl font-black text-[#2b5cff]">Free</p>
              <p className="mt-3 text-sm text-[#64748b] leading-relaxed">30-min discovery call to understand your goals</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

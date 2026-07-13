"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  ChevronDown,
  ClipboardCheck,
  CheckCircle2,
  Gem,
  HandCoins,
  Handshake,
  HeartHandshake,
  LineChart,
  Receipt,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import QuickConnectButton from "@/components/QuickConnectButton";
import { AnimatePresence, motion } from "framer-motion";
import { absoluteUrl, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";

type ServiceId = "wealth" | "tax" | "business" | "insurance" | "lending";

type ServiceNode = {
  id: ServiceId;
  title: string;
  tagline: string;
  icon: typeof Briefcase;
  summary: string;
  services: string[];
  highlights: string[];
  suitableFor: string[];
};

// ── Single source of truth for the mindmap hero + showcase cards ────────────
const SERVICES: ServiceNode[] = [
  {
    id: "wealth",
    title: "Wealth Management",
    tagline: "Grow and protect your long-term wealth.",
    icon: Gem,
    summary:
      "Goal-based wealth creation for families and professionals — financial planning, investment advisory, and retirement strategy built around your life goals and risk profile.",
    services: [
      "Financial Planning",
      "Investment Advisory",
      "Retirement Planning",
      "Child Education Planning",
      "Portfolio Review",
      "Goal-Based Wealth Creation",
    ],
    highlights: [
      "Personalized financial plans linked to real life goals",
      "Investment advisory across equity, debt, and mutual funds",
      "Retirement and child education planning roadmaps",
      "Periodic portfolio reviews and rebalancing",
    ],
    suitableFor: [
      "Salaried professionals and growing families",
      "Investors seeking disciplined, goal-linked execution",
      "Anyone planning retirement or education milestones",
    ],
  },
  {
    id: "tax",
    title: "Tax & CA Services",
    tagline: "Stay compliant and tax-efficient year-round.",
    icon: Receipt,
    summary:
      "Complete tax and chartered-accountancy support — from income tax and GST filing to accounting, payroll, and audit assistance for individuals and businesses.",
    services: [
      "Income Tax Filing",
      "Tax Planning",
      "GST Services",
      "Accounting & Bookkeeping",
      "Payroll Management",
      "Audit Support",
    ],
    highlights: [
      "Accurate income tax filing and proactive tax planning",
      "End-to-end GST registration and return filing",
      "Accounting, bookkeeping, and payroll management",
      "Audit support and statutory compliance",
    ],
    suitableFor: [
      "Salaried individuals and professionals",
      "Small businesses and startups",
      "Anyone seeking year-round tax efficiency",
    ],
  },
  {
    id: "business",
    title: "Business Advisory",
    tagline: "Build and scale your business with confidence.",
    icon: Building2,
    summary:
      "Strategic support for founders and business owners — company setup, virtual CFO services, valuation, fundraising, and compliance under one roof.",
    services: [
      "Company Registration",
      "Startup Advisory",
      "Virtual CFO Services",
      "Business Valuation",
      "Fundraising Support",
      "Compliance Management",
    ],
    highlights: [
      "Company registration and startup structuring",
      "Virtual CFO services for financial control",
      "Business valuation and fundraising support",
      "Ongoing regulatory compliance management",
    ],
    suitableFor: [
      "Early-stage startups and founders",
      "Growing SMEs needing financial leadership",
      "Businesses preparing to raise capital",
    ],
  },
  {
    id: "insurance",
    title: "Insurance Solutions",
    tagline: "Protect what matters most.",
    icon: ShieldCheck,
    summary:
      "Protection-first planning for your family and business — life, health, corporate, and keyman cover backed by structured risk management.",
    services: [
      "Life Insurance",
      "Health Insurance",
      "Corporate Insurance",
      "Keyman Insurance",
      "Risk Management Planning",
    ],
    highlights: [
      "Right-sized life and health insurance cover",
      "Corporate and group insurance solutions",
      "Keyman insurance for business continuity",
      "Holistic risk management planning",
    ],
    suitableFor: [
      "Families seeking complete protection",
      "Business owners safeguarding key people",
      "Anyone building a risk-aware financial base",
    ],
  },
  {
    id: "lending",
    title: "Lending Solutions",
    tagline: "Access the right funding at the right time.",
    icon: HandCoins,
    summary:
      "Access the right credit at the right time — home loans, business loans, loan against property, and working capital funding with structuring guidance.",
    services: [
      "Home Loans",
      "Business Loans",
      "Loan Against Property",
      "Working Capital Funding",
    ],
    highlights: [
      "Home loans with eligibility and structuring guidance",
      "Business loans and working capital funding",
      "Loan against property for liquidity needs",
      "Support across documentation and approvals",
    ],
    suitableFor: [
      "Home buyers and property owners",
      "Businesses needing growth or working capital",
      "Borrowers seeking better loan structuring",
    ],
  },
];

// Pentagon layout around the central node (desktop mindmap)
const NODE_POSITION: Record<ServiceId, string> = {
  wealth: "left-1/2 top-[13%] -translate-x-1/2 -translate-y-1/2",
  tax: "left-[85%] top-[42%] -translate-x-1/2 -translate-y-1/2",
  business: "left-[71%] top-[86%] -translate-x-1/2 -translate-y-1/2",
  insurance: "left-[29%] top-[86%] -translate-x-1/2 -translate-y-1/2",
  lending: "left-[15%] top-[42%] -translate-x-1/2 -translate-y-1/2",
};

const NODE_WIDTH: Record<ServiceId, string> = {
  wealth: "w-[210px]",
  tax: "w-[210px]",
  business: "w-[210px]",
  insurance: "w-[210px]",
  lending: "w-[210px]",
};

// SVG endpoints (viewBox 0 0 100 100, preserveAspectRatio none) from center (50,50)
const NODE_LINE: Record<ServiceId, { x: number; y: number }> = {
  wealth: { x: 50, y: 13 },
  tax: { x: 85, y: 42 },
  business: { x: 71, y: 86 },
  insurance: { x: 29, y: 86 },
  lending: { x: 15, y: 42 },
};

const WHY_CHOOSE = [
  {
    icon: BadgeCheck,
    title: "Certified Financial Experts",
    desc: "Qualified planners, CAs, and advisors guiding every financial decision.",
  },
  {
    icon: Target,
    title: "Personalized Wealth Solutions",
    desc: "Strategies tailored to your goals, income, and risk appetite.",
  },
  {
    icon: ClipboardCheck,
    title: "Tax & Compliance Expertise",
    desc: "Stay fully compliant while keeping more of what you earn.",
  },
  {
    icon: HeartHandshake,
    title: "End-to-End Financial Support",
    desc: "From planning to execution, everything handled in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent & Client-Centric Approach",
    desc: "Clear advice, honest pricing, and decisions made in your interest.",
  },
  {
    icon: Handshake,
    title: "One Financial Partner",
    desc: "Wealth, tax, business, insurance, and lending under one trusted roof.",
  },
];

const PROCESS_STEPS = [
  {
    icon: Search,
    title: "Understand Your Goals",
    desc: "We map your goals, income, and risk profile to build a clear baseline.",
  },
  {
    icon: ClipboardCheck,
    title: "Build Your Financial Strategy",
    desc: "A personalized plan across investments, tax, protection, and growth.",
  },
  {
    icon: Rocket,
    title: "Execute Recommendations",
    desc: "We help you act with the right products and structured guidance.",
  },
  {
    icon: LineChart,
    title: "Track Progress",
    desc: "Monitor milestones and portfolio health with regular reviews.",
  },
  {
    icon: RefreshCw,
    title: "Review & Optimize",
    desc: "Refine the plan as life, markets, and goals evolve.",
  },
];

const FAQS = [
  {
    question: "What financial planning services does Pravix provide?",
    answer:
      "Pravix offers end-to-end financial planning including goal-based wealth creation, investment advisory, retirement planning, child education planning, and periodic portfolio reviews tailored to Indian families and professionals.",
  },
  {
    question: "Does Pravix offer tax filing support?",
    answer:
      "Yes. Through our Tax & CA services we handle income tax filing, proactive tax planning, GST registration and returns, accounting and bookkeeping, payroll, and audit support for both individuals and businesses.",
  },
  {
    question: "Can Pravix help startups and business owners?",
    answer:
      "Absolutely. Our business advisory practice covers company registration, startup advisory, virtual CFO services, business valuation, fundraising support, and ongoing compliance management.",
  },
  {
    question: "What insurance solutions are available?",
    answer:
      "Pravix advises on life insurance, health insurance, corporate and group insurance, keyman insurance, and complete risk management planning to protect your family and business.",
  },
  {
    question: "Does Pravix assist with home and business loans?",
    answer:
      "Yes. Our lending solutions include home loans, business loans, loan against property, and working capital funding, with guidance on structuring, documentation, and eligibility.",
  },
];

// ── Structured data (JSON-LD) ───────────────────────────────────────────────
const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "Pravix Financial Services",
  url: absoluteUrl("/services"),
  areaServed: { "@type": "Country", name: "India" },
  description:
    "Pravix offers wealth management, tax & CA services, business advisory, insurance solutions, and lending solutions for Indian individuals, families, and business owners.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Pravix Financial Services",
    itemListElement: SERVICES.map((service) => ({
      "@type": "OfferCatalog",
      name: service.title,
      itemListElement: service.services.map((item) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: item },
      })),
    })),
  },
};

// ── Animation variants (staggered reveal) ───────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function ServicesPage() {
  const [activeId, setActiveId] = useState<ServiceId | null>(null);

  const activeService = useMemo(
    () => SERVICES.find((service) => service.id === activeId) ?? null,
    [activeId],
  );

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: absoluteUrl("/") },
              { name: "Services", url: absoluteUrl("/services") },
            ]),
          ),
        }}
      />

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f2f7ff] via-[#edf5ff] to-[#e4f0ff] pb-20 pt-28">
        {/* Creative Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-40 -top-40 h-[800px] w-[800px] rounded-full bg-gradient-to-b from-[#2b5cff]/10 to-[#04bfff]/5 blur-[120px]" />
          <div className="absolute -bottom-60 -left-60 h-[900px] w-[900px] rounded-full bg-gradient-to-t from-[#04bfff]/10 to-[#2b5cff]/5 blur-[150px]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+CjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSIjMmI1Y2ZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>

        {/* ════════════════════════ SECTION 1 — Service Showcase ════════════════════════ */}
        <section
          aria-labelledby="services-showcase-heading"
          className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-6"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#c9daf9] bg-[#f4f8ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-finance-muted">
              <Gem className="h-3.5 w-3.5 text-finance-accent" aria-hidden="true" />
              Our Services
            </p>
            <h1
              id="services-showcase-heading"
              className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-finance-text md:text-5xl"
            >
              Comprehensive Financial Solutions
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-finance-muted md:text-base">
              Everything you need to grow, protect, and manage your finances under one trusted platform.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <motion.article
                  key={`card-${service.id}`}
                  id={service.id}
                  variants={fadeUp}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-finance-border bg-white p-6 shadow-[0_14px_32px_rgba(16,47,103,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#b9cdf6] hover:shadow-[0_24px_48px_rgba(43,92,255,0.16)]"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-finance-accent/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 md:opacity-0" aria-hidden="true" />
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2b5cff] to-[#04bfff] text-white shadow-[0_8px_20px_rgba(4,191,255,0.3)] transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-finance-text">{service.title}</h3>
                      <p className="text-xs leading-snug text-finance-muted">{service.tagline}</p>
                    </div>
                  </div>

                  <ul className="mt-5 grid flex-1 gap-2.5">
                    {service.services.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-finance-muted">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-finance-accent" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(service.id);
                      document.getElementById("services-mindmap")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-finance-accent transition-colors hover:text-[#1e3a8a]"
                  >
                    Explore service
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                </motion.article>
              );
            })}

            {/* Closing CTA card */}
            <motion.article
              variants={fadeUp}
              className="flex h-full flex-col justify-between rounded-3xl border border-[#1f3a73] bg-gradient-to-br from-[#0a1930] to-[#1b3566] p-6 text-white shadow-[0_18px_40px_rgba(16,47,103,0.25)]"
            >
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Not sure where to start?</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#c5d6f7]">
                  Get a personalized plan that maps the right Pravix services to your goals, income, and risk profile.
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <QuickConnectButton variant="accent" label="Contact Us" />
              </div>
            </motion.article>
          </motion.div>
        </section>

        {/* ════════════════════════ SECTION 2 — Services Mindmap ════════════════════════ */}
        <section
          id="services-mindmap"
          aria-labelledby="services-mindmap-heading"
          className="relative z-10 mx-auto mt-16 w-full max-w-6xl px-5 sm:px-6 md:mt-20"
        >
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_22px_48px_rgba(16,47,103,0.12)] backdrop-blur-md md:p-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#c9daf9] bg-[#f4f8ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-finance-muted">
              <Briefcase className="h-3.5 w-3.5 text-finance-accent" aria-hidden="true" />
              Financial Services
            </p>
            <h2
              id="services-mindmap-heading"
              className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-finance-text md:text-4xl"
            >
              Services Mindmap
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-finance-muted md:text-base">
              Explore Pravix services through an interactive map. Click any node to view the offering, where it fits,
              and what value it adds to your financial plan.
            </p>

            <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#d8e5fb] bg-gradient-to-br from-white to-[#f4f8ff] p-4 md:p-6">
              <div className="hidden md:block">
                <div className="relative mx-auto h-[460px] max-w-[860px] rounded-[28px] border border-[#dce7fb] bg-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
                  {/* Radial connector lines from center to each node */}
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {SERVICES.map((service) => {
                      const point = NODE_LINE[service.id];
                      return (
                        <line
                          key={`line-${service.id}`}
                          x1={50}
                          y1={50}
                          x2={point.x}
                          y2={point.y}
                          stroke={service.id === activeId ? "#2b5cff" : "#bcd0f5"}
                          strokeWidth={service.id === activeId ? 0.5 : 0.3}
                          vectorEffect="non-scaling-stroke"
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>

                  <div className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#bcd1fb] bg-gradient-to-br from-[#2b5cff] to-[#04bfff] p-5 text-center text-white shadow-[0_16px_34px_rgba(30,85,215,0.35)]">
                    <div>
                      <p className="mt-1 inline-flex rounded-full border border-white/45 bg-white/20 px-3 py-1 text-base font-extrabold leading-tight tracking-[0.01em] text-white shadow-[0_6px_16px_rgba(4,191,255,0.35)] backdrop-blur-sm">
                        Pravix Financial Services
                      </p>
                    </div>
                  </div>

                  {SERVICES.map((service) => {
                    const Icon = service.icon;
                    const isActive = service.id === activeId;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setActiveId(service.id)}
                        onMouseEnter={() => setActiveId(service.id)}
                        aria-label={`View ${service.title} details`}
                        className={`group absolute ${NODE_POSITION[service.id]} ${NODE_WIDTH[service.id]} rounded-[28px] border p-2 transition-all duration-300 ${isActive
                            ? "z-20 scale-105 border-white bg-white shadow-[0_20px_48px_rgba(43,92,255,0.15)]"
                            : "z-10 border-white/60 bg-white/40 shadow-sm backdrop-blur-md hover:scale-105 hover:border-white hover:bg-white/80 hover:shadow-[0_12px_32px_rgba(43,92,255,0.1)]"
                          }`}
                      >
                        <div className="flex items-center gap-3.5 rounded-[20px] bg-gradient-to-br from-[#f8faff] to-white p-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,1)]">
                          <span
                            className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] shadow-sm transition-all duration-300 ${isActive
                                ? "bg-gradient-to-br from-[#2b5cff] to-[#04bfff] text-white shadow-[0_8px_20px_rgba(4,191,255,0.35)]"
                                : "bg-white text-[#2b5cff] shadow-[0_2px_8px_rgba(43,92,255,0.1)] group-hover:bg-[#f0f5ff] group-hover:shadow-[0_4px_12px_rgba(43,92,255,0.15)]"
                              }`}
                          >
                            <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} aria-hidden="true" />
                          </span>
                          <div className="flex-1 text-left">
                            <p
                              className={`text-[15px] font-bold leading-tight tracking-tight transition-colors duration-300 ${isActive ? "text-[#1e3a8a]" : "text-[#475569] group-hover:text-[#1e3a8a]"
                                }`}
                            >
                              {service.title}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Mobile: accordion cards ───────────────────────────────────── */}
              <div className="grid gap-3 md:hidden">
                {SERVICES.map((service) => {
                  const Icon = service.icon;
                  const isActive = service.id === activeId;

                  return (
                    <div key={`mobile-${service.id}`}>
                      <button
                        type="button"
                        onClick={() => setActiveId(isActive ? null : service.id)}
                        aria-expanded={isActive}
                        className={`group w-full rounded-[22px] border p-2 text-left transition-all duration-300 ${isActive
                            ? "border-[#dce7fb] bg-white shadow-[0_12px_32px_rgba(43,92,255,0.13)]"
                            : "border-white/60 bg-white/40 shadow-sm backdrop-blur-md active:bg-white/70"
                          }`}
                      >
                        <div className="flex items-center gap-3 rounded-[16px] bg-gradient-to-br from-[#f8faff] to-white p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,1)]">
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] shadow-sm transition-all duration-300 ${isActive
                                ? "bg-gradient-to-br from-[#2b5cff] to-[#04bfff] text-white shadow-[0_6px_16px_rgba(4,191,255,0.3)]"
                                : "bg-white text-[#2b5cff] shadow-[0_2px_6px_rgba(43,92,255,0.08)]"
                              }`}
                          >
                            <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} aria-hidden="true" />
                          </span>
                          <p
                            className={`flex-1 text-[15px] font-bold leading-tight tracking-tight transition-colors duration-300 ${isActive ? "text-[#1e3a8a]" : "text-[#475569]"}`}
                          >
                            {service.title}
                          </p>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-[#7f94bb] transition-transform duration-300 ${isActive ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        </div>
                      </button>

                      {/* Inline accordion detail */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 rounded-2xl border border-[#dce7fb] bg-white/90 p-4 shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7f94bb]">About</p>
                              <p className="mt-2 text-sm leading-relaxed text-finance-text">{service.summary}</p>
                              <div className="mt-3 grid gap-2">
                                {service.highlights.map((item) => (
                                  <div key={item} className="flex items-start gap-2.5 rounded-xl border border-[#e8effe] bg-[#f8faff] p-3">
                                    <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2b5cff]" />
                                    <p className="text-sm leading-relaxed text-finance-text">{item}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* ── Desktop overlay (hover/click on mindmap nodes) ──────────── */}
              <AnimatePresence>
                {activeService && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-30 hidden items-center justify-center bg-[#eaf2ff]/40 p-6 backdrop-blur-[12px] md:flex"
                    onClick={() => setActiveId(null)}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    <motion.section
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="w-full max-w-3xl rounded-3xl border border-white/50 bg-white/60 p-6 shadow-[0_28px_56px_rgba(16,47,103,0.25)] backdrop-blur-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7f94bb]">Service Snapshot</p>
                          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-finance-text">{activeService.title}</h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveId(null)}
                          className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-red-600 shadow-md backdrop-blur-md transition-all hover:bg-red-100 hover:scale-105 hover:shadow-lg active:scale-95"
                        >
                          Close
                        </button>
                      </div>

                      <article className="mt-4 rounded-2xl border border-white/40 bg-white/40 p-4 shadow-sm backdrop-blur-md">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7f94bb]">About</p>
                        <p className="mt-2 text-sm leading-relaxed text-finance-text">{activeService.summary}</p>
                      </article>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {activeService.highlights.slice(0, 4).map((item) => (
                          <article key={item} className="flex items-center rounded-2xl border border-white/40 bg-white/40 p-4 shadow-sm backdrop-blur-md">
                            <p className="text-sm leading-relaxed text-finance-text">{item}</p>
                          </article>
                        ))}
                      </div>
                    </motion.section>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex justify-center">
              <QuickConnectButton variant="dark" label="Contact Us" />
            </div>
          </div>
        </section>

        {/* ════════════════════════ SECTION 3 — Why Choose Pravix ════════════════════════ */}
        <section
          id="why-choose-pravix"
          aria-labelledby="why-choose-heading"
          className="relative z-10 mx-auto mt-16 w-full max-w-6xl px-5 sm:px-6 md:mt-20"
        >
          <div className="rounded-[30px] border border-finance-border bg-[linear-gradient(160deg,#ffffff_0%,#eef4ff_100%)] p-6 shadow-[0_22px_48px_rgba(16,47,103,0.08)] md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#c9daf9] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-finance-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-finance-accent" aria-hidden="true" />
                Why Pravix
              </p>
              <h2
                id="why-choose-heading"
                className="mt-3 text-3xl font-semibold tracking-tight text-finance-text md:text-4xl"
              >
                Why Choose Pravix
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-finance-muted md:text-base">
                A single, accountable partner combining expertise across wealth, tax, business, insurance, and lending.
              </p>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {WHY_CHOOSE.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    variants={fadeUp}
                    className="group rounded-2xl border border-finance-border bg-white p-6 shadow-[0_10px_26px_rgba(16,47,103,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(43,92,255,0.14)]"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-finance-accent/10 text-finance-accent transition-all duration-300 group-hover:bg-finance-accent group-hover:text-white">
                      <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-finance-text">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-finance-muted">{item.desc}</p>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════ SECTION 4 — How Pravix Works ════════════════════════ */}
        <section
          id="how-pravix-works"
          aria-labelledby="how-it-works-heading"
          className="relative z-10 mx-auto mt-16 w-full max-w-6xl px-5 sm:px-6 md:mt-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#c9daf9] bg-[#f4f8ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-finance-muted">
              <Target className="h-3.5 w-3.5 text-finance-accent" aria-hidden="true" />
              Our Process
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-finance-text md:text-4xl"
            >
              How Pravix Works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-finance-muted md:text-base">
              A clear, five-step journey from understanding your goals to optimizing your plan over time.
            </p>
          </div>

          <div className="relative mt-12">
            {/* Connecting line (desktop) */}
            <div
              className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-[#9fb9ef] to-transparent lg:block"
              aria-hidden="true"
            />
            <motion.ol
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5"
            >
              {PROCESS_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.li
                    key={step.title}
                    variants={fadeUp}
                    className="relative flex flex-col items-center text-center"
                  >
                    <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2b5cff] to-[#04bfff] text-white shadow-[0_10px_24px_rgba(4,191,255,0.32)]">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-finance-text text-[11px] font-bold text-white">
                        {index + 1}
                      </span>
                    </span>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-finance-text">{step.title}</h3>
                    <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-finance-muted">{step.desc}</p>
                  </motion.li>
                );
              })}
            </motion.ol>
          </div>
        </section>

        {/* ════════════════════════ SECTION 5 — FAQ ════════════════════════ */}
        <section
          id="services-faq"
          aria-labelledby="faq-heading"
          className="relative z-10 mx-auto mt-16 w-full max-w-3xl px-5 sm:px-6 md:mt-20"
        >
          <div className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#c9daf9] bg-[#f4f8ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-finance-muted">
              <ClipboardCheck className="h-3.5 w-3.5 text-finance-accent" aria-hidden="true" />
              FAQ
            </p>
            <h2
              id="faq-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-finance-text md:text-4xl"
            >
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-finance-muted md:text-base">
              Answers to common questions about Pravix financial services.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-finance-border bg-white shadow-[0_10px_26px_rgba(16,47,103,0.05)] transition-shadow hover:shadow-[0_14px_32px_rgba(16,47,103,0.09)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-finance-text transition-colors hover:text-finance-accent">
                  {faq.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#7f94bb] transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="px-5 pb-4 text-sm leading-relaxed text-finance-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ════════════════════════ Final CTA ════════════════════════ */}
        <section
          id="services-cta"
          aria-labelledby="services-cta-heading"
          className="relative z-10 mx-auto mt-16 w-full max-w-6xl px-5 sm:px-6 md:mt-20"
        >
          <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0a1930,#1b3566)] p-8 text-center shadow-[0_24px_56px_rgba(16,47,103,0.28)] md:p-12">
            <h2 id="services-cta-heading" className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              One trusted partner for your entire financial life
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#c5d6f7] md:text-base">
              Wealth, tax, business, insurance, and lending — coordinated under one platform. Start with a guided plan
              or talk to a Pravix specialist.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-full bg-[#2b5cff] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(43,92,255,0.4)] transition-transform hover:-translate-y-0.5"
              >
                Get Your Guided Plan
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <QuickConnectButton variant="dark" label="Contact Us" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

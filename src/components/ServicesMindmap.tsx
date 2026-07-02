"use client";

import { useMemo, useState } from "react";
import { Briefcase, Building2, ChevronDown, Gem, Landmark, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ServiceNode = {
  id: "hni" | "mf-portfolio" | "corp-bonds" | "alts";
  title: string;
  shortLabel: string;
  icon: typeof Briefcase;
  summary: string;
  highlights: string[];
  suitableFor: string[];
};

const SERVICES: ServiceNode[] = [
  {
    id: "hni",
    title: "HNI Services",
    shortLabel: "HNI Services",
    icon: Gem,
    summary:
      "A relationship-led investment setup for affluent families, focused on capital growth, downside control, and tax-aware structuring.",
    highlights: [
      "Dedicated wealth specialist with quarterly strategy reviews",
      "Goal-linked allocation across equity, debt, and alternatives",
      "Tax-aware rebalancing framework under Indian market conditions",
      "Consolidated family-level portfolio tracking",
    ],
    suitableFor: [
      "Households with significant investable surplus",
      "Professionals and founders planning long-horizon wealth",
      "Families needing multi-goal and multi-account coordination",
    ],
  },
  {
    id: "mf-portfolio",
    title: "Mutual Fund Portfolio",
    shortLabel: "Mutual Fund Portfolio",
    icon: Landmark,
    summary:
      "Curated mutual fund portfolios built around risk profile, timeline, and SIP capacity with periodic optimization.",
    highlights: [
      "Model portfolios for conservative, balanced, and growth styles",
      "SIP + lump sum deployment playbooks",
      "Fund overlap, expense ratio, and consistency checks",
      "Review triggers for rebalancing and underperformance",
    ],
    suitableFor: [
      "Investors seeking disciplined SIP execution",
      "Users migrating from ad-hoc fund selection",
      "Long-term goals like retirement and education",
    ],
  },
  {
    id: "corp-bonds",
    title: "Corporate Bonds",
    shortLabel: "Corporate Bonds",
    icon: Building2,
    summary:
      "Income-focused fixed income opportunities with transparent issuer and tenure evaluation.",
    highlights: [
      "Issuer quality review and credit risk layering",
      "Laddering strategies for predictable cash flows",
      "Yield-to-maturity comparison across tenures",
      "Interest-rate sensitivity mapping for better entry timing",
    ],
    suitableFor: [
      "Investors targeting regular income",
      "Capital-preservation focused portfolios",
      "Clients balancing equity volatility with fixed income",
    ],
  },
  {
    id: "alts",
    title: "Alternative and Emerging Products",
    shortLabel: "Alternative & Emerging Products",
    icon: Sparkles,
    summary:
      "Comprehensive access to curated financial products including IPOs, comprehensive Life & Health insurance coverage, emerging NFOs, and secure Corporate FDs to complete your wealth strategy.",
    highlights: [
      "Early access and detailed analysis for high-potential IPOs and NFOs",
      "Tailored Life and Health insurance solutions for complete family protection",
      "Highly-rated Corporate FDs for predictable, stable income streams",
      "Strict due-diligence checklists to manage risk across all alternative assets",
    ],
    suitableFor: [
      "Experienced investors with core portfolios in place",
      "Users seeking non-correlated return sources",
      "Long-horizon allocations with measured risk appetite",
    ],
  },
];

const NODE_POSITION: Record<ServiceNode["id"], string> = {
  hni: "left-3 top-1/2 -translate-y-1/2",
  "mf-portfolio": "left-1/2 top-3 -translate-x-1/2",
  "corp-bonds": "right-3 top-1/2 -translate-y-1/2",
  alts: "left-1/2 bottom-3 -translate-x-1/2",
};

const NODE_WIDTH: Record<ServiceNode["id"], string> = {
  hni: "w-[240px]",
  "mf-portfolio": "w-[240px]",
  "corp-bonds": "w-[240px]",
  alts: "w-[276px]",
};

export default function ServicesMindmap() {
  const [activeId, setActiveId] = useState<ServiceNode["id"] | null>(null);

  const activeService = useMemo(
    () => SERVICES.find((service) => service.id === activeId) ?? null,
    [activeId],
  );

  return (
    <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#d8e5fb] bg-gradient-to-br from-white to-[#f4f8ff] p-4 md:p-6">
      <div className="hidden md:block">
        <div className="relative mx-auto h-[430px] max-w-[860px] rounded-[28px] border border-[#dce7fb] bg-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#9fb9ef] to-transparent" />
            <div className="absolute left-1/2 top-1/2 h-[72%] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#9fb9ef] to-transparent" />
          </div>

          <div className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#bcd1fb] bg-gradient-to-br from-[#2b5cff] to-[#04bfff] p-5 text-center text-white shadow-[0_16px_34px_rgba(30,85,215,0.35)]">
            <div>
              <p className="mt-1 inline-flex rounded-full border border-white/45 bg-white/20 px-3 py-1 text-base font-extrabold leading-tight tracking-[0.01em] text-white shadow-[0_6px_16px_rgba(4,191,255,0.35)] backdrop-blur-sm">
                Pravix investment service
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
                    <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
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
                    <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`} />
                  </span>
                  <p
                    className={`flex-1 text-[15px] font-bold leading-tight tracking-tight transition-colors duration-300 ${isActive ? "text-[#1e3a8a]" : "text-[#475569]"}`}
                  >
                    {service.title}
                  </p>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#7f94bb] transition-transform duration-300 ${isActive ? "rotate-180" : ""}`}
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
  );
}

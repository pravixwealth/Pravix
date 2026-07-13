"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { SEOScoreResult } from "@/lib/admin/content-utils";

type SEOHealthPanelProps = {
  result: SEOScoreResult;
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 50) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export function SEOHealthPanel({ result }: SEOHealthPanelProps) {
  const passed = result.checks.filter((c) => c.passed).length;
  const total = result.checks.length;

  return (
    <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#94a3b8]">SEO Score</p>
        <div className={`rounded-full border px-2.5 py-0.5 text-sm font-bold ${getScoreBg(result.score)} ${getScoreColor(result.score)}`}>
          {result.score}/100
        </div>
      </div>

      <p className="mt-2 text-xs text-[#64748b]">{passed}/{total} checks passed</p>

      <div className="mt-3 space-y-1.5">
        {result.checks.map((check) => (
          <div key={check.id} className="flex items-center gap-2">
            {check.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
            )}
            <span className={`text-xs ${check.passed ? "text-[#475569]" : "text-[#94a3b8]"}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

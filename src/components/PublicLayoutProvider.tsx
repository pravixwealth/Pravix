"use client";

import { createContext, useContext } from "react";
import type { PublicLayoutData } from "@/lib/admin/public-layout.repository";

const PublicLayoutContext = createContext<PublicLayoutData | null>(null);

type PublicLayoutProviderProps = {
  data: PublicLayoutData;
  children: React.ReactNode;
};

/**
 * Provides CMS-driven layout data to all client components.
 * Injected once at the root layout level (server fetches, client consumes).
 *
 * Any client component can call usePublicLayout() to access:
 * - nav.header (navigation items)
 * - branding (logo, company name, colors)
 * - contact (phone, email, whatsapp)
 * - social (profile URLs)
 * - footer (description, copyright, CTA)
 */
export function PublicLayoutProvider({ data, children }: PublicLayoutProviderProps) {
  return (
    <PublicLayoutContext.Provider value={data}>
      {children}
    </PublicLayoutContext.Provider>
  );
}

export function usePublicLayout(): PublicLayoutData {
  const context = useContext(PublicLayoutContext);
  if (!context) {
    throw new Error("usePublicLayout must be used within PublicLayoutProvider");
  }
  return context;
}

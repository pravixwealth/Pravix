"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Loader2, Mail, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const ALLOWED_ADMIN_EMAILS = [
  "usefullother6@gmail.com",
  "pravix10@gmail.com",
];

type Step = "email" | "otp";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
      setError("This email is not authorized for admin access.");
      return;
    }

    setLoading(true);

    try {
      // Use the existing custom OTP system (Resend email)
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to send verification code.");
        return;
      }

      setStep("otp");
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Verify OTP via custom endpoint
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          token: otp,
          password: password || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? "Invalid or expired code. Please try again.");
        return;
      }

      // If verify-email returned a session, set it
      if (data.session?.access_token && data.session?.refresh_token) {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      } else {
        // Fallback: try to sign in with password if session wasn't returned
        if (password) {
          const supabase = getSupabaseBrowserClient();
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
          if (signInError) {
            setError("OTP verified but sign-in failed. Please try logging in normally.");
            return;
          }
        } else {
          setError("OTP verified. Please enter your password to complete sign-in.");
          return;
        }
      }

      // Success — redirect to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafb] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2b5cff] text-white shadow-[0_8px_20px_rgba(43,92,255,0.3)]">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-[#0f172a]">Pravix Admin</h1>
          <p className="mt-1 text-sm text-[#64748b]">Sign in to manage your platform</p>
        </div>

        {/* Form */}
        <div className="mt-8 rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-[#0f172a]">
                  Admin Email
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    autoFocus
                    className="w-full rounded-lg border border-[#e2e8f0] bg-white py-2.5 pl-10 pr-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-[#0f172a]">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your account password"
                  className="mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20"
                />
                <p className="mt-1 text-[11px] text-[#94a3b8]">Required to complete sign-in after OTP verification.</p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2b5cff] py-2.5 text-sm font-medium text-white hover:bg-[#224ed8] disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Login Code
              </button>

              <div className="flex items-center gap-2 rounded-lg bg-[#f8fafc] px-3 py-2 text-xs text-[#64748b]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#2b5cff]" />
                Only authorized admin emails can access this panel.
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="admin-otp" className="block text-sm font-medium text-[#0f172a]">
                  Verification Code
                </label>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  Sent to {email.trim().toLowerCase()}
                </p>
                <input
                  id="admin-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  autoFocus
                  className="mt-2 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2.5 text-center text-2xl font-mono tracking-[0.3em] text-[#0f172a] focus:border-[#2b5cff] focus:outline-none focus:ring-2 focus:ring-[#2b5cff]/20"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2b5cff] py-2.5 text-sm font-medium text-white hover:bg-[#224ed8] disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify & Sign In
              </button>

              <div className="flex items-center justify-between text-xs text-[#64748b]">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(""); setError(null); }}
                  className="hover:text-[#0f172a]"
                >
                  ← Change email
                </button>
                {cooldown > 0 ? (
                  <span>Resend in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="hover:text-[#0f172a]"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/admin/session?access_token=...&refresh_token=...
 * Sets Supabase auth cookies so the server-side admin layout can read them.
 * Called after successful OTP verification.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get("access_token");
  const refreshToken = url.searchParams.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }

  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL
    ?.replace("https://", "")
    .replace(".supabase.co", "");

  const response = NextResponse.redirect(new URL("/admin", request.url));

  // Set Supabase auth cookies that the server-side client can read
  const cookieValue = JSON.stringify({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "bearer",
  });

  const cookieName = `sb-${projectRef}-auth-token`;
  const maxAge = 60 * 60 * 24 * 7; // 7 days

  response.cookies.set(cookieName, cookieValue, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  });

  return response;
}

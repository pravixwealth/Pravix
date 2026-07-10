import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ALLOWED_ADMIN_EMAILS = [
  "usefullother6@gmail.com",
  "pravix10@gmail.com",
];

/**
 * POST /api/admin/auth
 * After OTP is verified via /api/auth/verify-email, this endpoint
 * generates a session for the admin user using the service role.
 * 
 * This bypasses password requirement — OTP already proved identity.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const otpToken = String(body?.token ?? "");

    if (!email || !ALLOWED_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Unauthorized email" }, { status: 403 });
    }

    if (!otpToken || otpToken.length !== 6) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // Verify the OTP token from email_verification_tokens table
    const { data: tokenData, error: tokenError } = await supabase
      .from("email_verification_tokens")
      .select("*")
      .eq("email", email)
      .eq("token", otpToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Mark token as verified
    await supabase
      .from("email_verification_tokens")
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    // Find the user (or create if whitelisted but doesn't exist)
    const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 200 });
    let user = usersData?.users?.find((u) => u.email === email);

    if (!user) {
      // Auto-create admin user since they're in the whitelist
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (createError || !newUser?.user) {
        return NextResponse.json({ error: "Failed to create admin account" }, { status: 500 });
      }

      user = newUser.user;
    }

    // Generate a session directly using admin API
    // Create a magic link and immediately verify it server-side
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError || !linkData) {
      console.error("[admin/auth] generateLink error:", linkError?.message);
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    const token_hash = linkData.properties?.hashed_token;
    if (!token_hash) {
      return NextResponse.json({ error: "No token hash generated" }, { status: 500 });
    }

    // Verify the token to get a real session
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const anonClient = createClient(supabaseUrl, anonKey!, {
      auth: { persistSession: false },
    });

    const { data: sessionData, error: sessionError } = await anonClient.auth.verifyOtp({
      token_hash,
      type: "magiclink",
    });

    if (sessionError || !sessionData.session) {
      console.error("[admin/auth] verifyOtp error:", sessionError?.message);
      return NextResponse.json({ error: "Session creation failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

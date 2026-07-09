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

    // Find the user
    const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 200 });
    const user = usersData?.users?.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // Generate a magic link that we can use to create a session
    // Using generateLink to get a token-based URL
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError || !linkData) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    // Extract the token from the generated link properties
    const token_hash = linkData.properties?.hashed_token;

    if (!token_hash) {
      return NextResponse.json({ error: "Session generation failed" }, { status: 500 });
    }

    // Verify the magic link token to get a session
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const anonClient = createClient(supabaseUrl, anonKey!, {
      auth: { persistSession: false },
    });

    const { data: sessionData, error: sessionError } = await anonClient.auth.verifyOtp({
      token_hash,
      type: "magiclink",
    });

    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: "Session verification failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

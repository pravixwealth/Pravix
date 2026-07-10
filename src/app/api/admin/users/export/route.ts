import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  const authCookies = all
    .filter((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (authCookies.length === 0) return null;

  const combined = authCookies.map((c) => c.value).join("");
  try {
    let decoded = combined;
    if (decoded.includes("%7B") || decoded.includes("%22")) decoded = decodeURIComponent(decoded);
    if (decoded.includes("%7B") || decoded.includes("%22")) decoded = decodeURIComponent(decoded);
    const parsed = JSON.parse(decoded);
    return parsed?.access_token ?? null;
  } catch {
    return combined.length > 20 ? combined : null;
  }
}

export async function GET() {
  try {
    const accessToken = await getAccessTokenFromCookies();
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Verify user
    const userClient = createClient(supabaseUrl, anonKey!, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const { data: roleRows } = await adminClient
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", userData.user.id);

    const hasAdmin = (roleRows ?? []).some((r) => {
      const role = r.roles as { name: string } | Array<{ name: string }> | null;
      const name = Array.isArray(role) ? role[0]?.name : role?.name;
      return name === "super_admin" || name === "admin";
    });

    if (!hasAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all user profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("full_name, email, phone_e164, city, state, occupation_title, employment_type, monthly_income_inr, monthly_investable_surplus_inr, monthly_expenses_inr, current_savings_inr, risk_appetite, target_amount_inr, target_horizon_years, onboarding_completed_at, created_at, status")
      .order("created_at", { ascending: false });

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // Generate CSV
    const headers = [
      "Full Name", "Email", "Phone", "City", "State", "Occupation", "Employment Type",
      "Monthly Income (₹)", "Monthly SIP (₹)", "Monthly Expenses (₹)", "Current Savings (₹)",
      "Risk Appetite", "Target Amount (₹)", "Horizon (Years)", "Onboarded Date", "Joined", "Status"
    ];

    const rows = (profiles ?? []).map((p) => [
      p.full_name ?? "",
      p.email ?? "",
      p.phone_e164 ? `="${p.phone_e164}"` : "",  // Prevent Excel scientific notation
      p.city ?? "",
      p.state ?? "",
      p.occupation_title ?? "",
      p.employment_type ?? "",
      p.monthly_income_inr ?? 0,
      p.monthly_investable_surplus_inr ?? 0,
      p.monthly_expenses_inr ?? 0,
      p.current_savings_inr ?? 0,
      p.risk_appetite ?? "",
      p.target_amount_inr ?? 0,
      p.target_horizon_years ?? 0,
      p.onboarding_completed_at ? new Date(p.onboarding_completed_at).toLocaleDateString("en-IN") : "No",
      p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      p.status ?? "active",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => {
          const str = String(cell);
          // Escape commas and quotes in CSV
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(",")
      ),
    ].join("\n");

    const filename = `pravix-users-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

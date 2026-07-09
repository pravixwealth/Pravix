/**
 * Setup script: Creates admin tables and assigns roles.
 * Run with: node scripts/setup-admin.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ntxfcrvgjfaesedyribq.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eGZjcnZnamZhZXNlZHlyaWJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg0NTE1NCwiZXhwIjoyMDkxNDIxMTU0fQ.SHgOgwLYOfNzgqIYQWT8HpKO7A3s_M99RX2-rSCdAcM";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const ADMIN_EMAILS = ["usefullother6@gmail.com", "pravix10@gmail.com"];

async function run() {
  console.log("🔧 Setting up admin tables...\n");

  // Check if roles table exists
  const { data: existingRoles, error: checkErr } = await supabase
    .from("roles")
    .select("name")
    .limit(1);

  if (checkErr) {
    console.log("❌ 'roles' table doesn't exist yet.");
    console.log("   Please run the migrations first via Supabase SQL Editor:");
    console.log("   1. Go to https://supabase.com/dashboard/project/ntxfcrvgjfaesedyribq/sql");
    console.log("   2. Copy and paste the content of these migration files:");
    console.log("      - supabase/migrations/202607080001_create_admin_roles_and_audit.sql");
    console.log("      - supabase/migrations/202607080002_create_media_library.sql");
    console.log("      - supabase/migrations/202607080003_create_settings_engine.sql");
    console.log("      - supabase/migrations/202607080004_enhance_media_library.sql");
    console.log("      - supabase/migrations/202607080005_enhance_navigation_and_footer.sql");
    console.log("      - supabase/migrations/202607080006_create_blog_cms.sql");
    console.log("   3. Then run this script again.\n");
    process.exit(1);
  }

  console.log("✅ 'roles' table exists. Checking roles...");

  // 2. Verify roles are seeded
  const { data: roles } = await supabase.from("roles").select("id, name");
  console.log(`   Found ${roles?.length ?? 0} roles:`, roles?.map(r => r.name).join(", "));

  // 3. Find admin users
  console.log("\n🔍 Looking up admin users...");

  for (const email of ADMIN_EMAILS) {
    const { data: userData, error: userErr } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    });

    if (userErr) {
      console.log(`   ❌ Error listing users: ${userErr.message}`);
      continue;
    }

    const user = userData.users.find(u => u.email === email);

    if (!user) {
      console.log(`   ⚠️  ${email} — not found in auth.users (needs to sign up first)`);
      continue;
    }

    console.log(`   ✅ ${email} — found (ID: ${user.id})`);

    // 4. Assign super_admin role
    const superAdminRole = roles?.find(r => r.name === "super_admin");
    if (!superAdminRole) {
      console.log(`   ❌ super_admin role not found in roles table`);
      continue;
    }

    const { error: assignErr } = await supabase
      .from("user_roles")
      .upsert(
        { user_id: user.id, role_id: superAdminRole.id },
        { onConflict: "user_id,role_id" }
      );

    if (assignErr) {
      console.log(`   ❌ Failed to assign role: ${assignErr.message}`);
    } else {
      console.log(`   ✅ Assigned super_admin role to ${email}`);
    }
  }

  // 5. Verify
  console.log("\n📋 Current admin role assignments:");
  const { data: allRoles } = await supabase
    .from("user_roles")
    .select("user_id, roles(name)");

  if (allRoles && allRoles.length > 0) {
    for (const assignment of allRoles) {
      const rolesData = assignment.roles;
      const roleName = Array.isArray(rolesData) ? rolesData[0]?.name : rolesData?.name;
      console.log(`   ${assignment.user_id} → ${roleName}`);
    }
  } else {
    console.log("   (none)");
  }

  console.log("\n✅ Done! Admin users can now access /admin/login");
}

run().catch(console.error);

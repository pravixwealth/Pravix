import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ntxfcrvgjfaesedyribq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eGZjcnZnamZhZXNlZHlyaWJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg0NTE1NCwiZXhwIjoyMDkxNDIxMTU0fQ.SHgOgwLYOfNzgqIYQWT8HpKO7A3s_M99RX2-rSCdAcM",
  { auth: { persistSession: false } }
);

async function run() {
  // Fix copyright in site_content
  const { error: e1 } = await supabase
    .from("site_content")
    .update({ value: "© 2025 Pravix Wealth Management. All rights reserved." })
    .eq("key", "footer_copyright");

  if (e1) console.log("❌ site_content:", e1.message);
  else console.log("✅ Fixed site_content footer_copyright");

  // Fix copyright in business_settings too
  const { error: e2 } = await supabase
    .from("business_settings")
    .update({ value: "© 2025 Pravix Wealth Management. All rights reserved." })
    .eq("key", "copyright_text");

  if (e2) console.log("❌ business_settings:", e2.message);
  else console.log("✅ Fixed business_settings copyright_text");

  console.log("\n🎉 Copyright encoding fixed.");
}

run();

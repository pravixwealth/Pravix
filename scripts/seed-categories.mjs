import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ntxfcrvgjfaesedyribq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eGZjcnZnamZhZXNlZHlyaWJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg0NTE1NCwiZXhwIjoyMDkxNDIxMTU0fQ.SHgOgwLYOfNzgqIYQWT8HpKO7A3s_M99RX2-rSCdAcM",
  { auth: { persistSession: false } }
);

const categories = [
  { name: "Investment Planning", slug: "investment-planning", description: "SIP, mutual funds, equity, portfolio strategies", sort_order: 1 },
  { name: "Tax Planning", slug: "tax-planning", description: "Section 80C, 80D, regime selection, GST", sort_order: 2 },
  { name: "Retirement Planning", slug: "retirement-planning", description: "Pension, NPS, long-term corpus building", sort_order: 3 },
  { name: "Goal Planning", slug: "goal-planning", description: "Education, home, wedding, emergency fund goals", sort_order: 4 },
  { name: "Market Insights", slug: "market-insights", description: "Nifty, Sensex, market analysis and trends", sort_order: 5 },
  { name: "Personal Finance", slug: "personal-finance", description: "Budgeting, insurance, savings fundamentals", sort_order: 6 },
  { name: "Wealth Management", slug: "wealth-management", description: "HNI services, estate planning, family office", sort_order: 7 },
];

async function run() {
  for (const cat of categories) {
    const { error } = await supabase.from("blog_categories").upsert(cat, { onConflict: "slug", ignoreDuplicates: true });
    if (error) console.log(`❌ ${cat.slug}: ${error.message}`);
    else console.log(`✅ ${cat.name}`);
  }
  console.log("\n🎉 Categories seeded.");
}

run();

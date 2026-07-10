import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ntxfcrvgjfaesedyribq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eGZjcnZnamZhZXNlZHlyaWJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg0NTE1NCwiZXhwIjoyMDkxNDIxMTU0fQ.SHgOgwLYOfNzgqIYQWT8HpKO7A3s_M99RX2-rSCdAcM",
  { auth: { persistSession: false } }
);

async function run() {
  // Get author
  const { data: author } = await supabase.from("blog_authors").select("id").eq("slug", "pravix-team").single();
  if (!author) {
    console.log("❌ No 'pravix-team' author found. Run the admin migrations first.");
    process.exit(1);
  }
  console.log("✅ Author found:", author.id);

  const posts = [
    {
      title: "Goal-Based Investing in India: A Practical 2026 Blueprint",
      slug: "goal-based-investing-india-blueprint",
      excerpt: "Turn major life goals into measurable monthly action by linking timelines, inflation, and risk capacity to a disciplined portfolio design.",
      status: "published",
      visibility: "public",
      author_id: author.id,
      published_at: "2026-04-01T00:00:00Z",
      published_content_html: `<h2>Why Most Investment Plans Fail</h2><p>Most investors do not fail because they picked bad funds. They fail because their plan was not tied to real goals with target amounts, timelines, and contribution rules. When markets turn noisy, any plan without structure feels optional.</p><h2>The Goal-Based Framework</h2><p>Goal-based investing starts with defining what you want to achieve — retirement, education, home purchase — then works backward to determine the monthly SIP and asset allocation needed.</p><h2>Steps to Get Started</h2><ul><li>Define your top 3 financial goals with target amounts</li><li>Assign timelines (short/medium/long term)</li><li>Match each goal to the right asset class based on horizon</li><li>Set up automated SIPs for each goal</li><li>Review quarterly and rebalance annually</li></ul>`,
    },
    {
      title: "Section 80C Planning Without March Panic",
      slug: "section-80c-planning-without-march-panic",
      excerpt: "Structure your Section 80C investments across the fiscal year instead of panic-buying in March. Save tax efficiently while building real wealth.",
      status: "published",
      visibility: "public",
      author_id: author.id,
      published_at: "2026-04-08T00:00:00Z",
      published_content_html: `<h2>The March Rush Problem</h2><p>Every March, millions of Indian taxpayers rush to invest under Section 80C. This panic-driven behaviour leads to poor fund selection, insurance products sold as investments, and missed opportunities for better returns.</p><h2>A Better Approach</h2><p>Spread your 80C investments across the year. Start in April with a plan that covers PPF, ELSS, NPS, and insurance — each serving a specific purpose in your financial plan.</p><h2>Recommended Allocation</h2><ul><li>ELSS Mutual Funds — equity growth with 3-year lock-in</li><li>PPF — guaranteed returns for conservative allocation</li><li>NPS — additional ₹50K deduction under 80CCD(1B)</li><li>Term Insurance — pure protection, not investment</li></ul>`,
    },
    {
      title: "Investing During Market Volatility: Discipline Over Drama",
      slug: "investing-during-market-volatility-discipline-over-drama",
      excerpt: "When markets swing wildly, the temptation to react is intense. Learn why staying disciplined beats timing the market every time.",
      status: "published",
      visibility: "public",
      author_id: author.id,
      published_at: "2026-04-15T00:00:00Z",
      published_content_html: `<h2>Why Volatility Feels Worse Than It Is</h2><p>Market volatility triggers emotional responses. Investors who sell during dips and buy during euphoria consistently underperform those who maintain discipline. The data shows that missing just the 10 best days in a decade can cut returns by more than half.</p><h2>What Disciplined Investors Do</h2><ul><li>Continue SIPs regardless of market direction</li><li>Rebalance based on allocation drift, not news</li><li>Keep 6 months emergency fund separate from investments</li><li>Review goals annually, not daily NAVs</li></ul><h2>Historical Perspective</h2><p>Every major correction in Indian markets (2008, 2020, 2022) was followed by recovery within 12-18 months. Investors who stayed invested recovered fully. Those who exited locked in losses permanently.</p>`,
    },
    {
      title: "Portfolio Diversification for Indian Households",
      slug: "portfolio-diversification-for-indian-households",
      excerpt: "Build a portfolio that balances growth and stability across asset classes suited to Indian market conditions and family goals.",
      status: "published",
      visibility: "public",
      author_id: author.id,
      published_at: "2026-04-22T00:00:00Z",
      published_content_html: `<h2>What Diversification Really Means</h2><p>Diversification is not about owning many funds. It is about owning different asset classes that respond differently to economic conditions. A portfolio of 10 large-cap equity funds is not diversified — it is concentrated with extra paperwork.</p><h2>Asset Classes for Indian Households</h2><ul><li><strong>Equity (40-60%)</strong> — long-term wealth creation, suitable for goals 7+ years away</li><li><strong>Debt (20-30%)</strong> — stability and predictable income, suitable for 3-5 year goals</li><li><strong>Gold (5-10%)</strong> — inflation hedge and crisis protection</li><li><strong>Real Estate</strong> — only if you can hold 10+ years and it does not consume all your capital</li></ul><h2>Common Mistakes</h2><ul><li>Over-concentration in one sector or theme</li><li>Ignoring debt allocation entirely</li><li>Treating real estate as the only investment</li><li>Not reviewing allocation annually</li></ul>`,
    },
  ];

  for (const post of posts) {
    const { error } = await supabase.from("blog_posts").upsert(post, { onConflict: "slug", ignoreDuplicates: true });
    if (error) {
      console.log(`❌ ${post.slug}: ${error.message}`);
    } else {
      console.log(`✅ ${post.slug}`);
    }
  }

  console.log("\n🎉 Done! Blog posts seeded.");
}

run();

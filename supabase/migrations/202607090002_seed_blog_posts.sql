-- ============================================================================
-- Seed the 4 existing blog posts into the database.
-- After this migration, blog-data.ts can be removed.
-- ============================================================================

-- Get the default author ID
DO $$
DECLARE
  v_author_id uuid;
BEGIN
  SELECT id INTO v_author_id FROM public.blog_authors WHERE slug = 'pravix-team' LIMIT 1;

  IF v_author_id IS NULL THEN
    INSERT INTO public.blog_authors (name, slug, role)
    VALUES ('Pravix Team', 'pravix-team', 'Wealth Planning Team')
    RETURNING id INTO v_author_id;
  END IF;

  -- Post 1
  INSERT INTO public.blog_posts (title, slug, excerpt, status, visibility, author_id, published_at, published_content_html)
  VALUES (
    'Goal-Based Investing in India: A Practical 2026 Blueprint',
    'goal-based-investing-india-blueprint',
    'Turn major life goals into measurable monthly action by linking timelines, inflation, and risk capacity to a disciplined portfolio design.',
    'published', 'public', v_author_id, '2026-04-01T00:00:00Z',
    '<p>Most investors do not fail because they picked bad funds. They fail because their plan was not tied to real goals with target amounts, timelines, and contribution rules.</p>'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Post 2
  INSERT INTO public.blog_posts (title, slug, excerpt, status, visibility, author_id, published_at, published_content_html)
  VALUES (
    'Section 80C Planning Without March Panic',
    'section-80c-planning-without-march-panic',
    'Structure your Section 80C investments across the fiscal year instead of panic-buying in March. Save tax efficiently while building real wealth.',
    'published', 'public', v_author_id, '2026-04-08T00:00:00Z',
    '<p>Every March, millions of Indian taxpayers rush to invest under Section 80C. This panic-driven behaviour leads to poor fund selection and missed opportunities.</p>'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Post 3
  INSERT INTO public.blog_posts (title, slug, excerpt, status, visibility, author_id, published_at, published_content_html)
  VALUES (
    'Investing During Market Volatility: Discipline Over Drama',
    'investing-during-market-volatility-discipline-over-drama',
    'When markets swing wildly, the temptation to react is intense. Learn why staying disciplined beats timing the market every time.',
    'published', 'public', v_author_id, '2026-04-15T00:00:00Z',
    '<p>Market volatility triggers emotional responses. Investors who sell during dips and buy during euphoria consistently underperform those who maintain discipline.</p>'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Post 4
  INSERT INTO public.blog_posts (title, slug, excerpt, status, visibility, author_id, published_at, published_content_html)
  VALUES (
    'Portfolio Diversification for Indian Households',
    'portfolio-diversification-for-indian-households',
    'Build a portfolio that balances growth and stability across asset classes suited to Indian market conditions and family goals.',
    'published', 'public', v_author_id, '2026-04-22T00:00:00Z',
    '<p>Diversification is not about owning many funds. It is about owning different asset classes that respond differently to economic conditions.</p>'
  ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- Seed remaining footer content that's currently hardcoded
INSERT INTO public.site_content (key, value, type, group_key, label, description, sort_order) VALUES
  ('footer_about', 'Pravix helps households organize goals, tax planning, and investment decisions into one disciplined system.', 'text', 'footer', 'About Text', 'Short about text in footer column', 5),
  ('footer_social_heading', 'Follow Pravix for real financial insights', 'string', 'footer', 'Social Heading', 'Heading above social links', 6),
  ('footer_disclaimer', 'Pravix provides educational and informational content. It is not personalized investment advice. Investments are subject to market risk. Review relevant documents carefully and consult a qualified professional before making decisions.', 'text', 'footer', 'Disclaimer', 'Legal disclaimer text', 7)
ON CONFLICT (key) DO NOTHING;

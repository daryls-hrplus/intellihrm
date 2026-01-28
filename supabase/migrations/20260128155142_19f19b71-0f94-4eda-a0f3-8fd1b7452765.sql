-- Learning & Development Administrator Manual Registration Only
INSERT INTO manual_definitions (
  manual_code, manual_name, description, icon_name, sections_count, chapters_count,
  href, current_version, functional_areas, color_class, badge_color
) VALUES (
  'learning-development',
  'Learning & Development Guide',
  'Comprehensive guide to LMS management, training operations, compliance tracking, agency management, and AI-powered learning recommendations',
  'GraduationCap', 86, 9,
  '/enablement/manuals/learning-development',
  '1.0.0',
  ARRAY['talent']::text[],
  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
) ON CONFLICT (manual_code) DO UPDATE SET
  manual_name = EXCLUDED.manual_name, description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name, sections_count = EXCLUDED.sections_count,
  chapters_count = EXCLUDED.chapters_count, href = EXCLUDED.href,
  functional_areas = EXCLUDED.functional_areas, color_class = EXCLUDED.color_class,
  badge_color = EXCLUDED.badge_color;
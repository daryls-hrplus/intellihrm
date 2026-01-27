-- 1. Rename "Admin & Security" to "Platform & Security"
UPDATE kb_categories 
SET name = 'Platform & Security', 
    description = 'Security configuration, user management, system administration, and AI governance'
WHERE slug = 'admin-security';

-- 2. Add 360 Feedback category
INSERT INTO kb_categories (name, slug, description, icon, display_order, is_active)
VALUES ('360 Feedback', 'feedback-360', 'Multi-rater feedback systems, cycles, and development insights', 'Radar', 10, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- 3. Add Career Development category  
INSERT INTO kb_categories (name, slug, description, icon, display_order, is_active)
VALUES ('Career Development', 'career-development', 'Career paths, IDPs, mentorship programs, and AI-driven development', 'TrendingUp', 11, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- 4. Deactivate "Onboarding" (redundant with Getting Started)
UPDATE kb_categories SET is_active = false WHERE slug = 'onboarding';

-- 5. Deactivate "Policies & Compliance" (merge into Platform & Security or HR Hub)
UPDATE kb_categories SET is_active = false WHERE slug = 'policies-compliance';

-- 6. Deactivate "Workflow & Approvals" (cross-cutting, covered in manuals)
UPDATE kb_categories SET is_active = false WHERE slug = 'workflow-approvals';

-- 7. Archive all seed articles (those without source_manual_id)
UPDATE kb_articles 
SET 
  is_published = false
WHERE source_manual_id IS NULL;
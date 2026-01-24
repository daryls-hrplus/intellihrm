-- =============================================
-- PHASE 1: SEED 360 FEEDBACK DEFAULTS
-- =============================================

-- 1. SEED RATER CATEGORIES
INSERT INTO public.feedback_360_rater_categories (id, company_id, name, code, description, is_anonymous, anonymity_threshold, display_order, is_active, is_external, external_consent_required, min_raters, max_raters, is_required)
VALUES 
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', 'Self', 'SELF', 'Self-assessment by the participant', false, 1, 1, true, false, false, 1, 1, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', 'Manager', 'MANAGER', 'Direct supervisor or reporting manager', false, 1, 2, true, false, false, 1, 2, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', 'Peer', 'PEER', 'Colleagues at similar organizational level', true, 3, 3, true, false, false, 2, 5, false),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', 'Direct Report', 'DIRECT_REPORT', 'Employees who report directly to the participant', true, 3, 4, true, false, false, 2, 10, false),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', 'External/Customer', 'EXTERNAL', 'External stakeholders, clients, or customers', true, 3, 5, true, true, true, 1, 5, false)
ON CONFLICT DO NOTHING;

-- 2. SEED FEEDBACK 360 QUESTIONS
INSERT INTO public.feedback_360_questions (id, company_id, category_id, question_text, question_type, is_required, display_order, rating_scale_min, rating_scale_max, is_active)
VALUES 
  -- Leadership
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Demonstrates clear vision and strategic direction for the team', 'rating', true, 1, 1, 5, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Makes timely and well-informed decisions', 'rating', true, 2, 1, 5, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Inspires and motivates others to achieve goals', 'rating', true, 3, 1, 5, true),
  
  -- Communication
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Communicates clearly and effectively', 'rating', true, 4, 1, 5, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Actively listens and considers different perspectives', 'rating', true, 5, 1, 5, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Provides constructive and actionable feedback', 'rating', true, 6, 1, 5, true),
  
  -- Collaboration
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Works effectively with diverse teams and stakeholders', 'rating', true, 7, 1, 5, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Builds strong relationships based on trust and respect', 'rating', true, 8, 1, 5, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Shares knowledge and supports the development of others', 'rating', true, 9, 1, 5, true),
  
  -- Problem Solving
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Identifies and analyzes problems effectively', 'rating', true, 10, 1, 5, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Develops creative and practical solutions', 'rating', true, 11, 1, 5, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Adapts quickly to changing circumstances', 'rating', true, 12, 1, 5, true),
  
  -- Execution
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'Delivers high-quality results consistently', 'rating', true, 13, 1, 5, true),
  
  -- Open-ended Questions
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'What are this person''s greatest strengths that you have observed?', 'text', true, 14, NULL, NULL, true),
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', NULL, 'What specific areas would you recommend for development?', 'text', true, 15, NULL, NULL, true)
ON CONFLICT DO NOTHING;

-- 3. SEED REPORT TEMPLATES
INSERT INTO public.feedback_report_templates (id, company_id, name, description, audience_type, sections_config, content_depth, is_default, is_active)
VALUES
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', 'Executive Summary Report', 'High-level overview for executives with key metrics and trends', 'executive', 
   '{"include_executive_summary": true, "include_score_breakdown": true, "include_comparison_to_norm": true, "include_development_suggestions": false, "include_verbatim_comments": false, "include_heatmap": true}',
   'high_level', true, true),
   
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', 'Manager Report', 'Comprehensive report for direct managers with development suggestions', 'manager',
   '{"include_executive_summary": true, "include_score_breakdown": true, "include_comparison_to_norm": true, "include_development_suggestions": true, "include_verbatim_comments": false, "include_heatmap": true, "include_gap_analysis": true}',
   'summary', false, true),
   
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', 'HR Detailed Report', 'Full detailed report for HR with all sections enabled', 'hr',
   '{"include_executive_summary": true, "include_score_breakdown": true, "include_comparison_to_norm": true, "include_development_suggestions": true, "include_verbatim_comments": true, "include_heatmap": true, "include_gap_analysis": true, "include_trend_analysis": true, "include_response_rates": true}',
   'detailed', false, true),
   
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', 'Individual Contributor Report', 'Standard report for individual contributors receiving feedback', 'individual_contributor',
   '{"include_executive_summary": true, "include_score_breakdown": true, "include_comparison_to_norm": false, "include_development_suggestions": true, "include_verbatim_comments": true, "include_heatmap": false, "include_gap_analysis": false}',
   'summary', false, true),
   
  (gen_random_uuid(), '6542628f-4b2b-4a75-98cf-6e056a508800', 'Self-Reflection Report', 'Comprehensive report for participants to review their own feedback', 'self',
   '{"include_executive_summary": true, "include_score_breakdown": true, "include_comparison_to_norm": false, "include_development_suggestions": true, "include_verbatim_comments": true, "include_heatmap": true, "include_gap_analysis": true, "include_self_vs_others": true}',
   'comprehensive', false, true)
ON CONFLICT DO NOTHING;

-- 4. ADD 360 CYCLE OPTIONS COLUMNS TO review_cycles
ALTER TABLE public.review_cycles
ADD COLUMN IF NOT EXISTS hide_rating_points boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS exclude_self_from_average boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_peer_nomination boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS require_comments boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS nomination_deadline date,
ADD COLUMN IF NOT EXISTS manager_approval_required boolean DEFAULT true;

-- Also add to feedback_360_cycles
ALTER TABLE public.feedback_360_cycles
ADD COLUMN IF NOT EXISTS hide_rating_points boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS exclude_self_from_average boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_peer_nomination boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS require_comments boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS nomination_deadline date,
ADD COLUMN IF NOT EXISTS manager_approval_required boolean DEFAULT true;
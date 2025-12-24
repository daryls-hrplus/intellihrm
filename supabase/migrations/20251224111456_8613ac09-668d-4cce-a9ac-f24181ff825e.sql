-- =============================================
-- SECURITY LINTER REMEDIATIONS (enablement onboarding)
-- =============================================

-- 1) Ensure enablement analytics view runs with invoker permissions
CREATE OR REPLACE VIEW public.enablement_tour_analytics_summary
WITH (security_invoker = true)
AS
SELECT 
  t.id as tour_id,
  t.tour_code,
  t.tour_name,
  t.module_code,
  t.is_active,
  COUNT(DISTINCT CASE WHEN a.event_type = 'start' THEN a.user_id END) as total_starts,
  COUNT(DISTINCT CASE WHEN a.event_type = 'finish' THEN a.user_id END) as total_completions,
  COUNT(DISTINCT CASE WHEN a.event_type = 'skip' THEN a.user_id END) as total_skips,
  COUNT(DISTINCT CASE WHEN a.event_type = 'abandon' THEN a.user_id END) as total_abandons,
  COUNT(DISTINCT CASE WHEN a.event_type = 'video_play' THEN a.user_id END) as video_plays,
  ROUND(
    COUNT(DISTINCT CASE WHEN a.event_type = 'finish' THEN a.user_id END)::numeric /
    NULLIF(COUNT(DISTINCT CASE WHEN a.event_type = 'start' THEN a.user_id END), 0) * 100, 2
  ) as completion_rate,
  AVG(c.feedback_rating) as avg_feedback_rating
FROM public.enablement_tours t
LEFT JOIN public.enablement_tour_analytics a ON t.id = a.tour_id
LEFT JOIN public.enablement_tour_completions c ON t.id = c.tour_id AND c.feedback_rating IS NOT NULL
GROUP BY t.id, t.tour_code, t.tour_name, t.module_code, t.is_active;

-- 2) Fix mutable search_path warnings on existing functions
ALTER FUNCTION public.calculate_distance_meters(numeric,numeric,numeric,numeric)
  SET search_path = public;

ALTER FUNCTION public.is_active_at_date(date,date,date)
  SET search_path = public;

ALTER FUNCTION public.validate_job_competency_no_overlap()
  SET search_path = public;

ALTER FUNCTION public.validate_job_responsibility_no_overlap()
  SET search_path = public;

-- 3) Move extensions out of public schema (recommended hardening)
CREATE SCHEMA IF NOT EXISTS extensions;

ALTER EXTENSION vector SET SCHEMA extensions;
ALTER EXTENSION btree_gist SET SCHEMA extensions;
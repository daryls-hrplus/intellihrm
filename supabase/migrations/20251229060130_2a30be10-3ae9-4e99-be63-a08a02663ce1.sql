-- Add eNPS-specific fields to pulse_sentiment_metrics
ALTER TABLE public.pulse_sentiment_metrics 
ADD COLUMN IF NOT EXISTS enps_score numeric,
ADD COLUMN IF NOT EXISTS promoter_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS passive_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS detractor_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS enps_response_count integer DEFAULT 0;

-- Add eNPS alert threshold to pulse_sentiment_alerts
ALTER TABLE public.pulse_sentiment_alerts
ADD COLUMN IF NOT EXISTS is_enps_alert boolean DEFAULT false;

-- Insert eNPS survey template
INSERT INTO public.pulse_survey_templates (
  name, 
  description, 
  category, 
  questions, 
  estimated_duration_minutes, 
  is_system_template, 
  is_active
) VALUES (
  'Employee Net Promoter Score (eNPS)',
  'Measure employee loyalty and likelihood to recommend your organization as a workplace. Industry-standard eNPS methodology.',
  'engagement',
  '[
    {
      "id": "enps_core",
      "text": "On a scale of 0-10, how likely are you to recommend this company as a place to work to a friend or colleague?",
      "type": "nps",
      "required": true,
      "order": 1
    },
    {
      "id": "enps_reason",
      "text": "What is the primary reason for your score?",
      "type": "open_text",
      "required": true,
      "order": 2
    },
    {
      "id": "enps_improve",
      "text": "What is one thing we could do to improve your experience working here?",
      "type": "open_text",
      "required": false,
      "order": 3
    }
  ]'::jsonb,
  3,
  true,
  true
) ON CONFLICT DO NOTHING;

-- Add index for eNPS queries
CREATE INDEX IF NOT EXISTS idx_pulse_sentiment_metrics_enps 
ON public.pulse_sentiment_metrics (company_id, enps_score) 
WHERE enps_score IS NOT NULL;
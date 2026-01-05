-- =============================================
-- D4: Talent Readiness Indicators
-- =============================================

-- Organization-wide indicator definitions (extends beyond succession-specific)
CREATE TABLE talent_indicator_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'readiness', 'risk', 'potential', 'engagement', 'performance'
  )),
  calculation_method TEXT NOT NULL CHECK (calculation_method IN (
    'formula', 'ai_computed', 'manual', 'hybrid'
  )),
  calculation_config JSONB DEFAULT '{}',
  threshold_levels JSONB NOT NULL DEFAULT '{"low": 30, "medium": 60, "high": 80}',
  data_sources TEXT[] NOT NULL DEFAULT ARRAY['360_feedback'],
  applies_to TEXT[] NOT NULL DEFAULT ARRAY['talent_pool'],
  refresh_frequency TEXT DEFAULT 'on_demand' CHECK (refresh_frequency IN (
    'real_time', 'daily', 'weekly', 'on_demand', 'cycle_end'
  )),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Employee-level indicator scores
CREATE TABLE talent_indicator_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  indicator_id UUID REFERENCES talent_indicator_definitions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL CHECK (score BETWEEN 0 AND 100),
  level TEXT NOT NULL CHECK (level IN ('low', 'medium', 'high', 'critical')),
  confidence NUMERIC CHECK (confidence BETWEEN 0 AND 1),
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  trend_percentage NUMERIC,
  explanation TEXT,
  explanation_factors JSONB,
  data_points_used INTEGER,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE
);

-- Create index for efficient lookups
CREATE INDEX idx_talent_indicator_scores_employee ON talent_indicator_scores(employee_id, indicator_id);
CREATE INDEX idx_talent_indicator_scores_computed ON talent_indicator_scores(computed_at DESC);

-- Indicator alerts for HR dashboard
CREATE TABLE talent_indicator_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_score_id UUID REFERENCES talent_indicator_scores(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'threshold_breach', 'trend_change', 'confidence_drop', 'stale_data'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_talent_indicator_alerts_unack ON talent_indicator_alerts(company_id, acknowledged) WHERE acknowledged = false;

-- =============================================
-- D1: Feedback Report Templates
-- =============================================

-- 360 Feedback-specific report templates
CREATE TABLE feedback_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  audience_type TEXT NOT NULL CHECK (audience_type IN (
    'executive', 'manager', 'individual_contributor', 'hr', 'self'
  )),
  sections_config JSONB NOT NULL DEFAULT '{
    "executive_summary": true,
    "score_breakdown": true,
    "category_analysis": true,
    "question_details": false,
    "verbatim_comments": false,
    "anonymized_themes": true,
    "comparison_to_norm": true,
    "development_suggestions": true,
    "ai_insights": true
  }',
  visualization_config JSONB DEFAULT '{
    "chart_types": ["radar", "bar"],
    "show_benchmarks": true,
    "color_scheme": "default"
  }',
  content_depth TEXT DEFAULT 'detailed' CHECK (content_depth IN (
    'high_level', 'summary', 'detailed', 'comprehensive'
  )),
  anonymity_level TEXT DEFAULT 'standard' CHECK (anonymity_level IN (
    'strict', 'standard', 'relaxed'
  )),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add report template configuration to feedback cycles
ALTER TABLE feedback_360_cycles ADD COLUMN IF NOT EXISTS
  report_template_config JSONB DEFAULT '{}';

-- Enable RLS
ALTER TABLE talent_indicator_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_indicator_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_indicator_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_report_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for talent_indicator_definitions
CREATE POLICY "HR manages indicator definitions" ON talent_indicator_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for talent_indicator_scores
CREATE POLICY "Employees view own scores" ON talent_indicator_scores
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "HR views all scores" ON talent_indicator_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for talent_indicator_alerts
CREATE POLICY "HR manages alerts" ON talent_indicator_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for feedback_report_templates
CREATE POLICY "HR manages report templates" ON feedback_report_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "All users view active templates" ON feedback_report_templates
  FOR SELECT USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_talent_indicator_definitions_updated_at
  BEFORE UPDATE ON talent_indicator_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_report_templates_updated_at
  BEFORE UPDATE ON feedback_report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default indicator definitions (global, not company-specific)
INSERT INTO talent_indicator_definitions (company_id, code, name, description, category, calculation_method, data_sources, applies_to, threshold_levels)
VALUES 
  (NULL, 'leadership_readiness', 'Leadership Readiness', 'Measures readiness for leadership roles based on 360 feedback signals', 'readiness', 'ai_computed', ARRAY['360_feedback', 'appraisals'], ARRAY['succession', 'talent_pool'], '{"low": 40, "medium": 65, "high": 85}'),
  (NULL, 'flight_risk', 'Flight Risk', 'Predicts likelihood of voluntary departure based on engagement and sentiment signals', 'risk', 'ai_computed', ARRAY['360_feedback', 'engagement'], ARRAY['workforce_planning', 'retention'], '{"low": 30, "medium": 50, "high": 70}'),
  (NULL, 'high_potential', 'High Potential Score', 'Identifies high-potential employees based on performance and growth trajectory', 'potential', 'hybrid', ARRAY['360_feedback', 'appraisals', 'goals'], ARRAY['talent_pool', 'succession'], '{"low": 50, "medium": 70, "high": 90}'),
  (NULL, 'manager_effectiveness', 'Manager Effectiveness', 'Measures people leadership capability from direct report feedback', 'performance', 'formula', ARRAY['360_feedback'], ARRAY['leadership_programs', 'talent_pool'], '{"low": 45, "medium": 65, "high": 80}')
ON CONFLICT DO NOTHING;
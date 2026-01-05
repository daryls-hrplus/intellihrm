-- D3: AI Writing Assistance Tables

-- Real-time writing suggestions
CREATE TABLE feedback_writing_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES feedback_360_responses(id) ON DELETE CASCADE,
  question_id UUID REFERENCES feedback_360_questions(id),
  rater_id UUID REFERENCES profiles(id),
  company_id UUID REFERENCES companies(id),
  original_text TEXT NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN (
    'bias', 'clarity', 'specificity', 'tone', 'length', 'behavioral'
  )),
  suggestion_text TEXT NOT NULL,
  explanation TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
  was_accepted BOOLEAN,
  accepted_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Writing quality scores per response
CREATE TABLE feedback_writing_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES feedback_360_responses(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  clarity_score NUMERIC CHECK (clarity_score BETWEEN 0 AND 100),
  specificity_score NUMERIC CHECK (specificity_score BETWEEN 0 AND 100),
  bias_risk_score NUMERIC CHECK (bias_risk_score BETWEEN 0 AND 100),
  behavioral_focus_score NUMERIC CHECK (behavioral_focus_score BETWEEN 0 AND 100),
  overall_quality_score NUMERIC CHECK (overall_quality_score BETWEEN 0 AND 100),
  improvement_suggestions JSONB,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE feedback_writing_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_writing_quality ENABLE ROW LEVEL SECURITY;

-- RLS Policies for writing suggestions
CREATE POLICY "Raters view own suggestions" ON feedback_writing_suggestions
  FOR SELECT USING (rater_id = auth.uid());

CREATE POLICY "Raters insert own suggestions" ON feedback_writing_suggestions
  FOR INSERT WITH CHECK (rater_id = auth.uid());

CREATE POLICY "Raters update own suggestions" ON feedback_writing_suggestions
  FOR UPDATE USING (rater_id = auth.uid());

CREATE POLICY "HR views all suggestions" ON feedback_writing_suggestions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  ));

-- RLS Policies for writing quality
CREATE POLICY "Company members view quality scores" ON feedback_writing_quality
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = feedback_writing_quality.company_id
  ));

CREATE POLICY "System inserts quality scores" ON feedback_writing_quality
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_writing_suggestions_response ON feedback_writing_suggestions(response_id);
CREATE INDEX idx_writing_suggestions_rater ON feedback_writing_suggestions(rater_id);
CREATE INDEX idx_writing_quality_response ON feedback_writing_quality(response_id);
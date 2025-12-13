-- Interview Scorecards
CREATE TABLE public.interview_scorecards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.interview_scorecard_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scorecard_id UUID NOT NULL REFERENCES public.interview_scorecards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 1,
  max_score INTEGER DEFAULT 5,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.interview_scorecard_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  scorecard_id UUID NOT NULL REFERENCES public.interview_scorecards(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES public.interview_scorecard_criteria(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES public.profiles(id),
  score INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Candidate Pipeline/CRM
CREATE TABLE public.candidate_pipeline_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- email_sent, call_made, note_added, status_changed, meeting, linkedin_message
  subject TEXT,
  content TEXT,
  outcome TEXT,
  follow_up_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Referral Program
CREATE TABLE public.referral_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  reward_amount NUMERIC(10,2),
  reward_currency TEXT DEFAULT 'USD',
  reward_type TEXT DEFAULT 'cash', -- cash, gift_card, pto
  payout_timing TEXT DEFAULT 'after_probation', -- immediate, after_30_days, after_probation
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.employee_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.referral_programs(id),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  candidate_id UUID REFERENCES public.candidates(id),
  application_id UUID REFERENCES public.applications(id),
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT,
  relationship TEXT,
  notes TEXT,
  status TEXT DEFAULT 'submitted', -- submitted, reviewing, interviewed, hired, rejected, reward_pending, reward_paid
  hired_date DATE,
  reward_amount NUMERIC(10,2),
  reward_paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Offer Management
CREATE TABLE public.recruitment_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  offer_number TEXT,
  position_title TEXT NOT NULL,
  department TEXT,
  base_salary NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  bonus_amount NUMERIC(12,2),
  bonus_type TEXT, -- signing, annual, performance
  equity_details JSONB,
  benefits_summary TEXT,
  start_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'draft', -- draft, pending_approval, approved, sent, accepted, declined, negotiating, withdrawn
  sent_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  negotiation_notes TEXT,
  counter_offer_details JSONB,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recruitment Email Templates
CREATE TABLE public.recruitment_email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- application_received, interview_invite, interview_reminder, rejection, offer, offer_accepted, offer_declined
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB, -- available merge fields
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assessment/Skills Testing
CREATE TABLE public.candidate_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT NOT NULL, -- skills, personality, cognitive, technical, coding
  duration_minutes INTEGER,
  passing_score INTEGER,
  instructions TEXT,
  questions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.candidate_assessments(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  max_score INTEGER,
  passed BOOLEAN,
  answers JSONB,
  detailed_results JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Interview Panel Management
CREATE TABLE public.interview_panels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL, -- phone_screen, technical, behavioral, culture_fit, final
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, rescheduled
  scorecard_id UUID REFERENCES public.interview_scorecards(id),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.interview_panel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID NOT NULL REFERENCES public.interview_panels(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT DEFAULT 'interviewer', -- lead, interviewer, observer
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.interview_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID NOT NULL REFERENCES public.interview_panels(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  overall_rating INTEGER,
  recommendation TEXT, -- strong_hire, hire, no_hire, strong_no_hire
  strengths TEXT,
  weaknesses TEXT,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.interview_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_scorecard_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_scorecard_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_pipeline_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_panel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to manage interview_scorecards" ON public.interview_scorecards FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage interview_scorecard_criteria" ON public.interview_scorecard_criteria FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage interview_scorecard_ratings" ON public.interview_scorecard_ratings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage candidate_pipeline_activities" ON public.candidate_pipeline_activities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage referral_programs" ON public.referral_programs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage employee_referrals" ON public.employee_referrals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage recruitment_offers" ON public.recruitment_offers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage recruitment_email_templates" ON public.recruitment_email_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage candidate_assessments" ON public.candidate_assessments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage assessment_results" ON public.assessment_results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage interview_panels" ON public.interview_panels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage interview_panel_members" ON public.interview_panel_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage interview_feedback" ON public.interview_feedback FOR ALL USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_interview_scorecards_company ON public.interview_scorecards(company_id);
CREATE INDEX idx_scorecard_criteria_scorecard ON public.interview_scorecard_criteria(scorecard_id);
CREATE INDEX idx_scorecard_ratings_application ON public.interview_scorecard_ratings(application_id);
CREATE INDEX idx_pipeline_activities_candidate ON public.candidate_pipeline_activities(candidate_id);
CREATE INDEX idx_referral_programs_company ON public.referral_programs(company_id);
CREATE INDEX idx_employee_referrals_company ON public.employee_referrals(company_id);
CREATE INDEX idx_employee_referrals_referrer ON public.employee_referrals(referrer_id);
CREATE INDEX idx_recruitment_offers_application ON public.recruitment_offers(application_id);
CREATE INDEX idx_email_templates_company ON public.recruitment_email_templates(company_id);
CREATE INDEX idx_assessments_company ON public.candidate_assessments(company_id);
CREATE INDEX idx_assessment_results_application ON public.assessment_results(application_id);
CREATE INDEX idx_interview_panels_application ON public.interview_panels(application_id);
CREATE INDEX idx_interview_feedback_panel ON public.interview_feedback(panel_id);

-- Trigger for offer number generation
CREATE OR REPLACE FUNCTION public.generate_offer_number_recruitment()
RETURNS TRIGGER AS $$
BEGIN
  NEW.offer_number := 'OFR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_offer_number
  BEFORE INSERT ON public.recruitment_offers
  FOR EACH ROW
  WHEN (NEW.offer_number IS NULL)
  EXECUTE FUNCTION public.generate_offer_number_recruitment();
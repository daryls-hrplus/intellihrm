-- Create 360 Review Cycles table
CREATE TABLE public.review_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  self_review_deadline date,
  peer_nomination_deadline date,
  feedback_deadline date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'in_progress', 'completed', 'cancelled')),
  include_self_review boolean DEFAULT true,
  include_manager_review boolean DEFAULT true,
  include_peer_review boolean DEFAULT true,
  include_direct_report_review boolean DEFAULT true,
  min_peer_reviewers integer DEFAULT 3,
  max_peer_reviewers integer DEFAULT 5,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create 360 Review Questions table
CREATE TABLE public.review_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_cycle_id uuid REFERENCES public.review_cycles(id) ON DELETE CASCADE NOT NULL,
  competency_id uuid REFERENCES public.competencies(id) ON DELETE SET NULL,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'rating' CHECK (question_type IN ('rating', 'text', 'multiple_choice')),
  is_required boolean DEFAULT true,
  applies_to text[] DEFAULT ARRAY['self', 'manager', 'peer', 'direct_report'],
  display_order integer DEFAULT 0,
  rating_scale_min integer DEFAULT 1,
  rating_scale_max integer DEFAULT 5,
  rating_labels jsonb DEFAULT '["Needs Improvement", "Below Expectations", "Meets Expectations", "Exceeds Expectations", "Outstanding"]',
  options jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create 360 Review Participants table (employees being reviewed)
CREATE TABLE public.review_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_cycle_id uuid REFERENCES public.review_cycles(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES auth.users(id) NOT NULL,
  manager_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  self_review_completed boolean DEFAULT false,
  manager_review_completed boolean DEFAULT false,
  overall_score numeric(5,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(review_cycle_id, employee_id)
);

-- Create 360 Peer Nominations table
CREATE TABLE public.peer_nominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_participant_id uuid REFERENCES public.review_participants(id) ON DELETE CASCADE NOT NULL,
  nominated_peer_id uuid REFERENCES auth.users(id) NOT NULL,
  nominated_by text NOT NULL CHECK (nominated_by IN ('self', 'manager', 'system')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(review_participant_id, nominated_peer_id)
);

-- Create 360 Feedback Submissions table (anonymous)
CREATE TABLE public.feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_participant_id uuid REFERENCES public.review_participants(id) ON DELETE CASCADE NOT NULL,
  reviewer_type text NOT NULL CHECK (reviewer_type IN ('self', 'manager', 'peer', 'direct_report')),
  reviewer_id uuid REFERENCES auth.users(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted')),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(review_participant_id, reviewer_id)
);

-- Create 360 Feedback Responses table (stores actual answers)
CREATE TABLE public.feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_submission_id uuid REFERENCES public.feedback_submissions(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES public.review_questions(id) ON DELETE CASCADE NOT NULL,
  rating_value integer,
  text_value text,
  selected_options jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(feedback_submission_id, question_id)
);

-- Create indexes for performance
CREATE INDEX idx_review_cycles_company ON public.review_cycles(company_id);
CREATE INDEX idx_review_cycles_status ON public.review_cycles(status);
CREATE INDEX idx_review_questions_cycle ON public.review_questions(review_cycle_id);
CREATE INDEX idx_review_participants_cycle ON public.review_participants(review_cycle_id);
CREATE INDEX idx_review_participants_employee ON public.review_participants(employee_id);
CREATE INDEX idx_peer_nominations_participant ON public.peer_nominations(review_participant_id);
CREATE INDEX idx_feedback_submissions_participant ON public.feedback_submissions(review_participant_id);
CREATE INDEX idx_feedback_responses_submission ON public.feedback_responses(feedback_submission_id);

-- Enable RLS
ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_cycles
CREATE POLICY "Admins and HR can manage review cycles"
ON public.review_cycles FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can view active review cycles"
ON public.review_cycles FOR SELECT
USING (auth.uid() IS NOT NULL AND status IN ('active', 'in_progress'));

-- RLS Policies for review_questions
CREATE POLICY "Admins and HR can manage review questions"
ON public.review_questions FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can view questions for their cycles"
ON public.review_questions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for review_participants
CREATE POLICY "Admins and HR can manage review participants"
ON public.review_participants FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view own participation"
ON public.review_participants FOR SELECT
USING (auth.uid() = employee_id);

CREATE POLICY "Managers can view their direct reports participation"
ON public.review_participants FOR SELECT
USING (auth.uid() = manager_id);

-- RLS Policies for peer_nominations
CREATE POLICY "Admins and HR can manage peer nominations"
ON public.peer_nominations FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Participants can manage own nominations"
ON public.peer_nominations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.review_participants rp
    WHERE rp.id = peer_nominations.review_participant_id
    AND (rp.employee_id = auth.uid() OR rp.manager_id = auth.uid())
  )
);

CREATE POLICY "Nominated peers can view their nominations"
ON public.peer_nominations FOR SELECT
USING (nominated_peer_id = auth.uid());

-- RLS Policies for feedback_submissions (critical for anonymity)
CREATE POLICY "Admins and HR can view all submissions"
ON public.feedback_submissions FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Reviewers can manage own submissions"
ON public.feedback_submissions FOR ALL
USING (reviewer_id = auth.uid());

-- RLS Policies for feedback_responses (critical for anonymity)
CREATE POLICY "Admins and HR can view all responses"
ON public.feedback_responses FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Reviewers can manage own responses"
ON public.feedback_responses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.feedback_submissions fs
    WHERE fs.id = feedback_responses.feedback_submission_id
    AND fs.reviewer_id = auth.uid()
  )
);

-- Function to get aggregated anonymous feedback for a participant
CREATE OR REPLACE FUNCTION public.get_360_feedback_summary(p_participant_id uuid)
RETURNS TABLE (
  question_id uuid,
  question_text text,
  competency_name text,
  reviewer_type text,
  avg_rating numeric,
  response_count bigint,
  text_responses text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow employee to see their own feedback or admin/HR
  IF NOT (
    EXISTS (SELECT 1 FROM review_participants WHERE id = p_participant_id AND employee_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'hr_manager')
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    rq.id as question_id,
    rq.question_text,
    c.name as competency_name,
    fs.reviewer_type,
    ROUND(AVG(fr.rating_value)::numeric, 2) as avg_rating,
    COUNT(fr.id) as response_count,
    ARRAY_AGG(fr.text_value) FILTER (WHERE fr.text_value IS NOT NULL AND fr.text_value != '') as text_responses
  FROM feedback_submissions fs
  INNER JOIN feedback_responses fr ON fr.feedback_submission_id = fs.id
  INNER JOIN review_questions rq ON rq.id = fr.question_id
  LEFT JOIN competencies c ON c.id = rq.competency_id
  WHERE fs.review_participant_id = p_participant_id
    AND fs.status = 'submitted'
  GROUP BY rq.id, rq.question_text, c.name, fs.reviewer_type
  ORDER BY rq.display_order, fs.reviewer_type;
END;
$$;

-- Trigger to update timestamps
CREATE TRIGGER update_review_cycles_updated_at
BEFORE UPDATE ON public.review_cycles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_questions_updated_at
BEFORE UPDATE ON public.review_questions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_participants_updated_at
BEFORE UPDATE ON public.review_participants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_peer_nominations_updated_at
BEFORE UPDATE ON public.peer_nominations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_submissions_updated_at
BEFORE UPDATE ON public.feedback_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_responses_updated_at
BEFORE UPDATE ON public.feedback_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
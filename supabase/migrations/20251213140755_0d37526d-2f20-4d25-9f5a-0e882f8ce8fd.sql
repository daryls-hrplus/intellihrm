-- Create appraisal interviews table for scheduling appraisal meetings
CREATE TABLE public.appraisal_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  meeting_type TEXT NOT NULL DEFAULT 'in_person' CHECK (meeting_type IN ('in_person', 'video_call', 'phone_call')),
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  agenda TEXT,
  manager_notes TEXT,
  employee_notes TEXT,
  outcome_summary TEXT,
  scheduled_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appraisal_interviews ENABLE ROW LEVEL SECURITY;

-- Policies for appraisal interviews
CREATE POLICY "Users can view interviews they are part of"
  ON public.appraisal_interviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appraisal_participants ap
      WHERE ap.id = participant_id
      AND (ap.employee_id = auth.uid() OR ap.evaluator_id = auth.uid())
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Managers and HR can create interviews"
  ON public.appraisal_interviews
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM appraisal_participants ap
      WHERE ap.id = participant_id
      AND ap.evaluator_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Participants can update their interviews"
  ON public.appraisal_interviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM appraisal_participants ap
      WHERE ap.id = participant_id
      AND (ap.employee_id = auth.uid() OR ap.evaluator_id = auth.uid())
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "HR and admin can delete interviews"
  ON public.appraisal_interviews
  FOR DELETE
  USING (
    has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'hr_manager')
  );

-- Create trigger for updated_at
CREATE TRIGGER update_appraisal_interviews_updated_at
  BEFORE UPDATE ON public.appraisal_interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_appraisal_interviews_participant ON public.appraisal_interviews(participant_id);
CREATE INDEX idx_appraisal_interviews_scheduled_at ON public.appraisal_interviews(scheduled_at);
CREATE INDEX idx_appraisal_interviews_status ON public.appraisal_interviews(status);
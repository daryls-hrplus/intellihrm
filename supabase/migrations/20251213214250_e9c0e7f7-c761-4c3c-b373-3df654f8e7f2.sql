
-- Create timesheet submissions table for workflow approval
CREATE TABLE public.timesheet_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'returned')),
  workflow_instance_id UUID REFERENCES public.workflow_instances(id),
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create junction table linking time entries to submissions
CREATE TABLE public.timesheet_submission_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.timesheet_submissions(id) ON DELETE CASCADE,
  time_entry_id UUID NOT NULL REFERENCES public.project_time_entries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id, time_entry_id)
);

-- Add submission_id to project_time_entries for tracking
ALTER TABLE public.project_time_entries 
ADD COLUMN submission_id UUID REFERENCES public.timesheet_submissions(id);

-- Enable RLS
ALTER TABLE public.timesheet_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_submission_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for timesheet_submissions
CREATE POLICY "Users can view own submissions" ON public.timesheet_submissions
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins and HR can view all submissions" ON public.timesheet_submissions
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Users can create own submissions" ON public.timesheet_submissions
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Users can update own draft submissions" ON public.timesheet_submissions
  FOR UPDATE USING (auth.uid() = employee_id AND status = 'draft');

CREATE POLICY "Admins can update any submission" ON public.timesheet_submissions
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS policies for submission entries
CREATE POLICY "Users can view own submission entries" ON public.timesheet_submission_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.timesheet_submissions ts
      WHERE ts.id = submission_id AND ts.employee_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all submission entries" ON public.timesheet_submission_entries
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users can create own submission entries" ON public.timesheet_submission_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.timesheet_submissions ts
      WHERE ts.id = submission_id AND ts.employee_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_timesheet_submissions_employee ON public.timesheet_submissions(employee_id);
CREATE INDEX idx_timesheet_submissions_company ON public.timesheet_submissions(company_id);
CREATE INDEX idx_timesheet_submissions_status ON public.timesheet_submissions(status);
CREATE INDEX idx_timesheet_submissions_period ON public.timesheet_submissions(period_start, period_end);
CREATE INDEX idx_timesheet_submission_entries_submission ON public.timesheet_submission_entries(submission_id);

-- Trigger for updated_at
CREATE TRIGGER update_timesheet_submissions_updated_at
  BEFORE UPDATE ON public.timesheet_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

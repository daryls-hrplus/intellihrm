-- Create goal_interviews table for scheduling goal review meetings
CREATE TABLE public.goal_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  location TEXT,
  meeting_link TEXT,
  meeting_type TEXT NOT NULL DEFAULT 'in_person',
  status TEXT NOT NULL DEFAULT 'scheduled',
  agenda TEXT,
  manager_notes TEXT,
  employee_notes TEXT,
  outcome_summary TEXT,
  scheduled_by UUID REFERENCES public.profiles(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_interviews ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own goal interviews"
  ON public.goal_interviews FOR SELECT
  USING (employee_id = auth.uid() OR scheduled_by = auth.uid());

CREATE POLICY "Users can view goal interviews they scheduled"
  ON public.goal_interviews FOR SELECT
  USING (scheduled_by = auth.uid());

CREATE POLICY "Users can create goal interviews"
  ON public.goal_interviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own goal interviews"
  ON public.goal_interviews FOR UPDATE
  USING (employee_id = auth.uid() OR scheduled_by = auth.uid());

CREATE POLICY "Users can delete goal interviews they created"
  ON public.goal_interviews FOR DELETE
  USING (scheduled_by = auth.uid());

-- Create index for performance
CREATE INDEX idx_goal_interviews_employee_id ON public.goal_interviews(employee_id);
CREATE INDEX idx_goal_interviews_goal_id ON public.goal_interviews(goal_id);
CREATE INDEX idx_goal_interviews_scheduled_at ON public.goal_interviews(scheduled_at);
CREATE INDEX idx_goal_interviews_status ON public.goal_interviews(status);
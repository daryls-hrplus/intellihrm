-- Create implementation sub-tasks table for granular tracking
CREATE TABLE public.implementation_sub_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  sub_task_order INTEGER NOT NULL,
  sub_task_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'not_applicable', 'deferred', 'blocked')),
  notes TEXT,
  blocker_reason TEXT,
  completed_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, phase_id, step_order, sub_task_order)
);

-- Enable RLS
ALTER TABLE public.implementation_sub_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view sub-tasks for their company"
ON public.implementation_sub_tasks
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert sub-tasks for their company"
ON public.implementation_sub_tasks
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update sub-tasks for their company"
ON public.implementation_sub_tasks
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_implementation_sub_tasks_updated_at
BEFORE UPDATE ON public.implementation_sub_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient querying
CREATE INDEX idx_implementation_sub_tasks_lookup 
ON public.implementation_sub_tasks(company_id, phase_id, step_order);
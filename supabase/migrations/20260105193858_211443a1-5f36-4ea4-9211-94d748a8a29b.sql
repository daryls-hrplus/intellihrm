-- Create hr_tasks table for HR task management
CREATE TABLE public.hr_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.hr_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view hr_tasks" 
ON public.hr_tasks FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert hr_tasks" 
ON public.hr_tasks FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update hr_tasks" 
ON public.hr_tasks FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete hr_tasks" 
ON public.hr_tasks FOR DELETE 
TO authenticated
USING (true);

-- Create index for company filtering
CREATE INDEX idx_hr_tasks_company_id ON public.hr_tasks(company_id);

-- Trigger for updated_at
CREATE TRIGGER update_hr_tasks_updated_at
BEFORE UPDATE ON public.hr_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
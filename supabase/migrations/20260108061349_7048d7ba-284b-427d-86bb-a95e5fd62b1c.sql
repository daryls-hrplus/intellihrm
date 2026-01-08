-- Create hr_task_comments table for task collaboration
CREATE TABLE public.hr_task_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.hr_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  comment_text text NOT NULL,
  comment_type text DEFAULT 'comment', -- 'comment', 'status_change', 'assignment_change'
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hr_task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view task comments" 
ON public.hr_task_comments FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can create task comments" 
ON public.hr_task_comments FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.hr_task_comments FOR UPDATE 
TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.hr_task_comments FOR DELETE 
TO authenticated USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_hr_task_comments_task_id ON public.hr_task_comments(task_id);
CREATE INDEX idx_hr_task_comments_user_id ON public.hr_task_comments(user_id);
CREATE INDEX idx_hr_task_comments_created_at ON public.hr_task_comments(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_hr_task_comments_updated_at
BEFORE UPDATE ON public.hr_task_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
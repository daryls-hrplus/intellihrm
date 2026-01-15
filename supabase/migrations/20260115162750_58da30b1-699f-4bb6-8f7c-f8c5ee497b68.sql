-- Create HR comments table for appraisal reviews
CREATE TABLE public.appraisal_hr_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  hr_user_id UUID REFERENCES public.profiles(id),
  hr_comments TEXT,
  developmental_issues TEXT,
  recommendations TEXT,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'in_review', 'reviewed', 'approved')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appraisal_hr_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies using user_roles table
CREATE POLICY "HR users can view all HR comments" 
ON public.appraisal_hr_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "HR users can insert HR comments" 
ON public.appraisal_hr_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "HR users can update their own comments" 
ON public.appraisal_hr_comments 
FOR UPDATE 
USING (
  hr_user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Add index for performance
CREATE INDEX idx_appraisal_hr_comments_participant ON public.appraisal_hr_comments(participant_id);

-- Add trigger for updated_at
CREATE TRIGGER update_appraisal_hr_comments_updated_at
BEFORE UPDATE ON public.appraisal_hr_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
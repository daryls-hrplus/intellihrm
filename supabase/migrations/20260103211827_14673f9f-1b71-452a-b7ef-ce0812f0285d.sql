-- Add template columns to review_cycles table
ALTER TABLE public.review_cycles 
ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS template_name text,
ADD COLUMN IF NOT EXISTS template_description text,
ADD COLUMN IF NOT EXISTS cloned_from_id uuid REFERENCES public.review_cycles(id);

-- Create table for template tags
CREATE TABLE IF NOT EXISTS public.review_cycle_template_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id uuid NOT NULL REFERENCES public.review_cycles(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(cycle_id, tag)
);

-- Enable RLS on template tags
ALTER TABLE public.review_cycle_template_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for template tags
CREATE POLICY "Users can view template tags for their company"
ON public.review_cycle_template_tags
FOR SELECT
USING (
  cycle_id IN (
    SELECT rc.id FROM review_cycles rc
    JOIN profiles p ON p.company_id = rc.company_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "HR can manage template tags"
ON public.review_cycle_template_tags
FOR ALL
USING (
  cycle_id IN (
    SELECT rc.id FROM review_cycles rc
    JOIN profiles p ON p.company_id = rc.company_id
    WHERE p.id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_review_cycle_template_tags_cycle_id 
ON public.review_cycle_template_tags(cycle_id);
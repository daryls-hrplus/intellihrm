-- Add role segmentation columns to appraisal_participants
ALTER TABLE public.appraisal_participants 
ADD COLUMN IF NOT EXISTS role_segments jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_role_change boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS primary_position_id uuid REFERENCES positions(id);

-- Create appraisal_role_segments table for detailed segment tracking
CREATE TABLE public.appraisal_role_segments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id uuid NOT NULL REFERENCES appraisal_participants(id) ON DELETE CASCADE,
  position_id uuid REFERENCES positions(id),
  job_id uuid REFERENCES jobs(id),
  segment_start_date date NOT NULL,
  segment_end_date date NOT NULL,
  contribution_percentage numeric NOT NULL DEFAULT 0,
  responsibilities jsonb DEFAULT '[]'::jsonb,
  competencies jsonb DEFAULT '[]'::jsonb,
  goals jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_appraisal_role_segments_participant ON appraisal_role_segments(participant_id);
CREATE INDEX idx_appraisal_role_segments_position ON appraisal_role_segments(position_id);
CREATE INDEX idx_appraisal_role_segments_job ON appraisal_role_segments(job_id);

-- Enable RLS
ALTER TABLE public.appraisal_role_segments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view role segments for their appraisals"
ON public.appraisal_role_segments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap
    WHERE ap.id = appraisal_role_segments.participant_id
    AND (
      ap.employee_id = auth.uid() OR
      ap.evaluator_id = auth.uid() OR
      public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  )
);

CREATE POLICY "HR/Admin can manage role segments"
ON public.appraisal_role_segments
FOR ALL
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

-- Create trigger for updated_at
CREATE TRIGGER update_appraisal_role_segments_updated_at
BEFORE UPDATE ON public.appraisal_role_segments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
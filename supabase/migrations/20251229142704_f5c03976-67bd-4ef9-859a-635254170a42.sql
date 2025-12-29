-- Add multi-position handling mode to appraisal cycles
ALTER TABLE public.appraisal_cycles 
ADD COLUMN IF NOT EXISTS multi_position_mode text DEFAULT 'aggregate' CHECK (multi_position_mode IN ('aggregate', 'separate'));

-- Add comment for documentation
COMMENT ON COLUMN public.appraisal_cycles.multi_position_mode IS 'How to handle employees with multiple positions: aggregate (weighted combined score) or separate (individual appraisals per position)';

-- Create table to track position weights for participants with multiple positions
CREATE TABLE IF NOT EXISTS public.appraisal_position_weights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id uuid NOT NULL REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  position_id uuid NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  weight_percentage numeric NOT NULL DEFAULT 0 CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
  is_primary boolean DEFAULT false,
  competency_score numeric,
  responsibility_score numeric,
  goal_score numeric,
  overall_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(participant_id, position_id)
);

-- Enable RLS
ALTER TABLE public.appraisal_position_weights ENABLE ROW LEVEL SECURITY;

-- RLS policies for appraisal_position_weights
CREATE POLICY "HR and admins can view position weights"
ON public.appraisal_position_weights
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'system_admin', 'enablement_admin')
  )
);

CREATE POLICY "HR and admins can manage position weights"
ON public.appraisal_position_weights
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'system_admin', 'enablement_admin')
  )
);

-- Employees can view their own position weights
CREATE POLICY "Employees can view own position weights"
ON public.appraisal_position_weights
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.appraisal_participants ap
    WHERE ap.id = participant_id
    AND ap.employee_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_position_weights_participant ON public.appraisal_position_weights(participant_id);
CREATE INDEX IF NOT EXISTS idx_position_weights_position ON public.appraisal_position_weights(position_id);

-- Add trigger for updated_at
CREATE TRIGGER update_position_weights_updated_at
BEFORE UPDATE ON public.appraisal_position_weights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
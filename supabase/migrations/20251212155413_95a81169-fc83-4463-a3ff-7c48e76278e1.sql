-- Add is_probation_review and is_manager_cycle to appraisal_cycles
ALTER TABLE public.appraisal_cycles
ADD COLUMN is_probation_review BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_manager_cycle BOOLEAN NOT NULL DEFAULT false;

-- Add comment
COMMENT ON COLUMN public.appraisal_cycles.is_probation_review IS 'Whether this is a probation review cycle';
COMMENT ON COLUMN public.appraisal_cycles.is_manager_cycle IS 'Whether this cycle was created by a manager for their team only';

-- Update RLS policies to allow managers to create their own probation cycles
DROP POLICY IF EXISTS "Admins and HR can manage appraisal cycles" ON public.appraisal_cycles;

-- HR/Admin can manage all cycles
CREATE POLICY "HR and Admin can manage all appraisal cycles"
ON public.appraisal_cycles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'hr_manager')
  )
);

-- Managers can create probation review cycles for their team
CREATE POLICY "Managers can create their own probation cycles"
ON public.appraisal_cycles FOR INSERT
WITH CHECK (
  is_manager_cycle = true 
  AND is_probation_review = true
  AND created_by = auth.uid()
);

-- Managers can view/update/delete their own manager cycles
CREATE POLICY "Managers can manage their own cycles"
ON public.appraisal_cycles FOR ALL
USING (
  is_manager_cycle = true 
  AND created_by = auth.uid()
);

-- Employees can view central cycles they participate in
CREATE POLICY "Employees can view cycles they participate in"
ON public.appraisal_cycles FOR SELECT
USING (
  is_manager_cycle = false
  AND EXISTS (
    SELECT 1 FROM public.appraisal_participants
    WHERE cycle_id = appraisal_cycles.id
    AND employee_id = auth.uid()
  )
);
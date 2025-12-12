-- Add column to distinguish manager-created cycles from central HR cycles
ALTER TABLE public.review_cycles ADD COLUMN IF NOT EXISTS is_manager_cycle boolean DEFAULT false;

-- Drop existing policies on review_cycles
DROP POLICY IF EXISTS "Admins and HR can manage review cycles" ON public.review_cycles;
DROP POLICY IF EXISTS "Authenticated users can view active cycles" ON public.review_cycles;

-- Create new RLS policies

-- HR/Admin can view and manage ALL cycles (including manager cycles)
CREATE POLICY "HR and Admin can manage all review cycles"
ON public.review_cycles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'hr_manager'::app_role)
);

-- Managers can create cycles (is_manager_cycle must be true)
CREATE POLICY "Managers can create their own review cycles"
ON public.review_cycles
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  is_manager_cycle = true AND 
  created_by = auth.uid()
);

-- Managers can view/update/delete only their own manager cycles
CREATE POLICY "Managers can manage their own cycles"
ON public.review_cycles
FOR ALL
USING (
  is_manager_cycle = true AND 
  created_by = auth.uid()
);

-- Employees can view central cycles (non-manager cycles) they are participating in
CREATE POLICY "Employees can view central cycles they participate in"
ON public.review_cycles
FOR SELECT
USING (
  is_manager_cycle = false AND
  EXISTS (
    SELECT 1 FROM review_participants rp 
    WHERE rp.review_cycle_id = review_cycles.id 
    AND rp.employee_id = auth.uid()
  )
);
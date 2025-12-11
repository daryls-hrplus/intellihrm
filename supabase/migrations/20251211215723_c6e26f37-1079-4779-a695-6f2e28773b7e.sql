-- Add target_departments column to intranet_announcements
ALTER TABLE public.intranet_announcements 
ADD COLUMN target_departments uuid[] DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.intranet_announcements.target_departments IS 'NULL means company-wide, otherwise array of department IDs';

-- Drop existing RLS policies for announcements
DROP POLICY IF EXISTS "Admins and HR can manage announcements" ON public.intranet_announcements;
DROP POLICY IF EXISTS "Authenticated users can view published announcements" ON public.intranet_announcements;

-- Recreate admin policy
CREATE POLICY "Admins and HR can manage announcements" 
ON public.intranet_announcements 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Create policy for viewing announcements based on department access
CREATE POLICY "Users can view accessible announcements" 
ON public.intranet_announcements 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_published = true
  AND (
    -- Company-wide announcements (no target departments)
    target_departments IS NULL
    OR
    -- User is in one of the target departments
    EXISTS (
      SELECT 1 FROM employee_positions ep
      JOIN positions p ON ep.position_id = p.id
      WHERE ep.employee_id = auth.uid()
        AND ep.is_active = true
        AND p.department_id = ANY(intranet_announcements.target_departments)
    )
    OR
    -- Admins and HR can always see all announcements
    has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'hr_manager')
  )
);
-- Add gender applicability to leave_types for gender-specific leave (e.g., maternity, paternity)
ALTER TABLE public.leave_types
ADD COLUMN gender_applicability text DEFAULT 'all' CHECK (gender_applicability IN ('all', 'male', 'female'));

-- Add comment for documentation
COMMENT ON COLUMN public.leave_types.gender_applicability IS 'Restricts leave type to specific gender: all (default), male (e.g., paternity), female (e.g., maternity)';
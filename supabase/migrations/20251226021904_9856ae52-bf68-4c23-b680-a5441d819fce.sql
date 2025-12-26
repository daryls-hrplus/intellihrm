-- Add leave year basis to leave_types for accumulative leave types
-- Options: 'calendar' (uses company leave_years table) or 'anniversary' (based on employee hire date)
ALTER TABLE public.leave_types 
ADD COLUMN leave_year_basis text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.leave_types.leave_year_basis IS 'Defines how the leave year is calculated for this leave type. NULL for non-accumulative types, ''calendar'' for fixed company leave years, ''anniversary'' for employee hire date based years.';
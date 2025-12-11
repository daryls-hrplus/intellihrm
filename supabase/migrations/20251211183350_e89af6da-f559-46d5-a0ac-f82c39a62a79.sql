
-- Create lookup types enum for categorization
CREATE TYPE lookup_category AS ENUM (
  'employee_status',
  'termination_reason', 
  'employee_type',
  'employment_action',
  'leave_type',
  'contract_type'
);

-- Create lookup values table
CREATE TABLE public.lookup_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category lookup_category NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, code)
);

-- Enable RLS
ALTER TABLE public.lookup_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view active lookup values"
ON public.lookup_values FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage lookup values"
ON public.lookup_values FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_lookup_values_updated_at
BEFORE UPDATE ON public.lookup_values
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default values
INSERT INTO public.lookup_values (category, code, name, description, display_order, is_default) VALUES
-- Employee Statuses
('employee_status', 'ACTIVE', 'Active', 'Currently employed and working', 1, true),
('employee_status', 'ON_LEAVE', 'On Leave', 'On approved leave of absence', 2, false),
('employee_status', 'SUSPENDED', 'Suspended', 'Employment temporarily suspended', 3, false),
('employee_status', 'TERMINATED', 'Terminated', 'Employment ended', 4, false),
('employee_status', 'RETIRED', 'Retired', 'Retired from service', 5, false),

-- Termination Reasons
('termination_reason', 'RESIGNATION', 'Resignation', 'Voluntary resignation by employee', 1, false),
('termination_reason', 'DISMISSAL', 'Dismissal', 'Termination for cause', 2, false),
('termination_reason', 'REDUNDANCY', 'Redundancy', 'Position made redundant', 3, false),
('termination_reason', 'END_CONTRACT', 'End of Contract', 'Fixed-term contract ended', 4, false),
('termination_reason', 'RETIREMENT', 'Retirement', 'Retirement from service', 5, false),
('termination_reason', 'DEATH', 'Death', 'Deceased employee', 6, false),
('termination_reason', 'MUTUAL_AGREEMENT', 'Mutual Agreement', 'Separation by mutual agreement', 7, false),

-- Employee Types
('employee_type', 'PERMANENT', 'Permanent', 'Full-time permanent employee', 1, true),
('employee_type', 'CONTRACT', 'Contract', 'Fixed-term contract employee', 2, false),
('employee_type', 'PART_TIME', 'Part-Time', 'Part-time employee', 3, false),
('employee_type', 'TEMPORARY', 'Temporary', 'Temporary or seasonal employee', 4, false),
('employee_type', 'INTERN', 'Intern', 'Internship position', 5, false),
('employee_type', 'CONSULTANT', 'Consultant', 'External consultant', 6, false),

-- Employment Actions
('employment_action', 'HIRE', 'Hire', 'New employee hiring', 1, false),
('employment_action', 'PROMOTION', 'Promotion', 'Employee promotion', 2, false),
('employment_action', 'DEMOTION', 'Demotion', 'Employee demotion', 3, false),
('employment_action', 'TRANSFER', 'Transfer', 'Department or location transfer', 4, false),
('employment_action', 'SALARY_CHANGE', 'Salary Change', 'Compensation adjustment', 5, false),
('employment_action', 'TITLE_CHANGE', 'Title Change', 'Job title modification', 6, false),
('employment_action', 'TERMINATION', 'Termination', 'Employment termination', 7, false);

-- Insert default pay element types
INSERT INTO lookup_values (category, code, name, description, display_order) VALUES
('pay_element_type', 'SALARY', 'Salary', 'Fixed monthly/annual salary', 1),
('pay_element_type', 'WAGE', 'Wage', 'Hourly or daily wage', 2),
('pay_element_type', 'ALLOWANCE', 'Allowance', 'Additional allowances (housing, transport, etc.)', 3),
('pay_element_type', 'BENEFIT', 'Benefit', 'Non-cash benefits (insurance, pension, etc.)', 4),
('pay_element_type', 'BONUS', 'Bonus', 'Performance or periodic bonuses', 5),
('pay_element_type', 'DEDUCTION', 'Deduction', 'Salary deductions', 6);

-- Insert proration methods
INSERT INTO lookup_values (category, code, name, description, display_order) VALUES
('proration_method', 'NONE', 'No Proration', 'Full amount regardless of days worked', 1),
('proration_method', 'CALENDAR_DAYS', 'Calendar Days', 'Prorate based on calendar days in month', 2),
('proration_method', 'WORK_DAYS', 'Work Days', 'Prorate based on working days in month', 3);

-- Insert payment frequencies
INSERT INTO lookup_values (category, code, name, description, display_order) VALUES
('payment_frequency', 'MONTHLY', 'Monthly', 'Paid once per month', 1),
('payment_frequency', 'BIWEEKLY', 'Bi-Weekly', 'Paid every two weeks', 2),
('payment_frequency', 'WEEKLY', 'Weekly', 'Paid every week', 3),
('payment_frequency', 'ANNUAL', 'Annual', 'Paid once per year', 4);

-- Create pay_elements table (master list of pay elements)
CREATE TABLE public.pay_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  element_type_id UUID REFERENCES lookup_values(id),
  proration_method_id UUID REFERENCES lookup_values(id),
  is_taxable BOOLEAN NOT NULL DEFAULT true,
  is_pensionable BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  company_id UUID REFERENCES companies(id),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create position_compensation table (compensation structure per position)
CREATE TABLE public.position_compensation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  pay_element_id UUID NOT NULL REFERENCES pay_elements(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  frequency_id UUID REFERENCES lookup_values(id),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(position_id, pay_element_id, effective_date)
);

-- Create salary_grades table for grade-based compensation
CREATE TABLE public.salary_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id),
  min_salary NUMERIC(15,2),
  mid_salary NUMERIC(15,2),
  max_salary NUMERIC(15,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Link positions to salary grades
ALTER TABLE positions ADD COLUMN IF NOT EXISTS salary_grade_id UUID REFERENCES salary_grades(id);

-- Enable RLS
ALTER TABLE pay_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_compensation ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_grades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pay_elements
CREATE POLICY "Authenticated users can view active pay elements"
  ON pay_elements FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage pay elements"
  ON pay_elements FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for position_compensation
CREATE POLICY "Authenticated users can view position compensation"
  ON position_compensation FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage position compensation"
  ON position_compensation FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for salary_grades
CREATE POLICY "Authenticated users can view active salary grades"
  ON salary_grades FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage salary grades"
  ON salary_grades FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_pay_elements_updated_at
  BEFORE UPDATE ON pay_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_position_compensation_updated_at
  BEFORE UPDATE ON position_compensation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_grades_updated_at
  BEFORE UPDATE ON salary_grades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
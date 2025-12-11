-- Add temporal validity fields to pay_elements
ALTER TABLE public.pay_elements
ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date date;

-- Add temporal validity fields to salary_grades
ALTER TABLE public.salary_grades
ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date date;

-- Create indexes for date-based queries
CREATE INDEX idx_pay_elements_dates ON public.pay_elements(start_date, end_date);
CREATE INDEX idx_salary_grades_dates ON public.salary_grades(start_date, end_date);
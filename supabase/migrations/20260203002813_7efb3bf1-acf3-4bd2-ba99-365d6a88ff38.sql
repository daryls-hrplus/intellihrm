-- =====================================================
-- SECURITY HARDENING MIGRATION
-- Fixes high-priority RLS vulnerabilities
-- =====================================================

-- 1. FIX: employee_regular_deductions - HIGH PRIORITY
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view their own deductions" ON public.employee_regular_deductions;
DROP POLICY IF EXISTS "Users can insert their own deductions" ON public.employee_regular_deductions;
DROP POLICY IF EXISTS "Users can update their own deductions" ON public.employee_regular_deductions;
DROP POLICY IF EXISTS "Users can delete their own deductions" ON public.employee_regular_deductions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_regular_deductions;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.employee_regular_deductions;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.employee_regular_deductions;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.employee_regular_deductions;

-- Create proper RLS policies for employee_regular_deductions
CREATE POLICY "Employees can view their own deductions"
ON public.employee_regular_deductions
FOR SELECT
USING (employee_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Only HR/Admin can insert deductions"
ON public.employee_regular_deductions
FOR INSERT
WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Only HR/Admin can update deductions"
ON public.employee_regular_deductions
FOR UPDATE
USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Only HR/Admin can delete deductions"
ON public.employee_regular_deductions
FOR DELETE
USING (public.is_admin_or_hr(auth.uid()));

-- 2. FIX: ai_payroll_reports - MEDIUM PRIORITY
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ai_payroll_reports;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.ai_payroll_reports;

CREATE POLICY "Only creators or HR/Admin can update ai_payroll_reports"
ON public.ai_payroll_reports
FOR UPDATE
USING (created_by = auth.uid() OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Only creators or HR/Admin can delete ai_payroll_reports"
ON public.ai_payroll_reports
FOR DELETE
USING (created_by = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- 3. FIX: ai_module_reports - MEDIUM PRIORITY
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ai_module_reports;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.ai_module_reports;

CREATE POLICY "Only creators or HR/Admin can update ai_module_reports"
ON public.ai_module_reports
FOR UPDATE
USING (created_by = auth.uid() OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Only creators or HR/Admin can delete ai_module_reports"
ON public.ai_module_reports
FOR DELETE
USING (created_by = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- 4. FIX: hr_tasks - MEDIUM PRIORITY
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.hr_tasks;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.hr_tasks;

CREATE POLICY "Only assignees or HR/Admin can update hr_tasks"
ON public.hr_tasks
FOR UPDATE
USING (assigned_to = auth.uid() OR created_by = auth.uid() OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "Only creators or HR/Admin can delete hr_tasks"
ON public.hr_tasks
FOR DELETE
USING (created_by = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- 5. FIX: Function search paths - LOW PRIORITY
-- Update functions with mutable search paths to use explicit search_path

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
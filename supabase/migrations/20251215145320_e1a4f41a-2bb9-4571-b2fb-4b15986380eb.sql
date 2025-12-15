-- Fix critical RLS vulnerabilities - Core tables only

-- Helper functions with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin_or_hr()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'hr_manager')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
$$;

-- Employee Bank Accounts
DROP POLICY IF EXISTS "Users can view bank accounts" ON public.employee_bank_accounts;
DROP POLICY IF EXISTS "Users can manage bank accounts" ON public.employee_bank_accounts;
DROP POLICY IF EXISTS "Authenticated users can view bank accounts" ON public.employee_bank_accounts;
DROP POLICY IF EXISTS "Authenticated users can manage bank accounts" ON public.employee_bank_accounts;
CREATE POLICY "Employees view own bank accounts" ON public.employee_bank_accounts FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR manages bank accounts" ON public.employee_bank_accounts FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Employee Medical Profiles
DROP POLICY IF EXISTS "Users can view medical profiles" ON public.employee_medical_profiles;
DROP POLICY IF EXISTS "Users can manage medical profiles" ON public.employee_medical_profiles;
DROP POLICY IF EXISTS "Authenticated users can view medical profiles" ON public.employee_medical_profiles;
DROP POLICY IF EXISTS "Authenticated users can manage medical profiles" ON public.employee_medical_profiles;
CREATE POLICY "Employees view own medical" ON public.employee_medical_profiles FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR manages medical" ON public.employee_medical_profiles FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Employee Payroll
DROP POLICY IF EXISTS "Users can view payroll" ON public.employee_payroll;
DROP POLICY IF EXISTS "Users can manage payroll" ON public.employee_payroll;
DROP POLICY IF EXISTS "Authenticated users can view payroll" ON public.employee_payroll;
DROP POLICY IF EXISTS "Authenticated users can manage payroll" ON public.employee_payroll;
CREATE POLICY "Employees view own payroll" ON public.employee_payroll FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR manages payroll" ON public.employee_payroll FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Employee Tax Forms
DROP POLICY IF EXISTS "Users can view tax forms" ON public.employee_tax_forms;
DROP POLICY IF EXISTS "Users can manage tax forms" ON public.employee_tax_forms;
DROP POLICY IF EXISTS "Authenticated users can view tax forms" ON public.employee_tax_forms;
DROP POLICY IF EXISTS "Authenticated users can manage tax forms" ON public.employee_tax_forms;
CREATE POLICY "Employees view own tax forms" ON public.employee_tax_forms FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR manages tax forms" ON public.employee_tax_forms FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Employee Compensation
DROP POLICY IF EXISTS "Users can view employee compensation" ON public.employee_compensation;
DROP POLICY IF EXISTS "Admins can manage employee compensation" ON public.employee_compensation;
DROP POLICY IF EXISTS "Authenticated users can view employee compensation" ON public.employee_compensation;
CREATE POLICY "Employees view own compensation" ON public.employee_compensation FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR manages compensation" ON public.employee_compensation FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Employee Addresses
DROP POLICY IF EXISTS "Users can view addresses" ON public.employee_addresses;
DROP POLICY IF EXISTS "Users can manage addresses" ON public.employee_addresses;
DROP POLICY IF EXISTS "Authenticated users can view addresses" ON public.employee_addresses;
DROP POLICY IF EXISTS "Authenticated users can manage addresses" ON public.employee_addresses;
CREATE POLICY "Employees view own addresses" ON public.employee_addresses FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Employees manage own addresses" ON public.employee_addresses FOR ALL TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr()) WITH CHECK (employee_id = auth.uid() OR public.is_admin_or_hr());

-- Employee Contacts
DROP POLICY IF EXISTS "Users can view contacts" ON public.employee_contacts;
DROP POLICY IF EXISTS "Users can manage contacts" ON public.employee_contacts;
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.employee_contacts;
DROP POLICY IF EXISTS "Authenticated users can manage contacts" ON public.employee_contacts;
CREATE POLICY "Employees view own contacts" ON public.employee_contacts FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Employees manage own contacts" ON public.employee_contacts FOR ALL TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr()) WITH CHECK (employee_id = auth.uid() OR public.is_admin_or_hr());

-- Emergency Contacts
DROP POLICY IF EXISTS "Users can view emergency contacts" ON public.employee_emergency_contacts;
DROP POLICY IF EXISTS "Users can manage emergency contacts" ON public.employee_emergency_contacts;
DROP POLICY IF EXISTS "Authenticated users can view emergency contacts" ON public.employee_emergency_contacts;
DROP POLICY IF EXISTS "Authenticated users can manage emergency contacts" ON public.employee_emergency_contacts;
CREATE POLICY "Employees view own emergency contacts" ON public.employee_emergency_contacts FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Employees manage own emergency contacts" ON public.employee_emergency_contacts FOR ALL TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr()) WITH CHECK (employee_id = auth.uid() OR public.is_admin_or_hr());

-- Employee Dependents
DROP POLICY IF EXISTS "Users can view dependents" ON public.employee_dependents;
DROP POLICY IF EXISTS "Users can manage dependents" ON public.employee_dependents;
DROP POLICY IF EXISTS "Authenticated users can view dependents" ON public.employee_dependents;
DROP POLICY IF EXISTS "Authenticated users can manage dependents" ON public.employee_dependents;
CREATE POLICY "Employees view own dependents" ON public.employee_dependents FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Employees manage own dependents" ON public.employee_dependents FOR ALL TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr()) WITH CHECK (employee_id = auth.uid() OR public.is_admin_or_hr());

-- Background Checks
DROP POLICY IF EXISTS "Users can view background checks" ON public.employee_background_checks;
DROP POLICY IF EXISTS "Users can manage background checks" ON public.employee_background_checks;
DROP POLICY IF EXISTS "Authenticated users can view background checks" ON public.employee_background_checks;
DROP POLICY IF EXISTS "Authenticated users can manage background checks" ON public.employee_background_checks;
CREATE POLICY "HR views background checks" ON public.employee_background_checks FOR SELECT TO authenticated USING (public.is_admin_or_hr());
CREATE POLICY "HR manages background checks" ON public.employee_background_checks FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- ER Disciplinary Actions
DROP POLICY IF EXISTS "Users can view disciplinary actions" ON public.er_disciplinary_actions;
DROP POLICY IF EXISTS "Users can manage disciplinary actions" ON public.er_disciplinary_actions;
DROP POLICY IF EXISTS "Authenticated users can view disciplinary actions" ON public.er_disciplinary_actions;
DROP POLICY IF EXISTS "Authenticated users can manage disciplinary actions" ON public.er_disciplinary_actions;
CREATE POLICY "Employees view own disciplinary" ON public.er_disciplinary_actions FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR manages disciplinary" ON public.er_disciplinary_actions FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- ER Cases
DROP POLICY IF EXISTS "Users can view ER cases" ON public.er_cases;
DROP POLICY IF EXISTS "Users can manage ER cases" ON public.er_cases;
DROP POLICY IF EXISTS "Authenticated users can view ER cases" ON public.er_cases;
DROP POLICY IF EXISTS "Authenticated users can manage ER cases" ON public.er_cases;
CREATE POLICY "Employees view own cases" ON public.er_cases FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Employees create cases" ON public.er_cases FOR INSERT TO authenticated WITH CHECK (employee_id = auth.uid());
CREATE POLICY "HR manages cases" ON public.er_cases FOR UPDATE TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());
CREATE POLICY "HR deletes cases" ON public.er_cases FOR DELETE TO authenticated USING (public.is_admin_or_hr());

-- ER Exit Interviews
DROP POLICY IF EXISTS "Users can view exit interviews" ON public.er_exit_interviews;
DROP POLICY IF EXISTS "Users can manage exit interviews" ON public.er_exit_interviews;
DROP POLICY IF EXISTS "Authenticated users can view exit interviews" ON public.er_exit_interviews;
DROP POLICY IF EXISTS "Authenticated users can manage exit interviews" ON public.er_exit_interviews;
CREATE POLICY "HR views exit interviews" ON public.er_exit_interviews FOR SELECT TO authenticated USING (public.is_admin_or_hr());
CREATE POLICY "HR manages exit interviews" ON public.er_exit_interviews FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Time Clock Entries
DROP POLICY IF EXISTS "Users can view time entries" ON public.time_clock_entries;
DROP POLICY IF EXISTS "Users can manage time entries" ON public.time_clock_entries;
DROP POLICY IF EXISTS "Authenticated users can view time entries" ON public.time_clock_entries;
DROP POLICY IF EXISTS "Authenticated users can manage time entries" ON public.time_clock_entries;
CREATE POLICY "Employees view own time entries" ON public.time_clock_entries FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Employees create time entries" ON public.time_clock_entries FOR INSERT TO authenticated WITH CHECK (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR manages time entries" ON public.time_clock_entries FOR UPDATE TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());
CREATE POLICY "HR deletes time entries" ON public.time_clock_entries FOR DELETE TO authenticated USING (public.is_admin_or_hr());

-- Face Enrollments
DROP POLICY IF EXISTS "Users can view face enrollments" ON public.employee_face_enrollments;
DROP POLICY IF EXISTS "Users can manage face enrollments" ON public.employee_face_enrollments;
DROP POLICY IF EXISTS "Authenticated users can view face enrollments" ON public.employee_face_enrollments;
DROP POLICY IF EXISTS "Authenticated users can manage face enrollments" ON public.employee_face_enrollments;
CREATE POLICY "Employees view own face enrollment" ON public.employee_face_enrollments FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR manages face enrollments" ON public.employee_face_enrollments FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Biometric Templates
DROP POLICY IF EXISTS "Users can view biometric templates" ON public.employee_biometric_templates;
DROP POLICY IF EXISTS "Users can manage biometric templates" ON public.employee_biometric_templates;
DROP POLICY IF EXISTS "Authenticated users can view biometric templates" ON public.employee_biometric_templates;
DROP POLICY IF EXISTS "Authenticated users can manage biometric templates" ON public.employee_biometric_templates;
CREATE POLICY "HR views biometrics" ON public.employee_biometric_templates FOR SELECT TO authenticated USING (public.is_admin_or_hr());
CREATE POLICY "HR manages biometrics" ON public.employee_biometric_templates FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Candidates
DROP POLICY IF EXISTS "Users can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can manage candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can manage candidates" ON public.candidates;
CREATE POLICY "HR views candidates" ON public.candidates FOR SELECT TO authenticated USING (public.is_admin_or_hr());
CREATE POLICY "HR manages candidates" ON public.candidates FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Applications
DROP POLICY IF EXISTS "Users can view applications" ON public.applications;
DROP POLICY IF EXISTS "Users can manage applications" ON public.applications;
DROP POLICY IF EXISTS "Authenticated users can view applications" ON public.applications;
DROP POLICY IF EXISTS "Authenticated users can manage applications" ON public.applications;
CREATE POLICY "HR views applications" ON public.applications FOR SELECT TO authenticated USING (public.is_admin_or_hr());
CREATE POLICY "HR manages applications" ON public.applications FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Offer Letters
DROP POLICY IF EXISTS "Users can view offer letters" ON public.offer_letters;
DROP POLICY IF EXISTS "Users can manage offer letters" ON public.offer_letters;
DROP POLICY IF EXISTS "Authenticated users can view offer letters" ON public.offer_letters;
DROP POLICY IF EXISTS "Authenticated users can manage offer letters" ON public.offer_letters;
CREATE POLICY "HR views offer letters" ON public.offer_letters FOR SELECT TO authenticated USING (public.is_admin_or_hr());
CREATE POLICY "HR manages offer letters" ON public.offer_letters FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Performance Goals
DROP POLICY IF EXISTS "Users can view goals" ON public.performance_goals;
DROP POLICY IF EXISTS "Users can manage goals" ON public.performance_goals;
DROP POLICY IF EXISTS "Authenticated users can view goals" ON public.performance_goals;
DROP POLICY IF EXISTS "Authenticated users can manage goals" ON public.performance_goals;
CREATE POLICY "Employees view own goals" ON public.performance_goals FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Employees manage own goals" ON public.performance_goals FOR ALL TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr()) WITH CHECK (employee_id = auth.uid() OR public.is_admin_or_hr());

-- Continuous Feedback
DROP POLICY IF EXISTS "Users can view feedback" ON public.continuous_feedback;
DROP POLICY IF EXISTS "Users can manage feedback" ON public.continuous_feedback;
DROP POLICY IF EXISTS "Authenticated users can view feedback" ON public.continuous_feedback;
DROP POLICY IF EXISTS "Authenticated users can manage feedback" ON public.continuous_feedback;
CREATE POLICY "Employees view relevant feedback" ON public.continuous_feedback FOR SELECT TO authenticated USING (from_user_id = auth.uid() OR to_user_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Users create feedback" ON public.continuous_feedback FOR INSERT TO authenticated WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "HR manages feedback" ON public.continuous_feedback FOR UPDATE TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());
CREATE POLICY "HR deletes feedback" ON public.continuous_feedback FOR DELETE TO authenticated USING (public.is_admin_or_hr());

-- AI Interaction Logs
DROP POLICY IF EXISTS "Users can view AI logs" ON public.ai_interaction_logs;
DROP POLICY IF EXISTS "Users can manage AI logs" ON public.ai_interaction_logs;
DROP POLICY IF EXISTS "Authenticated users can view AI logs" ON public.ai_interaction_logs;
DROP POLICY IF EXISTS "Authenticated users can manage AI logs" ON public.ai_interaction_logs;
CREATE POLICY "Users view own AI logs" ON public.ai_interaction_logs FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users create AI logs" ON public.ai_interaction_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Leave Requests
DROP POLICY IF EXISTS "Users can view leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can manage leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Authenticated users can view leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Authenticated users can manage leave requests" ON public.leave_requests;
CREATE POLICY "Employees view own leave" ON public.leave_requests FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Employees create leave" ON public.leave_requests FOR INSERT TO authenticated WITH CHECK (employee_id = auth.uid());
CREATE POLICY "Employees update own leave" ON public.leave_requests FOR UPDATE TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr()) WITH CHECK (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR deletes leave" ON public.leave_requests FOR DELETE TO authenticated USING (public.is_admin_or_hr());

-- Expense Claims
DROP POLICY IF EXISTS "Users can view expense claims" ON public.expense_claims;
DROP POLICY IF EXISTS "Users can manage expense claims" ON public.expense_claims;
DROP POLICY IF EXISTS "Authenticated users can view expense claims" ON public.expense_claims;
DROP POLICY IF EXISTS "Authenticated users can manage expense claims" ON public.expense_claims;
CREATE POLICY "Employees view own expenses" ON public.expense_claims FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Employees create expenses" ON public.expense_claims FOR INSERT TO authenticated WITH CHECK (employee_id = auth.uid());
CREATE POLICY "HR manages expenses" ON public.expense_claims FOR UPDATE TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());
CREATE POLICY "HR deletes expenses" ON public.expense_claims FOR DELETE TO authenticated USING (public.is_admin_or_hr());

-- Geofence Violations
DROP POLICY IF EXISTS "Users can view geofence violations" ON public.geofence_violations;
DROP POLICY IF EXISTS "Users can manage geofence violations" ON public.geofence_violations;
DROP POLICY IF EXISTS "Authenticated users can view geofence violations" ON public.geofence_violations;
DROP POLICY IF EXISTS "Authenticated users can manage geofence violations" ON public.geofence_violations;
CREATE POLICY "Employees view own violations" ON public.geofence_violations FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR manages violations" ON public.geofence_violations FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- Payslips
DROP POLICY IF EXISTS "Users can view payslips" ON public.payslips;
DROP POLICY IF EXISTS "Users can manage payslips" ON public.payslips;
DROP POLICY IF EXISTS "Authenticated users can view payslips" ON public.payslips;
DROP POLICY IF EXISTS "Authenticated users can manage payslips" ON public.payslips;
CREATE POLICY "Employees view own payslips" ON public.payslips FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "HR manages payslips" ON public.payslips FOR ALL TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());

-- HSE Incidents
DROP POLICY IF EXISTS "Users can view incidents" ON public.hse_incidents;
DROP POLICY IF EXISTS "Users can manage incidents" ON public.hse_incidents;
DROP POLICY IF EXISTS "Authenticated users can view incidents" ON public.hse_incidents;
DROP POLICY IF EXISTS "Authenticated users can manage incidents" ON public.hse_incidents;
CREATE POLICY "Employees view own incidents" ON public.hse_incidents FOR SELECT TO authenticated USING (reported_by = auth.uid() OR public.is_admin_or_hr());
CREATE POLICY "Employees report incidents" ON public.hse_incidents FOR INSERT TO authenticated WITH CHECK (reported_by = auth.uid());
CREATE POLICY "HR manages incidents" ON public.hse_incidents FOR UPDATE TO authenticated USING (public.is_admin_or_hr()) WITH CHECK (public.is_admin_or_hr());
CREATE POLICY "HR deletes incidents" ON public.hse_incidents FOR DELETE TO authenticated USING (public.is_admin_or_hr());

-- Audit logs - append-only
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated insert audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin views audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
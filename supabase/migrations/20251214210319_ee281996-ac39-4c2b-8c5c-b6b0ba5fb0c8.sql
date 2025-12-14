
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can view leave payment rules" ON public.leave_payment_rules;
DROP POLICY IF EXISTS "Users can view leave payment tiers" ON public.leave_payment_tiers;
DROP POLICY IF EXISTS "Users can view leave payroll mappings" ON public.leave_payroll_mappings;

-- Create proper company-filtered policies for leave_payment_rules
CREATE POLICY "Users can view leave payment rules for their company" 
ON public.leave_payment_rules FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.company_id = leave_payment_rules.company_id
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager')
  )
);

-- Create proper company-filtered policies for leave_payment_tiers
CREATE POLICY "Users can view leave payment tiers for their company" 
ON public.leave_payment_tiers FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.leave_payment_rules lpr
    JOIN public.profiles p ON p.company_id = lpr.company_id
    WHERE lpr.id = leave_payment_tiers.leave_payment_rule_id AND p.id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager')
  )
);

-- Create proper company-filtered policies for leave_payroll_mappings
CREATE POLICY "Users can view leave payroll mappings for their company" 
ON public.leave_payroll_mappings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.company_id = leave_payroll_mappings.company_id
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager')
  )
);

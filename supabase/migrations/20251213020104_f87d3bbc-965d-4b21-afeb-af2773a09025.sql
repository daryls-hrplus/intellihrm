-- Compensatory Time Off Configuration (per company)
CREATE TABLE public.comp_time_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Policy',
  description TEXT,
  expiry_type TEXT NOT NULL DEFAULT 'no_expiry' CHECK (expiry_type IN ('configurable', 'no_expiry', 'year_end_reset')),
  expiry_days INTEGER,
  max_balance_hours NUMERIC,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Compensatory Time Earned Records (employee requests)
CREATE TABLE public.comp_time_earned (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.comp_time_policies(id),
  hours_earned NUMERIC NOT NULL CHECK (hours_earned > 0),
  work_date DATE NOT NULL,
  reason TEXT NOT NULL,
  work_type TEXT NOT NULL DEFAULT 'overtime' CHECK (work_type IN ('overtime', 'holiday_work', 'weekend_work', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  expires_at DATE,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compensatory Time Used Records
CREATE TABLE public.comp_time_used (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  hours_used NUMERIC NOT NULL CHECK (hours_used > 0),
  use_date DATE NOT NULL,
  reason TEXT,
  leave_request_id UUID REFERENCES public.leave_requests(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compensatory Time Balance
CREATE TABLE public.comp_time_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  total_used NUMERIC NOT NULL DEFAULT 0,
  total_expired NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, company_id)
);

-- Enable RLS
ALTER TABLE public.comp_time_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comp_time_earned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comp_time_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comp_time_balances ENABLE ROW LEVEL SECURITY;

-- Policies for comp_time_policies
CREATE POLICY "Admins and HR can manage comp time policies"
  ON public.comp_time_policies FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can view active policies"
  ON public.comp_time_policies FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Policies for comp_time_earned
CREATE POLICY "Employees can view own comp time earned"
  ON public.comp_time_earned FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Employees can create comp time requests"
  ON public.comp_time_earned FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Admins and HR can manage all comp time earned"
  ON public.comp_time_earned FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Policies for comp_time_used
CREATE POLICY "Employees can view own comp time used"
  ON public.comp_time_used FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Employees can create comp time usage requests"
  ON public.comp_time_used FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Admins and HR can manage all comp time used"
  ON public.comp_time_used FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Policies for comp_time_balances
CREATE POLICY "Employees can view own comp time balance"
  ON public.comp_time_balances FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Admins and HR can view all comp time balances"
  ON public.comp_time_balances FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "System can manage comp time balances"
  ON public.comp_time_balances FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Function to recalculate comp time balance
CREATE OR REPLACE FUNCTION public.recalculate_comp_time_balance(p_employee_id UUID, p_company_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_earned NUMERIC;
  v_total_used NUMERIC;
  v_total_expired NUMERIC;
BEGIN
  SELECT COALESCE(SUM(hours_earned), 0)
  INTO v_total_earned
  FROM comp_time_earned
  WHERE employee_id = p_employee_id
    AND company_id = p_company_id
    AND status = 'approved';

  SELECT COALESCE(SUM(hours_used), 0)
  INTO v_total_used
  FROM comp_time_used
  WHERE employee_id = p_employee_id
    AND company_id = p_company_id
    AND status = 'approved';

  SELECT COALESCE(SUM(hours_earned), 0)
  INTO v_total_expired
  FROM comp_time_earned
  WHERE employee_id = p_employee_id
    AND company_id = p_company_id
    AND status = 'expired';

  INSERT INTO comp_time_balances (employee_id, company_id, total_earned, total_used, total_expired, current_balance, last_calculated_at)
  VALUES (p_employee_id, p_company_id, v_total_earned, v_total_used, v_total_expired, v_total_earned - v_total_used, now())
  ON CONFLICT (employee_id, company_id)
  DO UPDATE SET
    total_earned = v_total_earned,
    total_used = v_total_used,
    total_expired = v_total_expired,
    current_balance = v_total_earned - v_total_used,
    last_calculated_at = now(),
    updated_at = now();
END;
$$;

-- Trigger to recalculate balance when earned status changes
CREATE OR REPLACE FUNCTION public.trigger_recalc_comp_time_on_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_comp_time_balance(OLD.employee_id, OLD.company_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_comp_time_balance(NEW.employee_id, NEW.company_id);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER recalc_comp_time_on_earned
AFTER INSERT OR UPDATE OR DELETE ON public.comp_time_earned
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalc_comp_time_on_earned();

-- Trigger to recalculate balance when used status changes
CREATE OR REPLACE FUNCTION public.trigger_recalc_comp_time_on_used()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_comp_time_balance(OLD.employee_id, OLD.company_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_comp_time_balance(NEW.employee_id, NEW.company_id);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER recalc_comp_time_on_used
AFTER INSERT OR UPDATE OR DELETE ON public.comp_time_used
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalc_comp_time_on_used();
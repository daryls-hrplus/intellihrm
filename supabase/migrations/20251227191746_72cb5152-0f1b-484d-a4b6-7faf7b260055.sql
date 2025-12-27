-- Create overpayment_records table
CREATE TABLE public.overpayment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overpayment_date DATE NOT NULL,
  discovery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT NOT NULL,
  reason_details TEXT,
  original_amount NUMERIC(15,2) NOT NULL,
  recovery_amount_per_cycle NUMERIC(15,2) NOT NULL,
  total_recovered NUMERIC(15,2) NOT NULL DEFAULT 0,
  remaining_balance NUMERIC(15,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'pending_approval',
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  linked_deduction_id UUID REFERENCES public.employee_regular_deductions(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending_approval', 'active', 'suspended', 'completed', 'written_off', 'cancelled')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT positive_amounts CHECK (original_amount > 0 AND recovery_amount_per_cycle > 0)
);

-- Create overpayment_status_history table
CREATE TABLE public.overpayment_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  overpayment_id UUID NOT NULL REFERENCES public.overpayment_records(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create overpayment_recovery_payments table
CREATE TABLE public.overpayment_recovery_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  overpayment_id UUID NOT NULL REFERENCES public.overpayment_records(id) ON DELETE CASCADE,
  pay_period_id UUID REFERENCES public.pay_periods(id),
  deduction_id UUID REFERENCES public.employee_period_deductions(id),
  amount NUMERIC(15,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50) DEFAULT 'payroll_deduction',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_overpayment_records_company ON public.overpayment_records(company_id);
CREATE INDEX idx_overpayment_records_employee ON public.overpayment_records(employee_id);
CREATE INDEX idx_overpayment_records_status ON public.overpayment_records(status);
CREATE INDEX idx_overpayment_status_history_record ON public.overpayment_status_history(overpayment_id);
CREATE INDEX idx_overpayment_recovery_payments_record ON public.overpayment_recovery_payments(overpayment_id);

-- Enable RLS
ALTER TABLE public.overpayment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overpayment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overpayment_recovery_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for overpayment_records
CREATE POLICY "Users can view overpayment records in their company"
  ON public.overpayment_records FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create overpayment records in their company"
  ON public.overpayment_records FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update overpayment records in their company"
  ON public.overpayment_records FOR UPDATE
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete overpayment records in their company"
  ON public.overpayment_records FOR DELETE
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for overpayment_status_history
CREATE POLICY "Users can view status history for their company records"
  ON public.overpayment_status_history FOR SELECT
  USING (overpayment_id IN (
    SELECT id FROM public.overpayment_records 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  ));

CREATE POLICY "Users can create status history for their company records"
  ON public.overpayment_status_history FOR INSERT
  WITH CHECK (overpayment_id IN (
    SELECT id FROM public.overpayment_records 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  ));

-- RLS Policies for overpayment_recovery_payments
CREATE POLICY "Users can view recovery payments for their company records"
  ON public.overpayment_recovery_payments FOR SELECT
  USING (overpayment_id IN (
    SELECT id FROM public.overpayment_records 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  ));

CREATE POLICY "Users can create recovery payments for their company records"
  ON public.overpayment_recovery_payments FOR INSERT
  WITH CHECK (overpayment_id IN (
    SELECT id FROM public.overpayment_records 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  ));

-- Add scheduled_resume_date column for suspended recoveries
ALTER TABLE public.overpayment_records ADD COLUMN scheduled_resume_date DATE;

-- Create trigger for updated_at
CREATE TRIGGER update_overpayment_records_updated_at
  BEFORE UPDATE ON public.overpayment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
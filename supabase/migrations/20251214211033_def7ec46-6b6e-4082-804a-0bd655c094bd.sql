
-- Create leave_balance_buyouts table
CREATE TABLE public.leave_balance_buyouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  leave_days_bought NUMERIC(10,2) NOT NULL,
  buyout_rate NUMERIC(5,4) NOT NULL DEFAULT 1.0000,
  daily_rate_amount NUMERIC(12,2) NOT NULL,
  total_buyout_amount NUMERIC(12,2) NOT NULL,
  currency_id UUID REFERENCES public.currencies(id),
  agreement_date DATE NOT NULL,
  transaction_date DATE NOT NULL,
  pay_group_id UUID REFERENCES public.pay_groups(id),
  pay_period_id UUID REFERENCES public.pay_periods(id),
  agreement_document_url TEXT,
  agreement_document_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_balance_buyouts ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_leave_balance_buyouts_company ON public.leave_balance_buyouts(company_id);
CREATE INDEX idx_leave_balance_buyouts_employee ON public.leave_balance_buyouts(employee_id);
CREATE INDEX idx_leave_balance_buyouts_leave_type ON public.leave_balance_buyouts(leave_type_id);
CREATE INDEX idx_leave_balance_buyouts_pay_period ON public.leave_balance_buyouts(pay_period_id);
CREATE INDEX idx_leave_balance_buyouts_status ON public.leave_balance_buyouts(status);
CREATE INDEX idx_leave_balance_buyouts_transaction_date ON public.leave_balance_buyouts(transaction_date);

-- RLS policies
CREATE POLICY "Users can view leave buyouts for their company" 
ON public.leave_balance_buyouts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.company_id = leave_balance_buyouts.company_id
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "Admins and HR can insert leave buyouts" 
ON public.leave_balance_buyouts FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "Admins and HR can update leave buyouts" 
ON public.leave_balance_buyouts FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "Admins and HR can delete leave buyouts" 
ON public.leave_balance_buyouts FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager')
  )
);

-- Create storage bucket for agreement documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('leave-buyout-agreements', 'leave-buyout-agreements', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for agreement documents
CREATE POLICY "Authenticated users can upload buyout agreements"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'leave-buyout-agreements' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view buyout agreements"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'leave-buyout-agreements' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update buyout agreements"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'leave-buyout-agreements' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete buyout agreements"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'leave-buyout-agreements' 
  AND auth.role() = 'authenticated'
);

-- Trigger for updated_at
CREATE TRIGGER update_leave_balance_buyouts_updated_at
  BEFORE UPDATE ON public.leave_balance_buyouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

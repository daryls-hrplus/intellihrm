-- Add payroll-related fields to expense_claims
ALTER TABLE public.expense_claims
ADD COLUMN IF NOT EXISTS pay_period_id UUID REFERENCES public.pay_periods(id),
ADD COLUMN IF NOT EXISTS approved_for_payment_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_for_payment_by UUID REFERENCES public.profiles(id);

-- Create index for payroll queries
CREATE INDEX IF NOT EXISTS idx_expense_claims_pay_period ON public.expense_claims(pay_period_id);
CREATE INDEX IF NOT EXISTS idx_expense_claims_status_company ON public.expense_claims(status, company_id);

-- Create storage bucket for expense receipts if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for expense receipts
CREATE POLICY "Users can upload expense receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'expense-receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view expense receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'expense-receipts');

CREATE POLICY "Users can update their expense receipts"
ON storage.objects FOR UPDATE
USING (bucket_id = 'expense-receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their expense receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'expense-receipts' AND auth.uid() IS NOT NULL);
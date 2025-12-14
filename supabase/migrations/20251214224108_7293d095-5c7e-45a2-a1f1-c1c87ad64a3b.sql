-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.company_subscriptions(id) ON DELETE CASCADE,
  invoice_type TEXT NOT NULL DEFAULT 'subscription' CHECK (invoice_type IN ('subscription', 'renewal', 'upgrade', 'adjustment')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'void')),
  
  -- Billing period
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  
  -- Amounts
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  discount_description TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Line items stored as JSON
  line_items JSONB NOT NULL DEFAULT '[]',
  
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Payment details
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Metadata
  notes TEXT,
  terms TEXT,
  footer_text TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invoice settings table
CREATE TABLE public.invoice_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Company details for invoice
  company_name TEXT,
  company_address TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_tax_id TEXT,
  company_logo_url TEXT,
  
  -- Invoice configuration
  invoice_prefix TEXT DEFAULT 'INV',
  next_invoice_number INTEGER DEFAULT 1,
  default_tax_rate NUMERIC(5,2) DEFAULT 0,
  default_payment_terms INTEGER DEFAULT 30, -- days
  default_currency TEXT DEFAULT 'USD',
  
  -- Email settings
  send_to_company_admin BOOLEAN DEFAULT true,
  additional_email_recipients TEXT[], -- Array of email addresses
  cc_system_admin BOOLEAN DEFAULT true,
  system_admin_email TEXT,
  
  -- Template settings
  invoice_terms TEXT DEFAULT 'Payment is due within 30 days of invoice date.',
  invoice_footer TEXT DEFAULT 'Thank you for your business!',
  
  -- Reminder settings
  send_renewal_reminder BOOLEAN DEFAULT true,
  renewal_reminder_days INTEGER DEFAULT 10, -- Days before renewal
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_global_settings UNIQUE (company_id)
);

-- Create invoice email log table
CREATE TABLE public.invoice_email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('invoice', 'reminder', 'overdue', 'receipt')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
  error_message TEXT,
  resend_message_id TEXT
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Company admins can view their invoices" ON public.invoices
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for invoice_settings
CREATE POLICY "Admins can manage invoice settings" ON public.invoice_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for invoice_email_logs
CREATE POLICY "Admins can view invoice email logs" ON public.invoice_email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'super_admin')
    )
  );

-- Create indexes
CREATE INDEX idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX idx_invoices_subscription_id ON public.invoices(subscription_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoice_email_logs_invoice_id ON public.invoice_email_logs(invoice_id);

-- Add triggers for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoice_settings_updated_at
  BEFORE UPDATE ON public.invoice_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default global invoice settings
INSERT INTO public.invoice_settings (
  company_id,
  company_name,
  invoice_prefix,
  invoice_terms,
  invoice_footer
) VALUES (
  NULL,
  'HRplus Cerebra',
  'INV',
  'Payment is due within 30 days of invoice date. Please include your invoice number with your payment.',
  'Thank you for choosing HRplus Cerebra. For billing inquiries, please contact billing@hrplus.com'
);
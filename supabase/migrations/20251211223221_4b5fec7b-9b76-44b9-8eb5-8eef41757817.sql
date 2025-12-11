
-- Employee Addresses
CREATE TABLE public.employee_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL DEFAULT 'home',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'USA',
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Bank Accounts
CREATE TABLE public.employee_bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT,
  iban TEXT,
  swift_code TEXT,
  account_type TEXT NOT NULL DEFAULT 'checking',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  currency TEXT NOT NULL DEFAULT 'USD',
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Beneficiaries
CREATE TABLE public.employee_beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT,
  email TEXT,
  address TEXT,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 100,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  beneficiary_type TEXT NOT NULL DEFAULT 'primary',
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Documents
CREATE TABLE public.employee_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  expiry_date DATE,
  notes TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_addresses
CREATE POLICY "Users can view own addresses" ON public.employee_addresses
  FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all addresses" ON public.employee_addresses
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own addresses" ON public.employee_addresses
  FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all addresses" ON public.employee_addresses
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_bank_accounts
CREATE POLICY "Users can view own bank accounts" ON public.employee_bank_accounts
  FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all bank accounts" ON public.employee_bank_accounts
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own bank accounts" ON public.employee_bank_accounts
  FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all bank accounts" ON public.employee_bank_accounts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_beneficiaries
CREATE POLICY "Users can view own beneficiaries" ON public.employee_beneficiaries
  FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all beneficiaries" ON public.employee_beneficiaries
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own beneficiaries" ON public.employee_beneficiaries
  FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all beneficiaries" ON public.employee_beneficiaries
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for employee_documents
CREATE POLICY "Users can view own documents" ON public.employee_documents
  FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all documents" ON public.employee_documents
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));
CREATE POLICY "Users can manage own documents" ON public.employee_documents
  FOR ALL USING (auth.uid() = employee_id);
CREATE POLICY "Admins can manage all documents" ON public.employee_documents
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- Create storage bucket for employee documents
INSERT INTO storage.buckets (id, name, public) VALUES ('employee-documents', 'employee-documents', false);

-- Storage policies
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'employee-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'employee-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can manage all employee documents" ON storage.objects
  FOR ALL USING (bucket_id = 'employee-documents' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role)));

-- Indexes
CREATE INDEX idx_employee_addresses_employee ON public.employee_addresses(employee_id);
CREATE INDEX idx_employee_bank_accounts_employee ON public.employee_bank_accounts(employee_id);
CREATE INDEX idx_employee_beneficiaries_employee ON public.employee_beneficiaries(employee_id);
CREATE INDEX idx_employee_documents_employee ON public.employee_documents(employee_id);

-- Triggers for updated_at
CREATE TRIGGER update_employee_addresses_updated_at BEFORE UPDATE ON public.employee_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_bank_accounts_updated_at BEFORE UPDATE ON public.employee_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_beneficiaries_updated_at BEFORE UPDATE ON public.employee_beneficiaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_documents_updated_at BEFORE UPDATE ON public.employee_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

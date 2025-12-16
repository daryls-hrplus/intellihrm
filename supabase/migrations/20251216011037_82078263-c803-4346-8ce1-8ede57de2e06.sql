-- Create payslip templates table for company-specific payslip customization
CREATE TABLE public.payslip_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  template_name VARCHAR(100) NOT NULL DEFAULT 'Default Template',
  template_style VARCHAR(20) NOT NULL DEFAULT 'classic' CHECK (template_style IN ('classic', 'modern', 'minimal')),
  
  -- Company branding
  company_logo_url TEXT,
  company_name_override VARCHAR(200),
  company_address TEXT,
  company_phone VARCHAR(50),
  company_email VARCHAR(100),
  company_website VARCHAR(200),
  company_registration_number VARCHAR(100),
  
  -- Colors and styling
  primary_color VARCHAR(20) DEFAULT '#1e40af',
  secondary_color VARCHAR(20) DEFAULT '#64748b',
  accent_color VARCHAR(20) DEFAULT '#059669',
  
  -- Content options
  show_company_logo BOOLEAN DEFAULT true,
  show_company_address BOOLEAN DEFAULT true,
  show_employee_address BOOLEAN DEFAULT true,
  show_employee_id BOOLEAN DEFAULT true,
  show_department BOOLEAN DEFAULT true,
  show_position BOOLEAN DEFAULT true,
  show_bank_details BOOLEAN DEFAULT false,
  show_ytd_totals BOOLEAN DEFAULT true,
  show_tax_breakdown BOOLEAN DEFAULT true,
  show_statutory_breakdown BOOLEAN DEFAULT true,
  
  -- Custom text
  header_text TEXT,
  footer_text TEXT DEFAULT 'This is a computer-generated document. No signature required.',
  confidentiality_notice TEXT DEFAULT 'CONFIDENTIAL - For employee use only',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  
  UNIQUE(company_id, template_name)
);

-- Enable RLS
ALTER TABLE public.payslip_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view payslip templates for their company"
  ON public.payslip_templates FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage payslip templates"
  ON public.payslip_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('admin', 'hr_manager', 'payroll_admin')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_payslip_templates_updated_at
  BEFORE UPDATE ON public.payslip_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index
CREATE INDEX idx_payslip_templates_company ON public.payslip_templates(company_id);
CREATE INDEX idx_payslip_templates_active ON public.payslip_templates(company_id, is_active, is_default);
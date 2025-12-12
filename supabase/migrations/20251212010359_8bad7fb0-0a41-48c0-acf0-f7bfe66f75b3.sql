-- Create responsibilities table
CREATE TABLE public.responsibilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint for company + code
ALTER TABLE public.responsibilities ADD CONSTRAINT responsibilities_company_code_unique UNIQUE (company_id, code);

-- Enable RLS
ALTER TABLE public.responsibilities ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view responsibilities"
  ON public.responsibilities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and HR managers can manage responsibilities"
  ON public.responsibilities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'hr_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'hr_manager')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_responsibilities_updated_at
  BEFORE UPDATE ON public.responsibilities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for company lookup
CREATE INDEX idx_responsibilities_company_id ON public.responsibilities(company_id);
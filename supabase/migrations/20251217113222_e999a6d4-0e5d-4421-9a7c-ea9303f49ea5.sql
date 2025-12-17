-- Create statutory reporting documents table
CREATE TABLE public.statutory_reporting_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  statutory_deduction_type_id UUID NOT NULL REFERENCES public.statutory_deduction_types(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  reporting_interval TEXT NOT NULL CHECK (reporting_interval IN ('monthly', 'quarterly', 'annually', 'ad_hoc')),
  file_path TEXT,
  file_name TEXT,
  file_type TEXT,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  required_data_structures JSONB DEFAULT '[]'::jsonb,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  extraction_notes TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.statutory_reporting_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view statutory reporting documents"
  ON public.statutory_reporting_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert statutory reporting documents"
  ON public.statutory_reporting_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update statutory reporting documents"
  ON public.statutory_reporting_documents
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete statutory reporting documents"
  ON public.statutory_reporting_documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_statutory_reporting_documents_updated_at
  BEFORE UPDATE ON public.statutory_reporting_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_statutory_reporting_documents_type_id ON public.statutory_reporting_documents(statutory_deduction_type_id);
CREATE INDEX idx_statutory_reporting_documents_interval ON public.statutory_reporting_documents(reporting_interval);
CREATE INDEX idx_statutory_reporting_documents_dates ON public.statutory_reporting_documents(start_date, end_date);

-- Add comment
COMMENT ON TABLE public.statutory_reporting_documents IS 'Stores statutory reporting document templates linked to statutory deduction types with AI-extracted data structures for report generation';
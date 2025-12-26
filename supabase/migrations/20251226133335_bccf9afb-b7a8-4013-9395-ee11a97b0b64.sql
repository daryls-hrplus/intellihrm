-- Create import_batches table for tracking import history and enabling rollback
CREATE TABLE public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  import_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  total_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  skipped_records INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validating', 'validated', 'staging', 'committed', 'rolled_back', 'failed', 'cancelled')),
  staging_data JSONB,
  imported_record_ids JSONB DEFAULT '[]'::jsonb,
  validation_result JSONB,
  errors JSONB,
  warnings JSONB,
  field_mapping JSONB,
  import_options JSONB,
  imported_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  committed_at TIMESTAMPTZ,
  rolled_back_at TIMESTAMPTZ,
  rolled_back_by UUID REFERENCES auth.users(id),
  rollback_reason TEXT,
  rollback_eligible_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view import batches for their company"
  ON public.import_batches FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR imported_by = auth.uid()
  );

CREATE POLICY "Users can create import batches"
  ON public.import_batches FOR INSERT
  WITH CHECK (imported_by = auth.uid());

CREATE POLICY "Users can update their own import batches"
  ON public.import_batches FOR UPDATE
  USING (imported_by = auth.uid() OR 
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_import_batches_company ON public.import_batches(company_id);
CREATE INDEX idx_import_batches_status ON public.import_batches(status);
CREATE INDEX idx_import_batches_type ON public.import_batches(import_type);
CREATE INDEX idx_import_batches_imported_by ON public.import_batches(imported_by);
CREATE INDEX idx_import_batches_created_at ON public.import_batches(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_import_batches_updated_at
  BEFORE UPDATE ON public.import_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
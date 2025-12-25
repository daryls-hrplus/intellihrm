-- Create enum for form contexts
CREATE TYPE custom_field_form_context AS ENUM (
  'employee_profile',
  'employee_create',
  'leave_request',
  'job_requisition',
  'job_application',
  'performance_review',
  'training_request',
  'expense_claim',
  'grievance',
  'onboarding_task',
  'position',
  'department',
  'company'
);

-- Create enum for field types
CREATE TYPE custom_field_type AS ENUM (
  'text',
  'number',
  'date',
  'boolean',
  'select',
  'multi_select',
  'textarea',
  'email',
  'phone',
  'url',
  'currency'
);

-- Custom Field Definitions table
CREATE TABLE public.custom_field_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  form_context custom_field_form_context NOT NULL,
  field_code TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type custom_field_type NOT NULL DEFAULT 'text',
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  section_name TEXT,
  placeholder TEXT,
  help_text TEXT,
  default_value TEXT,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(company_id, form_context, field_code)
);

-- Custom Field Options table (for select/multi_select types)
CREATE TABLE public.custom_field_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_definition_id UUID NOT NULL REFERENCES public.custom_field_definitions(id) ON DELETE CASCADE,
  option_value TEXT NOT NULL,
  option_label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Custom Field Values table
CREATE TABLE public.custom_field_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_definition_id UUID NOT NULL REFERENCES public.custom_field_definitions(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  text_value TEXT,
  number_value NUMERIC,
  date_value DATE,
  boolean_value BOOLEAN,
  json_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id),
  UNIQUE(field_definition_id, entity_id, entity_type)
);

-- Add indexes for performance
CREATE INDEX idx_custom_field_definitions_company ON public.custom_field_definitions(company_id);
CREATE INDEX idx_custom_field_definitions_context ON public.custom_field_definitions(form_context);
CREATE INDEX idx_custom_field_definitions_active ON public.custom_field_definitions(is_active);
CREATE INDEX idx_custom_field_options_definition ON public.custom_field_options(field_definition_id);
CREATE INDEX idx_custom_field_values_entity ON public.custom_field_values(entity_id, entity_type);
CREATE INDEX idx_custom_field_values_definition ON public.custom_field_values(field_definition_id);

-- Add updated_at triggers
CREATE TRIGGER update_custom_field_definitions_updated_at
  BEFORE UPDATE ON public.custom_field_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_field_options_updated_at
  BEFORE UPDATE ON public.custom_field_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_field_values_updated_at
  BEFORE UPDATE ON public.custom_field_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_field_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_field_definitions
CREATE POLICY "Admins can manage custom field definitions"
  ON public.custom_field_definitions
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Users can read active custom field definitions"
  ON public.custom_field_definitions
  FOR SELECT
  USING (
    is_active = true AND
    (company_id IS NULL OR company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    ))
  );

-- RLS Policies for custom_field_options
CREATE POLICY "Admins can manage custom field options"
  ON public.custom_field_options
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Users can read active custom field options"
  ON public.custom_field_options
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for custom_field_values
CREATE POLICY "Admins can manage all custom field values"
  ON public.custom_field_values
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Users can read their own custom field values"
  ON public.custom_field_values
  FOR SELECT
  USING (
    entity_type = 'profiles' AND entity_id = auth.uid()
  );

CREATE POLICY "Users can update their own custom field values"
  ON public.custom_field_values
  FOR UPDATE
  USING (
    entity_type = 'profiles' AND entity_id = auth.uid()
  );

CREATE POLICY "Users can insert their own custom field values"
  ON public.custom_field_values
  FOR INSERT
  WITH CHECK (
    entity_type = 'profiles' AND entity_id = auth.uid()
  );
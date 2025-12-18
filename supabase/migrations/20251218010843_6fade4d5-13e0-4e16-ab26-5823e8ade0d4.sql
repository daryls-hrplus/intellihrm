-- Create enablement document templates table
CREATE TABLE public.enablement_document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom' CHECK (category IN ('training_guide', 'user_manual', 'sop', 'quick_start', 'custom')),
  layout_config JSONB NOT NULL DEFAULT '{}',
  sections_config JSONB NOT NULL DEFAULT '{}',
  formatting_config JSONB NOT NULL DEFAULT '{}',
  branding_config JSONB NOT NULL DEFAULT '{}',
  is_system_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enablement template reference documents table
CREATE TABLE public.enablement_template_reference_docs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.enablement_document_templates(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  storage_path TEXT,
  document_type TEXT NOT NULL DEFAULT 'pdf' CHECK (document_type IN ('pdf', 'docx', 'txt', 'existing_doc')),
  extracted_content TEXT,
  extracted_styles JSONB DEFAULT '{}',
  file_size INTEGER,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enablement template instructions table
CREATE TABLE public.enablement_template_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.enablement_document_templates(id) ON DELETE CASCADE,
  instruction_type TEXT NOT NULL CHECK (instruction_type IN ('tone', 'audience', 'formatting', 'terminology', 'content')),
  instruction_key TEXT NOT NULL,
  instruction_value TEXT NOT NULL,
  priority_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enablement_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_template_reference_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_template_instructions ENABLE ROW LEVEL SECURITY;

-- Policies for enablement_document_templates
CREATE POLICY "Users can view templates" ON public.enablement_document_templates
  FOR SELECT USING (
    is_system_default = true OR 
    created_by = auth.uid() OR
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create templates" ON public.enablement_document_templates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own templates" ON public.enablement_document_templates
  FOR UPDATE USING (created_by = auth.uid() OR is_system_default = false);

CREATE POLICY "Users can delete own templates" ON public.enablement_document_templates
  FOR DELETE USING (created_by = auth.uid() AND is_system_default = false);

-- Policies for enablement_template_reference_docs
CREATE POLICY "Users can view reference docs" ON public.enablement_template_reference_docs
  FOR SELECT USING (
    created_by = auth.uid() OR
    template_id IN (SELECT id FROM enablement_document_templates WHERE is_system_default = true OR created_by = auth.uid())
  );

CREATE POLICY "Users can create reference docs" ON public.enablement_template_reference_docs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own reference docs" ON public.enablement_template_reference_docs
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own reference docs" ON public.enablement_template_reference_docs
  FOR DELETE USING (created_by = auth.uid());

-- Policies for enablement_template_instructions
CREATE POLICY "Users can view instructions" ON public.enablement_template_instructions
  FOR SELECT USING (
    created_by = auth.uid() OR
    template_id IN (SELECT id FROM enablement_document_templates WHERE is_system_default = true OR created_by = auth.uid())
  );

CREATE POLICY "Users can create instructions" ON public.enablement_template_instructions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own instructions" ON public.enablement_template_instructions
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own instructions" ON public.enablement_template_instructions
  FOR DELETE USING (created_by = auth.uid());

-- Create updated_at triggers
CREATE TRIGGER update_enablement_document_templates_updated_at
  BEFORE UPDATE ON public.enablement_document_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enablement_template_reference_docs_updated_at
  BEFORE UPDATE ON public.enablement_template_reference_docs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enablement_template_instructions_updated_at
  BEFORE UPDATE ON public.enablement_template_instructions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for reference documents
INSERT INTO storage.buckets (id, name, public) VALUES ('enablement-reference-docs', 'enablement-reference-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for reference documents
CREATE POLICY "Users can upload reference docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'enablement-reference-docs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view reference docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'enablement-reference-docs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own reference docs" ON storage.objects
  FOR DELETE USING (bucket_id = 'enablement-reference-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
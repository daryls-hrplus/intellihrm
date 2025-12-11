-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Policy categories
CREATE TABLE public.policy_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'FileText',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Policy documents table
CREATE TABLE public.policy_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.policy_categories(id),
  company_id UUID REFERENCES public.companies(id), -- NULL means global policy
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, docx, txt, md
  file_size INTEGER,
  version TEXT DEFAULT '1.0',
  effective_date DATE,
  expiry_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_global BOOLEAN NOT NULL DEFAULT false, -- true = applies to all companies
  uploaded_by UUID NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  processing_error TEXT,
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document chunks with embeddings for RAG
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.policy_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for similarity search
CREATE INDEX document_chunks_embedding_idx ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Extracted policy rules for enforcement
CREATE TABLE public.policy_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.policy_documents(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL, -- age_restriction, document_required, approval_required, etc.
  rule_context TEXT NOT NULL, -- hiring, leave, benefits, etc.
  rule_description TEXT NOT NULL,
  rule_condition JSONB NOT NULL, -- structured rule data for programmatic checks
  severity TEXT DEFAULT 'warning', -- info, warning, error
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Policy enforcement logs (tracks when rules are triggered)
CREATE TABLE public.policy_enforcement_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES public.policy_rules(id),
  user_id UUID NOT NULL,
  action_context TEXT NOT NULL, -- what the user was trying to do
  rule_triggered TEXT NOT NULL,
  user_response TEXT, -- acknowledged, overridden, cancelled
  override_justification TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_enforcement_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for policy_categories
CREATE POLICY "Authenticated users can view active categories"
  ON public.policy_categories FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.policy_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for policy_documents
CREATE POLICY "Authenticated users can view active documents"
  ON public.policy_documents FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage documents"
  ON public.policy_documents FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for document_chunks
CREATE POLICY "Authenticated users can view chunks"
  ON public.document_chunks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage chunks"
  ON public.document_chunks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for policy_rules
CREATE POLICY "Authenticated users can view active rules"
  ON public.policy_rules FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage rules"
  ON public.policy_rules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for enforcement logs
CREATE POLICY "Users can view own enforcement logs"
  ON public.policy_enforcement_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enforcement logs"
  ON public.policy_enforcement_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert enforcement logs"
  ON public.policy_enforcement_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Function to search similar document chunks
CREATE OR REPLACE FUNCTION public.match_policy_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  p_company_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT,
  document_title TEXT,
  category_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    pd.title AS document_title,
    pc.name AS category_name
  FROM document_chunks dc
  JOIN policy_documents pd ON dc.document_id = pd.id
  LEFT JOIN policy_categories pc ON pd.category_id = pc.id
  WHERE pd.is_active = true
    AND pd.processing_status = 'completed'
    AND (pd.is_global = true OR pd.company_id = p_company_id OR p_company_id IS NULL)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create storage bucket for policy documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('policy-documents', 'policy-documents', false, 52428800); -- 50MB limit

-- Storage policies
CREATE POLICY "Admins can upload policy documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'policy-documents' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update policy documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'policy-documents' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete policy documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'policy-documents' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view policy documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'policy-documents' AND auth.uid() IS NOT NULL);

-- Insert default policy categories
INSERT INTO public.policy_categories (name, code, description, icon, display_order) VALUES
  ('Human Resources', 'hr', 'General HR policies and procedures', 'Users', 1),
  ('Recruitment & Hiring', 'hiring', 'Policies related to recruitment and onboarding', 'UserPlus', 2),
  ('Leave & Attendance', 'leave', 'Leave policies, attendance rules, and time-off procedures', 'Calendar', 3),
  ('Compensation & Benefits', 'compensation', 'Salary, bonuses, and benefits policies', 'DollarSign', 4),
  ('Health & Safety', 'safety', 'Workplace safety and health guidelines', 'Shield', 5),
  ('Code of Conduct', 'conduct', 'Employee behavior and ethics guidelines', 'Scale', 6),
  ('Data & Privacy', 'privacy', 'Data protection and privacy policies', 'Lock', 7),
  ('Training & Development', 'training', 'Learning and development policies', 'GraduationCap', 8);

-- Update trigger for timestamps
CREATE TRIGGER update_policy_documents_updated_at
  BEFORE UPDATE ON public.policy_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_policy_rules_updated_at
  BEFORE UPDATE ON public.policy_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
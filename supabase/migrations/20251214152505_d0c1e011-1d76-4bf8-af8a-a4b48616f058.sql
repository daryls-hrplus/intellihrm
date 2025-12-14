-- Create SOP (Standard Operating Procedures) knowledge base tables
CREATE TABLE public.sop_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.sop_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.sop_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  version TEXT DEFAULT '1.0',
  task_type TEXT, -- e.g., 'leave_request', 'expense_claim', 'onboarding', etc.
  applicable_roles TEXT[], -- Which roles this SOP applies to
  steps JSONB, -- Array of step objects with order, instruction, notes
  file_path TEXT,
  is_global BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  effective_date DATE,
  expiry_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SOP embeddings for RAG
CREATE TABLE public.sop_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID REFERENCES public.sop_documents(id) ON DELETE CASCADE NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI interaction audit logs
CREATE TABLE public.ai_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  session_id TEXT,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context_sources JSONB, -- Which sources were used (policies, SOPs, help center)
  tokens_used INTEGER,
  estimated_cost_usd NUMERIC(10, 6),
  user_role TEXT,
  pii_accessed BOOLEAN DEFAULT false,
  escalation_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI guardrails configuration
CREATE TABLE public.ai_guardrails_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  guardrail_type TEXT NOT NULL, -- 'role_access', 'pii_protection', 'escalation_topics', 'disclaimer'
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, guardrail_type, config_key)
);

-- Insert default guardrails configuration
INSERT INTO public.ai_guardrails_config (company_id, guardrail_type, config_key, config_value) VALUES
  (NULL, 'escalation_topics', 'topics', '["termination", "legal matter", "lawsuit", "harassment", "discrimination", "violence", "salary negotiation", "union", "strike", "disciplinary action"]'::jsonb),
  (NULL, 'disclaimer', 'text', '"This AI assistant provides guidance based on company policies and SOPs. For official decisions or sensitive matters, please consult with your HR representative."'::jsonb),
  (NULL, 'pii_protection', 'protected_fields', '["email", "phone", "address", "bank_account", "ssn", "national_id", "salary", "date_of_birth"]'::jsonb);

-- Create indexes
CREATE INDEX idx_sop_categories_company ON public.sop_categories(company_id);
CREATE INDEX idx_sop_documents_company ON public.sop_documents(company_id);
CREATE INDEX idx_sop_documents_category ON public.sop_documents(category_id);
CREATE INDEX idx_sop_documents_task_type ON public.sop_documents(task_type);
CREATE INDEX idx_sop_embeddings_sop ON public.sop_embeddings(sop_id);
CREATE INDEX idx_ai_interaction_logs_user ON public.ai_interaction_logs(user_id);
CREATE INDEX idx_ai_interaction_logs_created ON public.ai_interaction_logs(created_at);
CREATE INDEX idx_ai_guardrails_config_type ON public.ai_guardrails_config(guardrail_type);

-- Enable RLS
ALTER TABLE public.sop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sop_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sop_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_guardrails_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for SOP categories
CREATE POLICY "Admins and HR can manage SOP categories"
  ON public.sop_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can view active SOP categories"
  ON public.sop_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS policies for SOP documents
CREATE POLICY "Admins and HR can manage SOP documents"
  ON public.sop_documents FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can view active SOP documents"
  ON public.sop_documents FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS policies for SOP embeddings
CREATE POLICY "Admins and HR can manage SOP embeddings"
  ON public.sop_embeddings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can view SOP embeddings"
  ON public.sop_embeddings FOR SELECT
  TO authenticated
  USING (true);

-- RLS policies for AI interaction logs
CREATE POLICY "Admins can view all AI interaction logs"
  ON public.ai_interaction_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own AI interaction logs"
  ON public.ai_interaction_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert AI interaction logs"
  ON public.ai_interaction_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS policies for AI guardrails config
CREATE POLICY "Admins can manage AI guardrails config"
  ON public.ai_guardrails_config FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view AI guardrails config"
  ON public.ai_guardrails_config FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Function to match SOPs for RAG
CREATE OR REPLACE FUNCTION public.match_sop_documents(
  query_embedding vector,
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 5,
  p_company_id uuid DEFAULT NULL,
  p_task_type text DEFAULT NULL
)
RETURNS TABLE(
  id uuid, 
  sop_id uuid, 
  content text, 
  similarity double precision, 
  sop_title text, 
  category_name text,
  steps jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id,
    se.sop_id,
    se.content,
    1 - (se.embedding <=> query_embedding) AS similarity,
    sd.title AS sop_title,
    sc.name AS category_name,
    sd.steps
  FROM sop_embeddings se
  JOIN sop_documents sd ON se.sop_id = sd.id
  LEFT JOIN sop_categories sc ON sd.category_id = sc.id
  WHERE sd.is_active = true
    AND sd.processing_status = 'completed'
    AND (sd.is_global = true OR sd.company_id = p_company_id OR p_company_id IS NULL)
    AND (p_task_type IS NULL OR sd.task_type = p_task_type)
    AND 1 - (se.embedding <=> query_embedding) > match_threshold
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_sop_categories_updated_at
  BEFORE UPDATE ON public.sop_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sop_documents_updated_at
  BEFORE UPDATE ON public.sop_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_guardrails_config_updated_at
  BEFORE UPDATE ON public.ai_guardrails_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
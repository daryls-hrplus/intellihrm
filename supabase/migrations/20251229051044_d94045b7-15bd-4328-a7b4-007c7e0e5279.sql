-- CBA Articles: Break down agreements into articles/sections
CREATE TABLE public.cba_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES public.collective_agreements(id) ON DELETE CASCADE,
  article_number VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  category VARCHAR(50), -- wages, scheduling, benefits, discipline, seniority, leave, safety, general
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CBA Clauses: Specific provisions within articles
CREATE TABLE public.cba_clauses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.cba_articles(id) ON DELETE CASCADE,
  clause_number VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  clause_type VARCHAR(50), -- mandatory, optional, negotiable
  is_enforceable BOOLEAN DEFAULT false,
  rule_parameters JSONB, -- For automated rule extraction
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CBA Versions: Version history for agreements
CREATE TABLE public.cba_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES public.collective_agreements(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  effective_date DATE NOT NULL,
  changes_summary TEXT,
  document_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agreement_id, version_number)
);

-- CBA Negotiations: Track negotiation sessions
CREATE TABLE public.cba_negotiations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID REFERENCES public.collective_agreements(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  union_id UUID NOT NULL REFERENCES public.unions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  session_date DATE,
  session_time TIME,
  location TEXT,
  meeting_type VARCHAR(50) DEFAULT 'in_person', -- in_person, virtual, hybrid
  attendees JSONB, -- Array of {name, role, organization}
  agenda TEXT,
  outcomes TEXT,
  next_steps TEXT,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, adjourned
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CBA Proposals: Track proposals and counter-proposals
CREATE TABLE public.cba_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  negotiation_id UUID NOT NULL REFERENCES public.cba_negotiations(id) ON DELETE CASCADE,
  proposed_by VARCHAR(20) NOT NULL, -- union, management
  proposal_type VARCHAR(50) NOT NULL, -- initial, counter, final
  title TEXT NOT NULL,
  content TEXT,
  affected_articles TEXT[], -- Array of article references
  estimated_cost_impact NUMERIC(15,2),
  cost_justification TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, withdrawn, modified
  response_notes TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CBA Amendments: Side letters and amendments to agreements
CREATE TABLE public.cba_amendments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES public.collective_agreements(id) ON DELETE CASCADE,
  amendment_number VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  content TEXT,
  affected_articles TEXT[], -- Array of article numbers affected
  document_url TEXT,
  status VARCHAR(50) DEFAULT 'active', -- draft, pending_approval, active, expired, superseded
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CBA Enforceable Rules: Specific rules extracted for automation
CREATE TABLE public.cba_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES public.collective_agreements(id) ON DELETE CASCADE,
  clause_id UUID REFERENCES public.cba_clauses(id) ON DELETE SET NULL,
  rule_type VARCHAR(50) NOT NULL, -- max_hours, min_rest_period, overtime_threshold, seniority_bidding, shift_premium, weekend_limit, holiday_premium, break_requirement
  rule_name TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL, -- {threshold_value, threshold_unit, conditions, etc.}
  applies_to_departments UUID[], -- Null = all departments
  applies_to_positions UUID[], -- Null = all positions
  enforcement_action VARCHAR(20) DEFAULT 'warn', -- block, warn, log
  is_active BOOLEAN DEFAULT true,
  effective_date DATE,
  expiry_date DATE,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CBA Violations: Track detected violations of CBA rules
CREATE TABLE public.cba_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  agreement_id UUID NOT NULL REFERENCES public.collective_agreements(id) ON DELETE CASCADE,
  clause_id UUID REFERENCES public.cba_clauses(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES public.cba_rules(id) ON DELETE SET NULL,
  violation_date DATE NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  detected_by VARCHAR(20) DEFAULT 'system', -- system, manual
  affected_employee_id UUID REFERENCES public.profiles(id),
  related_grievance_id UUID REFERENCES public.grievances(id) ON DELETE SET NULL,
  evidence JSONB, -- Supporting data/screenshots
  status VARCHAR(50) DEFAULT 'open', -- open, under_review, resolved, disputed, escalated
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add cba_clause_id to grievances for linking
ALTER TABLE public.grievances ADD COLUMN IF NOT EXISTS cba_clause_id UUID REFERENCES public.cba_clauses(id) ON DELETE SET NULL;

-- Enable RLS on all new tables
ALTER TABLE public.cba_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cba_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cba_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cba_negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cba_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cba_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cba_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cba_violations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cba_articles
CREATE POLICY "Users can view CBA articles for their company" ON public.cba_articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collective_agreements ca
      JOIN public.profiles p ON p.company_id = ca.company_id
      WHERE ca.id = cba_articles.agreement_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "HR can manage CBA articles" ON public.cba_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.collective_agreements ca
      JOIN public.profiles p ON p.company_id = ca.company_id
      WHERE ca.id = cba_articles.agreement_id 
        AND p.id = auth.uid()
        AND public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  );

-- RLS Policies for cba_clauses
CREATE POLICY "Users can view CBA clauses for their company" ON public.cba_clauses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cba_articles a
      JOIN public.collective_agreements ca ON ca.id = a.agreement_id
      JOIN public.profiles p ON p.company_id = ca.company_id
      WHERE a.id = cba_clauses.article_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "HR can manage CBA clauses" ON public.cba_clauses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cba_articles a
      JOIN public.collective_agreements ca ON ca.id = a.agreement_id
      JOIN public.profiles p ON p.company_id = ca.company_id
      WHERE a.id = cba_clauses.article_id 
        AND p.id = auth.uid()
        AND public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  );

-- RLS Policies for cba_versions
CREATE POLICY "Users can view CBA versions for their company" ON public.cba_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collective_agreements ca
      JOIN public.profiles p ON p.company_id = ca.company_id
      WHERE ca.id = cba_versions.agreement_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "HR can manage CBA versions" ON public.cba_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.collective_agreements ca
      JOIN public.profiles p ON p.company_id = ca.company_id
      WHERE ca.id = cba_versions.agreement_id 
        AND p.id = auth.uid()
        AND public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  );

-- RLS Policies for cba_negotiations
CREATE POLICY "Users can view CBA negotiations for their company" ON public.cba_negotiations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.company_id = cba_negotiations.company_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "HR can manage CBA negotiations" ON public.cba_negotiations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.company_id = cba_negotiations.company_id 
        AND p.id = auth.uid()
        AND public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  );

-- RLS Policies for cba_proposals
CREATE POLICY "Users can view CBA proposals for their company negotiations" ON public.cba_proposals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cba_negotiations n
      JOIN public.profiles p ON p.company_id = n.company_id
      WHERE n.id = cba_proposals.negotiation_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "HR can manage CBA proposals" ON public.cba_proposals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cba_negotiations n
      JOIN public.profiles p ON p.company_id = n.company_id
      WHERE n.id = cba_proposals.negotiation_id 
        AND p.id = auth.uid()
        AND public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  );

-- RLS Policies for cba_amendments
CREATE POLICY "Users can view CBA amendments for their company" ON public.cba_amendments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collective_agreements ca
      JOIN public.profiles p ON p.company_id = ca.company_id
      WHERE ca.id = cba_amendments.agreement_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "HR can manage CBA amendments" ON public.cba_amendments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.collective_agreements ca
      JOIN public.profiles p ON p.company_id = ca.company_id
      WHERE ca.id = cba_amendments.agreement_id 
        AND p.id = auth.uid()
        AND public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  );

-- RLS Policies for cba_rules
CREATE POLICY "Users can view CBA rules for their company" ON public.cba_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collective_agreements ca
      JOIN public.profiles p ON p.company_id = ca.company_id
      WHERE ca.id = cba_rules.agreement_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "HR can manage CBA rules" ON public.cba_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.collective_agreements ca
      JOIN public.profiles p ON p.company_id = ca.company_id
      WHERE ca.id = cba_rules.agreement_id 
        AND p.id = auth.uid()
        AND public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  );

-- RLS Policies for cba_violations
CREATE POLICY "Users can view CBA violations for their company" ON public.cba_violations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.company_id = cba_violations.company_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "HR can manage CBA violations" ON public.cba_violations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.company_id = cba_violations.company_id 
        AND p.id = auth.uid()
        AND public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
    )
  );

-- Create indexes for performance
CREATE INDEX idx_cba_articles_agreement_id ON public.cba_articles(agreement_id);
CREATE INDEX idx_cba_clauses_article_id ON public.cba_clauses(article_id);
CREATE INDEX idx_cba_versions_agreement_id ON public.cba_versions(agreement_id);
CREATE INDEX idx_cba_negotiations_company_id ON public.cba_negotiations(company_id);
CREATE INDEX idx_cba_negotiations_union_id ON public.cba_negotiations(union_id);
CREATE INDEX idx_cba_proposals_negotiation_id ON public.cba_proposals(negotiation_id);
CREATE INDEX idx_cba_amendments_agreement_id ON public.cba_amendments(agreement_id);
CREATE INDEX idx_cba_rules_agreement_id ON public.cba_rules(agreement_id);
CREATE INDEX idx_cba_rules_clause_id ON public.cba_rules(clause_id);
CREATE INDEX idx_cba_violations_company_id ON public.cba_violations(company_id);
CREATE INDEX idx_cba_violations_agreement_id ON public.cba_violations(agreement_id);
CREATE INDEX idx_cba_violations_status ON public.cba_violations(status);
CREATE INDEX idx_grievances_cba_clause_id ON public.grievances(cba_clause_id);

-- Triggers for updated_at
CREATE TRIGGER update_cba_articles_updated_at BEFORE UPDATE ON public.cba_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cba_clauses_updated_at BEFORE UPDATE ON public.cba_clauses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cba_negotiations_updated_at BEFORE UPDATE ON public.cba_negotiations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cba_proposals_updated_at BEFORE UPDATE ON public.cba_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cba_amendments_updated_at BEFORE UPDATE ON public.cba_amendments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cba_rules_updated_at BEFORE UPDATE ON public.cba_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cba_violations_updated_at BEFORE UPDATE ON public.cba_violations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
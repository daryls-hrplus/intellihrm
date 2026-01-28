-- =====================================================
-- GAP 4: SLA Tracking Tables
-- =====================================================

-- SLA Metrics table
CREATE TABLE public.vendor_sla_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.training_vendors(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  metric_period VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (metric_period IN ('daily', 'weekly', 'monthly', 'quarterly')),
  -- SLA scores (0-100)
  response_time_score NUMERIC(5,2),
  delivery_on_time_score NUMERIC(5,2),
  quality_score NUMERIC(5,2),
  attendance_rate_score NUMERIC(5,2),
  completion_rate_score NUMERIC(5,2),
  satisfaction_score NUMERIC(5,2),
  overall_sla_score NUMERIC(5,2),
  -- Thresholds
  response_time_threshold NUMERIC(5,2) DEFAULT 80,
  delivery_threshold NUMERIC(5,2) DEFAULT 90,
  quality_threshold NUMERIC(5,2) DEFAULT 75,
  -- Period counts
  sessions_delivered INTEGER DEFAULT 0,
  total_enrollments INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  total_evaluations INTEGER DEFAULT 0,
  -- Metadata
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  calculated_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_sla_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view vendor SLA metrics"
  ON public.vendor_sla_metrics FOR SELECT
  USING (public.is_admin_or_hr());

CREATE POLICY "HR can manage vendor SLA metrics"
  ON public.vendor_sla_metrics FOR ALL
  USING (public.is_admin_or_hr());

-- SLA Breaches table
CREATE TABLE public.vendor_sla_breaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.training_vendors(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sla_metric_id UUID REFERENCES public.vendor_sla_metrics(id) ON DELETE SET NULL,
  breach_type VARCHAR(50) NOT NULL,
  breach_date DATE NOT NULL,
  threshold_value NUMERIC(5,2) NOT NULL,
  actual_value NUMERIC(5,2) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'minor' CHECK (severity IN ('critical', 'major', 'minor')),
  session_id UUID REFERENCES public.training_vendor_sessions(id) ON DELETE SET NULL,
  description TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'waived', 'disputed')),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  financial_impact NUMERIC(12,2),
  penalty_applied BOOLEAN DEFAULT false,
  penalty_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_sla_breaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view vendor SLA breaches"
  ON public.vendor_sla_breaches FOR SELECT
  USING (public.is_admin_or_hr());

CREATE POLICY "HR can manage vendor SLA breaches"
  ON public.vendor_sla_breaches FOR ALL
  USING (public.is_admin_or_hr());

-- Indexes
CREATE INDEX idx_sla_metrics_vendor ON public.vendor_sla_metrics(vendor_id);
CREATE INDEX idx_sla_metrics_date ON public.vendor_sla_metrics(metric_date);
CREATE INDEX idx_sla_breaches_vendor ON public.vendor_sla_breaches(vendor_id);
CREATE INDEX idx_sla_breaches_status ON public.vendor_sla_breaches(status);
CREATE INDEX idx_sla_breaches_date ON public.vendor_sla_breaches(breach_date);

CREATE TRIGGER update_vendor_sla_breaches_updated_at
  BEFORE UPDATE ON public.vendor_sla_breaches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
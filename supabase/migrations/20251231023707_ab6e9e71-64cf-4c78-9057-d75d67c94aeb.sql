-- Performance Index Settings Table
CREATE TABLE public.performance_index_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rolling_window_months INTEGER NOT NULL DEFAULT 24,
  recency_weight_factor NUMERIC(3,2) NOT NULL DEFAULT 0.70,
  trend_sensitivity NUMERIC(3,2) NOT NULL DEFAULT 0.50,
  minimum_cycles_required INTEGER NOT NULL DEFAULT 2,
  include_probation_reviews BOOLEAN NOT NULL DEFAULT false,
  weight_by_cycle_type JSONB DEFAULT '{"annual": 1.0, "mid_year": 0.5, "quarterly": 0.25}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- External Benchmark Configuration Table (future-ready)
CREATE TABLE public.external_benchmark_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  benchmark_source TEXT,
  industry_code TEXT,
  region_code TEXT,
  refresh_schedule TEXT DEFAULT 'quarterly',
  last_refresh_at TIMESTAMP WITH TIME ZONE,
  api_endpoint TEXT,
  api_credentials_ref TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  config_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.performance_index_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_benchmark_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_index_settings
CREATE POLICY "Users can view their company performance index settings"
  ON public.performance_index_settings FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage performance index settings"
  ON public.performance_index_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for external_benchmark_config
CREATE POLICY "Users can view their company benchmark config"
  ON public.external_benchmark_config FOR SELECT
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage benchmark config"
  ON public.external_benchmark_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

-- Add updated_at triggers
CREATE TRIGGER update_performance_index_settings_updated_at
  BEFORE UPDATE ON public.performance_index_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_external_benchmark_config_updated_at
  BEFORE UPDATE ON public.external_benchmark_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
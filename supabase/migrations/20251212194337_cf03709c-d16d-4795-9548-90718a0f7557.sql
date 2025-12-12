-- Create BI dashboards table
CREATE TABLE public.bi_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  is_global BOOLEAN NOT NULL DEFAULT false,
  company_id UUID REFERENCES public.companies(id),
  layout JSONB NOT NULL DEFAULT '{"columns": 12, "rows": []}'::jsonb,
  filters JSONB NOT NULL DEFAULT '[]'::jsonb,
  refresh_interval INTEGER DEFAULT NULL, -- in seconds, null = manual refresh
  theme JSONB NOT NULL DEFAULT '{"colorScheme": "default"}'::jsonb,
  created_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(module, code)
);

-- Create BI widgets table
CREATE TABLE public.bi_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.bi_dashboards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  widget_type TEXT NOT NULL, -- 'chart', 'kpi', 'table', 'gauge', 'map', 'text'
  chart_type TEXT, -- 'bar', 'line', 'pie', 'donut', 'area', 'scatter', 'radar', 'funnel'
  data_source TEXT NOT NULL,
  custom_sql TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb, -- chart config, colors, labels, etc.
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "w": 4, "h": 3}'::jsonb, -- grid position
  filters JSONB NOT NULL DEFAULT '[]'::jsonb, -- widget-specific filters
  drill_down JSONB, -- drill-down configuration
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create BI data sources table (predefined data sources for BI)
CREATE TABLE public.bi_data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  module TEXT NOT NULL,
  base_table TEXT NOT NULL,
  available_fields JSONB NOT NULL DEFAULT '[]'::jsonb, -- {name, label, type, aggregatable}
  joins JSONB NOT NULL DEFAULT '[]'::jsonb, -- join definitions
  default_filters JSONB NOT NULL DEFAULT '[]'::jsonb,
  supports_drill_down BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create BI shared dashboards table (for sharing dashboards with users/roles)
CREATE TABLE public.bi_dashboard_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.bi_dashboards(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES public.profiles(id),
  shared_with_role TEXT, -- role code
  can_edit BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bi_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_dashboard_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bi_dashboards
CREATE POLICY "Admins and HR can manage all BI dashboards"
ON public.bi_dashboards
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users can view dashboards shared with them"
ON public.bi_dashboards
FOR SELECT
USING (
  created_by = auth.uid() OR
  is_global = true OR
  EXISTS (
    SELECT 1 FROM public.bi_dashboard_shares bds
    WHERE bds.dashboard_id = bi_dashboards.id
    AND (bds.shared_with_user_id = auth.uid() OR 
         bds.shared_with_role IN (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid()))
  )
);

-- RLS Policies for bi_widgets
CREATE POLICY "Users can manage widgets on accessible dashboards"
ON public.bi_widgets
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.bi_dashboards bd
    WHERE bd.id = bi_widgets.dashboard_id
    AND (
      has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'hr_manager') OR
      bd.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.bi_dashboard_shares bds
        WHERE bds.dashboard_id = bd.id AND bds.can_edit = true
        AND (bds.shared_with_user_id = auth.uid() OR 
             bds.shared_with_role IN (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid()))
      )
    )
  )
);

CREATE POLICY "Users can view widgets on accessible dashboards"
ON public.bi_widgets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bi_dashboards bd
    WHERE bd.id = bi_widgets.dashboard_id
    AND (
      has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'hr_manager') OR
      bd.created_by = auth.uid() OR
      bd.is_global = true OR
      EXISTS (
        SELECT 1 FROM public.bi_dashboard_shares bds
        WHERE bds.dashboard_id = bd.id
        AND (bds.shared_with_user_id = auth.uid() OR 
             bds.shared_with_role IN (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid()))
      )
    )
  )
);

-- RLS Policies for bi_data_sources
CREATE POLICY "Admins can manage BI data sources"
ON public.bi_data_sources
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view BI data sources"
ON public.bi_data_sources
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for bi_dashboard_shares
CREATE POLICY "Admins and dashboard owners can manage shares"
ON public.bi_dashboard_shares
FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.bi_dashboards bd
    WHERE bd.id = bi_dashboard_shares.dashboard_id
    AND bd.created_by = auth.uid()
  )
);

CREATE POLICY "Users can view their dashboard shares"
ON public.bi_dashboard_shares
FOR SELECT
USING (
  shared_with_user_id = auth.uid() OR
  shared_with_role IN (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid())
);

-- Create triggers for updated_at
CREATE TRIGGER update_bi_dashboards_updated_at
BEFORE UPDATE ON public.bi_dashboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bi_widgets_updated_at
BEFORE UPDATE ON public.bi_widgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bi_data_sources_updated_at
BEFORE UPDATE ON public.bi_data_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default BI data sources for benefits module
INSERT INTO public.bi_data_sources (name, code, module, base_table, available_fields, description) VALUES
('Benefit Enrollments', 'benefit_enrollments', 'benefits', 'benefit_enrollments', 
 '[{"name": "id", "label": "Enrollment ID", "type": "uuid", "aggregatable": false},
   {"name": "employee_id", "label": "Employee", "type": "uuid", "aggregatable": false},
   {"name": "plan_id", "label": "Plan", "type": "uuid", "aggregatable": false},
   {"name": "status", "label": "Status", "type": "text", "aggregatable": true},
   {"name": "coverage_level", "label": "Coverage Level", "type": "text", "aggregatable": true},
   {"name": "employer_contribution", "label": "Employer Contribution", "type": "number", "aggregatable": true},
   {"name": "employee_contribution", "label": "Employee Contribution", "type": "number", "aggregatable": true},
   {"name": "effective_date", "label": "Effective Date", "type": "date", "aggregatable": false},
   {"name": "enrollment_date", "label": "Enrollment Date", "type": "date", "aggregatable": false}]'::jsonb,
 'Benefit enrollment data with contribution details'),

('Benefit Plans', 'benefit_plans', 'benefits', 'benefit_plans',
 '[{"name": "id", "label": "Plan ID", "type": "uuid", "aggregatable": false},
   {"name": "name", "label": "Plan Name", "type": "text", "aggregatable": true},
   {"name": "plan_type", "label": "Plan Type", "type": "text", "aggregatable": true},
   {"name": "employer_contribution", "label": "Employer Contribution", "type": "number", "aggregatable": true},
   {"name": "employee_contribution", "label": "Employee Contribution", "type": "number", "aggregatable": true},
   {"name": "is_active", "label": "Is Active", "type": "boolean", "aggregatable": true}]'::jsonb,
 'Benefit plan definitions'),

('Benefit Claims', 'benefit_claims', 'benefits', 'benefit_claims',
 '[{"name": "id", "label": "Claim ID", "type": "uuid", "aggregatable": false},
   {"name": "claim_type", "label": "Claim Type", "type": "text", "aggregatable": true},
   {"name": "status", "label": "Status", "type": "text", "aggregatable": true},
   {"name": "amount_claimed", "label": "Amount Claimed", "type": "number", "aggregatable": true},
   {"name": "amount_approved", "label": "Amount Approved", "type": "number", "aggregatable": true},
   {"name": "claim_date", "label": "Claim Date", "type": "date", "aggregatable": false},
   {"name": "service_date", "label": "Service Date", "type": "date", "aggregatable": false}]'::jsonb,
 'Benefit claims data'),

('Employees', 'employees', 'workforce', 'profiles',
 '[{"name": "id", "label": "Employee ID", "type": "uuid", "aggregatable": false},
   {"name": "full_name", "label": "Full Name", "type": "text", "aggregatable": false},
   {"name": "email", "label": "Email", "type": "text", "aggregatable": false},
   {"name": "company_id", "label": "Company", "type": "uuid", "aggregatable": true},
   {"name": "department_id", "label": "Department", "type": "uuid", "aggregatable": true},
   {"name": "created_at", "label": "Created At", "type": "date", "aggregatable": false}]'::jsonb,
 'Employee profiles data'),

('Positions', 'positions', 'workforce', 'positions',
 '[{"name": "id", "label": "Position ID", "type": "uuid", "aggregatable": false},
   {"name": "title", "label": "Title", "type": "text", "aggregatable": true},
   {"name": "department_id", "label": "Department", "type": "uuid", "aggregatable": true},
   {"name": "authorized_headcount", "label": "Authorized Headcount", "type": "number", "aggregatable": true},
   {"name": "is_active", "label": "Is Active", "type": "boolean", "aggregatable": true}]'::jsonb,
 'Position definitions');
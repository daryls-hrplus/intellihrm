-- Property Categories
CREATE TABLE public.property_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  depreciation_years INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Property Items (Assets)
CREATE TABLE public.property_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  category_id UUID NOT NULL REFERENCES public.property_categories(id),
  asset_tag TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  serial_number TEXT,
  model TEXT,
  manufacturer TEXT,
  purchase_date DATE,
  purchase_cost NUMERIC,
  currency TEXT DEFAULT 'USD',
  warranty_expiry DATE,
  condition TEXT NOT NULL DEFAULT 'good',
  status TEXT NOT NULL DEFAULT 'available',
  location TEXT,
  notes TEXT,
  specifications JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, asset_tag)
);

-- Property Assignments
CREATE TABLE public.property_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.property_items(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date DATE,
  actual_return_date DATE,
  condition_at_assignment TEXT,
  condition_at_return TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Property Requests
CREATE TABLE public.property_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  category_id UUID REFERENCES public.property_categories(id),
  request_type TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  justification TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  fulfilled_property_id UUID REFERENCES public.property_items(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Property Maintenance Records
CREATE TABLE public.property_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.property_items(id),
  maintenance_type TEXT NOT NULL DEFAULT 'repair',
  title TEXT NOT NULL,
  description TEXT,
  vendor TEXT,
  cost NUMERIC,
  currency TEXT DEFAULT 'USD',
  scheduled_date DATE,
  completed_date DATE,
  status TEXT NOT NULL DEFAULT 'scheduled',
  performed_by TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_maintenance ENABLE ROW LEVEL SECURITY;

-- Property Categories Policies
CREATE POLICY "Admins and HR can manage property categories"
ON public.property_categories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Authenticated users can view active categories"
ON public.property_categories FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Property Items Policies
CREATE POLICY "Admins and HR can manage property items"
ON public.property_items FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Authenticated users can view property items"
ON public.property_items FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Property Assignments Policies
CREATE POLICY "Admins and HR can manage property assignments"
ON public.property_assignments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view own assignments"
ON public.property_assignments FOR SELECT
USING (auth.uid() = employee_id);

-- Property Requests Policies
CREATE POLICY "Admins and HR can manage property requests"
ON public.property_requests FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can create property requests"
ON public.property_requests FOR INSERT
WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Employees can view own requests"
ON public.property_requests FOR SELECT
USING (auth.uid() = employee_id);

-- Property Maintenance Policies
CREATE POLICY "Admins and HR can manage property maintenance"
ON public.property_maintenance FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Authenticated users can view maintenance records"
ON public.property_maintenance FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Triggers for updated_at
CREATE TRIGGER update_property_categories_updated_at
BEFORE UPDATE ON public.property_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_items_updated_at
BEFORE UPDATE ON public.property_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_assignments_updated_at
BEFORE UPDATE ON public.property_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_requests_updated_at
BEFORE UPDATE ON public.property_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_property_maintenance_updated_at
BEFORE UPDATE ON public.property_maintenance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
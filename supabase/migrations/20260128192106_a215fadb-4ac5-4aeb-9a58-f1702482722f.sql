-- =============================================================================
-- L&D VENDOR MANAGEMENT TABLES
-- 5 new tables: training_vendors, training_vendor_courses, training_vendor_sessions,
-- training_vendor_costs, training_vendor_reviews
-- Industry-aligned with Workday vendor lifecycle methodology
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TRAINING VENDORS (Vendor Registry - 25 fields)
-- Enterprise vendor management registry with tiered classification
-- -----------------------------------------------------------------------------
CREATE TABLE public.training_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  vendor_type TEXT NOT NULL DEFAULT 'operational', -- strategic, operational, transactional
  website_url TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  specializations TEXT[],
  accreditations TEXT[],
  is_preferred BOOLEAN NOT NULL DEFAULT false,
  contract_start_date DATE,
  contract_end_date DATE,
  contract_value NUMERIC,
  payment_terms TEXT,
  performance_score NUMERIC, -- 0-100 composite score
  last_review_date DATE,
  next_review_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- active, under_review, suspended, terminated
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

COMMENT ON TABLE public.training_vendors IS 'Enterprise vendor registry for external training providers with lifecycle management';
COMMENT ON COLUMN public.training_vendors.vendor_type IS 'Tiered classification: strategic (quarterly reviews), operational (standard), transactional (automated)';
COMMENT ON COLUMN public.training_vendors.performance_score IS 'Composite score 0-100 calculated from vendor reviews';

-- -----------------------------------------------------------------------------
-- 2. TRAINING VENDOR COURSES (Vendor Course Catalog - 15 fields)
-- -----------------------------------------------------------------------------
CREATE TABLE public.training_vendor_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.training_vendors(id) ON DELETE CASCADE,
  course_code TEXT,
  course_name TEXT NOT NULL,
  description TEXT,
  delivery_method TEXT NOT NULL DEFAULT 'in_person',
  duration_hours NUMERIC,
  duration_days INTEGER,
  certification_name TEXT,
  certification_validity_months INTEGER,
  target_audience TEXT,
  prerequisites TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.training_vendor_courses IS 'Catalog of courses offered by external training vendors';

-- -----------------------------------------------------------------------------
-- 3. TRAINING VENDOR SESSIONS (Session Scheduling - 21 fields)
-- -----------------------------------------------------------------------------
CREATE TABLE public.training_vendor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_course_id UUID NOT NULL REFERENCES public.training_vendor_courses(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  timezone TEXT DEFAULT 'UTC',
  location TEXT,
  location_type TEXT DEFAULT 'in_person',
  meeting_url TEXT,
  capacity INTEGER,
  registered_count INTEGER NOT NULL DEFAULT 0,
  waitlist_count INTEGER NOT NULL DEFAULT 0,
  registration_deadline DATE,
  cancellation_deadline DATE,
  cost_per_person NUMERIC,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'scheduled',
  instructor_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.training_vendor_sessions IS 'Scheduled sessions for vendor courses with capacity and waitlist management';

-- -----------------------------------------------------------------------------
-- 4. TRAINING VENDOR COSTS (Cost Breakdown - 11 fields)
-- -----------------------------------------------------------------------------
CREATE TABLE public.training_vendor_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_course_id UUID REFERENCES public.training_vendor_courses(id) ON DELETE CASCADE,
  vendor_session_id UUID REFERENCES public.training_vendor_sessions(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_per_person BOOLEAN NOT NULL DEFAULT true,
  is_included BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT vendor_costs_course_or_session CHECK (vendor_course_id IS NOT NULL OR vendor_session_id IS NOT NULL)
);

COMMENT ON TABLE public.training_vendor_costs IS 'Itemized cost breakdown for vendor training';

-- -----------------------------------------------------------------------------
-- 5. TRAINING VENDOR REVIEWS (Performance Tracking - 17 fields)
-- -----------------------------------------------------------------------------
CREATE TABLE public.training_vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.training_vendors(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL,
  review_date DATE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id),
  overall_score NUMERIC,
  quality_score NUMERIC,
  delivery_score NUMERIC,
  value_score NUMERIC,
  responsiveness_score NUMERIC,
  findings JSONB,
  recommendations JSONB,
  action_items JSONB,
  next_review_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.training_vendor_reviews IS 'Vendor performance reviews with multi-dimension KPI scoring';

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_training_vendors_company_id ON public.training_vendors(company_id);
CREATE INDEX idx_training_vendors_status ON public.training_vendors(status);
CREATE INDEX idx_training_vendors_vendor_type ON public.training_vendors(vendor_type);
CREATE INDEX idx_training_vendor_courses_vendor_id ON public.training_vendor_courses(vendor_id);
CREATE INDEX idx_training_vendor_courses_is_active ON public.training_vendor_courses(is_active);
CREATE INDEX idx_training_vendor_sessions_vendor_course_id ON public.training_vendor_sessions(vendor_course_id);
CREATE INDEX idx_training_vendor_sessions_start_date ON public.training_vendor_sessions(start_date);
CREATE INDEX idx_training_vendor_sessions_status ON public.training_vendor_sessions(status);
CREATE INDEX idx_training_vendor_costs_vendor_course_id ON public.training_vendor_costs(vendor_course_id);
CREATE INDEX idx_training_vendor_costs_vendor_session_id ON public.training_vendor_costs(vendor_session_id);
CREATE INDEX idx_training_vendor_reviews_vendor_id ON public.training_vendor_reviews(vendor_id);
CREATE INDEX idx_training_vendor_reviews_review_date ON public.training_vendor_reviews(review_date);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE public.training_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_vendor_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_vendor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_vendor_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_vendor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_vendors
CREATE POLICY "Users can view vendors in their company"
  ON public.training_vendors FOR SELECT
  TO authenticated
  USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "Admins and HR can manage vendors"
  ON public.training_vendors FOR ALL
  TO authenticated
  USING (public.is_admin_or_hr());

-- RLS Policies for training_vendor_courses
CREATE POLICY "Users can view vendor courses"
  ON public.training_vendor_courses FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.training_vendors tv 
    WHERE tv.id = vendor_id 
    AND public.user_has_company_access(auth.uid(), tv.company_id)
  ));

CREATE POLICY "Admins and HR can manage vendor courses"
  ON public.training_vendor_courses FOR ALL
  TO authenticated
  USING (public.is_admin_or_hr());

-- RLS Policies for training_vendor_sessions
CREATE POLICY "Users can view vendor sessions"
  ON public.training_vendor_sessions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.training_vendor_courses tvc
    JOIN public.training_vendors tv ON tv.id = tvc.vendor_id
    WHERE tvc.id = vendor_course_id
    AND public.user_has_company_access(auth.uid(), tv.company_id)
  ));

CREATE POLICY "Admins and HR can manage vendor sessions"
  ON public.training_vendor_sessions FOR ALL
  TO authenticated
  USING (public.is_admin_or_hr());

-- RLS Policies for training_vendor_costs
CREATE POLICY "Users can view vendor costs"
  ON public.training_vendor_costs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.training_vendor_courses tvc
      JOIN public.training_vendors tv ON tv.id = tvc.vendor_id
      WHERE tvc.id = vendor_course_id
      AND public.user_has_company_access(auth.uid(), tv.company_id)
    )
    OR
    EXISTS (
      SELECT 1 FROM public.training_vendor_sessions tvs
      JOIN public.training_vendor_courses tvc ON tvc.id = tvs.vendor_course_id
      JOIN public.training_vendors tv ON tv.id = tvc.vendor_id
      WHERE tvs.id = vendor_session_id
      AND public.user_has_company_access(auth.uid(), tv.company_id)
    )
  );

CREATE POLICY "Admins and HR can manage vendor costs"
  ON public.training_vendor_costs FOR ALL
  TO authenticated
  USING (public.is_admin_or_hr());

-- RLS Policies for training_vendor_reviews
CREATE POLICY "Users can view vendor reviews"
  ON public.training_vendor_reviews FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.training_vendors tv 
    WHERE tv.id = vendor_id 
    AND public.user_has_company_access(auth.uid(), tv.company_id)
  ));

CREATE POLICY "Admins and HR can manage vendor reviews"
  ON public.training_vendor_reviews FOR ALL
  TO authenticated
  USING (public.is_admin_or_hr());

-- -----------------------------------------------------------------------------
-- TRIGGERS FOR updated_at
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_training_vendors_updated_at
  BEFORE UPDATE ON public.training_vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_vendor_courses_updated_at
  BEFORE UPDATE ON public.training_vendor_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_vendor_sessions_updated_at
  BEFORE UPDATE ON public.training_vendor_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_vendor_reviews_updated_at
  BEFORE UPDATE ON public.training_vendor_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
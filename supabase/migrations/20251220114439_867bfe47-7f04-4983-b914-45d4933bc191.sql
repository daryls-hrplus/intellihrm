-- Tips/Tronc Pool Distribution System for Hotels

-- Pool configuration table
CREATE TABLE public.tip_pool_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  pool_type text NOT NULL CHECK (pool_type IN ('tips', 'tronc')),
  description text,
  troncmaster_id uuid REFERENCES public.profiles(id),
  distribution_method text NOT NULL DEFAULT 'points' CHECK (distribution_method IN ('points', 'hours', 'equal', 'percentage')),
  included_departments jsonb DEFAULT '[]',
  included_job_titles jsonb DEFAULT '[]',
  distribution_frequency text NOT NULL DEFAULT 'weekly' CHECK (distribution_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  include_in_payroll boolean DEFAULT true,
  pay_group_id uuid REFERENCES public.pay_groups(id),
  is_active boolean DEFAULT true,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Points/percentage allocation per job title or department
CREATE TABLE public.tip_pool_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_config_id uuid NOT NULL REFERENCES public.tip_pool_configurations(id) ON DELETE CASCADE,
  job_title text,
  department_id uuid REFERENCES public.departments(id),
  points_per_hour numeric(10,2),
  percentage numeric(5,2),
  fixed_amount numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Employee participation in pools
CREATE TABLE public.tip_pool_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_config_id uuid NOT NULL REFERENCES public.tip_pool_configurations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  custom_points_per_hour numeric(10,2),
  custom_percentage numeric(5,2),
  is_active boolean DEFAULT true,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pool_config_id, employee_id)
);

-- Pool collection records
CREATE TABLE public.tip_pool_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_config_id uuid NOT NULL REFERENCES public.tip_pool_configurations(id) ON DELETE CASCADE,
  collection_date date NOT NULL,
  cash_tips numeric(12,2) DEFAULT 0,
  card_tips numeric(12,2) DEFAULT 0,
  service_charge numeric(12,2) DEFAULT 0,
  other_gratuities numeric(12,2) DEFAULT 0,
  total_collected numeric(12,2) GENERATED ALWAYS AS (cash_tips + card_tips + service_charge + other_gratuities) STORED,
  deductions numeric(12,2) DEFAULT 0,
  deduction_notes text,
  net_distributable numeric(12,2) GENERATED ALWAYS AS (cash_tips + card_tips + service_charge + other_gratuities - deductions) STORED,
  recorded_by uuid REFERENCES public.profiles(id),
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'distributed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Distribution periods
CREATE TABLE public.tip_pool_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_config_id uuid NOT NULL REFERENCES public.tip_pool_configurations(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_pool_amount numeric(12,2) NOT NULL,
  total_distributed numeric(12,2) DEFAULT 0,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  payroll_run_id uuid REFERENCES public.payroll_runs(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'calculating', 'approved', 'paid', 'cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Individual employee distribution records
CREATE TABLE public.tip_pool_distribution_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id uuid NOT NULL REFERENCES public.tip_pool_distributions(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.profiles(id),
  hours_worked numeric(10,2),
  points_earned numeric(10,2),
  percentage_share numeric(5,2),
  gross_amount numeric(12,2) NOT NULL,
  tax_amount numeric(12,2) DEFAULT 0,
  ni_amount numeric(12,2) DEFAULT 0,
  net_amount numeric(12,2) NOT NULL,
  payroll_line_item_id uuid REFERENCES public.payroll_line_items(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tip_pool_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_pool_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_pool_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_pool_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_pool_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_pool_distribution_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "auth_tip_pool_configurations" ON public.tip_pool_configurations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_tip_pool_allocations" ON public.tip_pool_allocations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_tip_pool_participants" ON public.tip_pool_participants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_tip_pool_collections" ON public.tip_pool_collections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_tip_pool_distributions" ON public.tip_pool_distributions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_tip_pool_distribution_details" ON public.tip_pool_distribution_details FOR ALL USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_tip_pool_configs_company ON public.tip_pool_configurations(company_id);
CREATE INDEX idx_tip_pool_collections_date ON public.tip_pool_collections(pool_config_id, collection_date);
CREATE INDEX idx_tip_pool_distributions_period ON public.tip_pool_distributions(pool_config_id, period_start, period_end);
CREATE INDEX idx_tip_pool_dist_details_emp ON public.tip_pool_distribution_details(employee_id);
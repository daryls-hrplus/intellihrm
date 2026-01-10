-- =====================================================
-- HYBRID POSITION SEATS MODEL
-- Combines simple administration with granular tracking
-- =====================================================

-- 1. Position Seats Table - Individual seat records
CREATE TABLE public.position_seats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  seat_code TEXT NOT NULL, -- e.g., "POS-SE-001", "POS-SE-002"
  status TEXT NOT NULL DEFAULT 'VACANT' CHECK (status IN ('PLANNED', 'APPROVED', 'VACANT', 'FILLED', 'FROZEN', 'ELIMINATED')),
  
  -- Assignment tracking
  current_employee_id UUID REFERENCES public.profiles(id),
  current_employee_position_id UUID REFERENCES public.employee_positions(id),
  
  -- Lifecycle dates
  planned_date DATE,
  approved_date DATE,
  filled_date DATE,
  frozen_date DATE,
  eliminated_date DATE,
  
  -- Freeze/Reduction context
  freeze_reason TEXT,
  freeze_approved_by UUID REFERENCES public.profiles(id),
  elimination_reason TEXT,
  elimination_approved_by UUID REFERENCES public.profiles(id),
  
  -- Displacement tracking
  displacement_action_id UUID, -- Will be FK after table created
  requires_displacement BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(position_id, seat_number),
  UNIQUE(seat_code)
);

-- Index for fast lookups
CREATE INDEX idx_position_seats_position_id ON public.position_seats(position_id);
CREATE INDEX idx_position_seats_status ON public.position_seats(status);
CREATE INDEX idx_position_seats_current_employee ON public.position_seats(current_employee_id);

-- 2. Position Seat History - Full audit trail
CREATE TABLE public.position_seat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seat_id UUID NOT NULL REFERENCES public.position_seats(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  change_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_position_seat_history_seat_id ON public.position_seat_history(seat_id);

-- 3. Headcount Change Requests - For increases/decreases
CREATE TABLE public.headcount_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  
  -- Request details
  request_type TEXT NOT NULL CHECK (request_type IN ('INCREASE', 'DECREASE', 'FREEZE', 'UNFREEZE')),
  current_headcount INTEGER NOT NULL,
  requested_headcount INTEGER NOT NULL,
  change_amount INTEGER NOT NULL, -- Positive for increase, negative for decrease
  
  -- Business justification
  business_justification TEXT NOT NULL,
  cost_center_id UUID,
  budget_impact_amount NUMERIC(15,2),
  budget_impact_currency TEXT DEFAULT 'USD',
  effective_date DATE NOT NULL,
  
  -- Workflow
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXECUTED')),
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Approval chain
  current_approver_id UUID REFERENCES public.profiles(id),
  approval_level INTEGER DEFAULT 1,
  
  -- Completion
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  executed_at TIMESTAMPTZ,
  executed_by UUID REFERENCES public.profiles(id),
  
  -- Impact analysis (AI-populated)
  impact_analysis JSONB DEFAULT '{}',
  affected_seats JSONB DEFAULT '[]', -- Array of seat IDs affected
  displacement_required BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_headcount_change_requests_position ON public.headcount_change_requests(position_id);
CREATE INDEX idx_headcount_change_requests_status ON public.headcount_change_requests(status);
CREATE INDEX idx_headcount_change_requests_company ON public.headcount_change_requests(company_id);

-- 4. Headcount Change Approvals - Multi-level approval tracking
CREATE TABLE public.headcount_change_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.headcount_change_requests(id) ON DELETE CASCADE,
  approval_level INTEGER NOT NULL,
  approver_id UUID NOT NULL REFERENCES public.profiles(id),
  approver_role TEXT, -- e.g., 'MANAGER', 'HR', 'FINANCE', 'EXECUTIVE'
  
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SKIPPED')),
  decision_at TIMESTAMPTZ,
  comments TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_headcount_change_approvals_request ON public.headcount_change_approvals(request_id);

-- 5. Seat Displacement Actions - For handling reductions on filled seats
CREATE TABLE public.seat_displacement_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.headcount_change_requests(id) ON DELETE CASCADE,
  seat_id UUID NOT NULL REFERENCES public.position_seats(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Action type
  action_type TEXT NOT NULL CHECK (action_type IN ('REDEPLOYMENT', 'VOLUNTARY_SEPARATION', 'INVOLUNTARY_SEPARATION', 'TRANSFER', 'DEMOTION', 'EARLY_RETIREMENT')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  
  -- Redeployment options
  proposed_position_id UUID REFERENCES public.positions(id),
  proposed_seat_id UUID REFERENCES public.position_seats(id),
  
  -- Grace period
  grace_period_start DATE,
  grace_period_end DATE,
  grace_period_days INTEGER DEFAULT 30,
  
  -- Resolution
  final_action TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  
  -- Compliance
  legal_review_required BOOLEAN DEFAULT FALSE,
  legal_reviewed_by UUID REFERENCES public.profiles(id),
  legal_reviewed_at TIMESTAMPTZ,
  hr_reviewed_by UUID REFERENCES public.profiles(id),
  hr_reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seat_displacement_actions_request ON public.seat_displacement_actions(request_id);
CREATE INDEX idx_seat_displacement_actions_employee ON public.seat_displacement_actions(employee_id);
CREATE INDEX idx_seat_displacement_actions_status ON public.seat_displacement_actions(status);

-- Add FK for displacement_action_id in position_seats
ALTER TABLE public.position_seats 
ADD CONSTRAINT fk_position_seats_displacement_action 
FOREIGN KEY (displacement_action_id) REFERENCES public.seat_displacement_actions(id);

-- 6. Seat Restoration Window - For undoing eliminations
CREATE TABLE public.seat_restoration_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seat_id UUID NOT NULL REFERENCES public.position_seats(id),
  original_elimination_date DATE NOT NULL,
  restoration_window_end DATE NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'REQUESTED', 'APPROVED', 'EXPIRED')),
  
  requested_by UUID REFERENCES public.profiles(id),
  requested_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Function to auto-generate seats when position is created or headcount increases
CREATE OR REPLACE FUNCTION public.sync_position_seats()
RETURNS TRIGGER AS $$
DECLARE
  current_seat_count INTEGER;
  new_seat_number INTEGER;
  seat_code_prefix TEXT;
BEGIN
  -- Get current seat count
  SELECT COUNT(*) INTO current_seat_count 
  FROM public.position_seats 
  WHERE position_id = NEW.id AND status != 'ELIMINATED';
  
  -- If headcount increased, create new seats
  IF NEW.authorized_headcount > current_seat_count THEN
    seat_code_prefix := NEW.code;
    
    FOR new_seat_number IN (current_seat_count + 1)..NEW.authorized_headcount LOOP
      INSERT INTO public.position_seats (
        position_id,
        seat_number,
        seat_code,
        status,
        planned_date,
        approved_date
      ) VALUES (
        NEW.id,
        new_seat_number,
        seat_code_prefix || '-' || LPAD(new_seat_number::TEXT, 3, '0'),
        CASE WHEN NEW.is_active THEN 'VACANT' ELSE 'PLANNED' END,
        CASE WHEN NOT NEW.is_active THEN CURRENT_DATE END,
        CASE WHEN NEW.is_active THEN CURRENT_DATE END
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating seats
CREATE TRIGGER trigger_sync_position_seats
AFTER INSERT OR UPDATE OF authorized_headcount ON public.positions
FOR EACH ROW
EXECUTE FUNCTION public.sync_position_seats();

-- 8. Function to track seat status changes
CREATE OR REPLACE FUNCTION public.track_seat_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.position_seat_history (
      seat_id,
      previous_status,
      new_status,
      change_reason
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.notes
    );
    
    -- Update lifecycle dates based on new status
    CASE NEW.status
      WHEN 'PLANNED' THEN NEW.planned_date := COALESCE(NEW.planned_date, CURRENT_DATE);
      WHEN 'APPROVED' THEN NEW.approved_date := COALESCE(NEW.approved_date, CURRENT_DATE);
      WHEN 'FILLED' THEN NEW.filled_date := COALESCE(NEW.filled_date, CURRENT_DATE);
      WHEN 'FROZEN' THEN NEW.frozen_date := COALESCE(NEW.frozen_date, CURRENT_DATE);
      WHEN 'ELIMINATED' THEN NEW.eliminated_date := COALESCE(NEW.eliminated_date, CURRENT_DATE);
      ELSE NULL;
    END CASE;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_track_seat_status
BEFORE UPDATE ON public.position_seats
FOR EACH ROW
EXECUTE FUNCTION public.track_seat_status_change();

-- 9. Function to link employee_positions to seats
CREATE OR REPLACE FUNCTION public.link_employee_to_seat()
RETURNS TRIGGER AS $$
DECLARE
  available_seat_id UUID;
BEGIN
  -- Find an available (VACANT or APPROVED) seat for this position
  SELECT id INTO available_seat_id
  FROM public.position_seats
  WHERE position_id = NEW.position_id
    AND status IN ('VACANT', 'APPROVED')
    AND current_employee_id IS NULL
  ORDER BY seat_number
  LIMIT 1;
  
  -- If found, link employee to seat
  IF available_seat_id IS NOT NULL THEN
    UPDATE public.position_seats
    SET 
      status = 'FILLED',
      current_employee_id = NEW.employee_id,
      current_employee_position_id = NEW.id,
      filled_date = CURRENT_DATE,
      notes = 'Auto-assigned via employee position creation'
    WHERE id = available_seat_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_link_employee_to_seat
AFTER INSERT ON public.employee_positions
FOR EACH ROW
WHEN (NEW.is_active = TRUE)
EXECUTE FUNCTION public.link_employee_to_seat();

-- 10. Function to release seat when employee leaves position
CREATE OR REPLACE FUNCTION public.release_seat_on_employee_exit()
RETURNS TRIGGER AS $$
BEGIN
  -- If employee position is being deactivated, release the seat
  IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
    UPDATE public.position_seats
    SET 
      status = 'VACANT',
      current_employee_id = NULL,
      current_employee_position_id = NULL,
      notes = 'Released: Employee exited position'
    WHERE current_employee_position_id = OLD.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_release_seat_on_exit
AFTER UPDATE ON public.employee_positions
FOR EACH ROW
EXECUTE FUNCTION public.release_seat_on_employee_exit();

-- 11. View for position seat summary
CREATE OR REPLACE VIEW public.position_seat_summary AS
SELECT 
  p.id AS position_id,
  p.code AS position_code,
  p.title AS position_title,
  p.department_id,
  p.authorized_headcount,
  COUNT(ps.id) FILTER (WHERE ps.status NOT IN ('ELIMINATED')) AS total_seats,
  COUNT(ps.id) FILTER (WHERE ps.status = 'FILLED') AS filled_seats,
  COUNT(ps.id) FILTER (WHERE ps.status = 'VACANT') AS vacant_seats,
  COUNT(ps.id) FILTER (WHERE ps.status = 'FROZEN') AS frozen_seats,
  COUNT(ps.id) FILTER (WHERE ps.status = 'PLANNED') AS planned_seats,
  COUNT(ps.id) FILTER (WHERE ps.status = 'APPROVED') AS approved_seats,
  COUNT(ps.id) FILTER (WHERE ps.status = 'ELIMINATED') AS eliminated_seats,
  ROUND(
    (COUNT(ps.id) FILTER (WHERE ps.status = 'FILLED')::NUMERIC / 
     NULLIF(COUNT(ps.id) FILTER (WHERE ps.status NOT IN ('ELIMINATED', 'FROZEN')), 0)) * 100, 
    1
  ) AS fill_rate_percent
FROM public.positions p
LEFT JOIN public.position_seats ps ON p.id = ps.position_id
GROUP BY p.id, p.code, p.title, p.department_id, p.authorized_headcount;

-- RLS Policies
ALTER TABLE public.position_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_seat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.headcount_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.headcount_change_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_displacement_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_restoration_requests ENABLE ROW LEVEL SECURITY;

-- Basic RLS: Authenticated users can view
CREATE POLICY "Users can view position seats" ON public.position_seats
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view seat history" ON public.position_seat_history
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view headcount requests" ON public.headcount_change_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view approvals" ON public.headcount_change_approvals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view displacement actions" ON public.seat_displacement_actions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view restoration requests" ON public.seat_restoration_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert/Update policies for HR roles
CREATE POLICY "HR can manage position seats" ON public.position_seats
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "HR can manage headcount requests" ON public.headcount_change_requests
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "HR can manage approvals" ON public.headcount_change_approvals
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "HR can manage displacement actions" ON public.seat_displacement_actions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "HR can manage restoration requests" ON public.seat_restoration_requests
  FOR ALL USING (auth.role() = 'authenticated');

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.position_seats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.headcount_change_requests;
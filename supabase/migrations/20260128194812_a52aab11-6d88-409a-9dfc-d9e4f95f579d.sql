-- =====================================================
-- L&D Vendor Management Schema Enhancements
-- Industry alignment: Workday, SAP SuccessFactors
-- =====================================================

-- 1. Add multi-company sharing and SLA fields to training_vendors
ALTER TABLE IF EXISTS public.training_vendors
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.company_groups(id),
ADD COLUMN IF NOT EXISTS sla_document_url TEXT;

-- 2. Add minimum attendees and confirmation deadline to vendor sessions
ALTER TABLE IF EXISTS public.training_vendor_sessions
ADD COLUMN IF NOT EXISTS minimum_attendees INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS confirmation_deadline DATE;

-- 3. Add base price fields to vendor courses
ALTER TABLE IF EXISTS public.training_vendor_courses
ADD COLUMN IF NOT EXISTS base_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS base_currency TEXT DEFAULT 'USD';

-- 4. Create training_vendor_contacts for multi-contact support
CREATE TABLE IF NOT EXISTS public.training_vendor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.training_vendors(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('primary', 'billing', 'technical', 'escalation', 'sales')),
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create vendor_session_enrollments for session enrollment tracking
CREATE TABLE IF NOT EXISTS public.vendor_session_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.training_vendor_sessions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  training_request_id UUID REFERENCES public.training_requests(id),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'waitlisted', 'confirmed', 'attended', 'no_show', 'cancelled')),
  registered_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  attended BOOLEAN,
  attendance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, employee_id)
);

-- 6. Create vendor_session_waitlist for waitlist management
CREATE TABLE IF NOT EXISTS public.vendor_session_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.training_vendor_sessions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  training_request_id UUID REFERENCES public.training_requests(id),
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  promoted_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'promoted', 'expired', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, employee_id)
);

-- 7. Create vendor_volume_discounts for tiered pricing
CREATE TABLE IF NOT EXISTS public.vendor_volume_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.training_vendors(id) ON DELETE CASCADE,
  tier_name TEXT,
  min_enrollments INTEGER NOT NULL,
  max_enrollments INTEGER,
  discount_percentage NUMERIC(5,2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_vendor_id ON public.training_vendor_contacts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_is_primary ON public.training_vendor_contacts(vendor_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_session_enrollments_session_id ON public.vendor_session_enrollments(session_id);
CREATE INDEX IF NOT EXISTS idx_session_enrollments_employee_id ON public.vendor_session_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_session_enrollments_status ON public.vendor_session_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_session_waitlist_session_id ON public.vendor_session_waitlist(session_id);
CREATE INDEX IF NOT EXISTS idx_session_waitlist_position ON public.vendor_session_waitlist(session_id, position);
CREATE INDEX IF NOT EXISTS idx_volume_discounts_vendor_id ON public.vendor_volume_discounts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_training_vendors_group_id ON public.training_vendors(group_id) WHERE group_id IS NOT NULL;

-- 9. Enable RLS on new tables
ALTER TABLE public.training_vendor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_session_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_session_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_volume_discounts ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for training_vendor_contacts
CREATE POLICY "Allow read access to authenticated users for vendor contacts"
ON public.training_vendor_contacts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert for admins and HR on vendor contacts"
ON public.training_vendor_contacts FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_hr());

CREATE POLICY "Allow update for admins and HR on vendor contacts"
ON public.training_vendor_contacts FOR UPDATE
TO authenticated
USING (public.is_admin_or_hr());

CREATE POLICY "Allow delete for admins on vendor contacts"
ON public.training_vendor_contacts FOR DELETE
TO authenticated
USING (public.is_admin());

-- 11. RLS Policies for vendor_session_enrollments
CREATE POLICY "Allow read access to authenticated users for session enrollments"
ON public.vendor_session_enrollments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert for admins and HR on session enrollments"
ON public.vendor_session_enrollments FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_hr());

CREATE POLICY "Allow update for admins and HR on session enrollments"
ON public.vendor_session_enrollments FOR UPDATE
TO authenticated
USING (public.is_admin_or_hr());

CREATE POLICY "Allow delete for admins on session enrollments"
ON public.vendor_session_enrollments FOR DELETE
TO authenticated
USING (public.is_admin());

-- 12. RLS Policies for vendor_session_waitlist
CREATE POLICY "Allow read access to authenticated users for session waitlist"
ON public.vendor_session_waitlist FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert for admins and HR on session waitlist"
ON public.vendor_session_waitlist FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_hr());

CREATE POLICY "Allow update for admins and HR on session waitlist"
ON public.vendor_session_waitlist FOR UPDATE
TO authenticated
USING (public.is_admin_or_hr());

CREATE POLICY "Allow delete for admins on session waitlist"
ON public.vendor_session_waitlist FOR DELETE
TO authenticated
USING (public.is_admin());

-- 13. RLS Policies for vendor_volume_discounts
CREATE POLICY "Allow read access to authenticated users for volume discounts"
ON public.vendor_volume_discounts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert for admins on volume discounts"
ON public.vendor_volume_discounts FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Allow update for admins on volume discounts"
ON public.vendor_volume_discounts FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Allow delete for admins on volume discounts"
ON public.vendor_volume_discounts FOR DELETE
TO authenticated
USING (public.is_admin());

-- 14. Add updated_at trigger for new tables
CREATE TRIGGER update_training_vendor_contacts_updated_at
  BEFORE UPDATE ON public.training_vendor_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_session_enrollments_updated_at
  BEFORE UPDATE ON public.vendor_session_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_volume_discounts_updated_at
  BEFORE UPDATE ON public.vendor_volume_discounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Add comments for documentation
COMMENT ON TABLE public.training_vendor_contacts IS 'Multiple contacts per vendor with role-based classification';
COMMENT ON TABLE public.vendor_session_enrollments IS 'Track employee enrollments in vendor training sessions';
COMMENT ON TABLE public.vendor_session_waitlist IS 'Manage waitlists for full vendor training sessions';
COMMENT ON TABLE public.vendor_volume_discounts IS 'Tiered volume discount structures per vendor';
COMMENT ON COLUMN public.training_vendors.group_id IS 'Company group for multi-company vendor sharing';
COMMENT ON COLUMN public.training_vendors.sla_document_url IS 'URL to vendor SLA document';
COMMENT ON COLUMN public.training_vendor_sessions.minimum_attendees IS 'Minimum attendees for session confirmation';
COMMENT ON COLUMN public.training_vendor_sessions.confirmation_deadline IS 'Deadline for session confirmation';
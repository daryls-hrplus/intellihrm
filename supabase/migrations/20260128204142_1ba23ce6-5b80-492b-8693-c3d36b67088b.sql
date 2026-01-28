-- =====================================================
-- GAP 3: Vendor Contract Alerts Table
-- =====================================================
CREATE TABLE public.vendor_contract_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.training_vendors(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  -- Alert type
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('contract_expiring', 'contract_expired', 'renewal_due', 'sla_breach', 'performance_warning')),
  alert_priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (alert_priority IN ('critical', 'high', 'medium', 'low')),
  -- Alert details
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  days_until_event INTEGER,
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'actioned', 'dismissed', 'auto_resolved')),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actioned_at TIMESTAMPTZ,
  actioned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_notes TEXT,
  -- Notification tracking
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  escalation_level INTEGER DEFAULT 0,
  last_escalation_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_contract_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR can view vendor contract alerts"
  ON public.vendor_contract_alerts FOR SELECT
  USING (public.is_admin_or_hr());

CREATE POLICY "HR can manage vendor contract alerts"
  ON public.vendor_contract_alerts FOR ALL
  USING (public.is_admin_or_hr());

CREATE INDEX idx_vendor_alerts_vendor ON public.vendor_contract_alerts(vendor_id);
CREATE INDEX idx_vendor_alerts_company ON public.vendor_contract_alerts(company_id);
CREATE INDEX idx_vendor_alerts_status ON public.vendor_contract_alerts(status);

-- Function to check vendor contract expiries
CREATE OR REPLACE FUNCTION public.check_vendor_contract_expiries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_rec RECORD;
  days_until INT;
  alert_msg TEXT;
  alert_title TEXT;
  alert_prio VARCHAR(20);
BEGIN
  FOR vendor_rec IN
    SELECT v.id, v.company_id, v.name, v.contract_end_date
    FROM training_vendors v
    WHERE v.status = 'active'
      AND v.contract_end_date IS NOT NULL
      AND v.contract_end_date <= CURRENT_DATE + INTERVAL '90 days'
      AND v.contract_end_date >= CURRENT_DATE - INTERVAL '30 days'
  LOOP
    days_until := (vendor_rec.contract_end_date - CURRENT_DATE);
    
    IF days_until <= 0 THEN
      alert_prio := 'critical';
      alert_title := 'Contract Expired: ' || vendor_rec.name;
      alert_msg := 'The contract with ' || vendor_rec.name || ' expired ' || ABS(days_until) || ' day(s) ago.';
    ELSIF days_until <= 7 THEN
      alert_prio := 'critical';
      alert_title := 'Contract Expiring Soon: ' || vendor_rec.name;
      alert_msg := 'The contract with ' || vendor_rec.name || ' will expire in ' || days_until || ' day(s).';
    ELSIF days_until <= 30 THEN
      alert_prio := 'high';
      alert_title := 'Contract Renewal Due: ' || vendor_rec.name;
      alert_msg := 'The contract with ' || vendor_rec.name || ' will expire in ' || days_until || ' days.';
    ELSE
      alert_prio := 'medium';
      alert_title := 'Upcoming Contract Renewal: ' || vendor_rec.name;
      alert_msg := 'The contract with ' || vendor_rec.name || ' will expire in ' || days_until || ' days.';
    END IF;
    
    INSERT INTO vendor_contract_alerts (vendor_id, company_id, alert_type, alert_priority, title, message, days_until_event)
    SELECT vendor_rec.id, vendor_rec.company_id,
           CASE WHEN days_until <= 0 THEN 'contract_expired' ELSE 'contract_expiring' END,
           alert_prio, alert_title, alert_msg, days_until
    WHERE NOT EXISTS (
      SELECT 1 FROM vendor_contract_alerts a
      WHERE a.vendor_id = vendor_rec.id
        AND a.alert_type IN ('contract_expiring', 'contract_expired')
        AND a.status = 'pending'
        AND DATE(a.created_at) = CURRENT_DATE
    );
  END LOOP;
END;
$$;

CREATE TRIGGER update_vendor_contract_alerts_updated_at
  BEFORE UPDATE ON public.vendor_contract_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
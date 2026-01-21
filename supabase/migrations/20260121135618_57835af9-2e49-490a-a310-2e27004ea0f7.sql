-- Create comprehensive evidence audit trail table
CREATE TABLE IF NOT EXISTS public.performance_evidence_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'created', 'updated', 'deleted', 'validated', 
    'rejected', 'disputed', 'locked', 'unlocked',
    'attached_to_appraisal', 'detached_from_appraisal',
    'file_uploaded', 'file_replaced', 'viewed', 'exported'
  )),
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  appraisal_cycle_id UUID REFERENCES public.appraisal_cycles(id),
  participant_id UUID REFERENCES public.appraisal_participants(id),
  item_type TEXT,
  item_id UUID,
  item_name TEXT,
  old_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  company_id UUID REFERENCES public.companies(id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_evidence_audit_evidence_id ON public.performance_evidence_audit(evidence_id);
CREATE INDEX IF NOT EXISTS idx_evidence_audit_performed_by ON public.performance_evidence_audit(performed_by);
CREATE INDEX IF NOT EXISTS idx_evidence_audit_performed_at ON public.performance_evidence_audit(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_audit_action ON public.performance_evidence_audit(action);
CREATE INDEX IF NOT EXISTS idx_evidence_audit_cycle ON public.performance_evidence_audit(appraisal_cycle_id);
CREATE INDEX IF NOT EXISTS idx_evidence_audit_company ON public.performance_evidence_audit(company_id);

-- Enable RLS
ALTER TABLE public.performance_evidence_audit ENABLE ROW LEVEL SECURITY;

-- HR and managers can view audit logs for their company
CREATE POLICY "HR can view company evidence audit"
  ON public.performance_evidence_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.company_id = performance_evidence_audit.company_id
    )
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'hr_manager', 'system_admin')
    )
  );

-- Employees can view audit logs for their own evidence
CREATE POLICY "Employees can view own evidence audit"
  ON public.performance_evidence_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_evidence pe
      WHERE pe.id = evidence_id AND pe.employee_id = auth.uid()
    )
  );

-- System can insert audit records
CREATE POLICY "System can insert evidence audit"
  ON public.performance_evidence_audit FOR INSERT
  WITH CHECK (true);

-- Create trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION public.log_evidence_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_item_type TEXT;
  v_item_id UUID;
  v_item_name TEXT;
  v_company_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Determine item type and id
    IF NEW.goal_id IS NOT NULL THEN
      v_item_type := 'goal';
      v_item_id := NEW.goal_id;
      SELECT title INTO v_item_name FROM public.goals WHERE id = NEW.goal_id;
    ELSIF NEW.capability_id IS NOT NULL THEN
      v_item_type := 'competency';
      v_item_id := NEW.capability_id;
      SELECT name INTO v_item_name FROM public.capabilities WHERE id = NEW.capability_id;
    ELSIF NEW.responsibility_id IS NOT NULL THEN
      v_item_type := 'responsibility';
      v_item_id := NEW.responsibility_id;
      SELECT title INTO v_item_name FROM public.job_responsibilities WHERE id = NEW.responsibility_id;
    ELSIF NEW.kra_snapshot_id IS NOT NULL THEN
      v_item_type := 'kra';
      v_item_id := NEW.kra_snapshot_id;
      SELECT kra_title INTO v_item_name FROM public.kra_cycle_snapshots WHERE id = NEW.kra_snapshot_id;
    END IF;
    
    -- Get company_id
    v_company_id := NEW.company_id;
    
    INSERT INTO public.performance_evidence_audit (
      evidence_id, action, performed_by, appraisal_cycle_id,
      participant_id, item_type, item_id, item_name, new_values, company_id
    ) VALUES (
      NEW.id, 'created', NEW.submitted_by, NEW.appraisal_cycle_id,
      NEW.participant_id, v_item_type, v_item_id, v_item_name,
      to_jsonb(NEW), v_company_id
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_company_id := COALESCE(NEW.company_id, OLD.company_id);
    
    -- Log validation status changes
    IF OLD.validation_status IS DISTINCT FROM NEW.validation_status THEN
      INSERT INTO public.performance_evidence_audit (
        evidence_id, action, performed_by, old_values, new_values, company_id
      ) VALUES (
        NEW.id,
        CASE NEW.validation_status
          WHEN 'validated' THEN 'validated'
          WHEN 'rejected' THEN 'rejected'
          WHEN 'disputed' THEN 'disputed'
          ELSE 'updated'
        END,
        COALESCE(NEW.validated_by, auth.uid()),
        jsonb_build_object('validation_status', OLD.validation_status, 'validation_notes', OLD.validation_notes),
        jsonb_build_object('validation_status', NEW.validation_status, 'validation_notes', NEW.validation_notes),
        v_company_id
      );
    END IF;
    
    -- Log immutability changes
    IF OLD.is_immutable IS DISTINCT FROM NEW.is_immutable THEN
      INSERT INTO public.performance_evidence_audit (
        evidence_id, action, performed_by, company_id
      ) VALUES (
        NEW.id,
        CASE WHEN NEW.is_immutable THEN 'locked' ELSE 'unlocked' END,
        auth.uid(),
        v_company_id
      );
    END IF;
    
    -- Log general updates (title, description changes)
    IF (OLD.title IS DISTINCT FROM NEW.title OR OLD.description IS DISTINCT FROM NEW.description)
       AND OLD.validation_status IS NOT DISTINCT FROM NEW.validation_status
       AND OLD.is_immutable IS NOT DISTINCT FROM NEW.is_immutable THEN
      INSERT INTO public.performance_evidence_audit (
        evidence_id, action, performed_by, old_values, new_values, company_id
      ) VALUES (
        NEW.id, 'updated', auth.uid(),
        jsonb_build_object('title', OLD.title, 'description', OLD.description),
        jsonb_build_object('title', NEW.title, 'description', NEW.description),
        v_company_id
      );
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.performance_evidence_audit (
      evidence_id, action, performed_by, old_values, company_id
    ) VALUES (
      OLD.id, 'deleted', auth.uid(), to_jsonb(OLD), OLD.company_id
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on performance_evidence table
DROP TRIGGER IF EXISTS trg_evidence_audit ON public.performance_evidence;
CREATE TRIGGER trg_evidence_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.performance_evidence
  FOR EACH ROW EXECUTE FUNCTION public.log_evidence_changes();

-- Enable realtime for audit table
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_evidence_audit;
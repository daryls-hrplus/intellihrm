-- Add per-step expiration and SLA tracking columns to workflow_steps
ALTER TABLE public.workflow_steps 
ADD COLUMN IF NOT EXISTS expiration_days integer,
ADD COLUMN IF NOT EXISTS sla_warning_hours integer,
ADD COLUMN IF NOT EXISTS sla_critical_hours integer;

-- Add step timing tracking to workflow_instances
ALTER TABLE public.workflow_instances
ADD COLUMN IF NOT EXISTS current_step_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS current_step_deadline_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sla_status text DEFAULT 'on_track';

-- Add step-level tracking table for historical SLA data
CREATE TABLE IF NOT EXISTS public.workflow_step_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  deadline_at timestamp with time zone,
  escalated_at timestamp with time zone,
  expired_at timestamp with time zone,
  sla_status text DEFAULT 'on_track',
  actor_id uuid REFERENCES public.profiles(id),
  action text,
  time_to_complete_hours numeric,
  was_overdue boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_step_tracking_instance ON public.workflow_step_tracking(instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_step_tracking_step ON public.workflow_step_tracking(step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_sla ON public.workflow_instances(sla_status) WHERE sla_status != 'on_track';
CREATE INDEX IF NOT EXISTS idx_workflow_instances_step_deadline ON public.workflow_instances(current_step_deadline_at) WHERE current_step_deadline_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.workflow_step_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for workflow_step_tracking
CREATE POLICY "Users can view tracking for their workflows"
ON public.workflow_step_tracking FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workflow_instances wi
    WHERE wi.id = workflow_step_tracking.instance_id
    AND (wi.initiated_by = auth.uid() OR wi.company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    ))
  )
);

CREATE POLICY "System can insert tracking records"
ON public.workflow_step_tracking FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update tracking records"
ON public.workflow_step_tracking FOR UPDATE
USING (true);

-- Add comments for documentation
COMMENT ON COLUMN public.workflow_steps.expiration_days IS 'Number of days before step expires and workflow is auto-rejected';
COMMENT ON COLUMN public.workflow_steps.sla_warning_hours IS 'Hours before deadline to show warning status';
COMMENT ON COLUMN public.workflow_steps.sla_critical_hours IS 'Hours before deadline to show critical status';
COMMENT ON COLUMN public.workflow_instances.current_step_started_at IS 'When the current step was started';
COMMENT ON COLUMN public.workflow_instances.current_step_deadline_at IS 'Deadline for current step based on expiration_days';
COMMENT ON COLUMN public.workflow_instances.sla_status IS 'Current SLA status: on_track, warning, critical, overdue, expired';
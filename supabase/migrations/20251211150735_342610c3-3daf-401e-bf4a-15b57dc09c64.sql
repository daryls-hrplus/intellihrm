-- Create assignment history table
CREATE TABLE public.employee_position_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_position_id UUID REFERENCES public.employee_positions(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'ended')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_position_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view assignment history"
ON public.employee_position_history
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert history"
ON public.employee_position_history
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to log assignment changes
CREATE OR REPLACE FUNCTION public.log_employee_position_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.employee_position_history (
      employee_position_id, employee_id, position_id, action, new_values, changed_by
    ) VALUES (
      NEW.id, NEW.employee_id, NEW.position_id, 'created', to_jsonb(NEW), auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if meaningful fields changed
    IF OLD.position_id IS DISTINCT FROM NEW.position_id 
       OR OLD.is_active IS DISTINCT FROM NEW.is_active
       OR OLD.end_date IS DISTINCT FROM NEW.end_date
       OR OLD.is_primary IS DISTINCT FROM NEW.is_primary
       OR OLD.compensation_amount IS DISTINCT FROM NEW.compensation_amount THEN
      INSERT INTO public.employee_position_history (
        employee_position_id, employee_id, position_id, action, old_values, new_values, changed_by
      ) VALUES (
        NEW.id, 
        NEW.employee_id, 
        NEW.position_id, 
        CASE WHEN NEW.is_active = false AND OLD.is_active = true THEN 'ended' ELSE 'updated' END,
        to_jsonb(OLD), 
        to_jsonb(NEW), 
        auth.uid()
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.employee_position_history (
      employee_position_id, employee_id, position_id, action, old_values, changed_by
    ) VALUES (
      OLD.id, OLD.employee_id, OLD.position_id, 'ended', to_jsonb(OLD), auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger
CREATE TRIGGER employee_position_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.employee_positions
FOR EACH ROW EXECUTE FUNCTION public.log_employee_position_change();

-- Create index for faster queries
CREATE INDEX idx_employee_position_history_employee ON public.employee_position_history(employee_id);
CREATE INDEX idx_employee_position_history_created ON public.employee_position_history(created_at DESC);
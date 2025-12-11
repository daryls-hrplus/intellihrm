-- Create headcount request history table
CREATE TABLE public.headcount_request_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headcount_request_id UUID NOT NULL REFERENCES public.headcount_requests(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.headcount_request_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view headcount request history"
  ON public.headcount_request_history FOR SELECT
  USING (true);

CREATE POLICY "System can insert history"
  ON public.headcount_request_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger function to log status changes
CREATE OR REPLACE FUNCTION public.log_headcount_request_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.headcount_request_history (headcount_request_id, old_status, new_status, changed_by, notes)
    VALUES (NEW.id, NULL, NEW.status, auth.uid(), 'Request created');
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.headcount_request_history (headcount_request_id, old_status, new_status, changed_by, notes)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NEW.review_notes);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER headcount_request_status_change_trigger
  AFTER INSERT OR UPDATE ON public.headcount_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_headcount_request_status_change();

-- Add index for faster lookups
CREATE INDEX idx_headcount_request_history_request_id ON public.headcount_request_history(headcount_request_id);
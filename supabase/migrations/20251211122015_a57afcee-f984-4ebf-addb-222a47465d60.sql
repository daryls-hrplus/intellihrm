-- Create access request history table
CREATE TABLE public.access_request_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_request_id UUID NOT NULL REFERENCES public.access_requests(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_request_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view all history"
ON public.access_request_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own request history"
ON public.access_request_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.access_requests ar 
    WHERE ar.id = access_request_id AND ar.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert history"
ON public.access_request_history
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger function to log status changes
CREATE OR REPLACE FUNCTION public.log_access_request_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.access_request_history (access_request_id, old_status, new_status, changed_by, notes)
    VALUES (NEW.id, NULL, NEW.status, auth.uid(), 'Request created');
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.access_request_history (access_request_id, old_status, new_status, changed_by, notes)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NEW.review_notes);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER access_request_status_change_trigger
AFTER INSERT OR UPDATE ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION public.log_access_request_status_change();

-- Index for faster lookups
CREATE INDEX idx_access_request_history_request_id ON public.access_request_history(access_request_id);
-- Create table for saved scenarios
CREATE TABLE public.saved_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL,
  results JSONB,
  current_headcount INTEGER NOT NULL,
  created_by UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  is_shared BOOLEAN NOT NULL DEFAULT false,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_scenarios ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own scenarios
CREATE POLICY "Users can view own scenarios"
ON public.saved_scenarios
FOR SELECT
USING (auth.uid() = created_by);

-- Policy: Users can view shared scenarios via share token
CREATE POLICY "Anyone can view shared scenarios"
ON public.saved_scenarios
FOR SELECT
USING (is_shared = true AND share_token IS NOT NULL);

-- Policy: Users can create their own scenarios
CREATE POLICY "Users can create scenarios"
ON public.saved_scenarios
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own scenarios
CREATE POLICY "Users can update own scenarios"
ON public.saved_scenarios
FOR UPDATE
USING (auth.uid() = created_by);

-- Policy: Users can delete their own scenarios
CREATE POLICY "Users can delete own scenarios"
ON public.saved_scenarios
FOR DELETE
USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_saved_scenarios_updated_at
BEFORE UPDATE ON public.saved_scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for share token lookups
CREATE INDEX idx_saved_scenarios_share_token ON public.saved_scenarios(share_token) WHERE share_token IS NOT NULL;
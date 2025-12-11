-- Create scenario comments table
CREATE TABLE public.scenario_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID NOT NULL REFERENCES public.saved_scenarios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  content TEXT NOT NULL,
  annotation_target TEXT, -- e.g., 'parameter:growthRate', 'result:finalHeadcount', 'general'
  is_resolved BOOLEAN DEFAULT false,
  parent_comment_id UUID REFERENCES public.scenario_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scenario_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on scenarios they have access to
CREATE POLICY "Users can view comments on accessible scenarios"
ON public.scenario_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM saved_scenarios s
    WHERE s.id = scenario_comments.scenario_id
    AND (s.created_by = auth.uid() OR (s.is_shared = true AND s.share_token IS NOT NULL))
  )
);

-- Users can insert comments on accessible scenarios
CREATE POLICY "Users can insert comments"
ON public.scenario_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM saved_scenarios s
    WHERE s.id = scenario_comments.scenario_id
    AND (s.created_by = auth.uid() OR (s.is_shared = true AND s.share_token IS NOT NULL))
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.scenario_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.scenario_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.scenario_comments;

-- Create updated_at trigger
CREATE TRIGGER update_scenario_comments_updated_at
BEFORE UPDATE ON public.scenario_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
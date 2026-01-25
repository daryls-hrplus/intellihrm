-- Create workspace_tabs table for user-specific tab persistence
CREATE TABLE public.workspace_tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tabs JSONB NOT NULL DEFAULT '[]',
  active_tab_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.workspace_tabs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tabs
CREATE POLICY "Users can view their own workspace tabs"
  ON public.workspace_tabs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workspace tabs"
  ON public.workspace_tabs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspace tabs"
  ON public.workspace_tabs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workspace tabs"
  ON public.workspace_tabs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_workspace_tabs_updated_at
  BEFORE UPDATE ON public.workspace_tabs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Create enablement_checklists table
CREATE TABLE IF NOT EXISTS public.enablement_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL,
  task_order INTEGER NOT NULL DEFAULT 1,
  task_name TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  navigation_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for stage lookups
CREATE INDEX idx_enablement_checklists_stage ON public.enablement_checklists(stage);

-- Enable RLS
ALTER TABLE public.enablement_checklists ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read checklists
CREATE POLICY "Authenticated users can view checklists"
  ON public.enablement_checklists
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to manage checklists
CREATE POLICY "Admins can manage checklists"
  ON public.enablement_checklists
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.code IN ('admin', 'enablement_manager', 'implementation_consultant')
    )
  );

-- Create enablement_checklist_progress table to track completion
CREATE TABLE IF NOT EXISTS public.enablement_checklist_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_status_id UUID NOT NULL REFERENCES public.enablement_content_status(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.enablement_checklists(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_status_id, checklist_item_id)
);

-- Add indexes
CREATE INDEX idx_checklist_progress_content ON public.enablement_checklist_progress(content_status_id);
CREATE INDEX idx_checklist_progress_item ON public.enablement_checklist_progress(checklist_item_id);

-- Enable RLS
ALTER TABLE public.enablement_checklist_progress ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view and manage progress
CREATE POLICY "Authenticated users can view progress"
  ON public.enablement_checklist_progress
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage progress"
  ON public.enablement_checklist_progress
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
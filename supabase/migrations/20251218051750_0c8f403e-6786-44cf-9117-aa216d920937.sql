-- Create workflow stage checklists table (predefined tasks per stage)
CREATE TABLE public.enablement_stage_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL CHECK (stage IN ('backlog', 'in_progress', 'review', 'published')),
  task_order INTEGER NOT NULL DEFAULT 0,
  task_name TEXT NOT NULL,
  task_description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content item checklist progress table
CREATE TABLE public.enablement_content_checklist_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_status_id UUID NOT NULL REFERENCES public.enablement_content_status(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.enablement_stage_checklists(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_status_id, checklist_item_id)
);

-- Enable RLS
ALTER TABLE public.enablement_stage_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_content_checklist_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for stage checklists (read-only for most users, admin can manage)
CREATE POLICY "Anyone can view stage checklists" 
  ON public.enablement_stage_checklists FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage stage checklists" 
  ON public.enablement_stage_checklists FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS policies for checklist progress
CREATE POLICY "Anyone can view checklist progress" 
  ON public.enablement_content_checklist_progress FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage checklist progress" 
  ON public.enablement_content_checklist_progress FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default checklist items for each stage
INSERT INTO public.enablement_stage_checklists (stage, task_order, task_name, task_description, is_required) VALUES
-- Planning Stage (backlog)
('backlog', 1, 'Create release version', 'Create a new release version for the upcoming product update', true),
('backlog', 2, 'Run AI Content Gap Analysis', 'Identify documentation needs using AI gap analysis tool', true),
('backlog', 3, 'Run Compliance Impact Detector', 'Check for regulatory changes that need documentation', false),
('backlog', 4, 'Prioritize content items', 'Set priority levels (critical, high, medium, low) for all items', true),
('backlog', 5, 'Assign content owners', 'Assign team members responsible for each content item', true),
('backlog', 6, 'Set due dates', 'Define target completion dates for each item', true),
('backlog', 7, 'Review feature specifications', 'Ensure feature specs are complete and understood', true),

-- Development Stage (in_progress)
('in_progress', 1, 'Capture screenshots', 'Take annotated screenshots of all relevant screens', true),
('in_progress', 2, 'Generate documentation draft', 'Use AI Documentation Generator for initial content', true),
('in_progress', 3, 'Create video script', 'Write script for training video if applicable', false),
('in_progress', 4, 'Record training video', 'Record and edit training video content', false),
('in_progress', 5, 'Apply template formatting', 'Apply approved template to documentation', true),
('in_progress', 6, 'Add callouts and annotations', 'Add visual callouts and explanatory annotations', true),
('in_progress', 7, 'Link to DAP guides', 'Connect documentation to in-app walkthroughs', false),
('in_progress', 8, 'Self-review completed', 'Author has reviewed their own work', true),

-- Review Stage
('review', 1, 'Technical accuracy review', 'SME verifies technical accuracy of content', true),
('review', 2, 'Editorial review', 'Check grammar, spelling, and style consistency', true),
('review', 3, 'Accessibility check', 'Verify content meets accessibility standards', true),
('review', 4, 'Link verification', 'Confirm all links and references work correctly', true),
('review', 5, 'Screenshot currency check', 'Verify screenshots match current UI', true),
('review', 6, 'Stakeholder approval', 'Get sign-off from product owner or stakeholder', true),
('review', 7, 'Address review feedback', 'Incorporate all feedback from reviewers', true),

-- Published Stage
('published', 1, 'Export to required formats', 'Generate PDF, SCORM, or other required formats', true),
('published', 2, 'Upload to LMS', 'Publish content to learning management system', false),
('published', 3, 'Update help center', 'Publish to customer-facing help center', false),
('published', 4, 'Notify stakeholders', 'Send release notification to relevant teams', true),
('published', 5, 'Archive source files', 'Store editable source files for future updates', true),
('published', 6, 'Update release notes', 'Add content to release notes documentation', true);
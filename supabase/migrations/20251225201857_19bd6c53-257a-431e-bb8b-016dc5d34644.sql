-- Create table for storing sub-metric values per goal
CREATE TABLE public.goal_sub_metric_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  sub_metric_name TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  baseline_value NUMERIC,
  unit_of_measure TEXT,
  weight INTEGER NOT NULL DEFAULT 0 CHECK (weight >= 0 AND weight <= 100),
  evidence_url TEXT,
  evidence_type TEXT CHECK (evidence_type IN ('file', 'link', 'note', 'approval')),
  evidence_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_goal_sub_metric UNIQUE (goal_id, sub_metric_name)
);

-- Add indexes for performance
CREATE INDEX idx_goal_sub_metrics_goal_id ON public.goal_sub_metric_values(goal_id);

-- Enable RLS
ALTER TABLE public.goal_sub_metric_values ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view sub-metrics for goals in their company
CREATE POLICY "Users can view sub-metrics for accessible goals"
  ON public.goal_sub_metric_values
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_goals pg
      JOIN public.profiles p ON p.id = pg.employee_id
      WHERE pg.id = goal_sub_metric_values.goal_id
      AND (
        pg.employee_id = auth.uid()
        OR pg.assigned_by = auth.uid()
        OR p.company_id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      )
    )
  );

-- RLS Policy: Users can manage sub-metrics for their own goals or goals they assigned
CREATE POLICY "Users can manage sub-metrics for their goals"
  ON public.goal_sub_metric_values
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_goals pg
      WHERE pg.id = goal_sub_metric_values.goal_id
      AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.performance_goals pg
      WHERE pg.id = goal_sub_metric_values.goal_id
      AND (pg.employee_id = auth.uid() OR pg.assigned_by = auth.uid())
    )
  );

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_goal_sub_metric_values_updated_at
  BEFORE UPDATE ON public.goal_sub_metric_values
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add template_type column to performance_goals to track which template type was used
ALTER TABLE public.performance_goals 
ADD COLUMN IF NOT EXISTS template_type TEXT CHECK (template_type IN ('simple', 'composite', 'okr', 'delta'));

-- Add metric_template_id column to performance_goals
ALTER TABLE public.performance_goals
ADD COLUMN IF NOT EXISTS metric_template_id TEXT;
-- Add recurring task fields to hr_tasks table
ALTER TABLE public.hr_tasks 
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern text, -- 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'
ADD COLUMN IF NOT EXISTS recurrence_end_date date,
ADD COLUMN IF NOT EXISTS parent_recurring_task_id uuid REFERENCES public.hr_tasks(id) ON DELETE SET NULL;

-- Add index for recurring tasks
CREATE INDEX IF NOT EXISTS idx_hr_tasks_recurring ON public.hr_tasks(is_recurring) WHERE is_recurring = true;

-- Add comment for clarity
COMMENT ON COLUMN public.hr_tasks.recurrence_pattern IS 'Pattern for recurring tasks: daily, weekly, biweekly, monthly, quarterly, yearly';
COMMENT ON COLUMN public.hr_tasks.parent_recurring_task_id IS 'Reference to the original recurring task that spawned this instance';
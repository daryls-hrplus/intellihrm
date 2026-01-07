-- Add is_required column to implementation_sub_tasks
ALTER TABLE public.implementation_sub_tasks 
ADD COLUMN is_required BOOLEAN DEFAULT true;
-- Add position_id to compensation_history for multi-position support
ALTER TABLE public.compensation_history 
ADD COLUMN position_id uuid REFERENCES public.positions(id);

-- Add an index for performance
CREATE INDEX idx_compensation_history_position_id ON public.compensation_history(position_id);

-- Add comment
COMMENT ON COLUMN public.compensation_history.position_id IS 'The specific position this compensation change applies to';
-- Create ticket satisfaction surveys table
CREATE TABLE public.ticket_satisfaction_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  response_time_rating INTEGER CHECK (response_time_rating >= 1 AND response_time_rating <= 5),
  resolution_rating INTEGER CHECK (resolution_rating >= 1 AND resolution_rating <= 5),
  agent_rating INTEGER CHECK (agent_rating >= 1 AND agent_rating <= 5),
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ticket_id)
);

-- Enable RLS
ALTER TABLE public.ticket_satisfaction_surveys ENABLE ROW LEVEL SECURITY;

-- Users can submit survey for their own tickets
CREATE POLICY "Users can submit survey for own tickets"
ON public.ticket_satisfaction_surveys
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM tickets t 
    WHERE t.id = ticket_id 
    AND t.requester_id = auth.uid()
    AND t.status IN ('resolved', 'closed')
  )
);

-- Users can view their own survey responses
CREATE POLICY "Users can view own survey responses"
ON public.ticket_satisfaction_surveys
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all survey responses
CREATE POLICY "Admins can view all surveys"
ON public.ticket_satisfaction_surveys
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for analytics queries
CREATE INDEX idx_satisfaction_surveys_created_at ON public.ticket_satisfaction_surveys(created_at);
CREATE INDEX idx_satisfaction_surveys_rating ON public.ticket_satisfaction_surveys(rating);
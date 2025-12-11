-- Knowledge Base Categories
CREATE TABLE public.kb_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Knowledge Base Articles
CREATE TABLE public.kb_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Helpdesk Ticket Priorities (for SLA configuration)
CREATE TABLE public.ticket_priorities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6b7280',
  response_time_hours INTEGER NOT NULL,
  resolution_time_hours INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Helpdesk Ticket Categories
CREATE TABLE public.ticket_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  default_priority_id UUID REFERENCES public.ticket_priorities(id),
  default_assignee_id UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Helpdesk Tickets
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.ticket_categories(id),
  priority_id UUID REFERENCES public.ticket_priorities(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  requester_id UUID NOT NULL REFERENCES public.profiles(id),
  assignee_id UUID REFERENCES public.profiles(id),
  due_date TIMESTAMP WITH TIME ZONE,
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  sla_breach_response BOOLEAN DEFAULT false,
  sla_breach_resolution BOOLEAN DEFAULT false,
  related_article_id UUID REFERENCES public.kb_articles(id),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket Comments/Messages
CREATE TABLE public.ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket History for audit trail
CREATE TABLE public.ticket_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES public.profiles(id),
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Knowledge Base (All employees can read)
CREATE POLICY "Authenticated users can view active categories"
ON public.kb_categories FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.kb_categories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view published articles"
ON public.kb_articles FOR SELECT
USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage articles"
ON public.kb_articles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for Tickets
CREATE POLICY "Authenticated users can view ticket priorities"
ON public.ticket_priorities FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage ticket priorities"
ON public.ticket_priorities FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view ticket categories"
ON public.ticket_categories FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage ticket categories"
ON public.ticket_categories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own tickets"
ON public.tickets FOR SELECT
USING (auth.uid() = requester_id);

CREATE POLICY "Assignees and admins can view assigned tickets"
ON public.tickets FOR SELECT
USING (auth.uid() = assignee_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Users can create tickets"
ON public.tickets FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Assignees and admins can update tickets"
ON public.tickets FOR UPDATE
USING (auth.uid() = assignee_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Users can view comments on own tickets"
ON public.ticket_comments FOR SELECT
USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.requester_id = auth.uid() OR t.assignee_id = auth.uid())) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can add comments to tickets"
ON public.ticket_comments FOR INSERT
WITH CHECK (auth.uid() = author_id AND EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.requester_id = auth.uid() OR t.assignee_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))));

CREATE POLICY "Users can view history of own tickets"
ON public.ticket_history FOR SELECT
USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.requester_id = auth.uid() OR t.assignee_id = auth.uid())) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert history"
ON public.ticket_history FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := to_char(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 6) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM tickets
  WHERE ticket_number LIKE year_prefix || '-%';
  
  NEW.ticket_number := year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_ticket_number
BEFORE INSERT ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.generate_ticket_number();

-- Function to log ticket changes
CREATE OR REPLACE FUNCTION public.log_ticket_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status', OLD.status, NEW.status);
  END IF;
  IF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id THEN
    INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'assignee_id', OLD.assignee_id::TEXT, NEW.assignee_id::TEXT);
  END IF;
  IF OLD.priority_id IS DISTINCT FROM NEW.priority_id THEN
    INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'priority_id', OLD.priority_id::TEXT, NEW.priority_id::TEXT);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ticket_changes_trigger
AFTER UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.log_ticket_changes();

-- Insert default priorities
INSERT INTO public.ticket_priorities (name, code, color, response_time_hours, resolution_time_hours, display_order) VALUES
('Critical', 'critical', '#dc2626', 1, 4, 1),
('High', 'high', '#ea580c', 4, 24, 2),
('Medium', 'medium', '#ca8a04', 8, 48, 3),
('Low', 'low', '#22c55e', 24, 72, 4);

-- Insert default categories
INSERT INTO public.ticket_categories (name, code, description) VALUES
('Technical Support', 'technical', 'Issues with system access, errors, or bugs'),
('HR Inquiry', 'hr', 'Questions about policies, benefits, or HR processes'),
('Feature Request', 'feature', 'Suggestions for new features or improvements'),
('General Question', 'general', 'General questions about the system');

-- Indexes
CREATE INDEX idx_kb_articles_category ON public.kb_articles(category_id);
CREATE INDEX idx_kb_articles_published ON public.kb_articles(is_published);
CREATE INDEX idx_tickets_requester ON public.tickets(requester_id);
CREATE INDEX idx_tickets_assignee ON public.tickets(assignee_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_ticket_comments_ticket ON public.ticket_comments(ticket_id);
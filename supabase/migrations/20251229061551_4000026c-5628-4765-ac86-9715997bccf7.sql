-- Recognition Badges/Achievements System
CREATE TABLE IF NOT EXISTS public.recognition_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  badge_code TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'award',
  color TEXT DEFAULT 'primary',
  points_threshold INTEGER,
  recognition_count_threshold INTEGER,
  badge_type TEXT NOT NULL DEFAULT 'achievement',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User earned badges
CREATE TABLE IF NOT EXISTS public.employee_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  badge_id UUID NOT NULL REFERENCES public.recognition_badges(id),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  awarded_reason TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, badge_id)
);

-- Recognition notifications
CREATE TABLE IF NOT EXISTS public.recognition_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  recognition_id UUID REFERENCES public.recognition_awards(id),
  badge_id UUID REFERENCES public.recognition_badges(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Team recognition tracking (without team_id since teams table doesn't exist)
ALTER TABLE public.recognition_awards 
ADD COLUMN IF NOT EXISTS is_team_recognition BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);

-- Recognition analytics snapshots
CREATE TABLE IF NOT EXISTS public.recognition_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  department_id UUID REFERENCES public.departments(id),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_recognitions INTEGER DEFAULT 0,
  peer_recognitions INTEGER DEFAULT 0,
  manager_recognitions INTEGER DEFAULT 0,
  total_points_awarded INTEGER DEFAULT 0,
  unique_givers INTEGER DEFAULT 0,
  unique_receivers INTEGER DEFAULT 0,
  participation_rate NUMERIC(5,2),
  top_value TEXT,
  top_award_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, department_id, snapshot_date)
);

-- Enable RLS
ALTER TABLE public.recognition_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognition_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognition_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recognition_badges
CREATE POLICY "Users can view badges" ON public.recognition_badges
  FOR SELECT USING (true);

-- RLS Policies for employee_badges
CREATE POLICY "Users can view all badges" ON public.employee_badges
  FOR SELECT USING (true);

CREATE POLICY "System can insert badges" ON public.employee_badges
  FOR INSERT WITH CHECK (true);

-- RLS Policies for recognition_notifications
CREATE POLICY "Users can view their own notifications" ON public.recognition_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.recognition_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.recognition_notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for recognition_analytics
CREATE POLICY "Users can view analytics" ON public.recognition_analytics
  FOR SELECT USING (true);

CREATE POLICY "System can manage analytics" ON public.recognition_analytics
  FOR ALL USING (true);

-- Insert default badges
INSERT INTO public.recognition_badges (badge_code, badge_name, description, icon_name, color, recognition_count_threshold, badge_type) VALUES
  ('first_recognition', 'Rising Star', 'Received your first recognition', 'star', 'yellow', 1, 'milestone'),
  ('recognition_5', 'Team Player', 'Received 5 recognitions', 'users', 'blue', 5, 'milestone'),
  ('recognition_10', 'Star Performer', 'Received 10 recognitions', 'trophy', 'gold', 10, 'milestone'),
  ('recognition_25', 'Recognition Champion', 'Received 25 recognitions', 'crown', 'purple', 25, 'milestone'),
  ('giver_5', 'Generous Spirit', 'Given 5 recognitions to colleagues', 'heart', 'pink', 5, 'achievement'),
  ('giver_10', 'Culture Builder', 'Given 10 recognitions to colleagues', 'sparkles', 'cyan', 10, 'achievement'),
  ('innovation_hero', 'Innovation Hero', 'Recognized for innovation excellence', 'lightbulb', 'amber', NULL, 'special'),
  ('customer_champion', 'Customer Champion', 'Outstanding customer service recognition', 'award', 'green', NULL, 'special')
ON CONFLICT DO NOTHING;

-- Function to create notification when recognition is given
CREATE OR REPLACE FUNCTION create_recognition_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.recognition_notifications (user_id, recognition_id, notification_type, title, message)
  VALUES (
    NEW.recipient_id,
    NEW.id,
    'received_recognition',
    'You received a recognition!',
    'Someone recognized you for: ' || NEW.title
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for notifications
DROP TRIGGER IF EXISTS trigger_recognition_notification ON public.recognition_awards;
CREATE TRIGGER trigger_recognition_notification
  AFTER INSERT ON public.recognition_awards
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION create_recognition_notification();

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  recognition_count INTEGER;
  given_count INTEGER;
  badge_rec RECORD;
BEGIN
  -- Count recognitions received
  SELECT COUNT(*) INTO recognition_count
  FROM public.recognition_awards
  WHERE recipient_id = NEW.recipient_id AND status = 'approved';

  -- Count recognitions given
  SELECT COUNT(*) INTO given_count
  FROM public.recognition_awards
  WHERE nominator_id = NEW.nominator_id AND status = 'approved';

  -- Check milestone badges for recipient
  FOR badge_rec IN
    SELECT id, badge_code, badge_name, recognition_count_threshold
    FROM public.recognition_badges
    WHERE badge_type = 'milestone'
    AND recognition_count_threshold IS NOT NULL
    AND recognition_count_threshold <= recognition_count
  LOOP
    INSERT INTO public.employee_badges (employee_id, badge_id, awarded_reason)
    VALUES (NEW.recipient_id, badge_rec.id, 'Reached ' || badge_rec.recognition_count_threshold || ' recognitions')
    ON CONFLICT (employee_id, badge_id) DO NOTHING;
  END LOOP;

  -- Check giver badges
  FOR badge_rec IN
    SELECT id, badge_code, badge_name, recognition_count_threshold
    FROM public.recognition_badges
    WHERE badge_code LIKE 'giver_%'
    AND recognition_count_threshold IS NOT NULL
    AND recognition_count_threshold <= given_count
  LOOP
    INSERT INTO public.employee_badges (employee_id, badge_id, awarded_reason)
    VALUES (NEW.nominator_id, badge_rec.id, 'Given ' || badge_rec.recognition_count_threshold || ' recognitions')
    ON CONFLICT (employee_id, badge_id) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for badge checking
DROP TRIGGER IF EXISTS trigger_check_badges ON public.recognition_awards;
CREATE TRIGGER trigger_check_badges
  AFTER INSERT ON public.recognition_awards
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION check_and_award_badges();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_badges_employee ON public.employee_badges(employee_id);
CREATE INDEX IF NOT EXISTS idx_recognition_notifications_user ON public.recognition_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_recognition_analytics_company_date ON public.recognition_analytics(company_id, snapshot_date);
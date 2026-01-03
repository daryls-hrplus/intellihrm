-- Tutorial video categories
CREATE TABLE public.help_video_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_key TEXT,
  description TEXT,
  icon_name TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tutorial videos
CREATE TABLE public.help_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.help_video_categories(id),
  title TEXT NOT NULL,
  title_key TEXT,
  description TEXT,
  description_key TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  route_patterns TEXT[] DEFAULT '{}',
  action_tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  user_roles TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'beginner',
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User video watch history
CREATE TABLE public.help_video_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID REFERENCES public.help_videos(id) ON DELETE CASCADE,
  watched_at TIMESTAMPTZ DEFAULT now(),
  watch_duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  context_route TEXT,
  UNIQUE(user_id, video_id, watched_at)
);

-- Enable RLS
ALTER TABLE public.help_video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_video_history ENABLE ROW LEVEL SECURITY;

-- Categories and videos are publicly readable
CREATE POLICY "Anyone can view active categories" ON public.help_video_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active videos" ON public.help_videos
  FOR SELECT USING (is_active = true);

-- Admins can manage categories and videos
CREATE POLICY "Admins can manage categories" ON public.help_video_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "Admins can manage videos" ON public.help_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager')
    )
  );

-- Users can view and manage their own history
CREATE POLICY "Users can view own history" ON public.help_video_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON public.help_video_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history" ON public.help_video_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_help_videos_category ON public.help_videos(category_id);
CREATE INDEX idx_help_videos_route_patterns ON public.help_videos USING GIN(route_patterns);
CREATE INDEX idx_help_videos_action_tags ON public.help_videos USING GIN(action_tags);
CREATE INDEX idx_help_videos_keywords ON public.help_videos USING GIN(keywords);
CREATE INDEX idx_help_video_history_user ON public.help_video_history(user_id);
CREATE INDEX idx_help_video_history_video ON public.help_video_history(video_id);

-- Seed categories
INSERT INTO public.help_video_categories (name, description, icon_name, display_order) VALUES
  ('Getting Started', 'Introduction and onboarding videos', 'PlayCircle', 1),
  ('Core HR', 'Employee management and organization', 'Users', 2),
  ('Payroll', 'Payroll processing and management', 'DollarSign', 3),
  ('Leave & Attendance', 'Time tracking and leave management', 'Calendar', 4),
  ('Performance', 'Appraisals and performance management', 'TrendingUp', 5),
  ('Recruitment', 'Hiring and onboarding new employees', 'UserPlus', 6),
  ('Reports', 'Analytics and reporting features', 'BarChart', 7),
  ('Admin', 'System configuration and settings', 'Settings', 8);

-- Create triggers for updated_at
CREATE TRIGGER update_help_video_categories_updated_at
  BEFORE UPDATE ON public.help_video_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_videos_updated_at
  BEFORE UPDATE ON public.help_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
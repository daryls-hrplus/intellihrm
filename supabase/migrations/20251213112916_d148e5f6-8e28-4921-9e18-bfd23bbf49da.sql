-- 1. Discussion Forums
CREATE TABLE public.lms_discussion_forums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lms_discussion_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID NOT NULL REFERENCES public.lms_discussion_forums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lms_discussion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.lms_discussion_threads(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.lms_discussion_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN NOT NULL DEFAULT false,
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Bookmarks/Notes
CREATE TABLE public.lms_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lms_lessons(id) ON DELETE CASCADE,
  title TEXT,
  notes TEXT,
  position_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id, position_seconds)
);

CREATE TABLE public.lms_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lms_lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Course Reviews/Ratings
CREATE TABLE public.lms_course_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,
  is_verified_completion BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

CREATE TABLE public.lms_review_helpful (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.lms_course_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- 4. Prerequisites Management
CREATE TABLE public.lms_course_prerequisites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  prerequisite_course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  minimum_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, prerequisite_course_id),
  CHECK (course_id != prerequisite_course_id)
);

-- 5. Gamification
CREATE TABLE public.lms_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  badge_type TEXT NOT NULL DEFAULT 'achievement',
  criteria JSONB NOT NULL DEFAULT '{}',
  points INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lms_user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.lms_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  course_id UUID REFERENCES public.lms_courses(id) ON DELETE SET NULL,
  UNIQUE(user_id, badge_id)
);

CREATE TABLE public.lms_user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE public.lms_point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lms_leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  leaderboard_type TEXT NOT NULL DEFAULT 'points',
  time_period TEXT NOT NULL DEFAULT 'all_time',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. SCORM/xAPI Support
CREATE TABLE public.lms_scorm_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  package_url TEXT NOT NULL,
  scorm_version TEXT NOT NULL DEFAULT '1.2',
  manifest_data JSONB,
  entry_point TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lms_scorm_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.lms_scorm_packages(id) ON DELETE CASCADE,
  sco_id TEXT,
  lesson_status TEXT,
  completion_status TEXT,
  success_status TEXT,
  score_raw NUMERIC,
  score_min NUMERIC,
  score_max NUMERIC,
  score_scaled NUMERIC,
  total_time TEXT,
  session_time TEXT,
  suspend_data TEXT,
  location TEXT,
  cmi_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, package_id, sco_id)
);

CREATE TABLE public.lms_xapi_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.lms_courses(id) ON DELETE SET NULL,
  statement_id UUID NOT NULL UNIQUE,
  verb TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  result JSONB,
  context JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stored_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lms_discussion_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_review_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_course_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_scorm_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_scorm_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_xapi_statements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discussion forums (enrolled users can view/participate)
CREATE POLICY "Enrolled users can view forums" ON public.lms_discussion_forums
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = lms_discussion_forums.course_id AND user_id = auth.uid())
    OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Enrolled users can create threads" ON public.lms_discussion_threads
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM lms_discussion_forums f JOIN lms_enrollments e ON e.course_id = f.course_id 
            WHERE f.id = forum_id AND e.user_id = auth.uid())
  );

CREATE POLICY "Users can view threads" ON public.lms_discussion_threads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lms_discussion_forums f JOIN lms_enrollments e ON e.course_id = f.course_id 
            WHERE f.id = forum_id AND e.user_id = auth.uid())
    OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Users can reply to threads" ON public.lms_discussion_replies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM lms_discussion_threads t JOIN lms_discussion_forums f ON f.id = t.forum_id 
            JOIN lms_enrollments e ON e.course_id = f.course_id WHERE t.id = thread_id AND e.user_id = auth.uid())
  );

CREATE POLICY "Users can view replies" ON public.lms_discussion_replies
  FOR SELECT USING (true);

-- RLS Policies for bookmarks/notes (users manage their own)
CREATE POLICY "Users manage their own bookmarks" ON public.lms_bookmarks
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users manage their own notes" ON public.lms_notes
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Anyone can view approved reviews" ON public.lms_course_reviews
  FOR SELECT USING (is_approved = true OR user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create reviews" ON public.lms_course_reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON public.lms_course_reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users manage helpful votes" ON public.lms_review_helpful
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for prerequisites (viewable by all authenticated)
CREATE POLICY "Prerequisites viewable by all" ON public.lms_course_prerequisites
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage prerequisites" ON public.lms_course_prerequisites
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for gamification
CREATE POLICY "Badges viewable by all" ON public.lms_badges
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage badges" ON public.lms_badges
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "User badges viewable by all" ON public.lms_user_badges
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System inserts user badges" ON public.lms_user_badges
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "User points viewable by all" ON public.lms_user_points
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System manages user points" ON public.lms_user_points
  FOR ALL USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Point transactions viewable by owner" ON public.lms_point_transactions
  FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Leaderboards viewable by all" ON public.lms_leaderboards
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage leaderboards" ON public.lms_leaderboards
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for SCORM/xAPI
CREATE POLICY "SCORM packages viewable by enrolled" ON public.lms_scorm_packages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM lms_enrollments WHERE course_id = lms_scorm_packages.course_id AND user_id = auth.uid())
    OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Admins manage SCORM packages" ON public.lms_scorm_packages
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users manage their SCORM tracking" ON public.lms_scorm_tracking
  FOR ALL USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users manage their xAPI statements" ON public.lms_xapi_statements
  FOR ALL USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Add indexes for performance
CREATE INDEX idx_lms_discussion_threads_forum ON public.lms_discussion_threads(forum_id);
CREATE INDEX idx_lms_discussion_replies_thread ON public.lms_discussion_replies(thread_id);
CREATE INDEX idx_lms_bookmarks_user ON public.lms_bookmarks(user_id);
CREATE INDEX idx_lms_notes_user ON public.lms_notes(user_id);
CREATE INDEX idx_lms_course_reviews_course ON public.lms_course_reviews(course_id);
CREATE INDEX idx_lms_user_badges_user ON public.lms_user_badges(user_id);
CREATE INDEX idx_lms_point_transactions_user ON public.lms_point_transactions(user_id);
CREATE INDEX idx_lms_scorm_tracking_user ON public.lms_scorm_tracking(user_id);
CREATE INDEX idx_lms_xapi_statements_user ON public.lms_xapi_statements(user_id);
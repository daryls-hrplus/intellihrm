
-- Create employee privacy settings table for opt-out preferences
CREATE TABLE public.employee_privacy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_birthday BOOLEAN NOT NULL DEFAULT true,
    share_work_anniversary BOOLEAN NOT NULL DEFAULT true,
    share_new_child BOOLEAN NOT NULL DEFAULT true,
    share_marriage BOOLEAN NOT NULL DEFAULT true,
    share_promotion BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create intranet announcements table
CREATE TABLE public.intranet_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    announcement_type TEXT NOT NULL DEFAULT 'general',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    related_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create intranet photo gallery table
CREATE TABLE public.intranet_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    album_name TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create intranet blog posts table
CREATE TABLE public.intranet_blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_id UUID NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.employee_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intranet_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intranet_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intranet_blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_privacy_settings
CREATE POLICY "Users can view own privacy settings"
ON public.employee_privacy_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy settings"
ON public.employee_privacy_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings"
ON public.employee_privacy_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all privacy settings"
ON public.employee_privacy_settings FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for intranet_announcements
CREATE POLICY "Authenticated users can view published announcements"
ON public.intranet_announcements FOR SELECT
USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins and HR can manage announcements"
ON public.intranet_announcements FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS policies for intranet_gallery
CREATE POLICY "Authenticated users can view published gallery items"
ON public.intranet_gallery FOR SELECT
USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins and HR can manage gallery"
ON public.intranet_gallery FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS policies for intranet_blog_posts
CREATE POLICY "Authenticated users can view published blog posts"
ON public.intranet_blog_posts FOR SELECT
USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins and HR can manage blog posts"
ON public.intranet_blog_posts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_employee_privacy_settings_updated_at
BEFORE UPDATE ON public.employee_privacy_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intranet_announcements_updated_at
BEFORE UPDATE ON public.intranet_announcements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intranet_gallery_updated_at
BEFORE UPDATE ON public.intranet_gallery
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intranet_blog_posts_updated_at
BEFORE UPDATE ON public.intranet_blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

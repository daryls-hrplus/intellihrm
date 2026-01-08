-- Create announcement reads tracking table
CREATE TABLE public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.company_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Add acknowledgement flag to announcements
ALTER TABLE public.company_announcements 
ADD COLUMN IF NOT EXISTS requires_acknowledgement BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

-- Users can view their own read records
CREATE POLICY "Users can view own announcement reads"
ON public.announcement_reads
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own read records
CREATE POLICY "Users can mark announcements as read"
ON public.announcement_reads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own read records (for acknowledgement)
CREATE POLICY "Users can acknowledge announcements"
ON public.announcement_reads
FOR UPDATE
USING (auth.uid() = user_id);

-- HR/Admin can view all reads for analytics (using correct enum values)
CREATE POLICY "HR can view all announcement reads"
ON public.announcement_reads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager', 'system_admin')
  )
);

-- Create index for performance
CREATE INDEX idx_announcement_reads_announcement_id ON public.announcement_reads(announcement_id);
CREATE INDEX idx_announcement_reads_user_id ON public.announcement_reads(user_id);

-- Function to create notifications when announcement is published
CREATE OR REPLACE FUNCTION public.notify_on_announcement_publish()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for active announcements that are now published
  IF NEW.is_active = true AND (NEW.publish_at IS NULL OR NEW.publish_at <= now()) THEN
    -- Insert notifications for all users in the company (respecting preferences)
    INSERT INTO public.notifications (user_id, title, message, type, link, metadata)
    SELECT 
      p.id,
      'New Announcement: ' || NEW.title,
      LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
      'announcement',
      '/ess/announcements',
      jsonb_build_object('announcement_id', NEW.id, 'priority', NEW.priority)
    FROM public.profiles p
    LEFT JOIN public.notification_preferences np ON np.user_id = p.id
    WHERE p.company_id = NEW.company_id
    AND (np.system_announcements IS NULL OR np.system_announcements = true);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new announcements
CREATE TRIGGER trigger_notify_on_announcement_publish
AFTER INSERT ON public.company_announcements
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_announcement_publish();
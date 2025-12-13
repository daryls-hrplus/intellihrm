-- Add video platform fields to appraisal_interviews
ALTER TABLE public.appraisal_interviews 
ADD COLUMN IF NOT EXISTS video_platform TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS zoom_meeting_id TEXT,
ADD COLUMN IF NOT EXISTS teams_meeting_id TEXT,
ADD COLUMN IF NOT EXISTS screen_sharing_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recording_enabled BOOLEAN DEFAULT false;

-- Add video platform fields to goal_interviews
ALTER TABLE public.goal_interviews 
ADD COLUMN IF NOT EXISTS video_platform TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS zoom_meeting_id TEXT,
ADD COLUMN IF NOT EXISTS teams_meeting_id TEXT,
ADD COLUMN IF NOT EXISTS screen_sharing_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recording_enabled BOOLEAN DEFAULT false;

-- Create interview_recordings table for storing recordings
CREATE TABLE IF NOT EXISTS public.interview_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_type TEXT NOT NULL, -- 'appraisal', 'goal', 'recruitment'
  interview_id UUID NOT NULL,
  recording_url TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  recorded_by UUID REFERENCES public.profiles(id),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recordings they participated in"
  ON public.interview_recordings FOR SELECT
  USING (recorded_by = auth.uid());

CREATE POLICY "Users can create recordings"
  ON public.interview_recordings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add video fields to recruitment interviews table if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recruitment_interviews' AND table_schema = 'public') THEN
    ALTER TABLE public.recruitment_interviews 
    ADD COLUMN IF NOT EXISTS video_platform TEXT DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS zoom_meeting_id TEXT,
    ADD COLUMN IF NOT EXISTS teams_meeting_id TEXT,
    ADD COLUMN IF NOT EXISTS screen_sharing_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS recording_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;
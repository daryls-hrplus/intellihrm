-- Create storage bucket for training videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-videos',
  'training-videos',
  true,
  524288000, -- 500MB limit for videos
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']
);

-- RLS policies for training videos bucket
CREATE POLICY "Anyone can view training videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'training-videos');

CREATE POLICY "Admin/HR can upload training videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'training-videos' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Admin/HR can update training videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'training-videos' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Admin/HR can delete training videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'training-videos' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);
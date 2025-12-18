-- Create storage bucket for timeclock photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('timeclock-photos', 'timeclock-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for timeclock photos
CREATE POLICY "Users can upload their own timeclock photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'timeclock-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own timeclock photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'timeclock-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can view all timeclock photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'timeclock-photos' AND auth.role() = 'authenticated');
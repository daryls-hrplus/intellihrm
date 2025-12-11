
-- Create storage bucket for intranet images
INSERT INTO storage.buckets (id, name, public)
VALUES ('intranet-images', 'intranet-images', true);

-- RLS policies for intranet-images bucket
CREATE POLICY "Anyone can view intranet images"
ON storage.objects FOR SELECT
USING (bucket_id = 'intranet-images');

CREATE POLICY "Admins and HR can upload intranet images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'intranet-images' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
);

CREATE POLICY "Admins and HR can update intranet images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'intranet-images' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
);

CREATE POLICY "Admins and HR can delete intranet images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'intranet-images' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
);

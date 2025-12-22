-- Add storage policies for the payslips bucket

-- Allow HR/Admin to upload payslips
CREATE POLICY "HR/Admin can upload payslips" 
ON storage.objects 
FOR INSERT 
TO public
WITH CHECK (
  bucket_id = 'payslips' 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'))
);

-- Allow HR/Admin to update payslips
CREATE POLICY "HR/Admin can update payslips" 
ON storage.objects 
FOR UPDATE 
TO public
USING (
  bucket_id = 'payslips' 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'))
);

-- Allow HR/Admin to delete payslips
CREATE POLICY "HR/Admin can delete payslips" 
ON storage.objects 
FOR DELETE 
TO public
USING (
  bucket_id = 'payslips' 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'))
);

-- Allow employees to view their own payslips (the path contains their employee_id)
CREATE POLICY "Employees can view own payslips" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'payslips' 
  AND (
    -- Employee can access their own folder
    (storage.foldername(name))[1] = auth.uid()::text
    -- Or HR/Admin can access all
    OR has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'hr_manager')
  )
);
-- Add SELECT policy for territories table to allow authenticated users to read
CREATE POLICY "Authenticated users can view territories" 
ON public.territories 
FOR SELECT 
TO authenticated
USING (true);

-- Also add a policy for anon users if needed for public access (optional, keeping restrictive)
-- This allows any logged-in user to see territories which is appropriate for admin config data
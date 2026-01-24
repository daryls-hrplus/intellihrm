
-- Final security fixes: helper functions with search_path

-- 1. Recreate is_admin_or_hr with search_path
CREATE OR REPLACE FUNCTION public.is_admin_or_hr()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager')
  )
$$;

-- 2. Recreate is_admin with search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
$$;

-- 3. Fix goal_approval_history (uses actor_id, not approved_by)
DROP POLICY IF EXISTS "System can insert approval history" ON goal_approval_history;
CREATE POLICY "System can insert approval history"
  ON goal_approval_history FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_hr() OR auth.uid() = actor_id);

-- 4. Fix grievance_documents
DROP POLICY IF EXISTS "Users can upload grievance documents" ON grievance_documents;
CREATE POLICY "Users can upload own grievance documents"
  ON grievance_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- 5. Fix kb_article_reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON kb_article_reviews;
CREATE POLICY "Reviewers can create article reviews"
  ON kb_article_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

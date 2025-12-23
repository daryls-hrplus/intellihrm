-- Create employee_languages table for tracking employee language proficiency
CREATE TABLE public.employee_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  
  -- Language identification (ISO 639-1 codes)
  language_code VARCHAR(10) NOT NULL,
  language_name VARCHAR(100) NOT NULL,
  
  -- Proficiency scale type and levels
  proficiency_scale VARCHAR(10) DEFAULT 'numeric' CHECK (proficiency_scale IN ('numeric', 'cefr')),
  overall_proficiency VARCHAR(10),
  speaking_proficiency VARCHAR(10),
  reading_proficiency VARCHAR(10),
  writing_proficiency VARCHAR(10),
  
  -- Certification tracking
  certification_exam VARCHAR(100),
  certification_score VARCHAR(50),
  
  -- Validity tracking
  effective_date DATE,
  expiry_date DATE,
  
  -- Additional flags
  is_primary BOOLEAN DEFAULT false,
  is_native BOOLEAN DEFAULT false,
  notes TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Create employee_languages_history table for audit trail
CREATE TABLE public.employee_languages_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_record_id UUID REFERENCES public.employee_languages(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL,
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted')),
  previous_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES public.profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_employee_languages_employee_id ON public.employee_languages(employee_id);
CREATE INDEX idx_employee_languages_company_id ON public.employee_languages(company_id);
CREATE INDEX idx_employee_languages_language_code ON public.employee_languages(language_code);
CREATE INDEX idx_employee_languages_history_record_id ON public.employee_languages_history(language_record_id);
CREATE INDEX idx_employee_languages_history_employee_id ON public.employee_languages_history(employee_id);

-- Enable RLS
ALTER TABLE public.employee_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_languages_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_languages

-- Employees can view their own languages
CREATE POLICY "Employees can view own languages"
  ON public.employee_languages FOR SELECT
  USING (employee_id = auth.uid());

-- Employees can manage their own languages
CREATE POLICY "Employees can insert own languages"
  ON public.employee_languages FOR INSERT
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own languages"
  ON public.employee_languages FOR UPDATE
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can delete own languages"
  ON public.employee_languages FOR DELETE
  USING (employee_id = auth.uid());

-- HR and Managers can view all languages
CREATE POLICY "HR and Managers can view all languages"
  ON public.employee_languages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'hr', 'manager')
    )
  );

-- HR can manage all languages
CREATE POLICY "HR can insert any languages"
  ON public.employee_languages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'hr')
    )
  );

CREATE POLICY "HR can update any languages"
  ON public.employee_languages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'hr')
    )
  );

CREATE POLICY "HR can delete any languages"
  ON public.employee_languages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'hr')
    )
  );

-- RLS Policies for employee_languages_history

-- Employees can view their own history
CREATE POLICY "Employees can view own language history"
  ON public.employee_languages_history FOR SELECT
  USING (employee_id = auth.uid());

-- HR can view all history
CREATE POLICY "HR can view all language history"
  ON public.employee_languages_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'hr')
    )
  );

-- System can insert history (via trigger)
CREATE POLICY "System can insert language history"
  ON public.employee_languages_history FOR INSERT
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_employee_languages_updated_at
  BEFORE UPDATE ON public.employee_languages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger function for audit history
CREATE OR REPLACE FUNCTION public.log_employee_language_changes()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.employee_languages_history (
      language_record_id, employee_id, change_type, new_values, changed_by
    ) VALUES (
      NEW.id, NEW.employee_id, 'created', to_jsonb(NEW), auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.employee_languages_history (
      language_record_id, employee_id, change_type, previous_values, new_values, changed_by
    ) VALUES (
      NEW.id, NEW.employee_id, 'updated', to_jsonb(OLD), to_jsonb(NEW), auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.employee_languages_history (
      language_record_id, employee_id, change_type, previous_values, changed_by
    ) VALUES (
      OLD.id, OLD.employee_id, 'deleted', to_jsonb(OLD), auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for audit history
CREATE TRIGGER employee_languages_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_languages
  FOR EACH ROW
  EXECUTE FUNCTION public.log_employee_language_changes();

-- Insert module permissions for languages tab
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, is_active)
VALUES 
  ('ess', 'Employee Self Service', 'ess_languages', 'Languages', true),
  ('workforce', 'Workforce', 'employee_languages', 'Employee Languages', true)
ON CONFLICT DO NOTHING;
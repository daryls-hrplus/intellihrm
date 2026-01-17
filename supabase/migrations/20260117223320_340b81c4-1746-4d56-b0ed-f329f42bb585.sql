-- Create position_matrix_supervisors table for dotted-line/matrix reporting relationships
CREATE TABLE public.position_matrix_supervisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  matrix_supervisor_position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'functional' CHECK (relationship_type IN ('functional', 'project', 'shared_services', 'regional', 'custom')),
  relationship_label TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_matrix_relationship UNIQUE (position_id, matrix_supervisor_position_id),
  CONSTRAINT no_self_matrix_supervision CHECK (position_id != matrix_supervisor_position_id)
);

-- Create company_reporting_relationships table for admin-configurable cross-company rules
CREATE TABLE public.company_reporting_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  target_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'both' CHECK (relationship_type IN ('primary', 'matrix', 'both')),
  relationship_reason TEXT NOT NULL DEFAULT 'custom' CHECK (relationship_reason IN ('same_group', 'joint_venture', 'managed_services', 'shared_services', 'custom')),
  description TEXT,
  is_bidirectional BOOLEAN NOT NULL DEFAULT false,
  effective_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_company_relationship UNIQUE (source_company_id, target_company_id, relationship_type),
  CONSTRAINT no_self_relationship CHECK (source_company_id != target_company_id)
);

-- Create indexes for performance
CREATE INDEX idx_matrix_supervisors_position ON public.position_matrix_supervisors(position_id);
CREATE INDEX idx_matrix_supervisors_supervisor ON public.position_matrix_supervisors(matrix_supervisor_position_id);
CREATE INDEX idx_matrix_supervisors_active ON public.position_matrix_supervisors(is_active) WHERE is_active = true;
CREATE INDEX idx_company_relationships_source ON public.company_reporting_relationships(source_company_id);
CREATE INDEX idx_company_relationships_target ON public.company_reporting_relationships(target_company_id);
CREATE INDEX idx_company_relationships_active ON public.company_reporting_relationships(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.position_matrix_supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_reporting_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for position_matrix_supervisors
CREATE POLICY "Users can view matrix supervisors for their company positions"
ON public.position_matrix_supervisors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.positions p
    JOIN public.profiles pr ON pr.company_id = p.company_id
    WHERE p.id = position_matrix_supervisors.position_id
    AND pr.id = auth.uid()
  )
);

CREATE POLICY "Admins can insert matrix supervisor relationships"
ON public.position_matrix_supervisors
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'system_admin', 'hr_manager')
  )
);

CREATE POLICY "Admins can update matrix supervisor relationships"
ON public.position_matrix_supervisors
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'system_admin', 'hr_manager')
  )
);

CREATE POLICY "Admins can delete matrix supervisor relationships"
ON public.position_matrix_supervisors
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'system_admin', 'hr_manager')
  )
);

-- RLS Policies for company_reporting_relationships
CREATE POLICY "Users can view company relationships for their companies"
ON public.company_reporting_relationships
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles pr
    JOIN public.companies c ON c.id = pr.company_id
    WHERE pr.id = auth.uid()
    AND (
      c.id = company_reporting_relationships.source_company_id
      OR c.id = company_reporting_relationships.target_company_id
      OR c.group_id IN (
        SELECT c2.group_id FROM public.companies c2 
        WHERE c2.id IN (source_company_id, target_company_id)
        AND c2.group_id IS NOT NULL
      )
    )
  )
);

CREATE POLICY "Admins can insert company relationships"
ON public.company_reporting_relationships
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'system_admin')
  )
);

CREATE POLICY "Admins can update company relationships"
ON public.company_reporting_relationships
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'system_admin')
  )
);

CREATE POLICY "Admins can delete company relationships"
ON public.company_reporting_relationships
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'system_admin')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_position_matrix_supervisors_updated_at
BEFORE UPDATE ON public.position_matrix_supervisors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_reporting_relationships_updated_at
BEFORE UPDATE ON public.company_reporting_relationships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create company_boards table
CREATE TABLE public.company_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  board_type TEXT NOT NULL DEFAULT 'board_of_directors',
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company_board_members table
CREATE TABLE public.company_board_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.company_boards(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  external_member_name TEXT,
  external_member_email TEXT,
  board_role TEXT NOT NULL DEFAULT 'member',
  appointment_type TEXT DEFAULT 'appointed',
  is_independent BOOLEAN NOT NULL DEFAULT false,
  has_voting_rights BOOLEAN NOT NULL DEFAULT true,
  appointment_date DATE,
  term_start_date DATE,
  term_end_date DATE,
  is_renewable BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT chk_member_identity CHECK (
    (employee_id IS NOT NULL) OR (external_member_name IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX idx_company_boards_company_id ON public.company_boards(company_id);
CREATE INDEX idx_company_boards_is_active ON public.company_boards(is_active);
CREATE INDEX idx_company_board_members_board_id ON public.company_board_members(board_id);
CREATE INDEX idx_company_board_members_employee_id ON public.company_board_members(employee_id);
CREATE INDEX idx_company_board_members_is_active ON public.company_board_members(is_active);

-- Enable RLS
ALTER TABLE public.company_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_board_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_boards
CREATE POLICY "Users can view company boards" 
  ON public.company_boards 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create company boards" 
  ON public.company_boards 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update company boards" 
  ON public.company_boards 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete company boards" 
  ON public.company_boards 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- RLS policies for company_board_members
CREATE POLICY "Users can view board members" 
  ON public.company_board_members 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create board members" 
  ON public.company_board_members 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update board members" 
  ON public.company_board_members 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete board members" 
  ON public.company_board_members 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Create triggers for updated_at
CREATE TRIGGER update_company_boards_updated_at
  BEFORE UPDATE ON public.company_boards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_board_members_updated_at
  BEFORE UPDATE ON public.company_board_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.company_boards IS 'Stores company board information including board of directors, advisory boards, and committees';
COMMENT ON TABLE public.company_board_members IS 'Stores board member information including internal employees and external directors';
COMMENT ON COLUMN public.company_boards.board_type IS 'Type: board_of_directors, advisory_board, audit_committee, compensation_committee, executive_committee, nominating_committee, risk_committee';
COMMENT ON COLUMN public.company_board_members.board_role IS 'Role: chairperson, vice_chairperson, director, secretary, member, observer';
COMMENT ON COLUMN public.company_board_members.appointment_type IS 'Type: elected, appointed, ex_officio, co_opted';
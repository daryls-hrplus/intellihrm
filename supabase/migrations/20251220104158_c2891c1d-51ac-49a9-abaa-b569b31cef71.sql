-- Create semi-monthly payroll rules configuration table
CREATE TABLE public.semimonthly_payroll_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pay_group_id UUID NOT NULL REFERENCES public.pay_groups(id) ON DELETE CASCADE,
    -- Statutory handling
    statutory_handling TEXT NOT NULL DEFAULT 'split' CHECK (statutory_handling IN ('split', 'last_cycle', 'first_cycle')),
    -- Specific statutory overrides (JSON array of statutory type codes to handle differently)
    statutory_overrides JSONB DEFAULT '[]'::jsonb,
    -- Deduction handling
    deduction_handling TEXT NOT NULL DEFAULT 'split' CHECK (deduction_handling IN ('split', 'last_cycle', 'first_cycle')),
    -- Specific deduction overrides (JSON array of deduction codes to handle differently)
    deduction_overrides JSONB DEFAULT '[]'::jsonb,
    -- Which cycle is considered the "main" cycle for monthly calculations
    primary_cycle TEXT NOT NULL DEFAULT 'second' CHECK (primary_cycle IN ('first', 'second')),
    -- Notes/description
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_pay_group_rule UNIQUE (pay_group_id)
);

-- Enable RLS
ALTER TABLE public.semimonthly_payroll_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view semi-monthly rules for their company's pay groups"
ON public.semimonthly_payroll_rules
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.pay_groups pg
        JOIN public.profiles p ON p.company_id = pg.company_id
        WHERE pg.id = semimonthly_payroll_rules.pay_group_id
        AND p.id = auth.uid()
    )
);

CREATE POLICY "Users can insert semi-monthly rules for their company's pay groups"
ON public.semimonthly_payroll_rules
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.pay_groups pg
        JOIN public.profiles p ON p.company_id = pg.company_id
        WHERE pg.id = semimonthly_payroll_rules.pay_group_id
        AND p.id = auth.uid()
    )
);

CREATE POLICY "Users can update semi-monthly rules for their company's pay groups"
ON public.semimonthly_payroll_rules
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.pay_groups pg
        JOIN public.profiles p ON p.company_id = pg.company_id
        WHERE pg.id = semimonthly_payroll_rules.pay_group_id
        AND p.id = auth.uid()
    )
);

CREATE POLICY "Users can delete semi-monthly rules for their company's pay groups"
ON public.semimonthly_payroll_rules
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.pay_groups pg
        JOIN public.profiles p ON p.company_id = pg.company_id
        WHERE pg.id = semimonthly_payroll_rules.pay_group_id
        AND p.id = auth.uid()
    )
);

-- Create trigger for updated_at
CREATE TRIGGER update_semimonthly_payroll_rules_updated_at
BEFORE UPDATE ON public.semimonthly_payroll_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
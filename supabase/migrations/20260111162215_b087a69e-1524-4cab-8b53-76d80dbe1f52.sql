-- Drop existing constraint
ALTER TABLE public.positions DROP CONSTRAINT IF EXISTS positions_compensation_model_check;

-- Add updated constraint with all compensation models
ALTER TABLE public.positions ADD CONSTRAINT positions_compensation_model_check 
CHECK (compensation_model = ANY (ARRAY[
  'salary_grade'::text, 
  'spinal_point'::text, 
  'hybrid'::text,
  'commission_based'::text,
  'hourly_rate'::text,
  'direct_pay'::text
]));
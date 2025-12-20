-- Add pay calculation method to pay_groups for weekly/fortnightly payrolls
-- time_rate: Pay = Hours × Hourly Rate
-- piece_rate: Pay = Units Produced × Rate per Unit  
-- balance_debt: Advances given throughout period, settled against actual earnings at pay period end

ALTER TABLE public.pay_groups
ADD COLUMN pay_calculation_method text DEFAULT 'time_rate';

-- Add comment explaining the methods
COMMENT ON COLUMN public.pay_groups.pay_calculation_method IS 
'Pay calculation method for weekly/biweekly payrolls:
- time_rate: Standard hourly rate × hours worked
- piece_rate: Units/pieces produced × rate per piece
- balance_debt: Advances/draws settled against actual earnings at period end';
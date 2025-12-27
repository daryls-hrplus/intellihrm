-- Add targeting options to retroactive_pay_configs
ALTER TABLE public.retroactive_pay_configs
ADD COLUMN target_run_types text[] DEFAULT ARRAY['regular', 'off_cycle', 'supplemental', 'bonus', 'correction'],
ADD COLUMN target_pay_period_id uuid REFERENCES public.pay_periods(id) ON DELETE SET NULL,
ADD COLUMN auto_include boolean NOT NULL DEFAULT true;

-- Add index for pay period lookups
CREATE INDEX idx_retroactive_pay_configs_target_period ON public.retroactive_pay_configs(target_pay_period_id) WHERE target_pay_period_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.retroactive_pay_configs.target_run_types IS 'Run types that can process this retro (regular, off_cycle, supplemental, bonus, correction)';
COMMENT ON COLUMN public.retroactive_pay_configs.target_pay_period_id IS 'If set, retro is only applied when processing this specific pay period';
COMMENT ON COLUMN public.retroactive_pay_configs.auto_include IS 'If false, retro must be manually selected when creating/calculating a run';
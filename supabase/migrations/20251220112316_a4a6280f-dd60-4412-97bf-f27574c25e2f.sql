-- Add refund display configuration to country_tax_settings
ALTER TABLE public.country_tax_settings 
ADD COLUMN IF NOT EXISTS refund_display_type TEXT NOT NULL DEFAULT 'reduced_tax' 
CHECK (refund_display_type IN ('separate_line_item', 'reduced_tax'));

-- Add refund frequency configuration
ALTER TABLE public.country_tax_settings 
ADD COLUMN IF NOT EXISTS refund_calculation_frequency TEXT NOT NULL DEFAULT 'monthly'
CHECK (refund_calculation_frequency IN ('monthly', 'quarterly', 'annually'));

-- Add column for refund line item label (when shown separately)
ALTER TABLE public.country_tax_settings 
ADD COLUMN IF NOT EXISTS refund_line_item_label TEXT DEFAULT 'PAYE Refund';

-- Update existing records with appropriate defaults based on common practices
UPDATE public.country_tax_settings 
SET refund_display_type = 'separate_line_item',
    refund_line_item_label = 'PAYE Refund'
WHERE country IN ('ZA', 'GB', 'AU');

UPDATE public.country_tax_settings 
SET refund_display_type = 'reduced_tax'
WHERE country IN ('US', 'JM', 'TT', 'BB', 'GY', 'NG', 'GH', 'DO');
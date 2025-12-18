-- Add show_on_payslip column to pay_elements table for controlling payslip visibility (especially for benefits)
ALTER TABLE public.pay_elements 
ADD COLUMN show_on_payslip boolean NOT NULL DEFAULT true;
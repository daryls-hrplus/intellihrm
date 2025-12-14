-- Add unique constraint to prevent duplicate subscriptions per company
ALTER TABLE company_subscriptions 
ADD CONSTRAINT company_subscriptions_company_id_unique UNIQUE (company_id);
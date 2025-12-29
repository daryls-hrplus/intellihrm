-- Change global_id from UUID to TEXT to allow user-entered identifiers
ALTER TABLE public.profiles 
ALTER COLUMN global_id TYPE TEXT USING global_id::TEXT;
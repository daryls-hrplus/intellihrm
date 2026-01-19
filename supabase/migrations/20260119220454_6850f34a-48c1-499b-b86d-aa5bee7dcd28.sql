-- Add missing role values to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'executive';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support_readonly';
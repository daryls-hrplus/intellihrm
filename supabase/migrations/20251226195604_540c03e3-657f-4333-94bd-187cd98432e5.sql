-- Create translations table for i18n management
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  translation_key VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL DEFAULT 'common',
  en TEXT NOT NULL,
  ar TEXT,
  es TEXT,
  fr TEXT,
  nl TEXT,
  pt TEXT,
  de TEXT,
  ru TEXT,
  zh TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read translations
CREATE POLICY "Authenticated users can read translations"
ON public.translations
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage translations
CREATE POLICY "Admins can manage translations"
ON public.translations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('super_admin', 'admin')
  )
);

-- Create index for faster lookups
CREATE INDEX idx_translations_key ON public.translations(translation_key);
CREATE INDEX idx_translations_category ON public.translations(category);

-- Create trigger for updated_at
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.translations IS 'Centralized i18n translations for the application';
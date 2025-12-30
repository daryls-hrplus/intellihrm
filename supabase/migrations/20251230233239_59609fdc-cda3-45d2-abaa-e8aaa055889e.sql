-- Create dashboard configuration table for system-wide dashboard settings
CREATE TABLE public.dashboard_configuration (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  UNIQUE(company_id, config_key)
);

-- Enable RLS
ALTER TABLE public.dashboard_configuration ENABLE ROW LEVEL SECURITY;

-- Create policies using user_roles table with correct enum values
CREATE POLICY "Admins can view dashboard configuration"
  ON public.dashboard_configuration
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

CREATE POLICY "Admins can insert dashboard configuration"
  ON public.dashboard_configuration
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'system_admin')
    )
  );

CREATE POLICY "Admins can update dashboard configuration"
  ON public.dashboard_configuration
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'system_admin')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_dashboard_configuration_updated_at
  BEFORE UPDATE ON public.dashboard_configuration
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration
INSERT INTO public.dashboard_configuration (config_key, config_value) VALUES
('stat_card_style', '{"variant": "default", "showBorder": true, "showShadow": true, "iconStyle": "accent", "valueSize": "2xl"}'),
('color_semantics', '{"positive": "success", "negative": "destructive", "warning": "warning", "neutral": "foreground"}'),
('layout', '{"statsColumns": 4, "cardSpacing": "md", "cardRadius": "lg", "showAnimations": true}'),
('ai_dashboard', '{"showGradientBorder": true, "insightStyle": "card", "statsPosition": "top"}'),
('quick_actions', '{"style": "buttons", "showIcons": true, "maxVisible": 6}');
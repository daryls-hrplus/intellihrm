import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StatCardStyleConfig {
  variant: 'default' | 'minimal' | 'elevated';
  showBorder: boolean;
  showShadow: boolean;
  iconStyle: 'accent' | 'primary' | 'muted';
  valueSize: 'xl' | '2xl' | '3xl';
}

export interface ColorSemanticsConfig {
  positive: 'success' | 'primary';
  negative: 'destructive' | 'warning';
  warning: 'warning' | 'muted';
  neutral: 'foreground' | 'muted-foreground';
}

export interface LayoutConfig {
  statsColumns: 2 | 3 | 4 | 5;
  cardSpacing: 'sm' | 'md' | 'lg';
  cardRadius: 'sm' | 'md' | 'lg';
  showAnimations: boolean;
}

export interface AIDashboardConfig {
  showGradientBorder: boolean;
  insightStyle: 'card' | 'list' | 'compact';
  statsPosition: 'top' | 'bottom' | 'side';
}

export interface QuickActionsConfig {
  style: 'buttons' | 'cards' | 'icons';
  showIcons: boolean;
  maxVisible: number;
}

export interface DashboardConfiguration {
  statCardStyle: StatCardStyleConfig;
  colorSemantics: ColorSemanticsConfig;
  layout: LayoutConfig;
  aiDashboard: AIDashboardConfig;
  quickActions: QuickActionsConfig;
}

const DEFAULT_CONFIG: DashboardConfiguration = {
  statCardStyle: {
    variant: 'default',
    showBorder: true,
    showShadow: true,
    iconStyle: 'accent',
    valueSize: '2xl',
  },
  colorSemantics: {
    positive: 'success',
    negative: 'destructive',
    warning: 'warning',
    neutral: 'foreground',
  },
  layout: {
    statsColumns: 4,
    cardSpacing: 'md',
    cardRadius: 'lg',
    showAnimations: true,
  },
  aiDashboard: {
    showGradientBorder: true,
    insightStyle: 'card',
    statsPosition: 'top',
  },
  quickActions: {
    style: 'buttons',
    showIcons: true,
    maxVisible: 6,
  },
};

export function useDashboardConfiguration() {
  const [config, setConfig] = useState<DashboardConfiguration>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_configuration')
        .select('config_key, config_value')
        .is('company_id', null);

      if (error) {
        console.error('Error fetching dashboard configuration:', error);
        return;
      }

      if (data && data.length > 0) {
        const newConfig = { ...DEFAULT_CONFIG };
        data.forEach((item) => {
          const key = item.config_key as keyof DashboardConfiguration;
          if (key in newConfig && item.config_value) {
            (newConfig as any)[key] = item.config_value;
          }
        });
        setConfig(newConfig);
      }
    } catch (error) {
      console.error('Error fetching dashboard configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (
    key: keyof DashboardConfiguration,
    value: any
  ): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('dashboard_configuration')
        .upsert(
          {
            config_key: key,
            config_value: value,
            company_id: null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'company_id,config_key',
          }
        );

      if (error) {
        console.error('Error updating dashboard configuration:', error);
        return false;
      }

      setConfig((prev) => ({
        ...prev,
        [key]: value,
      }));
      return true;
    } catch (error) {
      console.error('Error updating dashboard configuration:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async (): Promise<boolean> => {
    setSaving(true);
    try {
      const updates = Object.entries(DEFAULT_CONFIG).map(([key, value]) => ({
        config_key: key,
        config_value: value,
        company_id: null,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('dashboard_configuration')
        .upsert(updates, {
          onConflict: 'company_id,config_key',
        });

      if (error) {
        console.error('Error resetting dashboard configuration:', error);
        return false;
      }

      setConfig(DEFAULT_CONFIG);
      return true;
    } catch (error) {
      console.error('Error resetting dashboard configuration:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    config,
    loading,
    saving,
    updateConfiguration,
    resetToDefaults,
    refetch: fetchConfiguration,
  };
}

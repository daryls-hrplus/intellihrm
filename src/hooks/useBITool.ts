import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface BIDashboard {
  id: string;
  name: string;
  code: string;
  description: string | null;
  module: string;
  is_global: boolean;
  company_id: string | null;
  layout: DashboardLayout;
  filters: DashboardFilter[];
  refresh_interval: number | null;
  theme: DashboardTheme;
  created_by: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  widgets?: BIWidget[];
}

export interface DashboardLayout {
  columns: number;
  rows: LayoutRow[];
}

export interface LayoutRow {
  id: string;
  widgets: string[]; // widget ids
}

export interface DashboardFilter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'multiSelect';
  field: string;
  required: boolean;
  defaultValue?: unknown;
  options?: { value: string; label: string }[];
}

export interface DashboardTheme {
  colorScheme: 'default' | 'dark' | 'light' | 'corporate' | 'vibrant';
  primaryColor?: string;
  chartColors?: string[];
}

export interface BIWidget {
  id: string;
  dashboard_id: string;
  name: string;
  widget_type: 'chart' | 'kpi' | 'table' | 'gauge' | 'map' | 'text';
  chart_type?: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar' | 'funnel' | 'stacked_bar' | 'horizontal_bar';
  data_source: string;
  custom_sql: string | null;
  config: WidgetConfig;
  position: WidgetPosition;
  filters: WidgetFilter[];
  drill_down: DrillDownConfig | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface WidgetConfig {
  title?: string;
  subtitle?: string;
  xAxis?: { field: string; label: string };
  yAxis?: { field: string; label: string; aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' };
  groupBy?: string;
  metrics?: MetricConfig[];
  colors?: string[];
  showLegend?: boolean;
  showDataLabels?: boolean;
  kpiFormat?: 'number' | 'currency' | 'percentage';
  kpiPrefix?: string;
  kpiSuffix?: string;
  kpiComparison?: { field: string; label: string };
  tableColumns?: TableColumn[];
  gaugeMin?: number;
  gaugeMax?: number;
  gaugeThresholds?: { value: number; color: string }[];
  textContent?: string;
}

export interface MetricConfig {
  field: string;
  label: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  color?: string;
}

export interface TableColumn {
  field: string;
  label: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date' | 'percentage';
  sortable?: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: unknown;
}

export interface DrillDownConfig {
  enabled: boolean;
  targetDashboard?: string;
  targetWidget?: string;
  passFilters?: { sourceField: string; targetField: string }[];
}

export interface BIDataSource {
  id: string;
  name: string;
  code: string;
  description: string | null;
  module: string;
  base_table: string;
  available_fields: DataSourceField[];
  joins: DataSourceJoin[];
  default_filters: WidgetFilter[];
  supports_drill_down: boolean;
  is_active: boolean;
}

export interface DataSourceField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'uuid';
  aggregatable: boolean;
}

export interface DataSourceJoin {
  table: string;
  alias: string;
  type: 'inner' | 'left' | 'right';
  on: { sourceField: string; targetField: string };
}

export function useBITool() {
  const [isLoading, setIsLoading] = useState(false);

  const getDataSources = async (module?: string): Promise<BIDataSource[]> => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('bi_data_sources')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (module) {
        query = query.eq('module', module);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(ds => ({
        ...ds,
        available_fields: (ds.available_fields as unknown) as DataSourceField[],
        joins: (ds.joins as unknown) as DataSourceJoin[],
        default_filters: (ds.default_filters as unknown) as WidgetFilter[],
      }));
    } catch (error) {
      console.error('Error fetching data sources:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboards = async (module?: string, companyId?: string): Promise<BIDashboard[]> => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('bi_dashboards')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (module) {
        query = query.eq('module', module);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(d => ({
        ...d,
        layout: (d.layout as unknown) as DashboardLayout,
        filters: (d.filters as unknown) as DashboardFilter[],
        theme: (d.theme as unknown) as DashboardTheme,
      })).filter(d => d.is_global || !companyId || d.company_id === companyId);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboard = async (id: string): Promise<BIDashboard | null> => {
    setIsLoading(true);
    try {
      const { data: dashboard, error: dashboardError } = await supabase
        .from('bi_dashboards')
        .select('*')
        .eq('id', id)
        .single();

      if (dashboardError) throw dashboardError;

      const { data: widgets, error: widgetsError } = await supabase
        .from('bi_widgets')
        .select('*')
        .eq('dashboard_id', id)
        .order('display_order');

      if (widgetsError) throw widgetsError;

      return {
        ...dashboard,
        layout: (dashboard.layout as unknown) as DashboardLayout,
        filters: (dashboard.filters as unknown) as DashboardFilter[],
        theme: (dashboard.theme as unknown) as DashboardTheme,
        widgets: (widgets || []).map(w => ({
          ...w,
          widget_type: w.widget_type as BIWidget['widget_type'],
          chart_type: w.chart_type as BIWidget['chart_type'],
          config: (w.config as unknown) as WidgetConfig,
          position: (w.position as unknown) as WidgetPosition,
          filters: (w.filters as unknown) as WidgetFilter[],
          drill_down: (w.drill_down as unknown) as DrillDownConfig | null,
        })),
      };
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createDashboard = async (dashboard: Partial<BIDashboard>): Promise<BIDashboard | null> => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('bi_dashboards')
        .insert({
          name: dashboard.name!,
          code: dashboard.code!,
          description: dashboard.description,
          module: dashboard.module!,
          is_global: dashboard.is_global || false,
          company_id: dashboard.company_id,
          layout: (dashboard.layout || { columns: 12, rows: [] }) as unknown as Json,
          filters: (dashboard.filters || []) as unknown as Json,
          refresh_interval: dashboard.refresh_interval,
          theme: (dashboard.theme || { colorScheme: 'default' }) as unknown as Json,
          created_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Dashboard created successfully');
      return {
        ...data,
        layout: (data.layout as unknown) as DashboardLayout,
        filters: (data.filters as unknown) as DashboardFilter[],
        theme: (data.theme as unknown) as DashboardTheme,
      };
    } catch (error: any) {
      console.error('Error creating dashboard:', error);
      toast.error(error.message || 'Failed to create dashboard');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDashboard = async (id: string, updates: Partial<BIDashboard>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('bi_dashboards')
        .update({
          name: updates.name,
          code: updates.code,
          description: updates.description,
          is_global: updates.is_global,
          company_id: updates.company_id,
          layout: updates.layout as unknown as Json,
          filters: updates.filters as unknown as Json,
          refresh_interval: updates.refresh_interval,
          theme: updates.theme as unknown as Json,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Dashboard updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating dashboard:', error);
      toast.error(error.message || 'Failed to update dashboard');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDashboard = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('bi_dashboards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Dashboard deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting dashboard:', error);
      toast.error(error.message || 'Failed to delete dashboard');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createWidget = async (widget: Partial<BIWidget>): Promise<BIWidget | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bi_widgets')
        .insert({
          dashboard_id: widget.dashboard_id!,
          name: widget.name!,
          widget_type: widget.widget_type!,
          chart_type: widget.chart_type,
          data_source: widget.data_source!,
          custom_sql: widget.custom_sql,
          config: (widget.config || {}) as unknown as Json,
          position: (widget.position || { x: 0, y: 0, w: 4, h: 3 }) as unknown as Json,
          filters: (widget.filters || []) as unknown as Json,
          drill_down: widget.drill_down as unknown as Json,
          display_order: widget.display_order || 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Widget created successfully');
      return {
        ...data,
        widget_type: data.widget_type as BIWidget['widget_type'],
        chart_type: data.chart_type as BIWidget['chart_type'],
        config: (data.config as unknown) as WidgetConfig,
        position: (data.position as unknown) as WidgetPosition,
        filters: (data.filters as unknown) as WidgetFilter[],
        drill_down: (data.drill_down as unknown) as DrillDownConfig | null,
      };
    } catch (error: any) {
      console.error('Error creating widget:', error);
      toast.error(error.message || 'Failed to create widget');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWidget = async (id: string, updates: Partial<BIWidget>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('bi_widgets')
        .update({
          name: updates.name,
          widget_type: updates.widget_type,
          chart_type: updates.chart_type,
          data_source: updates.data_source,
          custom_sql: updates.custom_sql,
          config: updates.config as unknown as Json,
          position: updates.position as unknown as Json,
          filters: updates.filters as unknown as Json,
          drill_down: updates.drill_down as unknown as Json,
          is_visible: updates.is_visible,
          display_order: updates.display_order,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Widget updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating widget:', error);
      toast.error(error.message || 'Failed to update widget');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWidget = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('bi_widgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Widget deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting widget:', error);
      toast.error(error.message || 'Failed to delete widget');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const executeWidgetQuery = async (widget: BIWidget): Promise<Record<string, unknown>[]> => {
    try {
      if (widget.custom_sql) {
        const { data, error } = await supabase.rpc('execute_report_sql', {
          sql_query: widget.custom_sql.replace(/;\s*$/, '').trim()
        });
        if (error) throw error;
        return (data || []) as Record<string, unknown>[];
      }
      // Return empty for now - complex queries need custom SQL
      return [];
    } catch (error) {
      console.error('Error executing widget query:', error);
      return [];
    }
  };

  return {
    getDataSources,
    getDashboards,
    getDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    createWidget,
    updateWidget,
    deleteWidget,
    executeWidgetQuery,
    isLoading,
  };
}

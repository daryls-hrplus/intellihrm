import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface ReportTemplate {
  id: string;
  name: string;
  code: string;
  description: string | null;
  module: string;
  is_global: boolean;
  company_id: string | null;
  data_source: string;
  custom_sql: string | null;
  layout: Record<string, unknown>;
  bands: ReportBand[];
  parameters: ReportParameter[];
  grouping: GroupConfig[];
  sorting: SortConfig[];
  calculations: Calculation[];
  page_settings: PageSettings;
  created_by: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportBand {
  id?: string;
  band_type: 'report_header' | 'page_header' | 'group_header' | 'detail' | 'group_footer' | 'page_footer' | 'report_footer' | 'sub_report';
  band_order: number;
  group_field?: string;
  content: BandContent;
  height: number;
  visible: boolean;
  page_break_before: boolean;
  page_break_after: boolean;
  repeat_on_each_page: boolean;
  sub_report_template_id?: string;
  sub_report_link_field?: string;
}

export interface BandContent {
  elements: BandElement[];
  backgroundColor?: string;
  borderTop?: boolean;
  borderBottom?: boolean;
}

export interface BandElement {
  id: string;
  type: 'field' | 'label' | 'expression' | 'image' | 'line' | 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
  fieldName?: string;
  expression?: string;
  format?: string;
  style?: ElementStyle;
}

export interface ElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  border?: string;
  padding?: number;
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'multiSelect';
  required: boolean;
  defaultValue?: unknown;
  options?: { value: string; label: string }[];
  lookupTable?: string;
}

export interface GroupConfig {
  field: string;
  label: string;
  sortOrder: 'asc' | 'desc';
  pageBreakAfter?: boolean;
}

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export interface Calculation {
  name: string;
  label: string;
  type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
  field?: string;
  expression?: string;
  resetOn?: 'group' | 'page' | 'report';
}

export interface PageSettings {
  orientation: 'portrait' | 'landscape';
  size: 'A4' | 'A3' | 'Letter' | 'Legal';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ReportDataSource {
  id: string;
  name: string;
  code: string;
  module: string;
  description: string | null;
  base_table: string;
  join_config: unknown[];
  available_fields: DataSourceField[];
  is_active: boolean;
}

export interface DataSourceField {
  name: string;
  label: string;
  type: string;
  lookup?: string;
}

export interface GeneratedReport {
  id: string;
  template_id: string;
  report_number: string;
  generated_by: string | null;
  parameters_used: Record<string, unknown>;
  output_format: 'pdf' | 'excel' | 'csv' | 'pptx';
  file_url: string | null;
  row_count: number | null;
  status: 'generating' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
}

export function useReportWriter() {
  const [isLoading, setIsLoading] = useState(false);

  const getDataSources = async (module?: string): Promise<ReportDataSource[]> => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('report_data_sources')
        .select('*')
        .eq('is_active', true);

      if (module) {
        query = query.eq('module', module);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return (data || []).map(ds => ({
        ...ds,
        available_fields: Array.isArray(ds.available_fields) ? ds.available_fields : []
      })) as unknown as ReportDataSource[];
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch data sources';
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplates = async (module?: string, companyId?: string): Promise<ReportTemplate[]> => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('report_templates')
        .select('*')
        .eq('is_active', true);

      if (module) {
        query = query.eq('module', module);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      
      const templates = (data || []).filter(t => 
        t.is_global || t.company_id === companyId || !companyId
      );

      return templates.map(t => ({
        ...t,
        bands: Array.isArray(t.bands) ? t.bands : [],
        parameters: Array.isArray(t.parameters) ? t.parameters : [],
        grouping: Array.isArray(t.grouping) ? t.grouping : [],
        sorting: Array.isArray(t.sorting) ? t.sorting : [],
        calculations: Array.isArray(t.calculations) ? t.calculations : [],
        layout: typeof t.layout === 'object' ? t.layout : {},
        page_settings: typeof t.page_settings === 'object' ? t.page_settings : {
          orientation: 'portrait',
          size: 'A4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        }
      })) as unknown as ReportTemplate[];
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch templates';
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplate = async (templateId: string): Promise<ReportTemplate | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        bands: Array.isArray(data.bands) ? data.bands : [],
        parameters: Array.isArray(data.parameters) ? data.parameters : [],
        grouping: Array.isArray(data.grouping) ? data.grouping : [],
        sorting: Array.isArray(data.sorting) ? data.sorting : [],
        calculations: Array.isArray(data.calculations) ? data.calculations : [],
        layout: typeof data.layout === 'object' ? data.layout : {},
        page_settings: typeof data.page_settings === 'object' ? data.page_settings : {
          orientation: 'portrait',
          size: 'A4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        }
      } as unknown as ReportTemplate;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch template';
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (template: Partial<ReportTemplate>): Promise<ReportTemplate | null> => {
    setIsLoading(true);
    try {
      const insertData = {
        name: template.name!,
        code: template.code!,
        description: template.description,
        module: template.module!,
        is_global: template.is_global || false,
        company_id: template.company_id,
        data_source: template.data_source!,
        custom_sql: template.custom_sql || null,
        layout: (template.layout || {}) as Json,
        bands: (template.bands || []) as unknown as Json,
        parameters: (template.parameters || []) as unknown as Json,
        grouping: (template.grouping || []) as unknown as Json,
        sorting: (template.sorting || []) as unknown as Json,
        calculations: (template.calculations || []) as unknown as Json,
        page_settings: (template.page_settings || {
          orientation: 'portrait',
          size: 'A4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        }) as Json
      };

      const { data, error } = await supabase
        .from('report_templates')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      toast.success('Report template created');
      return data as unknown as ReportTemplate;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create template';
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<ReportTemplate>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const updateData = {
        name: updates.name,
        description: updates.description,
        custom_sql: updates.custom_sql,
        layout: updates.layout as unknown as Json,
        bands: updates.bands as unknown as Json,
        parameters: updates.parameters as unknown as Json,
        grouping: updates.grouping as unknown as Json,
        sorting: updates.sorting as unknown as Json,
        calculations: updates.calculations as unknown as Json,
        page_settings: updates.page_settings as unknown as Json
      };

      const { error } = await supabase
        .from('report_templates')
        .update(updateData)
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Report template updated');
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update template';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Report template deleted');
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete template';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (
    templateId: string,
    parameters: Record<string, unknown>,
    outputFormat: 'pdf' | 'excel' | 'csv' | 'pptx'
  ): Promise<{ report: GeneratedReport | null; data: Record<string, unknown>[] | null }> => {
    setIsLoading(true);
    try {
      // Get template first for field mappings
      const template = await getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Get data source for field labels
      const dataSources = await getDataSources(template.module);
      const dataSource = dataSources.find(ds => ds.code === template.data_source);
      const fieldLabels = dataSource?.available_fields || [];

      // Create the report record
      const { data: report, error: insertError } = await supabase
        .from('generated_reports')
        .insert({
          template_id: templateId,
          parameters_used: parameters as unknown as Json,
          output_format: outputFormat,
          status: 'generating'
        } as never)
        .select()
        .single();

      if (insertError) throw insertError;

      toast.info('Generating report...');

      // Call edge function to actually generate the report
      const { data: result, error: genError } = await supabase.functions.invoke('generate-report', {
        body: { reportId: report.id }
      });

      if (genError) {
        console.error('Report generation error:', genError);
        toast.error('Failed to generate report');
        return { report: report as unknown as GeneratedReport, data: null };
      }

      if (result?.success) {
        toast.success(`Report generated with ${result.rowCount} rows`);
        
        const fileName = `${template.name || 'report'}_${new Date().toISOString().split('T')[0]}`;
        
        // Use field labels from edge function response if available
        const reportFieldLabels = result.fieldLabels || fieldLabels;
        
        // Download based on format
        if (result.data && result.data.length > 0) {
          if (outputFormat === 'csv' || outputFormat === 'excel') {
            downloadCsvData(result.data, reportFieldLabels, `${fileName}.csv`);
            if (outputFormat === 'excel') {
              toast.info('Excel format downloaded as CSV');
            }
          } else if (outputFormat === 'pdf') {
            downloadPdfData(result.data, reportFieldLabels, template.name, fileName);
          }
        }
        
        // Fetch updated report with status
        const { data: updatedReport } = await supabase
          .from('generated_reports')
          .select()
          .eq('id', report.id)
          .single();

        return { report: updatedReport as unknown as GeneratedReport, data: result.data || [] };
      }

      return { report: report as unknown as GeneratedReport, data: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to generate report';
      toast.error(message);
      return { report: null, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCsvData = (
    data: Record<string, unknown>[], 
    fieldLabels: DataSourceField[], 
    fileName: string
  ) => {
    if (!data || data.length === 0) return;
    
    // Use field labels if available, otherwise fall back to keys
    const dbFields = Object.keys(data[0]);
    const headers: string[] = [];
    const fieldOrder: string[] = [];
    
    // Map DB fields to labels
    for (const dbField of dbFields) {
      const fieldDef = fieldLabels.find(f => f.name === dbField);
      headers.push(fieldDef?.label || dbField);
      fieldOrder.push(dbField);
    }

    const escapeCSV = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...data.map(row => 
        fieldOrder.map(field => escapeCSV(row[field])).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPdfData = (
    data: Record<string, unknown>[], 
    fieldLabels: DataSourceField[],
    reportTitle: string,
    fileName: string
  ) => {
    if (!data || data.length === 0) return;
    
    // Build HTML table for PDF
    const dbFields = Object.keys(data[0]);
    const headers = dbFields.map(dbField => {
      const fieldDef = fieldLabels.find(f => f.name === dbField);
      return fieldDef?.label || dbField;
    });

    const tableRows = data.map(row => 
      `<tr>${dbFields.map(field => 
        `<td style="border: 1px solid #ddd; padding: 8px;">${row[field] ?? ''}</td>`
      ).join('')}</tr>`
    ).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; margin-bottom: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          th { background-color: #4a5568; color: white; padding: 10px; text-align: left; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .meta { color: #666; font-size: 12px; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <p class="meta">Generated: ${new Date().toLocaleString()} | Records: ${data.length}</p>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Open in new window for printing as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
      toast.info('Use Print → Save as PDF to download');
    } else {
      toast.error('Please allow popups to generate PDF');
    }
  };

  const getGeneratedReports = async (templateId?: string): Promise<GeneratedReport[]> => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('generated_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (templateId) {
        query = query.eq('template_id', templateId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as GeneratedReport[];
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch generated reports';
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getDataSources,
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    generateReport,
    getGeneratedReports
  };
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportBand {
  band_type: string;
  band_order: number;
  content: { elements: Array<{ type: string; value: string; style?: Record<string, unknown> }> };
  height: number;
  visible: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  data_source: string;
  bands: ReportBand[];
  parameters: Array<{ name: string; type: string; label: string; required: boolean }>;
  sorting: Array<{ field: string; order: string }>;
  grouping: Array<{ field: string }>;
  calculations: Array<{ name: string; type: string; field: string; label: string }>;
  page_settings: { orientation: string; size: string; margins: Record<string, number> };
  layout: { fields?: Array<{ name: string; label: string }> };
}

interface DataSourceField {
  name: string;
  label: string;
  type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId } = await req.json();

    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'Report ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the generated report record
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .select('*, report_templates(*)')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      console.error('Failed to fetch report:', reportError);
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const template = report.report_templates as unknown as ReportTemplate;
    const parameters = report.parameters_used as Record<string, unknown>;
    const outputFormat = report.output_format;

    console.log('Generating report:', { reportId, template: template.name, format: outputFormat });

    // Get data source info
    const { data: dataSource, error: dsError } = await supabase
      .from('report_data_sources')
      .select('*')
      .eq('code', template.data_source)
      .single();

    if (dsError || !dataSource) {
      await supabase
        .from('generated_reports')
        .update({ status: 'failed', error_message: 'Data source not found' })
        .eq('id', reportId);
      
      return new Response(
        JSON.stringify({ error: 'Data source not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const availableFields = (dataSource.available_fields || []) as DataSourceField[];
    
    // Determine which fields to select - from layout.fields or detail band elements
    let selectedFields: string[] = [];
    
    // First check layout.fields
    if (template.layout?.fields && Array.isArray(template.layout.fields)) {
      selectedFields = template.layout.fields.map((f: { name: string }) => f.name);
    }
    
    // If no layout fields, extract from detail band elements
    if (selectedFields.length === 0 && template.bands) {
      const detailBand = template.bands.find(b => b.band_type === 'detail');
      if (detailBand?.content?.elements) {
        for (const elem of detailBand.content.elements) {
          if (elem.type === 'field' && elem.value) {
            // Check if it's a valid DB field
            const fieldExists = availableFields.some(f => f.name === elem.value);
            if (fieldExists && !selectedFields.includes(elem.value)) {
              selectedFields.push(elem.value);
            }
          }
        }
      }
    }
    
    // If still no fields, use all available fields
    if (selectedFields.length === 0) {
      selectedFields = availableFields.map(f => f.name);
    }

    // Filter to only valid DB columns
    const validFields = selectedFields.filter(f => 
      availableFields.some(af => af.name === f)
    );

    console.log('Selected fields:', validFields);

    // Build select query with only valid fields
    const selectClause = validFields.length > 0 ? validFields.join(',') : '*';
    
    // Fetch data from the base table
    let query = supabase.from(dataSource.base_table).select(selectClause);

    // Apply parameter filters if applicable
    if (parameters.report_year) {
      const year = Number(parameters.report_year);
      if (!Number.isNaN(year)) {
        const hasCreatedAt = availableFields.some(f => f.name === 'created_at');
        const startOfYear = `${year}-01-01`;
        const endOfYear = `${year}-12-31`;

        if (hasCreatedAt) {
          query = query.gte('created_at', startOfYear).lte('created_at', endOfYear);
        }
      }
    }

    const { data: reportData, error: dataError } = await query.limit(1000);

    if (dataError) {
      console.error('Failed to fetch data:', dataError);
      await supabase
        .from('generated_reports')
        .update({ status: 'failed', error_message: dataError.message })
        .eq('id', reportId);
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rowCount = reportData?.length || 0;
    console.log(`Fetched ${rowCount} rows for report`);

    // Build field labels for output
    const fieldLabels: Array<{ name: string; label: string }> = [];
    for (const fieldName of validFields) {
      const fieldDef = availableFields.find(f => f.name === fieldName);
      fieldLabels.push({
        name: fieldName,
        label: fieldDef?.label || fieldName
      });
    }

    // Generate content based on format
    let fileContent: string;
    let mimeType: string;
    let fileExtension: string;

    if (outputFormat === 'csv') {
      // Generate CSV with only selected fields
      const headers = fieldLabels.map(f => f.label).join(',');
      const dataRows = (reportData || []) as unknown as Array<Record<string, unknown>>;
      const rows = dataRows.map((row) => 
        fieldLabels.map(f => {
          const value = row[f.name];
          if (value === null || value === undefined) return '';
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        }).join(',')
      );
      fileContent = [headers, ...rows].join('\n');
      mimeType = 'text/csv';
      fileExtension = 'csv';
    } else {
      // For PDF/Excel/PPTX - generate structured JSON
      fileContent = JSON.stringify({
        template: {
          name: template.name,
          bands: template.bands,
          page_settings: template.page_settings
        },
        fieldLabels,
        parameters,
        data: reportData,
        generated_at: new Date().toISOString(),
        row_count: rowCount
      }, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    }

    // Store the generated content
    const fileName = `reports/${reportId}.${fileExtension}`;
    
    // Upload to storage bucket
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileContent, {
        contentType: mimeType,
        upsert: true
      });

    let fileUrl = null;
    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
    } else {
      console.log('Storage upload skipped or failed:', uploadError.message);
    }

    // Update report status
    const { error: updateError } = await supabase
      .from('generated_reports')
      .update({
        status: 'completed',
        row_count: rowCount,
        file_url: fileUrl
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Failed to update report status:', updateError);
    }

    console.log('Report generation completed:', { reportId, rowCount, fileUrl });

    return new Response(
      JSON.stringify({
        success: true,
        reportId,
        rowCount,
        fileUrl,
        data: reportData,
        fieldLabels,
        format: outputFormat
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Report generation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

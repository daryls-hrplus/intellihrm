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

    // Fetch data from the base table
    let query = supabase.from(dataSource.base_table).select('*');

    // Apply sorting if defined
    if (template.sorting && template.sorting.length > 0) {
      for (const sort of template.sorting) {
        query = query.order(sort.field, { ascending: sort.order === 'asc' });
      }
    }

    // Apply parameter filters if applicable (only when matching date field exists)
    if (parameters.report_year) {
      const year = Number(parameters.report_year);
      if (!Number.isNaN(year)) {
        const fields = (dataSource.available_fields || []) as Array<{ name: string }>;
        const hasHireDate = fields.some((f) => f.name === 'hire_date');
        const hasCreatedAt = fields.some((f) => f.name === 'created_at');
        const startOfYear = `${year}-01-01`;
        const endOfYear = `${year}-12-31`;

        if (hasHireDate) {
          query = query.gte('hire_date', startOfYear).lte('hire_date', endOfYear);
        } else if (hasCreatedAt) {
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

    // Generate content based on format
    let fileContent: string;
    let mimeType: string;
    let fileExtension: string;

    if (outputFormat === 'csv') {
      // Generate CSV
      const fields = dataSource.available_fields as Array<{ name: string; label: string }>;
      const headers = fields.map(f => f.label).join(',');
      const rows = (reportData || []).map((row: Record<string, unknown>) => 
        fields.map(f => {
          const value = row[f.name];
          if (value === null || value === undefined) return '';
          const strValue = String(value);
          return strValue.includes(',') ? `"${strValue}"` : strValue;
        }).join(',')
      );
      fileContent = [headers, ...rows].join('\n');
      mimeType = 'text/csv';
      fileExtension = 'csv';
    } else {
      // For PDF/Excel/PPTX - generate a summary JSON that can be rendered client-side
      // In a production system, you'd use libraries like pdfkit, exceljs, etc.
      fileContent = JSON.stringify({
        template: {
          name: template.name,
          bands: template.bands,
          page_settings: template.page_settings
        },
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
      // Continue without file URL - data will still be in the response
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

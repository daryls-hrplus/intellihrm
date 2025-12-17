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
  custom_sql: string | null;
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

// PII fields that should be masked for users without PII access
const PII_FIELDS = [
  'email', 'phone', 'mobile', 'address', 'ssn', 'social_security',
  'national_id', 'passport', 'driver_license', 'bank_account',
  'bank_routing', 'iban', 'swift', 'personal_email', 'home_phone',
  'emergency_contact_phone', 'emergency_contact_email', 'date_of_birth',
  'birthdate', 'birth_date'
];

function maskPiiInResults(
  data: Record<string, unknown>[], 
  canViewPii: boolean
): Record<string, unknown>[] {
  if (canViewPii) return data;
  
  return data.map(row => {
    const maskedRow: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      const lowerKey = key.toLowerCase();
      const isPiiField = PII_FIELDS.some(pii => lowerKey.includes(pii));
      maskedRow[key] = isPiiField && value ? '***MASKED***' : value;
    }
    return maskedRow;
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId, permissionContext } = await req.json();

    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'Report ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let isAdmin = false;
    let canViewPii = false;
    let accessibleCompanyIds: string[] = [];

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Use permission context from request if provided
    if (permissionContext) {
      isAdmin = permissionContext.isAdmin || false;
      canViewPii = permissionContext.canViewPii || false;
      accessibleCompanyIds = permissionContext.accessibleCompanyIds || [];
    }

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

    console.log('Generating report:', { reportId, template: template.name, format: outputFormat, hasCustomSql: !!template.custom_sql });

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
    
    let reportData: Record<string, unknown>[] = [];
    let fieldLabels: Array<{ name: string; label: string }> = [];

    // Check if template has custom SQL
    if (template.custom_sql && template.custom_sql.trim()) {
      console.log('Executing custom SQL query');
      
      // Replace parameter placeholders in SQL
      let sql = template.custom_sql;
      
      // Replace {{param_name}} placeholders with actual values
      for (const [key, value] of Object.entries(parameters)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        if (typeof value === 'string') {
          // Escape single quotes for SQL safety
          sql = sql.replace(placeholder, `'${value.replace(/'/g, "''")}'`);
        } else if (typeof value === 'number') {
          sql = sql.replace(placeholder, String(value));
        } else if (value === null || value === undefined) {
          sql = sql.replace(placeholder, 'NULL');
        }
      }
      
      // Also handle :param_name style placeholders
      for (const [key, value] of Object.entries(parameters)) {
        const placeholder = new RegExp(`:${key}\\b`, 'g');
        if (typeof value === 'string') {
          sql = sql.replace(placeholder, `'${value.replace(/'/g, "''")}'`);
        } else if (typeof value === 'number') {
          sql = sql.replace(placeholder, String(value));
        } else if (value === null || value === undefined) {
          sql = sql.replace(placeholder, 'NULL');
        }
      }
      
      // Strip trailing semicolons as they break the subquery wrapping in execute_report_sql
      sql = sql.replace(/;\s*$/, '').trim();
      
      console.log('Final SQL:', sql);
      
      // Execute custom SQL using rpc or direct query
      const { data: sqlData, error: sqlError } = await supabase.rpc('execute_report_sql', { 
        sql_query: sql 
      });
      
      if (sqlError) {
        console.error('Custom SQL execution failed:', sqlError);
        
        // Fallback: try executing via postgres function if available, otherwise fail gracefully
        await supabase
          .from('generated_reports')
          .update({ status: 'failed', error_message: `SQL Error: ${sqlError.message}` })
          .eq('id', reportId);
        
        return new Response(
          JSON.stringify({ error: `SQL execution failed: ${sqlError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      reportData = (sqlData || []) as Record<string, unknown>[];
      
      // Build field labels from result columns
      if (reportData.length > 0) {
        const resultColumns = Object.keys(reportData[0]);
        fieldLabels = resultColumns.map(col => ({
          name: col,
          label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));
      }
    } else {
      // Standard query - fetch from base table
      console.log('Executing standard table query');
      
      // Determine which fields to select
      let selectedFields: string[] = [];
      
      if (template.layout?.fields && Array.isArray(template.layout.fields)) {
        selectedFields = template.layout.fields.map((f: { name: string }) => f.name);
      }
      
      if (selectedFields.length === 0 && template.bands) {
        const detailBand = template.bands.find(b => b.band_type === 'detail');
        if (detailBand?.content?.elements) {
          for (const elem of detailBand.content.elements) {
            if (elem.type === 'field' && elem.value) {
              const fieldExists = availableFields.some(f => f.name === elem.value);
              if (fieldExists && !selectedFields.includes(elem.value)) {
                selectedFields.push(elem.value);
              }
            }
          }
        }
      }
      
      if (selectedFields.length === 0) {
        selectedFields = availableFields.map(f => f.name);
      }

      let query = supabase.from(dataSource.base_table).select('*');

      // Apply parameter filters
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

      const { data: queryData, error: dataError } = await query.limit(1000);

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

      reportData = (queryData || []) as Record<string, unknown>[];
      
      // Validate fields against actual data
      const actualFields = reportData.length > 0
        ? Object.keys(reportData[0])
        : [];

      let validFields: string[];
      if (selectedFields.length > 0) {
        validFields = selectedFields.filter(f => actualFields.includes(f));
        if (validFields.length === 0) {
          validFields = actualFields;
        }
      } else {
        validFields = actualFields;
      }

      // Build field labels
      for (const fieldName of validFields) {
        const fieldDef = availableFields.find(f => f.name === fieldName);
        fieldLabels.push({
          name: fieldName,
          label: fieldDef?.label || fieldName
        });
      }
      
      // Filter data to only include valid fields
      reportData = reportData.map(row => {
        const filteredRow: Record<string, unknown> = {};
        for (const field of validFields) {
          filteredRow[field] = row[field];
        }
        return filteredRow;
      });
    }

    const rowCount = reportData.length;
    console.log(`Report data ready: ${rowCount} rows, ${fieldLabels.length} columns`);

    // Generate content based on format
    let fileContent: string;
    let mimeType: string;
    let fileExtension: string;

    if (outputFormat === 'csv') {
      const headers = fieldLabels.map(f => f.label).join(',');
      const rows = reportData.map((row) => 
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

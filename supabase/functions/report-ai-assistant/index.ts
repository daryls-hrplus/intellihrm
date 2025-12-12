import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportField {
  name: string;
  label: string;
  type: string;
}

interface DataSource {
  code: string;
  name: string;
  base_table: string;
  available_fields: ReportField[];
}

interface ReportRequest {
  action: "generate_template" | "suggest_fields" | "natural_language_query" | "generate_sql";
  prompt: string;
  module: string;
  dataSources: DataSource[];
  currentTemplate?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, prompt, module, dataSources, currentTemplate }: ReportRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get table schema info for SQL generation
    let tableSchemaContext = "";
    if (action === "generate_template" || action === "generate_sql") {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Get actual column info for tables used in data sources
      const tableNames = [...new Set(dataSources.map(ds => ds.base_table).filter(Boolean))];
      for (const tableName of tableNames) {
        const { data: columns } = await supabase
          .from('information_schema.columns' as never)
          .select('column_name, data_type, is_nullable')
          .eq('table_schema', 'public')
          .eq('table_name', tableName);
        
        if (columns && columns.length > 0) {
          tableSchemaContext += `\nTable: ${tableName}\nColumns:\n`;
          for (const col of columns as Array<{column_name: string; data_type: string; is_nullable: string}>) {
            tableSchemaContext += `  - ${col.column_name} (${col.data_type}${col.is_nullable === 'YES' ? ', nullable' : ''})\n`;
          }
        }
      }
    }

    let systemPrompt = "";
    let userPrompt = "";

    const dataSourcesContext = dataSources.map(ds => 
      `Data Source: ${ds.name} (code: ${ds.code}, table: ${ds.base_table || 'unknown'})\nAvailable Fields:\n${ds.available_fields.map(f => `  - ${f.name}: ${f.label} (${f.type})`).join('\n')}`
    ).join('\n\n');

    if (action === "generate_template") {
      systemPrompt = `You are an expert report designer for an HRIS (Human Resource Information System). Your job is to generate complete report template configurations based on user descriptions.

Available data sources and fields for the "${module}" module:
${dataSourcesContext}

${tableSchemaContext ? `Actual database schema:\n${tableSchemaContext}` : ''}

IMPORTANT: For complex reports that require aggregations, groupings, calculations, or cross-tab layouts (like headcount reports, trend analysis, etc.), you MUST generate a custom_sql query that produces the exact data structure needed.

Generate a complete report template configuration as JSON with the following structure:
{
  "name": "Report Name",
  "code": "REPORT_CODE",
  "description": "What this report shows",
  "data_source": "data_source_code",
  "custom_sql": "SELECT ... FROM ... GROUP BY ... -- Only include if aggregations/calculations needed",
  "bands": [
    {
      "band_type": "report_header|page_header|group_header|detail|group_footer|page_footer|report_footer",
      "band_order": 0,
      "content": { "elements": [{ "type": "text|field|calculated", "value": "...", "style": {} }] },
      "height": 50,
      "visible": true
    }
  ],
  "parameters": [
    { "name": "param_name", "label": "Label", "type": "text|number|date|dateRange|select", "required": true }
  ],
  "grouping": [
    { "field": "field_name", "label": "Group Label", "sortOrder": "asc|desc" }
  ],
  "sorting": [
    { "field": "field_name", "order": "asc|desc" }
  ],
  "calculations": [
    { "name": "calc_name", "label": "Label", "type": "sum|avg|count|min|max", "field": "field_name", "resetOn": "group|page|report" }
  ],
  "page_settings": {
    "orientation": "portrait|landscape",
    "size": "A4|A3|Letter|Legal",
    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
  }
}

SQL GUIDELINES:
- Use PostgreSQL syntax
- For date grouping use: TO_CHAR(date_column, 'YYYY-MM') or DATE_TRUNC('month', date_column)
- For aggregations use: COUNT(*), SUM(field), AVG(field), etc.
- Use FILTER clause for conditional counts: COUNT(*) FILTER (WHERE condition)
- For headcount-style reports, calculate running totals or period-based counts
- Always include ORDER BY for consistent results
- Use meaningful column aliases that match the report layout
- Only reference columns that actually exist in the database schema provided

Return ONLY valid JSON, no markdown or explanations.`;

      userPrompt = `Create a report template for: ${prompt}`;
    } else if (action === "generate_sql") {
      systemPrompt = `You are an expert SQL developer for PostgreSQL. Generate a SQL query that produces the exact data needed for the report described.

Available data sources:
${dataSourcesContext}

Actual database schema:
${tableSchemaContext}

Current report template:
${currentTemplate ? JSON.stringify(currentTemplate, null, 2) : 'None'}

REQUIREMENTS:
- Generate a single PostgreSQL SELECT query
- Use proper aggregations (COUNT, SUM, AVG, etc.) with GROUP BY when needed
- For time-series/trend reports, use DATE_TRUNC or TO_CHAR for date grouping
- Use FILTER clause for conditional aggregations
- Include ORDER BY for consistent results
- Use meaningful column aliases that match what the report needs
- ONLY use columns that exist in the database schema provided above
- Return data in a tabular format suitable for CSV/Excel export

Respond with JSON:
{
  "sql": "SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ...",
  "output_columns": [
    { "name": "alias_name", "label": "Display Label", "type": "text|number|date" }
  ],
  "explanation": "Brief explanation of what the query does"
}

Return ONLY valid JSON.`;

      userPrompt = `Generate SQL for: ${prompt}`;
    } else if (action === "suggest_fields") {
      systemPrompt = `You are an expert report designer. Based on the user's description, suggest which fields, groupings, and calculations would be most relevant for their report.

Available data sources and fields for the "${module}" module:
${dataSourcesContext}

${currentTemplate ? `Current template configuration:\n${JSON.stringify(currentTemplate, null, 2)}` : ''}

Respond with JSON:
{
  "suggested_fields": ["field1", "field2"],
  "suggested_grouping": [{ "field": "field_name", "reason": "why group by this" }],
  "suggested_calculations": [{ "type": "sum|avg|count", "field": "field_name", "reason": "why this calc" }],
  "suggested_parameters": [{ "name": "param", "type": "date|select", "reason": "why this filter" }],
  "layout_suggestions": "Brief suggestions for report layout",
  "needs_custom_sql": true/false,
  "custom_sql_reason": "Why custom SQL is needed (if applicable)"
}

Return ONLY valid JSON.`;

      userPrompt = `Suggest fields and layout for a report that: ${prompt}`;
    } else if (action === "natural_language_query") {
      systemPrompt = `You are an HRIS report assistant. Convert natural language queries into report specifications.

Available data sources and fields for the "${module}" module:
${dataSourcesContext}

${tableSchemaContext ? `Actual database schema:\n${tableSchemaContext}` : ''}

The user will describe what data they want to see. Analyze their request and return a report configuration.
If the request requires aggregations, groupings, or complex calculations, include a custom_sql query.

Respond with JSON:
{
  "interpretation": "What the user is asking for in plain English",
  "data_source": "best_matching_data_source_code",
  "fields_to_display": ["field1", "field2"],
  "filters": [{ "field": "field_name", "operator": "equals|contains|greater_than|less_than|between", "value": "suggested_value_or_parameter" }],
  "grouping": [{ "field": "field_name" }],
  "sorting": [{ "field": "field_name", "order": "asc|desc" }],
  "calculations": [{ "type": "count|sum|avg", "field": "field_name", "label": "Total X" }],
  "custom_sql": "SELECT ... -- Only if aggregations needed",
  "full_template": { /* Complete template JSON as in generate_template */ }
}

Return ONLY valid JSON.`;

      userPrompt = prompt;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let result;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI returned invalid JSON");
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Report AI assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

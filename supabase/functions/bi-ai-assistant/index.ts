import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DataSourceField {
  name: string;
  label: string;
  type: string;
}

interface DataSource {
  code: string;
  name: string;
  base_table: string;
  available_fields: DataSourceField[];
}

interface BIRequest {
  action: "generate_dashboard" | "generate_widget" | "suggest_widgets" | "generate_sql" | "preview_sql";
  prompt: string;
  module: string;
  dataSources: DataSource[];
  currentConfig?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, prompt, module, dataSources, currentConfig }: BIRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Database schema context for HRIS tables
    const tableSchemaContext = `
IMPORTANT HRIS DATABASE SCHEMA:
The main employee table is "profiles" (NOT "employees"):

Table: profiles
  - id (uuid, primary key)
  - email (text)
  - full_name (text)
  - avatar_url (text, nullable)
  - company_id (uuid, nullable, FK to companies)
  - department_id (uuid, nullable)
  - position_id (uuid, nullable)
  - hire_date (date, nullable)
  - termination_date (date, nullable)
  - employee_status (text, nullable)
  - employee_number (text, nullable)
  - is_active (boolean)
  - created_at (timestamptz)
  - updated_at (timestamptz)

Table: companies
  - id (uuid, primary key)
  - name (text)
  - code (text)
  - is_active (boolean)

Table: departments
  - id (uuid, primary key)
  - name (text)
  - code (text)
  - company_id (uuid, FK to companies)
  - is_active (boolean)

Table: positions
  - id (uuid, primary key)
  - title (text)
  - code (text)
  - department_id (uuid, FK to departments)
  - is_active (boolean)
  - authorized_headcount (integer)

Table: employee_positions
  - id (uuid, primary key)
  - employee_id (uuid, FK to profiles)
  - position_id (uuid, FK to positions)
  - start_date (date)
  - end_date (date, nullable)
  - is_active (boolean)
  - is_primary (boolean)

Table: leave_requests
  - id (uuid, primary key)
  - employee_id (uuid, FK to profiles)
  - leave_type_id (uuid, FK to leave_types)
  - start_date (date)
  - end_date (date)
  - total_days (numeric)
  - status (text: pending, approved, rejected)
  - created_at (timestamptz)

Table: leave_types
  - id (uuid, primary key)
  - name (text)
  - code (text)
  - company_id (uuid)

Table: payroll_runs
  - id (uuid, primary key)
  - company_id (uuid)
  - pay_group_id (uuid)
  - pay_period_id (uuid)
  - status (text)
  - total_gross (numeric)
  - total_net (numeric)
  - total_deductions (numeric)
  - employee_count (integer)
  - run_date (date)

POSTGRESQL DATE FUNCTIONS (DO NOT USE MYSQL FUNCTIONS):
- Use DATE_TRUNC('month', date_column) for first of month
- Use TO_CHAR(date_column, 'YYYY-MM') for month formatting
- Use EXTRACT(YEAR FROM date_column) for year
- Use EXTRACT(MONTH FROM date_column) for month
- Use AGE(date1, date2) for date differences
- Use GENERATE_SERIES(start_date, end_date, '1 month'::interval) for date sequences
`;

    let systemPrompt = "";
    let userPrompt = "";

    const dataSourcesContext = dataSources.map(ds => 
      `Data Source: ${ds.name} (code: ${ds.code})\nAvailable Fields:\n${ds.available_fields?.map(f => `  - ${f.name}: ${f.label} (${f.type})`).join('\n') || '  (no fields defined)'}`
    ).join('\n\n');

    if (action === "generate_dashboard") {
      systemPrompt = `You are an expert BI dashboard designer for an HRIS (Human Resource Information System). Generate a complete dashboard configuration with multiple widgets based on the user's description.

Available data sources for the "${module}" module:
${dataSourcesContext}

${tableSchemaContext}

Generate a complete dashboard configuration as JSON with the following structure:
{
  "name": "Dashboard Name",
  "code": "DASHBOARD_CODE",
  "description": "What this dashboard shows",
  "widgets": [
    {
      "name": "Widget Name",
      "widget_type": "chart|kpi|table",
      "chart_type": "bar|line|pie|area" (if widget_type is chart),
      "data_source": "data_source_code",
      "custom_sql": "SELECT ... -- SQL to get the data",
      "config": {
        "title": "Display Title",
        "xAxis": { "field": "field_name", "label": "X Label" },
        "yAxis": { "field": "field_name", "label": "Y Label", "aggregation": "count|sum|avg" },
        "groupBy": "optional_field",
        "kpiFormat": "number|currency|percentage" (for KPIs),
        "kpiPrefix": "$" (optional),
        "kpiSuffix": "%" (optional)
      },
      "position": { "x": 0, "y": 0, "w": 6, "h": 4 }
    }
  ],
  "layout": {
    "columns": 12,
    "rows": []
  }
}

IMPORTANT SQL GUIDELINES:
- Use PostgreSQL syntax
- For date grouping use: TO_CHAR(date_column, 'YYYY-MM') or DATE_TRUNC('month', date_column)
- Use meaningful column aliases
- Include ORDER BY for consistent results
- Use FILTER clause for conditional aggregations: COUNT(*) FILTER (WHERE condition)
- Ensure the SQL produces data in the correct format for the chart type

Return ONLY valid JSON, no markdown or explanations.`;

      userPrompt = `Create a BI dashboard for: ${prompt}`;
    } else if (action === "generate_widget") {
      systemPrompt = `You are an expert BI widget designer. Generate a single widget configuration based on the user's description.

Available data sources for the "${module}" module:
${dataSourcesContext}

${tableSchemaContext}

Generate a widget configuration as JSON:
{
  "name": "Widget Name",
  "widget_type": "chart|kpi|table",
  "chart_type": "bar|line|pie|area" (if chart),
  "data_source": "data_source_code",
  "custom_sql": "SELECT ... -- SQL query to get the data",
  "config": {
    "title": "Display Title",
    "xAxis": { "field": "field_name", "label": "X Label" },
    "yAxis": { "field": "field_name", "label": "Y Label", "aggregation": "count|sum|avg" },
    "groupBy": "optional_field"
  },
  "position": { "x": 0, "y": 0, "w": 6, "h": 4 },
  "explanation": "Brief explanation of what this widget shows"
}

Return ONLY valid JSON.`;

      userPrompt = `Create a widget for: ${prompt}`;
    } else if (action === "suggest_widgets") {
      systemPrompt = `You are an HRIS analytics expert. Suggest relevant widgets/charts that would be useful for the given module or topic.

Available data sources for the "${module}" module:
${dataSourcesContext}

${tableSchemaContext}

Suggest 3-5 useful widgets as JSON:
{
  "suggestions": [
    {
      "name": "Widget Name",
      "description": "What insight this widget provides",
      "widget_type": "chart|kpi|table",
      "chart_type": "bar|line|pie|area",
      "data_source": "data_source_code",
      "reason": "Why this widget is useful"
    }
  ],
  "dashboard_theme": "Suggested overall theme or focus for the dashboard"
}

Return ONLY valid JSON.`;

      userPrompt = `Suggest widgets for: ${prompt}`;
    } else if (action === "generate_sql" || action === "preview_sql") {
      systemPrompt = `You are an expert PostgreSQL developer for HRIS analytics. Generate a SQL query that produces the data needed for a BI widget.

${tableSchemaContext}

${currentConfig ? `Current widget configuration:\n${JSON.stringify(currentConfig, null, 2)}` : ''}

REQUIREMENTS:
- Generate a single PostgreSQL SELECT query
- Use proper aggregations (COUNT, SUM, AVG, etc.) with GROUP BY when needed
- For time-series/trend charts, use DATE_TRUNC or TO_CHAR for date grouping
- Use FILTER clause for conditional aggregations
- Include ORDER BY for consistent results
- Use meaningful column aliases that match the chart axis labels
- ONLY use columns that exist in the database schema provided
- Return data in a format suitable for charts (category/value pairs)

Respond with JSON:
{
  "sql": "SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ...",
  "output_columns": [
    { "name": "alias_name", "label": "Display Label", "type": "text|number|date" }
  ],
  "explanation": "Brief explanation of what the query does and what data it returns",
  "sample_data_description": "Description of expected output format"
}

Return ONLY valid JSON.`;

      userPrompt = action === "preview_sql" 
        ? `Generate SQL for this widget configuration: ${prompt}`
        : `Generate SQL for: ${prompt}`;
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
    console.error("BI AI assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

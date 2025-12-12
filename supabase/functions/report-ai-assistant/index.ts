import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  available_fields: ReportField[];
}

interface ReportRequest {
  action: "generate_template" | "suggest_fields" | "natural_language_query";
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

    let systemPrompt = "";
    let userPrompt = "";

    const dataSourcesContext = dataSources.map(ds => 
      `Data Source: ${ds.name} (code: ${ds.code})\nAvailable Fields:\n${ds.available_fields.map(f => `  - ${f.name}: ${f.label} (${f.type})`).join('\n')}`
    ).join('\n\n');

    if (action === "generate_template") {
      systemPrompt = `You are an expert report designer for an HRIS (Human Resource Information System). Your job is to generate complete report template configurations based on user descriptions.

Available data sources and fields for the "${module}" module:
${dataSourcesContext}

Generate a complete report template configuration as JSON with the following structure:
{
  "name": "Report Name",
  "code": "REPORT_CODE",
  "description": "What this report shows",
  "data_source": "data_source_code",
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

Return ONLY valid JSON, no markdown or explanations.`;

      userPrompt = `Create a report template for: ${prompt}`;
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
  "layout_suggestions": "Brief suggestions for report layout"
}

Return ONLY valid JSON.`;

      userPrompt = `Suggest fields and layout for a report that: ${prompt}`;
    } else if (action === "natural_language_query") {
      systemPrompt = `You are an HRIS report assistant. Convert natural language queries into report specifications.

Available data sources and fields for the "${module}" module:
${dataSourcesContext}

The user will describe what data they want to see. Analyze their request and return a report configuration.

Respond with JSON:
{
  "interpretation": "What the user is asking for in plain English",
  "data_source": "best_matching_data_source_code",
  "fields_to_display": ["field1", "field2"],
  "filters": [{ "field": "field_name", "operator": "equals|contains|greater_than|less_than|between", "value": "suggested_value_or_parameter" }],
  "grouping": [{ "field": "field_name" }],
  "sorting": [{ "field": "field_name", "order": "asc|desc" }],
  "calculations": [{ "type": "count|sum|avg", "field": "field_name", "label": "Total X" }],
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

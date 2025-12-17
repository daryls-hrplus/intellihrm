import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, documentContent, documentName, statutoryTypeId, countryCode } = await req.json();

    if (!documentContent || !statutoryTypeId) {
      return new Response(
        JSON.stringify({ error: "Document content and statutory type ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update status to processing
    if (documentId) {
      await supabase
        .from("statutory_reporting_documents")
        .update({ extraction_status: "processing" })
        .eq("id", documentId);
    }

    // Get statutory type info
    const { data: statutoryType } = await supabase
      .from("statutory_deduction_types")
      .select("*")
      .eq("id", statutoryTypeId)
      .single();

    const systemPrompt = `You are an expert payroll and statutory compliance analyst. Your task is to analyze statutory reporting document templates and extract:

1. REQUIRED DATA STRUCTURES: Database tables, columns, and relationships needed to generate this report
2. DATA FIELDS: All data fields that must be captured to populate the report
3. CALCULATION RULES: Any calculations or aggregations required
4. REPORTING PERIODS: How data should be grouped (monthly, quarterly, annually)
5. VALIDATION RULES: Data validation requirements
6. SUBMISSION REQUIREMENTS: Filing deadlines, formats, and submission methods

For the country ${countryCode || 'unknown'} and statutory type ${statutoryType?.statutory_name || 'unknown'}.

Respond with a JSON object containing:
{
  "documentSummary": "Brief description of the document purpose",
  "requiredDataStructures": [
    {
      "tableName": "suggested_table_name",
      "description": "What this table stores",
      "columns": [
        {
          "name": "column_name",
          "type": "text|number|date|boolean|jsonb",
          "description": "What this column stores",
          "required": true|false
        }
      ],
      "relationships": ["related_table_name"]
    }
  ],
  "dataFields": [
    {
      "fieldName": "Field Name",
      "source": "Where this data comes from (existing table or new)",
      "dataType": "text|number|date|currency",
      "required": true|false
    }
  ],
  "calculationRules": [
    {
      "name": "Calculation Name",
      "formula": "Description of calculation",
      "inputs": ["field1", "field2"],
      "output": "result_field"
    }
  ],
  "reportingPeriod": "monthly|quarterly|annually",
  "validationRules": [
    {
      "rule": "Description of validation",
      "fields": ["affected_fields"]
    }
  ],
  "submissionRequirements": {
    "deadline": "When report must be submitted",
    "format": "File format (PDF, CSV, XML, etc.)",
    "submissionMethod": "How to submit",
    "authorityName": "Name of receiving authority"
  },
  "implementationNotes": "Any additional notes for implementing report generation"
}`;

    console.log("Calling Lovable AI for statutory report analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Please analyze this statutory reporting document and extract the required data structures and reporting requirements:\n\nDocument Name: ${documentName}\n\nDocument Content:\n${documentContent}` 
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (documentId) {
        await supabase
          .from("statutory_reporting_documents")
          .update({ 
            extraction_status: "failed",
            extraction_notes: `AI analysis failed: ${response.status}`
          })
          .eq("id", documentId);
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    console.log("AI Response received, parsing...");

    // Extract JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      analysis = {
        documentSummary: content.substring(0, 500),
        requiredDataStructures: [],
        dataFields: [],
        calculationRules: [],
        validationRules: [],
        implementationNotes: "AI response could not be parsed as structured JSON"
      };
    }

    // Update the document record with analysis results
    if (documentId) {
      const { error: updateError } = await supabase
        .from("statutory_reporting_documents")
        .update({
          ai_analysis: analysis,
          required_data_structures: analysis.requiredDataStructures || [],
          extraction_status: "completed",
          extraction_notes: `Analysis completed successfully. Found ${(analysis.requiredDataStructures || []).length} data structures and ${(analysis.dataFields || []).length} data fields.`
        })
        .eq("id", documentId);

      if (updateError) {
        console.error("Failed to update document:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        message: "Document analyzed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-statutory-report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, statutoryId, documentContent, country, stateProvince, allStatutories } = await req.json();

    if (action === "analyze_document") {
      // Analyze uploaded document and extract calculation rules
      const systemPrompt = `You are an expert tax and payroll analyst. Analyze the provided statutory deduction document and extract:
1. Calculation rules (formulas, rates, thresholds, bands)
2. Any dependencies on other statutory deductions
3. Exemptions and special cases
4. Age-based or income-based variations

Return a JSON object with:
- calculationRules: array of rules with {type, description, formula, conditions, parameters}
- dependencies: array of {dependsOn, relationship, description}
- exemptions: array of exemption conditions
- sampleCalculations: array of example calculations showing how rules apply
- spreadsheetExamples: array of detailed spreadsheet rows showing different complexity scenarios`;

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
            { role: "user", content: `Analyze this statutory deduction document:\n\n${documentContent}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "statutory_analysis",
              schema: {
                type: "object",
                properties: {
                  calculationRules: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        description: { type: "string" },
                        formula: { type: "string" },
                        conditions: { type: "string" },
                        parameters: { type: "object" },
                      },
                    },
                  },
                  dependencies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        dependsOn: { type: "string" },
                        relationship: { type: "string" },
                        description: { type: "string" },
                      },
                    },
                  },
                  exemptions: { type: "array", items: { type: "string" } },
                  sampleCalculations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        scenario: { type: "string" },
                        inputs: { type: "object" },
                        calculation: { type: "string" },
                        result: { type: "string" },
                      },
                    },
                  },
                  spreadsheetExamples: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        scenarioName: { type: "string" },
                        employeeName: { type: "string" },
                        age: { type: "number" },
                        grossSalary: { type: "number" },
                        taxableIncome: { type: "number" },
                        rateApplied: { type: "string" },
                        deductionAmount: { type: "number" },
                        netAfterDeduction: { type: "number" },
                        exemptionApplied: { type: "string" },
                        notes: { type: "string" },
                      },
                    },
                  },
                },
                required: ["calculationRules", "dependencies", "exemptions", "sampleCalculations", "spreadsheetExamples"],
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        throw new Error(`AI analysis failed: ${response.status}`);
      }

      const aiData = await response.json();
      const analysis = JSON.parse(aiData.choices[0].message.content);

      // Generate sample document
      const sampleDocPrompt = `Based on the following statutory deduction rules, generate a clear, formatted document explaining how this statutory deduction will be applied in payroll calculations. Include examples and edge cases.

Rules: ${JSON.stringify(analysis)}`;

      const sampleDocResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a technical writer creating clear payroll documentation." },
            { role: "user", content: sampleDocPrompt },
          ],
        }),
      });

      const sampleDocData = await sampleDocResponse.json();
      const sampleDocument = sampleDocData.choices[0].message.content;

      // Update the statutory deduction type
      if (statutoryId) {
        await supabase
          .from("statutory_deduction_types")
          .update({
            ai_calculation_rules: analysis.calculationRules,
            ai_sample_document: sampleDocument,
            ai_dependencies: analysis.dependencies,
            ai_spreadsheet_examples: analysis.spreadsheetExamples,
            ai_analyzed_at: new Date().toISOString(),
          })
          .eq("id", statutoryId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          analysis,
          sampleDocument,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "generate_comprehensive") {
      // Generate comprehensive documentation for all statutories in a country
      const systemPrompt = `You are an expert payroll and tax documentation specialist. Create a comprehensive document explaining all statutory deductions for a country/state, including:
1. Overview of each statutory deduction
2. Calculation methods and formulas
3. How different deductions interact with each other (dependencies)
4. Order of calculation priority
5. Common scenarios with worked examples
6. Special cases and exemptions

Format the document in clear markdown with sections for each statutory type.`;

      const statutoryList = allStatutories.map((s: any) => ({
        name: s.statutory_name,
        code: s.statutory_code,
        type: s.statutory_type,
        description: s.description,
        rules: s.ai_calculation_rules,
        dependencies: s.ai_dependencies,
      }));

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
            {
              role: "user",
              content: `Generate comprehensive statutory deduction documentation for ${country}${stateProvince ? ` - ${stateProvince}` : ""}.\n\nStatutory Deductions:\n${JSON.stringify(statutoryList, null, 2)}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.status}`);
      }

      const aiData = await response.json();
      const comprehensiveDocument = aiData.choices[0].message.content;

      // Build dependency map
      const dependencyMap: Record<string, string[]> = {};
      allStatutories.forEach((s: any) => {
        if (s.ai_dependencies?.length) {
          dependencyMap[s.statutory_code] = s.ai_dependencies.map((d: any) => d.dependsOn);
        }
      });

      // Upsert the comprehensive documentation
      const { error } = await supabase
        .from("statutory_country_documentation")
        .upsert(
          {
            country,
            state_province: stateProvince || null,
            comprehensive_document: comprehensiveDocument,
            statutory_summary: statutoryList,
            dependency_map: dependencyMap,
            generated_at: new Date().toISOString(),
          },
          { onConflict: "country,state_province" }
        );

      if (error) {
        console.error("Error saving documentation:", error);
      }

      return new Response(
        JSON.stringify({
          success: true,
          document: comprehensiveDocument,
          dependencyMap,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error: unknown) {
    console.error("Error in analyze-statutory-document:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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

    const { action, statutoryId, documentContent, documentName, country, stateProvince, allStatutories, statutoryType, analysisType, effectiveDate, leaveTypes } = await req.json();

    // Handle leave accrual rules extraction
    if (analysisType === "extract_leave_accrual_rules") {
      const systemPrompt = `You are an expert HR and leave policy analyst. Extract leave accrual rules from the provided document.

Available leave types in the system: ${leaveTypes?.join(", ") || "Annual Leave, Sick Leave, Personal Leave"}

CURRENT SYSTEM FIELDS for accrual rules:
- name, description, leave_type_name
- accrual_frequency: "daily", "weekly", "bi_weekly", "monthly", "annually"
- accrual_amount: number of days/hours per frequency
- years_of_service_min, years_of_service_max
- employee_status, employee_type
- priority

For each accrual rule found, extract fields that match the above.

CRITICAL: Also analyze if the document contains rules/conditions that CANNOT be captured by the current fields. Examples:
- Gender-based accrual (e.g., maternity leave accrual only for female employees)
- Age-based accrual variations
- Department/location-specific rules
- Job grade/level-based accrual
- Pro-rating rules for part-time based on hours worked
- Cap/maximum accrual limits
- Accrual start conditions (e.g., after probation)
- Carry-over/rollover rules embedded in accrual

If such rules exist, include them in "schemaChangesSuggested".`;

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
            { role: "user", content: `Extract leave accrual rules from this document (${documentName || 'uploaded file'}):\n\n${documentContent}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "leave_accrual_rules_extraction",
              schema: {
                type: "object",
                properties: {
                  rules: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        leave_type_name: { type: "string" },
                        accrual_frequency: { type: "string", enum: ["daily", "weekly", "bi_weekly", "monthly", "annually"] },
                        accrual_amount: { type: "number" },
                        years_of_service_min: { type: "number" },
                        years_of_service_max: { type: ["number", "null"] },
                        employee_status: { type: ["string", "null"] },
                        employee_type: { type: ["string", "null"] },
                        priority: { type: "number" },
                        notes: { type: "string" },
                      },
                      required: ["name", "leave_type_name", "accrual_frequency", "accrual_amount"],
                    },
                  },
                  schemaChangesSuggested: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        fieldName: { type: "string" },
                        fieldType: { type: "string" },
                        description: { type: "string" },
                        reason: { type: "string" },
                        documentExcerpt: { type: "string" },
                        suggestedValues: { type: "array", items: { type: "string" } },
                        impact: { type: "string", enum: ["required", "recommended", "optional"] },
                        affectedRules: { type: "array", items: { type: "string" } },
                      },
                      required: ["fieldName", "fieldType", "description", "reason", "impact"],
                    },
                  },
                  newLeaveTypesNeeded: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        reason: { type: "string" },
                      },
                      required: ["name", "reason"],
                    },
                  },
                  spreadsheetExamples: {
                    type: "array",
                    description: "Generate 8-15 example scenarios showing rule complexity, edge cases, and multi-year projections",
                    items: {
                      type: "object",
                      properties: {
                        scenario: { type: "string", description: "Scenario name e.g., 'New Hire Year 1', 'Senior Employee 10+ Years'" },
                        employeeName: { type: "string", description: "Fictional employee name" },
                        employeeType: { type: "string" },
                        hireDate: { type: "string", description: "Format: YYYY-MM-DD" },
                        yearsOfService: { type: "number" },
                        leaveType: { type: "string" },
                        accrualFrequency: { type: "string" },
                        baseAccrualRate: { type: "number", description: "Days/hours per frequency" },
                        annualEntitlement: { type: "number", description: "Total annual days/hours" },
                        monthlyBreakdown: {
                          type: "array",
                          description: "12-month projection showing accumulation",
                          items: {
                            type: "object",
                            properties: {
                              month: { type: "string" },
                              accrued: { type: "number" },
                              used: { type: "number" },
                              balance: { type: "number" },
                            },
                          },
                        },
                        prorationApplied: { type: "boolean" },
                        prorationReason: { type: "string" },
                        ruleApplied: { type: "string", description: "Which accrual rule triggered this outcome" },
                        complexity: { type: "string", enum: ["simple", "moderate", "complex"], description: "Indicates rule complexity demonstrated" },
                        edgeCaseType: { type: "string", description: "e.g., 'Service milestone', 'Mid-year hire', 'Type transition', 'Cap reached'" },
                        notes: { type: "string" },
                      },
                    },
                  },
                  notes: { type: "string" },
                  warnings: { type: "array", items: { type: "string" } },
                  assumptions: { type: "array", items: { type: "string" } },
                },
                required: ["rules"],
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        throw new Error(`AI leave rules extraction failed: ${response.status}`);
      }

      const aiData = await response.json();
      const extraction = JSON.parse(aiData.choices[0].message.content);

      return new Response(
        JSON.stringify({
          success: true,
          rules: extraction.rules || [],
          schemaChangesSuggested: extraction.schemaChangesSuggested || [],
          newLeaveTypesNeeded: extraction.newLeaveTypesNeeded || [],
          spreadsheetExamples: extraction.spreadsheetExamples || [],
          notes: extraction.notes || "",
          warnings: extraction.warnings || [],
          assumptions: extraction.assumptions || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle tax bracket extraction from documents
    if (analysisType === "extract_brackets") {
      const systemPrompt = `You are an expert tax and payroll analyst. Extract tax brackets/rate bands from the provided document for ${statutoryType} in ${country}.

Return structured tax brackets that can be directly imported into a payroll system. For each bracket, determine:
- band_name: descriptive name for the bracket (e.g., "0% Band", "Basic Rate", "Higher Rate")
- min_amount: minimum income/salary threshold (number)
- max_amount: maximum income/salary threshold (number or null if unlimited)
- employee_rate: rate as decimal (e.g., 0.25 for 25%, null if fixed amount)
- employer_rate: employer contribution rate as decimal (null if not applicable)
- fixed_amount: fixed deduction amount if not percentage-based (null otherwise)
- calculation_method: "percentage", "fixed", or "per_monday"
- pay_frequency: "weekly", "monthly", "fortnightly", etc.
- min_age: minimum age for this bracket to apply (null if no age restriction)
- max_age: maximum age for this bracket to apply (null if no age restriction)
- notes: any special conditions or notes

Also provide:
- warnings: any issues or uncertainties in the extraction
- assumptions: any assumptions made during extraction`;

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
            { role: "user", content: `Extract tax brackets from this document (${documentName || 'uploaded file'}):\n\n${documentContent}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "tax_brackets_extraction",
              schema: {
                type: "object",
                properties: {
                  brackets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        band_name: { type: "string" },
                        min_amount: { type: "number" },
                        max_amount: { type: ["number", "null"] },
                        employee_rate: { type: ["number", "null"] },
                        employer_rate: { type: ["number", "null"] },
                        fixed_amount: { type: ["number", "null"] },
                        calculation_method: { type: "string" },
                        pay_frequency: { type: "string" },
                        min_age: { type: ["number", "null"] },
                        max_age: { type: ["number", "null"] },
                        notes: { type: "string" },
                      },
                      required: ["band_name", "min_amount", "calculation_method"],
                    },
                  },
                  notes: { type: "string" },
                  warnings: { type: "array", items: { type: "string" } },
                  assumptions: { type: "array", items: { type: "string" } },
                },
                required: ["brackets"],
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        throw new Error(`AI bracket extraction failed: ${response.status}`);
      }

      const aiData = await response.json();
      const extraction = JSON.parse(aiData.choices[0].message.content);

      return new Response(
        JSON.stringify({
          success: true,
          brackets: extraction.brackets || [],
          notes: extraction.notes || "",
          warnings: extraction.warnings || [],
          assumptions: extraction.assumptions || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

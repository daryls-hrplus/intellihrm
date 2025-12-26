import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidationIssue {
  row: number;
  field: string;
  value: string;
  issue: string;
  severity: "error" | "warning" | "info";
  suggestion?: string;
}

interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
  aiInsights?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { importType, data, schema, companyId } = await req.json();
    
    console.log(`Validating ${importType} import with ${data?.length || 0} rows`);

    if (!data || !Array.isArray(data) || data.length === 0) {
      return new Response(
        JSON.stringify({
          isValid: false,
          totalRows: 0,
          validRows: 0,
          errorCount: 1,
          warningCount: 0,
          issues: [{
            row: 0,
            field: "file",
            value: "",
            issue: "No data provided for validation",
            severity: "error",
            suggestion: "Upload a CSV file with data rows"
          }]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // Perform basic validation first
    const basicIssues: ValidationIssue[] = [];
    let basicErrorCount = 0;
    let basicWarningCount = 0;

    data.forEach((row: Record<string, string>, index: number) => {
      const rowNum = index + 2; // Account for header row and 1-based indexing

      if (schema) {
        Object.entries(schema).forEach(([field, rules]: [string, any]) => {
          const value = row[field] || "";

          // Required field check
          if (rules.required && !value.trim()) {
            basicIssues.push({
              row: rowNum,
              field,
              value,
              issue: `${field} is required`,
              severity: "error",
              suggestion: `Please provide a value for ${field}`,
            });
            basicErrorCount++;
            return;
          }

          if (!value.trim()) return;

          // Type validation
          if (rules.type === "date" && value) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(value) && isNaN(Date.parse(value))) {
              basicIssues.push({
                row: rowNum,
                field,
                value,
                issue: "Invalid date format",
                severity: "error",
                suggestion: "Use YYYY-MM-DD format (e.g., 2024-01-15)",
              });
              basicErrorCount++;
            }
          }

          if (rules.type === "email" && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              basicIssues.push({
                row: rowNum,
                field,
                value,
                issue: "Invalid email format",
                severity: "error",
                suggestion: "Provide a valid email address",
              });
              basicErrorCount++;
            }
          }

          if (rules.type === "number" && value) {
            if (isNaN(Number(value))) {
              basicIssues.push({
                row: rowNum,
                field,
                value,
                issue: "Must be a number",
                severity: "error",
                suggestion: "Provide a valid numeric value",
              });
              basicErrorCount++;
            }
          }

          // Max length check
          if (rules.maxLength && value.length > rules.maxLength) {
            basicIssues.push({
              row: rowNum,
              field,
              value: value.substring(0, 20) + "...",
              issue: `Exceeds maximum length of ${rules.maxLength}`,
              severity: "warning",
              suggestion: `Shorten to ${rules.maxLength} characters or less`,
            });
            basicWarningCount++;
          }
        });
      }
    });

    // If no Lovable API key, return basic validation only
    if (!LOVABLE_API_KEY) {
      console.log("No LOVABLE_API_KEY, returning basic validation only");
      const validRows = data.length - new Set(basicIssues.filter(i => i.severity === "error").map(i => i.row)).size;
      
      return new Response(
        JSON.stringify({
          isValid: basicErrorCount === 0,
          totalRows: data.length,
          validRows,
          errorCount: basicErrorCount,
          warningCount: basicWarningCount,
          issues: basicIssues,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI for enhanced validation
    const sampleData = data.slice(0, 10); // Only send first 10 rows for AI analysis
    const prompt = `You are an HR data validation expert. Analyze this ${importType} import data for potential issues.

Data sample (first ${sampleData.length} of ${data.length} rows):
${JSON.stringify(sampleData, null, 2)}

Schema requirements:
${JSON.stringify(schema, null, 2)}

Check for:
1. Semantic issues (e.g., job titles that don't match job levels)
2. Duplicate codes or names
3. Inconsistent formatting or casing
4. Missing relationships (if company_code, job_family_code, etc. are referenced)
5. Data quality issues (e.g., placeholder text, test data)

Return a JSON object with this exact structure:
{
  "additionalIssues": [
    {
      "row": <number>,
      "field": "<field_name>",
      "value": "<actual_value>",
      "issue": "<description>",
      "severity": "warning" | "info",
      "suggestion": "<fix_suggestion>"
    }
  ],
  "insights": ["<insight1>", "<insight2>"]
}

Only return warnings or info, not errors (basic validation handles errors). Be concise.`;

    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an HR data validation assistant. Always respond with valid JSON only." },
            { role: "user", content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        console.error("AI gateway error:", response.status);
        // Return basic validation if AI fails
        const validRows = data.length - new Set(basicIssues.filter(i => i.severity === "error").map(i => i.row)).size;
        return new Response(
          JSON.stringify({
            isValid: basicErrorCount === 0,
            totalRows: data.length,
            validRows,
            errorCount: basicErrorCount,
            warningCount: basicWarningCount,
            issues: basicIssues,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiData = await response.json();
      const aiContent = aiData.choices?.[0]?.message?.content || "";
      
      console.log("AI response received:", aiContent.substring(0, 200));

      // Parse AI response
      let aiResult: { additionalIssues?: ValidationIssue[]; insights?: string[] } = {};
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
        const jsonStr = jsonMatch[1]?.trim() || aiContent.trim();
        aiResult = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error("Failed to parse AI response:", parseErr);
        aiResult = { additionalIssues: [], insights: [] };
      }

      // Combine basic issues with AI issues
      const allIssues = [...basicIssues, ...(aiResult.additionalIssues || [])];
      const totalWarnings = basicWarningCount + (aiResult.additionalIssues?.filter(i => i.severity === "warning").length || 0);
      const validRows = data.length - new Set(allIssues.filter(i => i.severity === "error").map(i => i.row)).size;

      const result: ValidationResult = {
        isValid: basicErrorCount === 0,
        totalRows: data.length,
        validRows,
        errorCount: basicErrorCount,
        warningCount: totalWarnings,
        issues: allIssues,
        aiInsights: aiResult.insights,
      };

      console.log(`Validation complete: ${result.validRows}/${result.totalRows} valid, ${result.errorCount} errors, ${result.warningCount} warnings`);

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (aiErr) {
      console.error("AI validation error:", aiErr);
      // Return basic validation if AI fails
      const validRows = data.length - new Set(basicIssues.filter(i => i.severity === "error").map(i => i.row)).size;
      return new Response(
        JSON.stringify({
          isValid: basicErrorCount === 0,
          totalRows: data.length,
          validRows,
          errorCount: basicErrorCount,
          warningCount: basicWarningCount,
          issues: basicIssues,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Validation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        isValid: false,
        totalRows: 0,
        validRows: 0,
        errorCount: 1,
        warningCount: 0,
        issues: [{
          row: 0,
          field: "system",
          value: "",
          issue: "System error during validation",
          severity: "error",
          suggestion: "Please try again or contact support"
        }]
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    // Initialize Supabase client for database lookups
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
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

    // ============ DATABASE REFERENCE VALIDATION ============
    // Check if referenced entities exist in the database
    
    const referenceErrors = await validateDatabaseReferences(supabase, importType, data, companyId);
    basicIssues.push(...referenceErrors.issues);
    basicErrorCount += referenceErrors.errorCount;

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

// Database reference validation function
async function validateDatabaseReferences(
  supabase: any,
  importType: string,
  data: Record<string, string>[],
  companyId?: string
): Promise<{ issues: ValidationIssue[]; errorCount: number }> {
  const issues: ValidationIssue[] = [];
  let errorCount = 0;

  // Determine which references to check based on import type
  const needsCompanyCheck = ["positions", "new_hires", "company_structure_departments", "company_structure_divisions", "company_structure_sections", "company_structure_jobs"].some(t => importType.includes(t));
  const needsDepartmentCheck = ["positions", "new_hires", "company_structure_sections"].some(t => importType.includes(t));
  const needsJobCheck = importType === "positions";
  const needsPositionCheck = importType === "new_hires";
  const needsJobFamilyCheck = importType === "company_structure_jobs";

  if (!needsCompanyCheck && !needsDepartmentCheck && !needsJobCheck && !needsPositionCheck && !needsJobFamilyCheck) {
    return { issues, errorCount };
  }

  console.log(`Performing database reference validation for ${importType}`);

  try {
    // Fetch all companies
    const { data: companies, error: companyError } = await supabase
      .from("companies")
      .select("id, code");
    
    if (companyError) {
      console.error("Error fetching companies:", companyError);
      return { issues, errorCount };
    }

    const companyLookup = new Map<string, string>();
    (companies || []).forEach((c: { id: string; code: string | null }) => {
      if (c.code) {
        companyLookup.set(c.code.toUpperCase(), c.id);
      }
    });

    console.log(`Found ${companyLookup.size} companies for validation`);

    // Fetch departments if needed
    let departmentLookup = new Map<string, string>();
    if (needsDepartmentCheck) {
      const { data: departments } = await supabase
        .from("departments")
        .select("id, code, company_id");
      
      (departments || []).forEach((d: { id: string; code: string | null; company_id: string }) => {
        if (d.code) {
          // Key: companyId_departmentCode
          departmentLookup.set(`${d.company_id}_${d.code.toUpperCase()}`, d.id);
        }
      });
      console.log(`Found ${departmentLookup.size} departments for validation`);
    }

    // Fetch jobs if needed
    let jobLookup = new Map<string, string>();
    if (needsJobCheck) {
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, code, company_id");
      
      (jobs || []).forEach((j: { id: string; code: string | null; company_id: string }) => {
        if (j.code) {
          jobLookup.set(`${j.company_id}_${j.code.toUpperCase()}`, j.id);
        }
      });
      console.log(`Found ${jobLookup.size} jobs for validation`);
    }

    // Fetch positions if needed
    let positionLookup = new Map<string, string>();
    if (needsPositionCheck) {
      const { data: positions } = await supabase
        .from("positions")
        .select("id, code, company_id");
      
      (positions || []).forEach((p: { id: string; code: string | null; company_id: string }) => {
        if (p.code) {
          positionLookup.set(`${p.company_id}_${p.code.toUpperCase()}`, p.id);
        }
      });
      console.log(`Found ${positionLookup.size} positions for validation`);
    }

    // Fetch job families if needed
    let jobFamilyLookup = new Map<string, string>();
    if (needsJobFamilyCheck) {
      const { data: jobFamilies } = await supabase
        .from("job_families")
        .select("id, code, company_id");
      
      (jobFamilies || []).forEach((jf: { id: string; code: string | null; company_id: string }) => {
        if (jf.code) {
          jobFamilyLookup.set(`${jf.company_id}_${jf.code.toUpperCase()}`, jf.id);
        }
      });
      console.log(`Found ${jobFamilyLookup.size} job families for validation`);
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNum = index + 2;
      const companyCode = row.company_code?.toUpperCase();
      
      // Check company reference
      if (needsCompanyCheck && companyCode) {
        if (!companyLookup.has(companyCode)) {
          issues.push({
            row: rowNum,
            field: "company_code",
            value: row.company_code || "",
            issue: `Company '${row.company_code}' not found in database`,
            severity: "error",
            suggestion: "Import companies first using the Company Structure tab",
          });
          errorCount++;
          return; // Skip further checks for this row
        }
      }

      const resolvedCompanyId = companyCode ? companyLookup.get(companyCode) : companyId;

      // Check department reference
      if (needsDepartmentCheck && row.department_code && resolvedCompanyId) {
        const deptKey = `${resolvedCompanyId}_${row.department_code.toUpperCase()}`;
        if (!departmentLookup.has(deptKey)) {
          issues.push({
            row: rowNum,
            field: "department_code",
            value: row.department_code,
            issue: `Department '${row.department_code}' not found in company '${row.company_code}'`,
            severity: "error",
            suggestion: "Import departments first using the Company Structure tab",
          });
          errorCount++;
        }
      }

      // Check job reference
      if (needsJobCheck && row.job_code && resolvedCompanyId) {
        const jobKey = `${resolvedCompanyId}_${row.job_code.toUpperCase()}`;
        if (!jobLookup.has(jobKey)) {
          issues.push({
            row: rowNum,
            field: "job_code",
            value: row.job_code,
            issue: `Job '${row.job_code}' not found in company '${row.company_code}'`,
            severity: "error",
            suggestion: "Import jobs first using the Company Structure tab",
          });
          errorCount++;
        }
      }

      // Check position reference
      if (needsPositionCheck && row.position_code && resolvedCompanyId) {
        const posKey = `${resolvedCompanyId}_${row.position_code.toUpperCase()}`;
        if (!positionLookup.has(posKey)) {
          issues.push({
            row: rowNum,
            field: "position_code",
            value: row.position_code,
            issue: `Position '${row.position_code}' not found in company '${row.company_code}'`,
            severity: "error",
            suggestion: "Import positions first using the Positions tab",
          });
          errorCount++;
        }
      }

      // Check job family reference
      if (needsJobFamilyCheck && row.job_family_code && resolvedCompanyId) {
        const jfKey = `${resolvedCompanyId}_${row.job_family_code.toUpperCase()}`;
        if (!jobFamilyLookup.has(jfKey)) {
          issues.push({
            row: rowNum,
            field: "job_family_code",
            value: row.job_family_code,
            issue: `Job family '${row.job_family_code}' not found in company '${row.company_code}'`,
            severity: "error",
            suggestion: "Create job families first before importing jobs",
          });
          errorCount++;
        }
      }
    });

  } catch (err) {
    console.error("Database reference validation error:", err);
  }

  return { issues, errorCount };
}

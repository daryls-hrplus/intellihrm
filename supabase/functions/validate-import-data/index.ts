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
  duplicates?: { inFile: number; inDatabase: number };
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

    // ============ DUPLICATE DETECTION ============
    const duplicateResult = await detectDuplicates(supabase, importType, data, companyId);
    basicIssues.push(...duplicateResult.issues);
    basicErrorCount += duplicateResult.errorCount;
    basicWarningCount += duplicateResult.warningCount;

    // ============ DATABASE REFERENCE VALIDATION ============
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
          duplicates: { inFile: duplicateResult.inFileDuplicates, inDatabase: duplicateResult.inDatabaseDuplicates },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI for enhanced validation
    const sampleData = data.slice(0, 10);
    const prompt = `You are an HR data validation expert. Analyze this ${importType} import data for potential issues.

Data sample (first ${sampleData.length} of ${data.length} rows):
${JSON.stringify(sampleData, null, 2)}

Schema requirements:
${JSON.stringify(schema, null, 2)}

Check for:
1. Semantic issues (e.g., job titles that don't match job levels)
2. Inconsistent formatting or casing
3. Data quality issues (e.g., placeholder text, test data)
4. Patterns that suggest copy-paste errors

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
        const validRows = data.length - new Set(basicIssues.filter(i => i.severity === "error").map(i => i.row)).size;
        return new Response(
          JSON.stringify({
            isValid: basicErrorCount === 0,
            totalRows: data.length,
            validRows,
            errorCount: basicErrorCount,
            warningCount: basicWarningCount,
            issues: basicIssues,
            duplicates: { inFile: duplicateResult.inFileDuplicates, inDatabase: duplicateResult.inDatabaseDuplicates },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiData = await response.json();
      const aiContent = aiData.choices?.[0]?.message?.content || "";
      
      console.log("AI response received:", aiContent.substring(0, 200));

      let aiResult: { additionalIssues?: ValidationIssue[]; insights?: string[] } = {};
      try {
        const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
        const jsonStr = jsonMatch[1]?.trim() || aiContent.trim();
        aiResult = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error("Failed to parse AI response:", parseErr);
        aiResult = { additionalIssues: [], insights: [] };
      }

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
        duplicates: { inFile: duplicateResult.inFileDuplicates, inDatabase: duplicateResult.inDatabaseDuplicates },
      };

      console.log(`Validation complete: ${result.validRows}/${result.totalRows} valid, ${result.errorCount} errors, ${result.warningCount} warnings`);

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (aiErr) {
      console.error("AI validation error:", aiErr);
      const validRows = data.length - new Set(basicIssues.filter(i => i.severity === "error").map(i => i.row)).size;
      return new Response(
        JSON.stringify({
          isValid: basicErrorCount === 0,
          totalRows: data.length,
          validRows,
          errorCount: basicErrorCount,
          warningCount: basicWarningCount,
          issues: basicIssues,
          duplicates: { inFile: duplicateResult.inFileDuplicates, inDatabase: duplicateResult.inDatabaseDuplicates },
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

// Duplicate detection function
async function detectDuplicates(
  supabase: any,
  importType: string,
  data: Record<string, string>[],
  companyId?: string
): Promise<{ issues: ValidationIssue[]; errorCount: number; warningCount: number; inFileDuplicates: number; inDatabaseDuplicates: number }> {
  const issues: ValidationIssue[] = [];
  let errorCount = 0;
  let warningCount = 0;
  let inFileDuplicates = 0;
  let inDatabaseDuplicates = 0;

  // Determine which field(s) to check for duplicates based on import type
  let duplicateKey: string | string[] = "code";
  let tableName = "";
  let companyScoped = false;

  if (importType === "companies" || importType === "company_structure_companies") {
    duplicateKey = "code";
    tableName = "companies";
    companyScoped = false;
  } else if (importType === "departments" || importType === "company_structure_departments") {
    duplicateKey = "code";
    tableName = "departments";
    companyScoped = true;
  } else if (importType === "divisions" || importType === "company_structure_divisions") {
    duplicateKey = "code";
    tableName = "divisions";
    companyScoped = true;
  } else if (importType === "jobs" || importType === "company_structure_jobs") {
    duplicateKey = "code";
    tableName = "jobs";
    companyScoped = true;
  } else if (importType === "positions") {
    duplicateKey = "position_number";
    tableName = "positions";
    companyScoped = true;
  } else if (importType === "new_hires") {
    duplicateKey = "email";
    tableName = "profiles";
    companyScoped = false;
  } else if (importType === "job_families" || importType === "company_structure_job_families") {
    duplicateKey = "code";
    tableName = "job_families";
    companyScoped = true;
  } else {
    return { issues, errorCount, warningCount, inFileDuplicates, inDatabaseDuplicates };
  }

  console.log(`Checking duplicates for ${importType} using key: ${duplicateKey}`);

  // 1. Check for duplicates within the file
  const seenValues = new Map<string, number>();
  
  data.forEach((row, index) => {
    const rowNum = index + 2;
    const keyField = Array.isArray(duplicateKey) ? duplicateKey[0] : duplicateKey;
    const value = row[keyField]?.trim().toUpperCase();
    
    if (!value) return;

    // For company-scoped, include company_code in the key
    const fullKey = companyScoped && row.company_code 
      ? `${row.company_code.toUpperCase()}_${value}`
      : value;

    if (seenValues.has(fullKey)) {
      const firstRow = seenValues.get(fullKey)!;
      issues.push({
        row: rowNum,
        field: keyField,
        value: row[keyField],
        issue: `Duplicate ${keyField} found in file (first occurrence in row ${firstRow})`,
        severity: "error",
        suggestion: `Remove duplicate or use a unique ${keyField}`,
      });
      errorCount++;
      inFileDuplicates++;
    } else {
      seenValues.set(fullKey, rowNum);
    }
  });

  // 2. Check for duplicates against the database
  if (tableName) {
    try {
      const keyField = Array.isArray(duplicateKey) ? duplicateKey[0] : duplicateKey;
      const valuesToCheck = [...new Set(data.map(row => row[keyField]?.trim()).filter(Boolean))];
      
      if (valuesToCheck.length === 0) {
        return { issues, errorCount, warningCount, inFileDuplicates, inDatabaseDuplicates };
      }

      // Determine the correct column name in the database
      const dbColumn = keyField === "position_number" ? "code" : keyField;

      let query = supabase.from(tableName).select("id, " + dbColumn + (companyScoped ? ", company_id" : ""));
      
      // For new_hires checking profiles, we check email
      if (tableName === "profiles") {
        query = supabase.from("profiles").select("id, email");
      }

      const { data: existingRecords, error } = await query;
      
      if (error) {
        console.error(`Error fetching existing ${tableName}:`, error);
        return { issues, errorCount, warningCount, inFileDuplicates, inDatabaseDuplicates };
      }

      // Build lookup map
      const existingLookup = new Set<string>();
      const companyLookup = new Map<string, string>();

      // If company-scoped, fetch company codes
      if (companyScoped) {
        const { data: companies } = await supabase.from("companies").select("id, code");
        (companies || []).forEach((c: { id: string; code: string | null }) => {
          if (c.code) {
            companyLookup.set(c.code.toUpperCase(), c.id);
          }
        });
      }

      (existingRecords || []).forEach((record: any) => {
        const recordValue = record[dbColumn] || record.email;
        if (!recordValue) return;
        
        if (companyScoped && record.company_id) {
          existingLookup.add(`${record.company_id}_${recordValue.toUpperCase()}`);
        } else {
          existingLookup.add(recordValue.toUpperCase());
        }
      });

      console.log(`Found ${existingLookup.size} existing records in ${tableName}`);

      // Check each row against database
      data.forEach((row, index) => {
        const rowNum = index + 2;
        const value = row[keyField]?.trim();
        
        if (!value) return;

        let lookupKey = value.toUpperCase();
        
        if (companyScoped && row.company_code) {
          const resolvedCompanyId = companyLookup.get(row.company_code.toUpperCase()) || companyId;
          if (resolvedCompanyId) {
            lookupKey = `${resolvedCompanyId}_${value.toUpperCase()}`;
          }
        }

        if (existingLookup.has(lookupKey)) {
          issues.push({
            row: rowNum,
            field: keyField,
            value,
            issue: `${keyField} '${value}' already exists in the database`,
            severity: "error",
            suggestion: `Use a different ${keyField} or update the existing record instead`,
          });
          errorCount++;
          inDatabaseDuplicates++;
        }
      });

    } catch (err) {
      console.error("Database duplicate check error:", err);
    }
  }

  return { issues, errorCount, warningCount, inFileDuplicates, inDatabaseDuplicates };
}

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
  const needsCompanyCheck = ["positions", "new_hires", "company_structure_departments", "company_structure_divisions", "company_structure_sections", "company_structure_jobs", "company_structure_job_families"].some(t => importType.includes(t));
  const needsDepartmentCheck = ["positions", "new_hires", "company_structure_sections"].some(t => importType.includes(t));
  const needsJobCheck = importType === "positions";
  const needsPositionCheck = importType === "new_hires";
  const needsJobFamilyCheck = importType === "company_structure_jobs" || importType === "jobs";
  const needsSalaryGradeCheck = importType === "positions" && data.some(row => row.salary_grade_code);

  if (!needsCompanyCheck && !needsDepartmentCheck && !needsJobCheck && !needsPositionCheck && !needsJobFamilyCheck && !needsSalaryGradeCheck) {
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

    // Fetch salary grades if needed
    let salaryGradeLookup = new Map<string, string>();
    if (needsSalaryGradeCheck) {
      const { data: salaryGrades } = await supabase
        .from("salary_grades")
        .select("id, code, company_id");
      
      (salaryGrades || []).forEach((sg: { id: string; code: string | null; company_id: string }) => {
        if (sg.code) {
          salaryGradeLookup.set(`${sg.company_id}_${sg.code.toUpperCase()}`, sg.id);
        }
      });
      console.log(`Found ${salaryGradeLookup.size} salary grades for validation`);
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
          return;
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

      // Check salary grade reference (optional field)
      if (needsSalaryGradeCheck && row.salary_grade_code && resolvedCompanyId) {
        const sgKey = `${resolvedCompanyId}_${row.salary_grade_code.toUpperCase()}`;
        if (!salaryGradeLookup.has(sgKey)) {
          issues.push({
            row: rowNum,
            field: "salary_grade_code",
            value: row.salary_grade_code,
            issue: `Salary grade '${row.salary_grade_code}' not found in company '${row.company_code}'`,
            severity: "warning",
            suggestion: "Create salary grades first or leave this field empty",
          });
          // This is a warning, not an error, since it's optional
        }
      }

      // Validate allowed values for status fields
      if (importType === "positions") {
        const allowedEmploymentStatus = ["ACTIVE", "INACTIVE", "ON_HOLD", "TERMINATED"];
        const allowedEmploymentType = ["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY", "INTERN"];
        const allowedPayType = ["SALARIED", "HOURLY", "COMMISSION", "PIECE_RATE"];
        const allowedFlsaStatus = ["EXEMPT", "NON_EXEMPT"];

        if (row.employment_status && !allowedEmploymentStatus.includes(row.employment_status.toUpperCase())) {
          issues.push({
            row: rowNum,
            field: "employment_status",
            value: row.employment_status,
            issue: `Invalid employment status '${row.employment_status}'`,
            severity: "warning",
            suggestion: `Use one of: ${allowedEmploymentStatus.join(", ")}`,
          });
        }

        if (row.employment_type && !allowedEmploymentType.includes(row.employment_type.toUpperCase())) {
          issues.push({
            row: rowNum,
            field: "employment_type",
            value: row.employment_type,
            issue: `Invalid employment type '${row.employment_type}'`,
            severity: "warning",
            suggestion: `Use one of: ${allowedEmploymentType.join(", ")}`,
          });
        }

        if (row.pay_type && !allowedPayType.includes(row.pay_type.toUpperCase())) {
          issues.push({
            row: rowNum,
            field: "pay_type",
            value: row.pay_type,
            issue: `Invalid pay type '${row.pay_type}'`,
            severity: "warning",
            suggestion: `Use one of: ${allowedPayType.join(", ")}`,
          });
        }

        if (row.flsa_status && !allowedFlsaStatus.includes(row.flsa_status.toUpperCase())) {
          issues.push({
            row: rowNum,
            field: "flsa_status",
            value: row.flsa_status,
            issue: `Invalid FLSA status '${row.flsa_status}'`,
            severity: "warning",
            suggestion: `Use one of: ${allowedFlsaStatus.join(", ")}`,
          });
        }
      }
    });

  } catch (err) {
    console.error("Database reference validation error:", err);
  }

  return { issues, errorCount };
}

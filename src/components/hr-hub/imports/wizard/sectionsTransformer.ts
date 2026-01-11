import { supabase } from "@/integrations/supabase/client";

export interface SectionRow {
  company_code: string;
  department_code: string;
  code: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active?: string | boolean;
  [key: string]: any;
}

export interface SectionInsertRecord {
  department_id: string;
  code: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface TransformResult {
  transformed: SectionInsertRecord[];
  errors: { rowIndex: number; row: any; error: string }[];
  warnings: { rowIndex: number; row: any; message: string }[];
}

export async function transformSectionsData(rows: SectionRow[]): Promise<TransformResult> {
  const transformed: SectionInsertRecord[] = [];
  const errors: { rowIndex: number; row: any; error: string }[] = [];
  const warnings: { rowIndex: number; row: any; message: string }[] = [];

  // Fetch companies for code → id lookup
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, code");

  if (companiesError) {
    errors.push({ rowIndex: -1, row: {}, error: `Failed to fetch companies: ${companiesError.message}` });
    return { transformed, errors, warnings };
  }

  const companyLookup = new Map<string, string>();
  const validCompanyCodes: string[] = [];
  (companies || []).forEach((c) => {
    if (c.code) {
      companyLookup.set(c.code.toUpperCase(), c.id);
      validCompanyCodes.push(c.code);
    }
  });

  // Fetch departments for (company_id|code) → id lookup
  const { data: departments, error: departmentsError } = await supabase
    .from("departments")
    .select("id, code, company_id");

  if (departmentsError) {
    errors.push({ rowIndex: -1, row: {}, error: `Failed to fetch departments: ${departmentsError.message}` });
    return { transformed, errors, warnings };
  }

  // Create a map keyed by "company_id|department_code" for scoped lookup
  const departmentLookup = new Map<string, string>();
  const departmentsByCompany = new Map<string, string[]>();
  (departments || []).forEach((d) => {
    if (d.code && d.company_id) {
      departmentLookup.set(`${d.company_id}|${d.code.toUpperCase()}`, d.id);
      
      // Track departments per company for error messages
      if (!departmentsByCompany.has(d.company_id)) {
        departmentsByCompany.set(d.company_id, []);
      }
      departmentsByCompany.get(d.company_id)!.push(d.code);
    }
  });

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Validate required fields
    if (!row.company_code || !row.company_code.trim()) {
      errors.push({ 
        rowIndex: i, 
        row, 
        error: `Missing required field: company_code. Valid company codes: ${validCompanyCodes.slice(0, 10).join(", ")}${validCompanyCodes.length > 10 ? "..." : ""}` 
      });
      continue;
    }

    if (!row.department_code || !row.department_code.trim()) {
      errors.push({ rowIndex: i, row, error: "Missing required field: department_code" });
      continue;
    }

    if (!row.code || !row.code.trim()) {
      errors.push({ rowIndex: i, row, error: "Missing required field: code" });
      continue;
    }

    if (!row.name || !row.name.trim()) {
      errors.push({ rowIndex: i, row, error: "Missing required field: name" });
      continue;
    }

    // Resolve company_code to company_id
    const companyId = companyLookup.get(row.company_code.toUpperCase());
    if (!companyId) {
      errors.push({ 
        rowIndex: i, 
        row, 
        error: `Company code '${row.company_code}' not found. Valid company codes: ${validCompanyCodes.slice(0, 10).join(", ")}${validCompanyCodes.length > 10 ? "..." : ""}` 
      });
      continue;
    }

    // Resolve department_code to department_id (scoped to company)
    const deptLookupKey = `${companyId}|${row.department_code.toUpperCase()}`;
    const departmentId = departmentLookup.get(deptLookupKey);
    
    if (!departmentId) {
      const validDepts = departmentsByCompany.get(companyId) || [];
      errors.push({ 
        rowIndex: i, 
        row, 
        error: `Department code '${row.department_code}' not found for company '${row.company_code}'. Valid departments for this company: ${validDepts.slice(0, 10).join(", ")}${validDepts.length > 10 ? "..." : ""}` 
      });
      continue;
    }

    // Parse is_active
    let isActive = true;
    if (row.is_active !== undefined && row.is_active !== null && row.is_active !== "") {
      if (typeof row.is_active === "boolean") {
        isActive = row.is_active;
      } else if (typeof row.is_active === "string") {
        isActive = row.is_active.toLowerCase() !== "false" && row.is_active !== "0";
      }
    }

    // Parse dates
    const startDate = row.start_date && row.start_date.trim() 
      ? row.start_date.trim() 
      : new Date().toISOString().slice(0, 10);
    
    const endDate = row.end_date && row.end_date.trim() 
      ? row.end_date.trim() 
      : null;

    // Build the record
    const record: SectionInsertRecord = {
      department_id: departmentId,
      code: row.code.trim(),
      name: row.name.trim(),
      description: row.description?.trim() || null,
      start_date: startDate,
      end_date: endDate,
      is_active: isActive,
    };

    transformed.push(record);
  }

  return { transformed, errors, warnings };
}

export function generateSectionsFailureReport(
  failures: { rowIndex: number; row: any; error: string }[],
  warnings: { rowIndex: number; message: string }[]
): string {
  const lines: string[] = [
    "=== SECTIONS IMPORT FAILURE REPORT ===",
    `Generated: ${new Date().toISOString()}`,
    "",
    "=== SUMMARY ===",
    `Total Errors: ${failures.length}`,
    `Total Warnings: ${warnings.length}`,
    "",
  ];

  if (failures.length > 0) {
    lines.push("=== ERRORS (Records Not Imported) ===");
    failures.forEach((f, idx) => {
      lines.push(`\n--- Error ${idx + 1} ---`);
      lines.push(`Row: ${f.rowIndex + 2} (Excel row number)`);
      lines.push(`Error: ${f.error}`);
      lines.push(`Data: ${JSON.stringify(f.row, null, 2)}`);
    });
    lines.push("");
  }

  if (warnings.length > 0) {
    lines.push("=== WARNINGS (Records Imported with Issues) ===");
    warnings.forEach((w, idx) => {
      lines.push(`\n--- Warning ${idx + 1} ---`);
      lines.push(`Row: ${w.rowIndex + 2} (Excel row number)`);
      lines.push(`Warning: ${w.message}`);
    });
    lines.push("");
  }

  lines.push("=== RESOLUTION TIPS ===");
  lines.push("1. Ensure company codes match existing companies in the system");
  lines.push("2. Department codes must exist within the specified company");
  lines.push("3. Import order: Companies → Departments → Sections");
  lines.push("4. Use the Reference Data drawer to view valid codes");
  lines.push("5. Check for typos in code values (comparison is case-insensitive)");

  return lines.join("\n");
}

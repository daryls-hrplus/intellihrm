import { supabase } from "@/integrations/supabase/client";

export interface DepartmentRow {
  code: string;
  name: string;
  company_code: string;
  division_code?: string;
  parent_department_code?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active?: string | boolean;
  [key: string]: any;
}

export interface DepartmentInsertRecord {
  code: string;
  name: string;
  company_id: string;
  company_division_id: string | null;
  parent_department_id: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface TransformResult {
  transformed: DepartmentInsertRecord[];
  errors: { rowIndex: number; row: any; error: string }[];
  warnings: { rowIndex: number; row: any; message: string }[];
}

export async function transformDepartmentsData(rows: DepartmentRow[]): Promise<TransformResult> {
  const transformed: DepartmentInsertRecord[] = [];
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

  // Fetch company_divisions for (company_id|code) → id lookup
  const { data: divisions, error: divisionsError } = await supabase
    .from("company_divisions")
    .select("id, code, company_id");

  if (divisionsError) {
    warnings.push({ rowIndex: -1, row: {}, message: `Could not fetch divisions: ${divisionsError.message}` });
  }

  // Create a map keyed by "company_id|division_code" for scoped lookup
  const divisionLookup = new Map<string, string>();
  (divisions || []).forEach((d) => {
    if (d.code && d.company_id) {
      divisionLookup.set(`${d.company_id}|${d.code.toUpperCase()}`, d.id);
    }
  });

  // Fetch existing departments for parent lookup (after we know company_id)
  const { data: existingDepartments, error: deptError } = await supabase
    .from("departments")
    .select("id, code, company_id");

  if (deptError) {
    warnings.push({ rowIndex: -1, row: {}, message: `Could not fetch existing departments: ${deptError.message}` });
  }

  // Create a map keyed by "company_id|department_code" for parent lookup
  const departmentLookup = new Map<string, string>();
  (existingDepartments || []).forEach((d) => {
    if (d.code && d.company_id) {
      departmentLookup.set(`${d.company_id}|${d.code.toUpperCase()}`, d.id);
    }
  });

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Validate required fields
    if (!row.code || !row.code.trim()) {
      errors.push({ rowIndex: i, row, error: "Missing required field: code" });
      continue;
    }

    if (!row.name || !row.name.trim()) {
      errors.push({ rowIndex: i, row, error: "Missing required field: name" });
      continue;
    }

    if (!row.company_code || !row.company_code.trim()) {
      errors.push({ 
        rowIndex: i, 
        row, 
        error: `Missing required field: company_code. Valid company codes: ${validCompanyCodes.slice(0, 10).join(", ")}${validCompanyCodes.length > 10 ? "..." : ""}` 
      });
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

    // Resolve optional division_code to company_division_id (scoped to company)
    let companyDivisionId: string | null = null;
    if (row.division_code && row.division_code.trim()) {
      const lookupKey = `${companyId}|${row.division_code.toUpperCase()}`;
      companyDivisionId = divisionLookup.get(lookupKey) || null;
      
      if (!companyDivisionId) {
        // This is a warning, not an error - department can exist without division
        warnings.push({ 
          rowIndex: i, 
          row, 
          message: `Division code '${row.division_code}' not found for company '${row.company_code}'. Department will be linked directly to company.` 
        });
      }
    }

    // Resolve optional parent_department_code to parent_department_id (scoped to company)
    let parentDepartmentId: string | null = null;
    if (row.parent_department_code && row.parent_department_code.trim()) {
      const lookupKey = `${companyId}|${row.parent_department_code.toUpperCase()}`;
      parentDepartmentId = departmentLookup.get(lookupKey) || null;
      
      if (!parentDepartmentId) {
        warnings.push({ 
          rowIndex: i, 
          row, 
          message: `Parent department code '${row.parent_department_code}' not found for company '${row.company_code}'. Parent will be set to null.` 
        });
      }
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
    const record: DepartmentInsertRecord = {
      code: row.code.trim(),
      name: row.name.trim(),
      company_id: companyId,
      company_division_id: companyDivisionId,
      parent_department_id: parentDepartmentId,
      description: row.description?.trim() || null,
      start_date: startDate,
      end_date: endDate,
      is_active: isActive,
    };

    transformed.push(record);
  }

  return { transformed, errors, warnings };
}

export function generateDepartmentsFailureReport(
  failures: { rowIndex: number; row: any; error: string }[],
  warnings: { rowIndex: number; message: string }[]
): string {
  const lines: string[] = [
    "=== DEPARTMENTS IMPORT FAILURE REPORT ===",
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
  lines.push("2. Division codes are optional - if provided, must exist for that company");
  lines.push("3. Import order: Companies → Divisions → Departments");
  lines.push("4. Use the Reference Data drawer to view valid codes");
  lines.push("5. Check for typos in code values (comparison is case-insensitive)");

  return lines.join("\n");
}

import { supabase } from "@/integrations/supabase/client";

interface DivisionRow {
  code: string;
  name: string;
  company_code: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active?: string | boolean;
  _rowIndex?: number;
  _id?: string;
  [key: string]: any;
}

interface CompanyDivisionInsertRecord {
  code: string;
  name: string;
  company_id: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
}

interface TransformResult {
  transformed: CompanyDivisionInsertRecord[];
  errors: { rowIndex: number; row: DivisionRow; error: string }[];
  warnings: { rowIndex: number; message: string }[];
}

export async function transformDivisionsData(
  rows: DivisionRow[]
): Promise<TransformResult> {
  const errors: TransformResult["errors"] = [];
  const warnings: TransformResult["warnings"] = [];
  const transformed: CompanyDivisionInsertRecord[] = [];

  // Fetch companies for lookup
  const { data: companies } = await supabase
    .from("companies")
    .select("id, code");

  // Build lookup map
  const companyMap = new Map<string, string>();
  if (companies) {
    companies.forEach((c) => {
      if (c.code) companyMap.set(c.code.toUpperCase(), c.id);
    });
  }

  const validCompanyCodes = Array.from(companyMap.keys()).join(", ") || "(none)";

  // Transform each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = row._rowIndex ?? i;

    // Required field validation
    if (!row.code?.trim()) {
      errors.push({ rowIndex, row, error: "Missing required field: code" });
      continue;
    }
    if (!row.name?.trim()) {
      errors.push({ rowIndex, row, error: "Missing required field: name" });
      continue;
    }
    if (!row.company_code?.trim()) {
      errors.push({ rowIndex, row, error: "Missing required field: company_code" });
      continue;
    }

    // Resolve company_id (required)
    const companyCode = row.company_code.trim().toUpperCase();
    const company_id = companyMap.get(companyCode);
    if (!company_id) {
      errors.push({
        rowIndex,
        row,
        error: `Company code "${row.company_code}" not found. Valid codes: ${validCompanyCodes}`,
      });
      continue;
    }

    // Parse start_date (default to today if missing)
    let start_date = new Date().toISOString().slice(0, 10);
    if (row.start_date?.trim()) {
      const parsed = new Date(row.start_date.trim());
      if (!isNaN(parsed.getTime())) {
        start_date = parsed.toISOString().slice(0, 10);
      } else {
        warnings.push({
          rowIndex,
          message: `Invalid start_date "${row.start_date}", using today's date`,
        });
      }
    }

    // Parse end_date (optional)
    let end_date: string | null = null;
    if (row.end_date?.trim()) {
      const parsed = new Date(row.end_date.trim());
      if (!isNaN(parsed.getTime())) {
        end_date = parsed.toISOString().slice(0, 10);
      } else {
        warnings.push({
          rowIndex,
          message: `Invalid end_date "${row.end_date}", ignoring`,
        });
      }
    }

    // Parse is_active
    let is_active = true;
    if (row.is_active !== undefined && row.is_active !== null) {
      if (typeof row.is_active === "boolean") {
        is_active = row.is_active;
      } else if (typeof row.is_active === "string") {
        is_active = row.is_active.toLowerCase() !== "false" && row.is_active !== "0";
      }
    }

    // Build transformed record for company_divisions table
    const record: CompanyDivisionInsertRecord = {
      code: row.code.trim(),
      name: row.name.trim(),
      company_id,
      description: row.description?.trim() || null,
      start_date,
      end_date,
      is_active,
    };

    transformed.push(record);
  }

  return { transformed, errors, warnings };
}

export function generateDivisionsFailureReport(
  failures: { rowIndex: number; row: any; error: string }[],
  warnings: { rowIndex: number; message: string }[]
): string {
  let report = "DIVISIONS IMPORT FAILURE REPORT\n";
  report += `Generated: ${new Date().toISOString()}\n`;
  report += "=".repeat(60) + "\n\n";

  if (failures.length > 0) {
    report += `ERRORS (${failures.length}):\n`;
    report += "-".repeat(40) + "\n";
    failures.forEach((f) => {
      report += `Row ${f.rowIndex + 2}: ${f.error}\n`;
      report += `  Data: ${JSON.stringify(f.row)}\n\n`;
    });
  }

  if (warnings.length > 0) {
    report += `\nWARNINGS (${warnings.length}):\n`;
    report += "-".repeat(40) + "\n";
    warnings.forEach((w) => {
      report += `Row ${w.rowIndex + 2}: ${w.message}\n`;
    });
  }

  if (failures.length === 0 && warnings.length === 0) {
    report += "No errors or warnings.\n";
  }

  return report;
}

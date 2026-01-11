import { supabase } from "@/integrations/supabase/client";

interface DivisionRow {
  code: string;
  name: string;
  name_en?: string;
  group_code?: string;
  description?: string;
  description_en?: string;
  is_active?: string | boolean;
  _rowIndex?: number;
  _id?: string;
  [key: string]: any;
}

interface DivisionInsertRecord {
  code: string;
  name: string;
  name_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  group_id?: string | null;
  is_active: boolean;
}

interface TransformResult {
  transformed: DivisionInsertRecord[];
  errors: { rowIndex: number; row: DivisionRow; error: string }[];
  warnings: { rowIndex: number; message: string }[];
}

export async function transformDivisionsData(
  rows: DivisionRow[]
): Promise<TransformResult> {
  const errors: TransformResult["errors"] = [];
  const warnings: TransformResult["warnings"] = [];
  const transformed: DivisionInsertRecord[] = [];

  // Fetch company groups for lookup
  const { data: groups } = await supabase
    .from("company_groups")
    .select("id, code");

  // Build lookup map
  const groupMap = new Map<string, string>();
  if (groups) {
    groups.forEach((g) => {
      if (g.code) groupMap.set(g.code.toUpperCase(), g.id);
    });
  }

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

    // Resolve group_id (optional)
    let group_id: string | null = null;
    if (row.group_code?.trim()) {
      const groupCode = row.group_code.trim().toUpperCase();
      group_id = groupMap.get(groupCode) || null;
      if (!group_id) {
        warnings.push({
          rowIndex,
          message: `Group code "${row.group_code}" not found. Division will be imported without group assignment. Valid codes: ${Array.from(groupMap.keys()).join(", ") || "(none)"}`,
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

    // Build transformed record
    const record: DivisionInsertRecord = {
      code: row.code.trim(),
      name: row.name.trim(),
      name_en: row.name_en?.trim() || null,
      description: row.description?.trim() || null,
      description_en: row.description_en?.trim() || null,
      group_id,
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

import { supabase } from "@/integrations/supabase/client";

export interface SpinalPointTransformResult {
  transformed: any[];
  errors: Array<{ rowIndex: number; row: any; error: string }>;
  warnings: Array<{ rowIndex: number; field: string; message: string }>;
}

function parseNumber(value: string | undefined, defaultValue: number | null = null): number | null {
  if (!value || value.trim() === "") return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseDate(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

export async function transformSpinalPointsData(
  rows: any[],
  companyId?: string | null
): Promise<SpinalPointTransformResult> {
  const transformed: any[] = [];
  const errors: Array<{ rowIndex: number; row: any; error: string }> = [];
  const warnings: Array<{ rowIndex: number; field: string; message: string }> = [];

  // Fetch pay spines for lookup
  let spineQuery = supabase.from("pay_spines").select("id, code, name, company_id");
  if (companyId) {
    spineQuery = spineQuery.eq("company_id", companyId);
  }
  const { data: paySpines } = await spineQuery;

  const spineMap = new Map<string, string>();
  paySpines?.forEach((s) => {
    if (s.code) spineMap.set(s.code.toLowerCase(), s.id);
    if (s.name) spineMap.set(s.name.toLowerCase(), s.id);
  });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i;

    try {
      // Required fields validation
      if (!row.spine_code) {
        errors.push({ rowIndex, row, error: "Missing required field: spine_code" });
        continue;
      }

      if (!row.point_number && row.point_number !== 0) {
        errors.push({ rowIndex, row, error: "Missing required field: point_number" });
        continue;
      }

      // Resolve pay_spine_id
      const paySpineId = spineMap.get(row.spine_code.toLowerCase());
      if (!paySpineId) {
        errors.push({ rowIndex, row, error: `Pay spine not found: ${row.spine_code}` });
        continue;
      }

      // Parse salary values
      const annualSalary = parseNumber(row.annual_salary);
      const hourlyRate = parseNumber(row.hourly_rate);

      if (annualSalary === null && hourlyRate === null) {
        warnings.push({ rowIndex, field: "annual_salary", message: "No salary value provided" });
      }

      // Build transformed record
      const record: any = {
        pay_spine_id: paySpineId,
        point_number: parseInt(row.point_number),
        annual_salary: annualSalary,
        hourly_rate: hourlyRate,
        effective_date: parseDate(row.effective_date) || new Date().toISOString().split("T")[0],
        end_date: parseDate(row.end_date),
        notes: row.notes || null,
      };

      transformed.push(record);
    } catch (e: any) {
      errors.push({ rowIndex, row, error: e.message });
    }
  }

  return { transformed, errors, warnings };
}

export function generateSpinalPointsFailureReport(
  errors: Array<{ rowIndex: number; row: any; error: string }>,
  warnings: Array<{ rowIndex: number; field: string; message: string }>
): string {
  const lines: string[] = [];
  lines.push("SPINAL POINTS IMPORT FAILURE REPORT");
  lines.push("Generated: " + new Date().toISOString());
  lines.push("=".repeat(60));
  lines.push("");

  if (errors.length > 0) {
    lines.push(`ERRORS (${errors.length}):`);
    lines.push("-".repeat(40));
    errors.forEach((e) => {
      lines.push(`Row ${e.rowIndex + 2}: ${e.error}`);
      lines.push(`  Data: ${JSON.stringify(e.row)}`);
      lines.push("");
    });
  }

  if (warnings.length > 0) {
    lines.push(`WARNINGS (${warnings.length}):`);
    lines.push("-".repeat(40));
    warnings.forEach((w) => {
      lines.push(`Row ${w.rowIndex + 2}, ${w.field}: ${w.message}`);
    });
  }

  return lines.join("\n");
}

import { supabase } from "@/integrations/supabase/client";

export interface PaySpineTransformResult {
  transformed: any[];
  errors: Array<{ rowIndex: number; row: any; error: string }>;
  warnings: Array<{ rowIndex: number; field: string; message: string }>;
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return true; // Default to active
  const lower = value.toString().toLowerCase().trim();
  return lower === "true" || lower === "yes" || lower === "1" || lower === "active";
}

function parseDate(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

export async function transformPaySpinesData(
  rows: any[],
  companyId?: string | null
): Promise<PaySpineTransformResult> {
  const transformed: any[] = [];
  const errors: Array<{ rowIndex: number; row: any; error: string }> = [];
  const warnings: Array<{ rowIndex: number; field: string; message: string }> = [];

  // Fetch companies for lookup
  const { data: companies } = await supabase
    .from("companies")
    .select("id, code, name");

  const companyMap = new Map<string, string>();
  companies?.forEach((c) => {
    if (c.code) companyMap.set(c.code.toLowerCase(), c.id);
    if (c.name) companyMap.set(c.name.toLowerCase(), c.id);
  });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i;

    try {
      // Required fields validation
      if (!row.spine_code && !row.code) {
        errors.push({ rowIndex, row, error: "Missing required field: spine_code" });
        continue;
      }

      if (!row.spine_name && !row.name) {
        errors.push({ rowIndex, row, error: "Missing required field: spine_name" });
        continue;
      }

      // Resolve company_id
      let resolvedCompanyId = companyId;
      if (row.company_code && !companyId) {
        resolvedCompanyId = companyMap.get(row.company_code.toLowerCase());
        if (!resolvedCompanyId) {
          errors.push({ rowIndex, row, error: `Company not found: ${row.company_code}` });
          continue;
        }
      }

      if (!resolvedCompanyId) {
        errors.push({ rowIndex, row, error: "No company specified" });
        continue;
      }

      // Build transformed record
      const record: any = {
        company_id: resolvedCompanyId,
        code: row.spine_code || row.code,
        name: row.spine_name || row.name,
        description: row.description || null,
        effective_date: parseDate(row.effective_date) || new Date().toISOString().split("T")[0],
        end_date: parseDate(row.end_date),
        currency: row.currency?.toUpperCase() || "USD",
        is_active: parseBoolean(row.is_active),
      };

      transformed.push(record);
    } catch (e: any) {
      errors.push({ rowIndex, row, error: e.message });
    }
  }

  return { transformed, errors, warnings };
}

export function generatePaySpinesFailureReport(
  errors: Array<{ rowIndex: number; row: any; error: string }>,
  warnings: Array<{ rowIndex: number; field: string; message: string }>
): string {
  const lines: string[] = [];
  lines.push("PAY SPINES IMPORT FAILURE REPORT");
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

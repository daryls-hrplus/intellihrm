import { supabase } from "@/integrations/supabase/client";

interface JobFamilyRow {
  code?: string;
  name?: string;
  company_code?: string;
  master_code?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active?: string;
}

interface JobFamilyInsertRecord {
  code: string;
  name: string;
  company_id: string;
  master_job_family_id?: string;
  description?: string;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
}

interface TransformError {
  rowIndex: number;
  row: any;
  error: string;
}

interface TransformWarning {
  rowIndex: number;
  message: string;
}

interface TransformResult {
  transformed: JobFamilyInsertRecord[];
  errors: TransformError[];
  warnings: TransformWarning[];
}

export async function transformJobFamiliesData(data: JobFamilyRow[]): Promise<TransformResult> {
  const errors: TransformError[] = [];
  const warnings: TransformWarning[] = [];
  const transformed: JobFamilyInsertRecord[] = [];

  // Fetch companies for code → id lookup
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, code")
    .eq("is_active", true);

  if (companiesError) {
    throw new Error(`Failed to fetch companies: ${companiesError.message}`);
  }

  const companyCodeToId = new Map<string, string>();
  companies?.forEach((c) => {
    companyCodeToId.set(c.code.toLowerCase(), c.id);
  });

  // Fetch master job families for master_code → id lookup
  const { data: masterFamilies, error: masterError } = await supabase
    .from("master_job_families")
    .select("id, code")
    .eq("is_active", true);

  if (masterError) {
    throw new Error(`Failed to fetch master job families: ${masterError.message}`);
  }

  const masterCodeToId = new Map<string, string>();
  masterFamilies?.forEach((m) => {
    masterCodeToId.set(m.code.toLowerCase(), m.id);
  });

  // Get today's date as default start_date
  const today = new Date().toISOString().split("T")[0];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowIndex = i;

    try {
      // Validate required fields
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

      // Resolve company_code to company_id
      const companyId = companyCodeToId.get(row.company_code.toLowerCase().trim());
      if (!companyId) {
        errors.push({
          rowIndex,
          row,
          error: `Company code "${row.company_code}" not found. Import companies first.`,
        });
        continue;
      }

      // Build record
      const record: JobFamilyInsertRecord = {
        code: row.code.trim().toUpperCase(),
        name: row.name.trim(),
        company_id: companyId,
        description: row.description?.trim() || undefined,
        start_date: row.start_date?.trim() || today,
        end_date: row.end_date?.trim() || null,
        is_active: row.is_active?.toLowerCase() !== "false",
      };

      // Resolve optional master_code to master_job_family_id
      if (row.master_code?.trim()) {
        const masterId = masterCodeToId.get(row.master_code.toLowerCase().trim());
        if (masterId) {
          record.master_job_family_id = masterId;
        } else {
          warnings.push({
            rowIndex,
            message: `Master code "${row.master_code}" not found. Job family will be created without master link.`,
          });
        }
      }

      transformed.push(record);
    } catch (e: any) {
      errors.push({ rowIndex, row, error: e.message || "Unknown transformation error" });
    }
  }

  return { transformed, errors, warnings };
}

export function generateJobFamiliesFailureReport(
  failures: TransformError[],
  warnings: TransformWarning[]
): string {
  const lines: string[] = [];
  
  lines.push("=".repeat(60));
  lines.push("JOB FAMILIES IMPORT FAILURE REPORT");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("=".repeat(60));
  lines.push("");

  if (failures.length > 0) {
    lines.push(`ERRORS (${failures.length}):`);
    lines.push("-".repeat(40));
    failures.forEach((f) => {
      lines.push(`Row ${f.rowIndex + 2}: ${f.error}`);
      lines.push(`  Data: ${JSON.stringify(f.row)}`);
      lines.push("");
    });
  }

  if (warnings.length > 0) {
    lines.push("");
    lines.push(`WARNINGS (${warnings.length}):`);
    lines.push("-".repeat(40));
    warnings.forEach((w) => {
      lines.push(`Row ${w.rowIndex + 2}: ${w.message}`);
    });
  }

  if (failures.length === 0 && warnings.length === 0) {
    lines.push("No failures or warnings to report.");
  }

  return lines.join("\n");
}

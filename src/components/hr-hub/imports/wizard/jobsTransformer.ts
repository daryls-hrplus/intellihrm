import { supabase } from "@/integrations/supabase/client";

interface JobRow {
  code?: string;
  title?: string;
  company_code?: string;
  job_family_code?: string;
  grade?: string;
  description?: string;
  is_active?: string;
  start_date?: string;
  end_date?: string;
}

interface JobInsertRecord {
  code: string;
  name: string;
  company_id: string;
  job_family_id: string;
  job_grade?: string;
  description?: string;
  is_active: boolean;
  start_date: string;
  end_date?: string | null;
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
  transformed: JobInsertRecord[];
  errors: TransformError[];
  warnings: TransformWarning[];
}

export async function transformJobsData(data: JobRow[]): Promise<TransformResult> {
  const errors: TransformError[] = [];
  const warnings: TransformWarning[] = [];
  const transformed: JobInsertRecord[] = [];

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

  // Fetch job families for code → id lookup (need company_id for scoping)
  const { data: jobFamilies, error: jobFamiliesError } = await supabase
    .from("job_families")
    .select("id, code, company_id")
    .eq("is_active", true);

  if (jobFamiliesError) {
    throw new Error(`Failed to fetch job families: ${jobFamiliesError.message}`);
  }

  // Build a map: "companyId_familyCode" → family id
  const jobFamilyLookup = new Map<string, string>();
  jobFamilies?.forEach((jf) => {
    const key = `${jf.company_id}_${jf.code.toLowerCase()}`;
    jobFamilyLookup.set(key, jf.id);
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

      if (!row.title?.trim()) {
        errors.push({ rowIndex, row, error: "Missing required field: title" });
        continue;
      }

      if (!row.company_code?.trim()) {
        errors.push({ rowIndex, row, error: "Missing required field: company_code" });
        continue;
      }

      if (!row.job_family_code?.trim()) {
        errors.push({ rowIndex, row, error: "Missing required field: job_family_code" });
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

      // Resolve job_family_code to job_family_id (scoped by company)
      const familyKey = `${companyId}_${row.job_family_code.toLowerCase().trim()}`;
      const jobFamilyId = jobFamilyLookup.get(familyKey);
      if (!jobFamilyId) {
        errors.push({
          rowIndex,
          row,
          error: `Job family code "${row.job_family_code}" not found for company "${row.company_code}". Import job families first.`,
        });
        continue;
      }

      // Build record - map title to name, grade to job_grade
      const record: JobInsertRecord = {
        code: row.code.trim().toUpperCase(),
        name: row.title.trim(),
        company_id: companyId,
        job_family_id: jobFamilyId,
        job_grade: row.grade?.trim() || undefined,
        description: row.description?.trim() || undefined,
        start_date: row.start_date?.trim() || today,
        end_date: row.end_date?.trim() || null,
        is_active: row.is_active?.toLowerCase() !== "false",
      };

      transformed.push(record);
    } catch (e: any) {
      errors.push({ rowIndex, row, error: e.message || "Unknown transformation error" });
    }
  }

  return { transformed, errors, warnings };
}

export function generateJobsFailureReport(
  failures: TransformError[],
  warnings: { rowIndex: number; field?: string; message: string }[]
): string {
  const lines: string[] = [];
  
  lines.push("=".repeat(60));
  lines.push("JOBS IMPORT FAILURE REPORT");
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

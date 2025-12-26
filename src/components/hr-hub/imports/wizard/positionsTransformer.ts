import { supabase } from "@/integrations/supabase/client";
import { CompensationModel } from "./WizardStepCompensationModel";

export interface PositionTransformResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
}

export interface PositionTransformBatchResult {
  transformed: any[];
  errors: Array<{ rowIndex: number; row: any; error: string }>;
  warnings: Array<{ rowIndex: number; field: string; message: string }>;
}

// Normalize enum values to lowercase database format
function normalizeEnum(value: string | undefined, field: string): string | null {
  if (!value || value.trim() === "") return null;
  
  const normalizedValue = value.toLowerCase().trim();
  
  // Handle special mappings
  const mappings: Record<string, Record<string, string>> = {
    pay_type: {
      salaried: "salary",
      hourly: "hourly",
      salary: "salary",
      commission: "commission",
      piece_rate: "piece_rate",
    },
    employment_status: {
      active: "active",
      inactive: "inactive",
      on_hold: "on_hold",
      onhold: "on_hold",
      terminated: "terminated",
    },
    employment_type: {
      full_time: "full_time",
      fulltime: "full_time",
      part_time: "part_time",
      parttime: "part_time",
      contract: "contract",
      temporary: "temporary",
      intern: "intern",
    },
    employment_relation: {
      employee: "employee",
      contractor: "contractor",
      consultant: "consultant",
    },
    flsa_status: {
      exempt: "exempt",
      non_exempt: "non_exempt",
      nonexempt: "non_exempt",
    },
    compensation_model: {
      salary_grade: "salary_grade",
      salarygrade: "salary_grade",
      spinal_point: "spinal_point",
      spinalpoint: "spinal_point",
      hybrid: "hybrid",
      commission_based: "commission_based",
      commissionbased: "commission_based",
      hourly_rate: "hourly_rate",
      hourlyrate: "hourly_rate",
      direct_pay: "direct_pay",
      directpay: "direct_pay",
    },
  };
  
  const fieldMappings = mappings[field];
  if (fieldMappings) {
    const mapped = fieldMappings[normalizedValue.replace(/_/g, "").replace(/-/g, "")];
    if (mapped) return mapped;
    // Try with underscores
    return fieldMappings[normalizedValue] || normalizedValue;
  }
  
  return normalizedValue;
}

// Parse boolean value from various formats
function parseBoolean(value: string | undefined): boolean {
  if (!value || value.trim() === "") return true; // Default to true
  const normalized = value.toLowerCase().trim();
  return ["true", "1", "yes", "y", "active"].includes(normalized);
}

// Parse number with fallback
function parseNumber(value: string | undefined, defaultValue: number | null = null): number | null {
  if (!value || value.trim() === "") return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Parse date value
function parseDate(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  // Try to parse the date
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export async function transformPositionsData(
  rows: any[],
  companyId?: string | null,
  compensationModel?: CompensationModel | null
): Promise<PositionTransformBatchResult> {
  const transformed: any[] = [];
  const errors: Array<{ rowIndex: number; row: any; error: string }> = [];
  const warnings: Array<{ rowIndex: number; field: string; message: string }> = [];

  // Fetch all lookup data upfront for efficiency
  const { data: companies } = await supabase.from("companies").select("id, code");
  const companyLookup = new Map((companies || []).map((c) => [c.code?.toUpperCase(), c.id]));

  const { data: departments } = await supabase.from("departments").select("id, code, company_id");
  const deptLookup = new Map<string, string>();
  (departments || []).forEach((d) => {
    deptLookup.set(`${d.company_id}|${d.code?.toUpperCase()}`, d.id);
  });

  const { data: jobs } = await supabase.from("jobs").select("id, code, company_id");
  const jobLookup = new Map<string, string>();
  (jobs || []).forEach((j) => {
    jobLookup.set(`${j.company_id}|${j.code?.toUpperCase()}`, j.id);
  });

  const { data: positions } = await supabase.from("positions").select("id, code, company_id");
  const positionLookup = new Map<string, string>();
  (positions || []).forEach((p) => {
    positionLookup.set(`${p.company_id}|${p.code?.toUpperCase()}`, p.id);
  });

  const { data: salaryGrades } = await supabase.from("salary_grades").select("id, code, company_id");
  const gradeLookup = new Map<string, string>();
  (salaryGrades || []).forEach((g) => {
    gradeLookup.set(`${g.company_id}|${g.code?.toUpperCase()}`, g.id);
  });

  const { data: paySpines } = await supabase.from("pay_spines").select("id, code, company_id");
  const spineLookup = new Map<string, string>();
  (paySpines || []).forEach((s) => {
    spineLookup.set(`${s.company_id}|${s.code?.toUpperCase()}`, s.id);
  });

  // Default compensation model from wizard selection
  const defaultCompensationModel = compensationModel || "salary_grade";

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowErrors: string[] = [];
    const rowWarnings: Array<{ field: string; message: string }> = [];

    try {
      // Resolve company_id
      let resolvedCompanyId = companyId;
      if (row.company_code) {
        const lookupId = companyLookup.get(row.company_code.toUpperCase());
        if (lookupId) {
          resolvedCompanyId = lookupId;
        } else {
          rowErrors.push(`Company not found: ${row.company_code}`);
        }
      }

      if (!resolvedCompanyId) {
        rowErrors.push("No company_id could be resolved");
      }

      // Resolve department_id
      let departmentId: string | null = null;
      if (row.department_code && resolvedCompanyId) {
        const key = `${resolvedCompanyId}|${row.department_code.toUpperCase()}`;
        departmentId = deptLookup.get(key) || null;
        if (!departmentId) {
          rowErrors.push(`Department not found: ${row.department_code}`);
        }
      } else if (!row.department_code) {
        rowErrors.push("department_code is required");
      }

      // Resolve job_id
      let jobId: string | null = null;
      if (row.job_code && resolvedCompanyId) {
        const key = `${resolvedCompanyId}|${row.job_code.toUpperCase()}`;
        jobId = jobLookup.get(key) || null;
        if (!jobId) {
          rowErrors.push(`Job not found: ${row.job_code}`);
        }
      } else if (!row.job_code) {
        rowErrors.push("job_code is required");
      }

      // Resolve reports_to_position_id (optional)
      let reportsToPositionId: string | null = null;
      if (row.reports_to_position && resolvedCompanyId) {
        const key = `${resolvedCompanyId}|${row.reports_to_position.toUpperCase()}`;
        reportsToPositionId = positionLookup.get(key) || null;
        if (!reportsToPositionId) {
          rowWarnings.push({ 
            field: "reports_to_position", 
            message: `Position not found: ${row.reports_to_position}. Field will be left empty.` 
          });
        }
      }

      // Resolve salary_grade_id (optional)
      let salaryGradeId: string | null = null;
      if (row.salary_grade_code && resolvedCompanyId) {
        const key = `${resolvedCompanyId}|${row.salary_grade_code.toUpperCase()}`;
        salaryGradeId = gradeLookup.get(key) || null;
        if (!salaryGradeId) {
          rowWarnings.push({ 
            field: "salary_grade_code", 
            message: `Salary grade not found: ${row.salary_grade_code}. Field will be left empty.` 
          });
        }
      }

      // Resolve pay_spine_id (optional)
      let paySpineId: string | null = null;
      if (row.pay_spine_code && resolvedCompanyId) {
        const key = `${resolvedCompanyId}|${row.pay_spine_code.toUpperCase()}`;
        paySpineId = spineLookup.get(key) || null;
        if (!paySpineId) {
          rowWarnings.push({ 
            field: "pay_spine_code", 
            message: `Pay spine not found: ${row.pay_spine_code}. Field will be left empty.` 
          });
        }
      }

      // Validate required fields
      if (!row.position_number) {
        rowErrors.push("position_number is required");
      }
      if (!row.title) {
        rowErrors.push("title is required");
      }

      // If there are critical errors, skip this row
      if (rowErrors.length > 0) {
        errors.push({ rowIndex: i, row, error: rowErrors.join("; ") });
        continue;
      }

      // Determine compensation model - use row value if provided, else wizard default
      const rowCompensationModel = normalizeEnum(row.compensation_model, "compensation_model") 
        || defaultCompensationModel;

      // Build transformed record
      const transformedRow: any = {
        company_id: resolvedCompanyId,
        department_id: departmentId,
        job_id: jobId,
        code: row.position_number,
        title: row.title,
        description: row.description || null,
        reports_to_position_id: reportsToPositionId,
        salary_grade_id: salaryGradeId,
        pay_spine_id: paySpineId,
        min_spinal_point: parseNumber(row.min_spinal_point),
        max_spinal_point: parseNumber(row.max_spinal_point),
        entry_spinal_point: parseNumber(row.entry_spinal_point),
        authorized_headcount: parseNumber(row.headcount, 1) || 1,
        start_date: parseDate(row.start_date) || new Date().toISOString().slice(0, 10),
        end_date: parseDate(row.end_date),
        is_active: parseBoolean(row.is_active),
        pay_type: normalizeEnum(row.pay_type, "pay_type") || "salary",
        employment_status: normalizeEnum(row.employment_status, "employment_status") || "active",
        employment_type: normalizeEnum(row.employment_type, "employment_type") || "full_time",
        employment_relation: normalizeEnum(row.employment_relation, "employment_relation") || "employee",
        flsa_status: normalizeEnum(row.flsa_status, "flsa_status") || "exempt",
        default_scheduled_hours: parseNumber(row.default_scheduled_hours),
        compensation_model: rowCompensationModel,
      };

      transformed.push(transformedRow);
      
      // Add warnings for this row
      rowWarnings.forEach((w) => {
        warnings.push({ rowIndex: i, ...w });
      });

    } catch (err: any) {
      errors.push({ rowIndex: i, row, error: err.message || "Unknown error" });
    }
  }

  return { transformed, errors, warnings };
}

export function generateFailureReport(
  errors: Array<{ rowIndex: number; row: any; error: string }>,
  warnings: Array<{ rowIndex: number; field: string; message: string }>
): string {
  const lines: string[] = [];
  
  lines.push("POSITIONS IMPORT FAILURE REPORT");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("=".repeat(60));
  lines.push("");
  
  if (errors.length > 0) {
    lines.push(`ERRORS (${errors.length} rows failed)`);
    lines.push("-".repeat(40));
    
    errors.forEach((e) => {
      const csvRow = e.rowIndex + 2; // +2 for header + 0-indexed
      lines.push(`Row ${csvRow}: ${e.error}`);
      lines.push(`  Data: position_number=${e.row.position_number || "N/A"}, company_code=${e.row.company_code || "N/A"}`);
      lines.push("");
    });
  }
  
  if (warnings.length > 0) {
    lines.push("");
    lines.push(`WARNINGS (${warnings.length} issues)`);
    lines.push("-".repeat(40));
    
    warnings.forEach((w) => {
      const csvRow = w.rowIndex + 2;
      lines.push(`Row ${csvRow}, ${w.field}: ${w.message}`);
    });
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    lines.push("No errors or warnings.");
  }
  
  return lines.join("\n");
}

import { supabase } from "@/integrations/supabase/client";

interface TransformResult {
  transformed: any[];
  errors: Array<{ rowIndex: number; row: any; error: string }>;
  warnings: Array<{ rowIndex: number; field: string; message: string }>;
}

interface EmployeeAssignmentRow {
  employee_email?: string;
  position_code?: string;
  assignment_type?: string;
  start_date?: string;
  end_date?: string;
  rate_type?: string;
  standard_hours_per_week?: string;
  pay_group_code?: string;
  spinal_point_number?: string;
  is_active?: string;
}

interface EmployeeRecord {
  id: string;
  email: string | null;
}

interface PositionRecord {
  id: string;
  code: string;
  compensation_model: string | null;
  pay_spine_id: string | null;
}

export async function transformEmployeeAssignmentsData(
  data: EmployeeAssignmentRow[],
  companyId?: string | null
): Promise<TransformResult> {
  const errors: Array<{ rowIndex: number; row: any; error: string }> = [];
  const warnings: Array<{ rowIndex: number; field: string; message: string }> = [];
  const transformed: any[] = [];

  // Build lookups using any to avoid deep type instantiation
  const { data: employees } = await (supabase as any)
    .from("profiles")
    .select("id, email");
  
  const employeeByEmail = new Map<string, string>(
    ((employees as EmployeeRecord[]) || [])
      .filter(e => e.email)
      .map((e) => [e.email!.toLowerCase(), e.id])
  );

  let positionsQuery = (supabase as any).from("positions").select("id, code, compensation_model, pay_spine_id");
  if (companyId) {
    positionsQuery = positionsQuery.eq("company_id", companyId);
  }
  const { data: positions } = await positionsQuery;
  
  const positionByCode = new Map<string, PositionRecord>(
    ((positions as PositionRecord[]) || []).map((p) => [p.code?.toLowerCase(), p])
  );

  // Pay groups lookup
  let payGroupsQuery = (supabase as any).from("pay_groups").select("id, code");
  if (companyId) {
    payGroupsQuery = payGroupsQuery.eq("company_id", companyId);
  }
  const { data: payGroups } = await payGroupsQuery;
  const payGroupByCode = new Map<string, string>(
    ((payGroups as { id: string; code: string }[]) || []).map((pg) => [pg.code?.toLowerCase(), pg.id])
  );

  // Spinal points lookup (grouped by pay_spine_id)
  const { data: spinalPoints } = await (supabase as any)
    .from("spinal_points")
    .select("id, point_number, pay_spine_id")
    .eq("is_active", true);
  
  // Map: pay_spine_id -> Map(point_number -> spinal_point_id)
  const spinalPointsBySpine = new Map<string, Map<number, string>>();
  ((spinalPoints as { id: string; point_number: number; pay_spine_id: string }[]) || []).forEach((sp) => {
    if (!spinalPointsBySpine.has(sp.pay_spine_id)) {
      spinalPointsBySpine.set(sp.pay_spine_id, new Map());
    }
    spinalPointsBySpine.get(sp.pay_spine_id)!.set(sp.point_number, sp.id);
  });

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    try {
      // Find employee by email
      let employeeId: string | undefined;
      if (row.employee_email) {
        employeeId = employeeByEmail.get(row.employee_email.toLowerCase());
      }

      if (!employeeId) {
        errors.push({
          rowIndex: i,
          row,
          error: `Employee not found: ${row.employee_email}`,
        });
        continue;
      }

      // Find position by code
      let position: PositionRecord | undefined;
      if (row.position_code) {
        position = positionByCode.get(row.position_code.toLowerCase());
      }

      if (!position) {
        errors.push({
          rowIndex: i,
          row,
          error: `Position not found: ${row.position_code}`,
        });
        continue;
      }

      // Validate start_date
      if (!row.start_date) {
        errors.push({
          rowIndex: i,
          row,
          error: "Start date is required",
        });
        continue;
      }

      // Parse assignment type
      const assignmentType = normalizeEnum(row.assignment_type, 
        ["primary", "secondary", "acting", "temporary", "concurrent"], 
        "primary"
      );

      // Parse rate type
      const rateType = normalizeEnum(row.rate_type,
        ["salaried", "hourly", "daily"],
        "salaried"
      );

      // Find pay group
      let payGroupId: string | null = null;
      if (row.pay_group_code) {
        payGroupId = payGroupByCode.get(row.pay_group_code.toLowerCase()) || null;
        if (!payGroupId) {
          warnings.push({
            rowIndex: i,
            field: "pay_group_code",
            message: `Pay group not found: ${row.pay_group_code}`,
          });
        }
      }

      // Find spinal point if position uses spinal_point model
      let spinalPointId: string | null = null;
      if (row.spinal_point_number && position.pay_spine_id) {
        const pointNumber = parseInt(row.spinal_point_number, 10);
        if (!isNaN(pointNumber)) {
          const spinePoints = spinalPointsBySpine.get(position.pay_spine_id);
          if (spinePoints) {
            spinalPointId = spinePoints.get(pointNumber) || null;
          }
          if (!spinalPointId) {
            warnings.push({
              rowIndex: i,
              field: "spinal_point_number",
              message: `Spinal point ${pointNumber} not found on position's pay spine`,
            });
          }
        }
      }

      const record: any = {
        employee_id: employeeId,
        position_id: position.id,
        assignment_type: assignmentType,
        is_primary: assignmentType === "primary",
        start_date: row.start_date,
        end_date: row.end_date || null,
        rate_type: rateType,
        standard_hours_per_week: parseNumber(row.standard_hours_per_week) || 40,
        pay_group_id: payGroupId,
        spinal_point_id: spinalPointId,
        is_active: parseBoolean(row.is_active, true),
      };

      transformed.push(record);
    } catch (error: any) {
      errors.push({
        rowIndex: i,
        row,
        error: error.message || "Unknown error during transformation",
      });
    }
  }

  return { transformed, errors, warnings };
}

function parseNumber(value: string | undefined): number | null {
  if (!value || value.trim() === "") return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function parseBoolean(value: string | undefined, defaultVal: boolean): boolean {
  if (!value || value.trim() === "") return defaultVal;
  const lower = value.toLowerCase().trim();
  return ["true", "yes", "1", "y", "active"].includes(lower);
}

function normalizeEnum(value: string | undefined, allowed: string[], defaultVal: string): string {
  if (!value || value.trim() === "") return defaultVal;
  const lower = value.toLowerCase().trim().replace(/[\s_-]+/g, "_");
  const match = allowed.find((a) => a.toLowerCase() === lower);
  return match || defaultVal;
}

export function generateEmployeeAssignmentsFailureReport(
  failures: Array<{ rowIndex: number; row: any; error: string }>,
  warnings: Array<{ rowIndex: number; field: string; message: string }>
): string {
  let report = "EMPLOYEE ASSIGNMENTS IMPORT FAILURE REPORT\n";
  report += "=" .repeat(50) + "\n\n";
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Total Failures: ${failures.length}\n`;
  report += `Total Warnings: ${warnings.length}\n\n`;

  if (failures.length > 0) {
    report += "FAILURES\n";
    report += "-".repeat(40) + "\n";
    failures.forEach((f, idx) => {
      report += `\n${idx + 1}. Row ${f.rowIndex + 2}:\n`;
      report += `   Error: ${f.error}\n`;
      report += `   Data: ${JSON.stringify(f.row)}\n`;
    });
  }

  if (warnings.length > 0) {
    report += "\n\nWARNINGS\n";
    report += "-".repeat(40) + "\n";
    warnings.forEach((w, idx) => {
      report += `${idx + 1}. Row ${w.rowIndex + 2}, Field "${w.field}": ${w.message}\n`;
    });
  }

  return report;
}

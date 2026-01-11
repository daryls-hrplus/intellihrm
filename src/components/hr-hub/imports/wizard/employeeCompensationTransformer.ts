import { supabase } from "@/integrations/supabase/client";

interface TransformResult {
  transformed: any[];
  errors: Array<{ rowIndex: number; row: any; error: string }>;
  warnings: Array<{ rowIndex: number; field: string; message: string }>;
}

interface EmployeeCompensationRow {
  employee_email?: string;
  effective_date?: string;
  compensation_type?: string;
  amount?: string;
  currency?: string;
  pay_group_code?: string;
  spinal_point_number?: string;
  position_code?: string;
  notes?: string;
}

interface EmployeeRecord {
  id: string;
  email: string | null;
}

interface EmployeePositionRecord {
  id: string;
  employee_id: string;
  position_id: string;
  position: {
    code: string;
    pay_spine_id: string | null;
  } | null;
}

export async function transformEmployeeCompensationData(
  data: EmployeeCompensationRow[],
  companyId?: string | null
): Promise<TransformResult> {
  const errors: Array<{ rowIndex: number; row: any; error: string }> = [];
  const warnings: Array<{ rowIndex: number; field: string; message: string }> = [];
  const transformed: any[] = [];

  // Build lookups
  const { data: employees } = await (supabase as any)
    .from("profiles")
    .select("id, email");
  
  const employeeByEmail = new Map<string, string>(
    ((employees as EmployeeRecord[]) || [])
      .filter(e => e.email)
      .map((e) => [e.email!.toLowerCase(), e.id])
  );

  // Get employee positions with position details
  const { data: employeePositions } = await (supabase as any)
    .from("employee_positions")
    .select("id, employee_id, position_id, position:positions(code, pay_spine_id)")
    .eq("is_active", true);

  // Map: employee_id -> Map(position_code -> employee_position record)
  const empPositionMap = new Map<string, Map<string, EmployeePositionRecord>>();
  ((employeePositions as EmployeePositionRecord[]) || []).forEach((ep) => {
    const posCode = ep.position?.code?.toLowerCase();
    if (!empPositionMap.has(ep.employee_id)) {
      empPositionMap.set(ep.employee_id, new Map());
    }
    if (posCode) {
      empPositionMap.get(ep.employee_id)!.set(posCode, ep);
    }
  });

  // Get primary positions for employees (fallback when no position_code specified)
  const employeePrimaryPosition = new Map<string, EmployeePositionRecord>();
  ((employeePositions as EmployeePositionRecord[]) || []).forEach((ep) => {
    // Just use the first one found as primary for now
    if (!employeePrimaryPosition.has(ep.employee_id)) {
      employeePrimaryPosition.set(ep.employee_id, ep);
    }
  });

  // Pay groups lookup
  let payGroupsQuery = (supabase as any).from("pay_groups").select("id, code");
  if (companyId) {
    payGroupsQuery = payGroupsQuery.eq("company_id", companyId);
  }
  const { data: payGroups } = await payGroupsQuery;
  const payGroupByCode = new Map<string, string>(
    ((payGroups as { id: string; code: string }[]) || []).map((pg) => [pg.code?.toLowerCase(), pg.id])
  );

  // Currencies lookup
  const { data: currencies } = await (supabase as any)
    .from("currencies")
    .select("id, code");
  const currencyByCode = new Map<string, string>(
    ((currencies as { id: string; code: string }[]) || []).map((c) => [c.code?.toLowerCase(), c.id])
  );

  // Spinal points lookup (grouped by pay_spine_id)
  const { data: spinalPoints } = await (supabase as any)
    .from("spinal_points")
    .select("id, point_number, pay_spine_id, salary")
    .eq("is_active", true);
  
  // Map: pay_spine_id -> Map(point_number -> { id, salary })
  const spinalPointsBySpine = new Map<string, Map<number, { id: string; salary: number }>>();
  ((spinalPoints as { id: string; point_number: number; pay_spine_id: string; salary: number }[]) || []).forEach((sp) => {
    if (!spinalPointsBySpine.has(sp.pay_spine_id)) {
      spinalPointsBySpine.set(sp.pay_spine_id, new Map());
    }
    spinalPointsBySpine.get(sp.pay_spine_id)!.set(sp.point_number, { id: sp.id, salary: sp.salary });
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

      // Validate effective_date
      if (!row.effective_date) {
        errors.push({
          rowIndex: i,
          row,
          error: "Effective date is required",
        });
        continue;
      }

      // Validate compensation type
      const compensationType = normalizeEnum(row.compensation_type, 
        ["salary", "hourly_rate", "daily_rate"], 
        "salary"
      );

      // Validate amount
      const amount = parseNumber(row.amount);
      if (amount === null || amount < 0) {
        errors.push({
          rowIndex: i,
          row,
          error: `Invalid amount: ${row.amount}`,
        });
        continue;
      }

      // Find employee position
      let employeePositionId: string | undefined;
      let paySpineId: string | null = null;

      if (row.position_code) {
        const posMap = empPositionMap.get(employeeId);
        const empPos = posMap?.get(row.position_code.toLowerCase());
        if (empPos) {
          employeePositionId = empPos.id;
          paySpineId = empPos.position?.pay_spine_id || null;
        } else {
          warnings.push({
            rowIndex: i,
            field: "position_code",
            message: `Employee not assigned to position: ${row.position_code}`,
          });
        }
      } else {
        // Use primary position
        const primaryPos = employeePrimaryPosition.get(employeeId);
        if (primaryPos) {
          employeePositionId = primaryPos.id;
          paySpineId = primaryPos.position?.pay_spine_id || null;
        }
      }

      if (!employeePositionId) {
        errors.push({
          rowIndex: i,
          row,
          error: `No position assignment found for employee: ${row.employee_email}`,
        });
        continue;
      }

      // Find currency
      let currencyId: string | null = null;
      if (row.currency) {
        currencyId = currencyByCode.get(row.currency.toLowerCase()) || null;
        if (!currencyId) {
          warnings.push({
            rowIndex: i,
            field: "currency",
            message: `Currency not found: ${row.currency}`,
          });
        }
      }

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

      // Find spinal point and derive salary if applicable
      let spinalPointId: string | null = null;
      let derivedAmount = amount;

      if (row.spinal_point_number && paySpineId) {
        const pointNumber = parseInt(row.spinal_point_number, 10);
        if (!isNaN(pointNumber)) {
          const spinePoints = spinalPointsBySpine.get(paySpineId);
          if (spinePoints) {
            const spinalPoint = spinePoints.get(pointNumber);
            if (spinalPoint) {
              spinalPointId = spinalPoint.id;
              // If amount is 0, derive from spinal point
              if (amount === 0 && spinalPoint.salary) {
                derivedAmount = spinalPoint.salary;
              }
            }
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

      // Build the update record for employee_positions
      const record: any = {
        employee_position_id: employeePositionId,
        pay_group_id: payGroupId,
        spinal_point_id: spinalPointId,
        // Store compensation details
        compensation_type: compensationType,
        amount: derivedAmount,
        currency_id: currencyId,
        effective_date: row.effective_date,
        notes: row.notes || null,
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
  const num = parseFloat(value.replace(/[,$]/g, ""));
  return isNaN(num) ? null : num;
}

function normalizeEnum(value: string | undefined, allowed: string[], defaultVal: string): string {
  if (!value || value.trim() === "") return defaultVal;
  const lower = value.toLowerCase().trim().replace(/[\s_-]+/g, "_");
  const match = allowed.find((a) => a.toLowerCase() === lower);
  return match || defaultVal;
}

export function generateEmployeeCompensationFailureReport(
  failures: Array<{ rowIndex: number; row: any; error: string }>,
  warnings: Array<{ rowIndex: number; field: string; message: string }>
): string {
  let report = "EMPLOYEE COMPENSATION IMPORT FAILURE REPORT\n";
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

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HourlyEmployeeData {
  employeeId: string;
  employeeName: string;
  rateType: 'hourly' | 'daily' | 'monthly' | 'annual';
  baseRate: number;
  currency: string;
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  regularPay: number;
  overtimePay: number;
  holidayPay: number;
  totalHoursBasedPay: number;
}

export interface OvertimeMultipliers {
  standard: number;
  weekend: number;
  holiday: number;
  night: number;
}

const DEFAULT_OVERTIME_MULTIPLIERS: OvertimeMultipliers = {
  standard: 1.5,
  weekend: 2.0,
  holiday: 2.5,
  night: 1.25
};

export function useHourlyPayrollCalculation() {
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch work records for an employee in a pay period
  const fetchEmployeeWorkRecords = useCallback(async (
    employeeId: string,
    periodStart: string,
    periodEnd: string
  ) => {
    const { data, error } = await supabase
      .from("employee_work_records")
      .select("*")
      .eq("employee_id", employeeId)
      .gte("work_date", periodStart)
      .lte("work_date", periodEnd);

    if (error) {
      console.error("Failed to fetch work records:", error);
      return [];
    }

    return data || [];
  }, []);

  // Get employee compensation details
  const getEmployeeCompensation = useCallback(async (employeeId: string) => {
    const { data, error } = await supabase
      .from("employee_compensation")
      .select(`
        *,
        pay_element:pay_elements(code, name)
      `)
      .eq("employee_id", employeeId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Failed to fetch compensation:", error);
      return null;
    }

    return data;
  }, []);

  // Get overtime multipliers from company payroll rules
  const getOvertimeMultipliers = useCallback(async (companyId: string): Promise<OvertimeMultipliers> => {
    const { data, error } = await supabase
      .from("payroll_rules")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true);

    if (error || !data || data.length === 0) {
      return DEFAULT_OVERTIME_MULTIPLIERS;
    }

    const multipliers = { ...DEFAULT_OVERTIME_MULTIPLIERS };
    
    for (const rule of data) {
      if (rule.code?.includes('weekend')) {
        multipliers.weekend = rule.weekend_multiplier || 2.0;
      } else if (rule.code?.includes('holiday')) {
        multipliers.holiday = rule.holiday_multiplier || 2.5;
      } else if (rule.code?.includes('night')) {
        multipliers.night = rule.night_multiplier || 1.25;
      } else {
        multipliers.standard = rule.overtime_multiplier || 1.5;
      }
    }

    return multipliers;
  }, []);

  // Calculate hourly rate from different pay types
  const calculateHourlyRate = (
    baseAmount: number,
    rateType: string,
    standardHoursPerWeek: number = 40,
    payFrequency: string = 'monthly'
  ): number => {
    switch (rateType?.toLowerCase()) {
      case 'hourly':
        return baseAmount;
      case 'daily':
        return baseAmount / (standardHoursPerWeek / 5); // Assume 5-day week
      case 'weekly':
        return baseAmount / standardHoursPerWeek;
      case 'bi_weekly':
      case 'fortnightly':
        return baseAmount / (standardHoursPerWeek * 2);
      case 'monthly':
        return baseAmount / ((standardHoursPerWeek * 52) / 12);
      case 'annual':
        return baseAmount / (standardHoursPerWeek * 52);
      default:
        // Default to monthly
        return baseAmount / ((standardHoursPerWeek * 52) / 12);
    }
  };

  // Calculate pay for hourly/daily employees
  const calculateHourlyPay = useCallback(async (
    employeeId: string,
    companyId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<HourlyEmployeeData | null> => {
    setIsCalculating(true);
    
    try {
      // Get work records
      const workRecords = await fetchEmployeeWorkRecords(employeeId, periodStart, periodEnd);
      
      // Get compensation
      const compensation = await getEmployeeCompensation(employeeId);
      if (!compensation) {
        return null;
      }

      // Get employee name
      const { data: employee } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", employeeId)
        .single();

      // Get overtime multipliers
      const multipliers = await getOvertimeMultipliers(companyId);

      // Calculate totals from work records
      let regularHours = 0;
      let overtimeHours = 0;
      let holidayHours = 0;

      for (const record of workRecords) {
        regularHours += record.regular_hours || 0;
        overtimeHours += record.overtime_hours || 0;
        // Holiday hours would need a separate field or day_type check
      }

      // Calculate hourly rate
      const hourlyRate = calculateHourlyRate(
        compensation.amount,
        compensation.rate_type || 'monthly',
        40, // Standard hours per week
        compensation.frequency || 'monthly'
      );

      // Calculate pay
      const regularPay = regularHours * hourlyRate;
      const overtimePay = overtimeHours * hourlyRate * multipliers.standard;
      const holidayPay = holidayHours * hourlyRate * multipliers.holiday;

      return {
        employeeId,
        employeeName: employee?.full_name || 'Unknown',
        rateType: compensation.rate_type as 'hourly' | 'daily' | 'monthly' | 'annual',
        baseRate: hourlyRate,
        currency: compensation.currency || 'USD',
        regularHours,
        overtimeHours,
        holidayHours,
        regularPay,
        overtimePay,
        holidayPay,
        totalHoursBasedPay: regularPay + overtimePay + holidayPay
      };
    } catch (error) {
      console.error("Failed to calculate hourly pay:", error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [fetchEmployeeWorkRecords, getEmployeeCompensation, getOvertimeMultipliers]);

  // Batch calculate for multiple employees
  const calculateBatchHourlyPay = useCallback(async (
    employeeIds: string[],
    companyId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<HourlyEmployeeData[]> => {
    setIsCalculating(true);
    
    try {
      const results: HourlyEmployeeData[] = [];

      for (const employeeId of employeeIds) {
        const result = await calculateHourlyPay(employeeId, companyId, periodStart, periodEnd);
        if (result) {
          results.push(result);
        }
      }

      return results;
    } finally {
      setIsCalculating(false);
    }
  }, [calculateHourlyPay]);

  // Check if employee is hourly-based
  const isHourlyEmployee = useCallback(async (employeeId: string): Promise<boolean> => {
    const compensation = await getEmployeeCompensation(employeeId);
    if (!compensation) return false;
    
    const hourlyTypes = ['hourly', 'daily'];
    return hourlyTypes.includes(compensation.rate_type?.toLowerCase() || '');
  }, [getEmployeeCompensation]);

  return {
    isCalculating,
    calculateHourlyPay,
    calculateBatchHourlyPay,
    calculateHourlyRate,
    isHourlyEmployee,
    fetchEmployeeWorkRecords,
    getOvertimeMultipliers
  };
}

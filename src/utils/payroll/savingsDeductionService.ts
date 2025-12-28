/**
 * Savings Program Payroll Integration Service
 * 
 * This service calculates savings program deductions for employees during payroll processing.
 * It fetches active enrollments, calculates contribution amounts, and generates transactions.
 */

import { supabase } from "@/integrations/supabase/client";

export interface SavingsEnrollment {
  id: string;
  employee_id: string;
  program_type_id: string;
  contribution_amount: number | null;
  contribution_percentage: number | null;
  status: string;
  program_type: {
    id: string;
    code: string;
    name: string;
    category: string;
    calculation_method: string;
    default_amount: number | null;
    default_percentage: number | null;
    has_employer_match: boolean;
    employer_match_percentage: number | null;
    employer_match_cap: number | null;
    is_pretax: boolean;
    deduction_priority: number;
  };
}

export interface SavingsDeductionResult {
  enrollment_id: string;
  program_code: string;
  program_name: string;
  category: string;
  employee_amount: number;
  employer_amount: number;
  is_pretax: boolean;
  deduction_priority: number;
}

export interface EmployeeSavingsDeductions {
  employee_id: string;
  total_employee_deductions: number;
  total_employer_contributions: number;
  total_pretax_deductions: number;
  total_posttax_deductions: number;
  deductions: SavingsDeductionResult[];
}

/**
 * Fetch active savings enrollments for an employee
 */
export async function fetchActiveSavingsEnrollments(
  employeeId: string,
  companyId: string,
  asOfDate: string
): Promise<SavingsEnrollment[]> {
  const { data, error } = await supabase
    .from("savings_enrollments")
    .select(`
      id,
      employee_id,
      program_type_id,
      contribution_amount,
      contribution_percentage,
      status,
      program_type:savings_program_types!savings_enrollments_program_type_id_fkey(
        id,
        code,
        name,
        category,
        calculation_method,
        default_amount,
        default_percentage,
        has_employer_match,
        employer_match_percentage,
        employer_match_cap,
        is_pretax,
        deduction_priority
      )
    `)
    .eq("employee_id", employeeId)
    .eq("company_id", companyId)
    .eq("status", "active")
    .lte("effective_start_date", asOfDate)
    .or(`end_date.is.null,end_date.gte.${asOfDate}`);

  if (error) {
    console.error("Error fetching savings enrollments:", error);
    return [];
  }

  // Filter out enrollments where the program type is not active
  return (data || []).filter((enrollment: any) => {
    const program = enrollment.program_type;
    return program && program.is_active !== false;
  }) as SavingsEnrollment[];
}

/**
 * Calculate savings deductions for an employee based on their active enrollments
 */
export function calculateSavingsDeductions(
  enrollments: SavingsEnrollment[],
  grossPay: number
): EmployeeSavingsDeductions {
  const deductions: SavingsDeductionResult[] = [];
  let totalEmployeeDeductions = 0;
  let totalEmployerContributions = 0;
  let totalPretaxDeductions = 0;
  let totalPosttaxDeductions = 0;

  for (const enrollment of enrollments) {
    const program = enrollment.program_type;
    if (!program) continue;

    let employeeAmount = 0;
    let employerAmount = 0;

    // Calculate employee contribution
    const calculationMethod = program.calculation_method;
    
    if (calculationMethod === "fixed") {
      // Use enrollment-specific amount if set, otherwise use program default
      employeeAmount = enrollment.contribution_amount ?? program.default_amount ?? 0;
    } else if (calculationMethod === "percentage") {
      // Use enrollment-specific percentage if set, otherwise use program default
      const percentage = enrollment.contribution_percentage ?? program.default_percentage ?? 0;
      employeeAmount = grossPay * (percentage / 100);
    }

    // Calculate employer match if applicable
    if (program.has_employer_match && employeeAmount > 0) {
      const matchPercentage = program.employer_match_percentage ?? 0;
      let matchAmount = employeeAmount * (matchPercentage / 100);
      
      // Apply cap if set
      if (program.employer_match_cap && matchAmount > program.employer_match_cap) {
        matchAmount = program.employer_match_cap;
      }
      
      employerAmount = matchAmount;
    }

    if (employeeAmount > 0 || employerAmount > 0) {
      deductions.push({
        enrollment_id: enrollment.id,
        program_code: program.code,
        program_name: program.name,
        category: program.category,
        employee_amount: Math.round(employeeAmount * 100) / 100,
        employer_amount: Math.round(employerAmount * 100) / 100,
        is_pretax: program.is_pretax,
        deduction_priority: program.deduction_priority,
      });

      totalEmployeeDeductions += employeeAmount;
      totalEmployerContributions += employerAmount;

      if (program.is_pretax) {
        totalPretaxDeductions += employeeAmount;
      } else {
        totalPosttaxDeductions += employeeAmount;
      }
    }
  }

  // Sort by deduction priority
  deductions.sort((a, b) => a.deduction_priority - b.deduction_priority);

  return {
    employee_id: enrollments[0]?.employee_id ?? "",
    total_employee_deductions: Math.round(totalEmployeeDeductions * 100) / 100,
    total_employer_contributions: Math.round(totalEmployerContributions * 100) / 100,
    total_pretax_deductions: Math.round(totalPretaxDeductions * 100) / 100,
    total_posttax_deductions: Math.round(totalPosttaxDeductions * 100) / 100,
    deductions,
  };
}

/**
 * Calculate savings deductions for all employees in a payroll run
 */
export async function calculatePayrollSavingsDeductions(
  employeeIds: string[],
  companyId: string,
  asOfDate: string,
  employeeGrossPay: Map<string, number>
): Promise<Map<string, EmployeeSavingsDeductions>> {
  const results = new Map<string, EmployeeSavingsDeductions>();

  for (const employeeId of employeeIds) {
    const enrollments = await fetchActiveSavingsEnrollments(employeeId, companyId, asOfDate);
    
    if (enrollments.length === 0) {
      continue;
    }

    const grossPay = employeeGrossPay.get(employeeId) ?? 0;
    const deductions = calculateSavingsDeductions(enrollments, grossPay);
    
    if (deductions.deductions.length > 0) {
      results.set(employeeId, deductions);
    }
  }

  return results;
}

/**
 * Create savings transactions for a completed payroll run
 */
export async function createSavingsTransactions(
  payrollRunId: string,
  payPeriodId: string,
  companyId: string,
  employeePayrollMap: Map<string, string>, // employee_id -> employee_payroll_id
  savingsDeductions: Map<string, EmployeeSavingsDeductions>,
  processedBy: string
): Promise<{ success: boolean; transactionCount: number; error?: string }> {
  const transactions: any[] = [];
  const now = new Date().toISOString();

  for (const [employeeId, deductions] of savingsDeductions) {
    const employeePayrollId = employeePayrollMap.get(employeeId);
    
    for (const deduction of deductions.deductions) {
      // Employee contribution transaction
      if (deduction.employee_amount > 0) {
        transactions.push({
          company_id: companyId,
          enrollment_id: deduction.enrollment_id,
          employee_id: employeeId,
          transaction_type: "contribution",
          amount: deduction.employee_amount,
          source: "payroll",
          payroll_run_id: payrollRunId,
          pay_period_id: payPeriodId,
          employee_payroll_id: employeePayrollId || null,
          status: "completed",
          processed_at: now,
          processed_by: processedBy,
          notes: `Payroll deduction - ${deduction.program_name}`,
        });
      }

      // Employer match transaction
      if (deduction.employer_amount > 0) {
        transactions.push({
          company_id: companyId,
          enrollment_id: deduction.enrollment_id,
          employee_id: employeeId,
          transaction_type: "employer_match",
          amount: deduction.employer_amount,
          source: "payroll",
          payroll_run_id: payrollRunId,
          pay_period_id: payPeriodId,
          employee_payroll_id: employeePayrollId || null,
          status: "completed",
          processed_at: now,
          processed_by: processedBy,
          notes: `Employer match - ${deduction.program_name}`,
        });
      }
    }
  }

  if (transactions.length === 0) {
    return { success: true, transactionCount: 0 };
  }

  const { error } = await supabase
    .from("savings_transactions")
    .insert(transactions);

  if (error) {
    console.error("Error creating savings transactions:", error);
    return { success: false, transactionCount: 0, error: error.message };
  }

  return { success: true, transactionCount: transactions.length };
}

/**
 * Reverse savings transactions for a voided/cancelled payroll run
 */
export async function reverseSavingsTransactions(
  payrollRunId: string,
  reversedBy: string
): Promise<{ success: boolean; reversedCount: number; error?: string }> {
  // Fetch existing transactions for this payroll run
  const { data: existingTransactions, error: fetchError } = await supabase
    .from("savings_transactions")
    .select("id, enrollment_id, employee_id, amount, transaction_type, company_id")
    .eq("payroll_run_id", payrollRunId)
    .eq("status", "completed");

  if (fetchError) {
    return { success: false, reversedCount: 0, error: fetchError.message };
  }

  if (!existingTransactions || existingTransactions.length === 0) {
    return { success: true, reversedCount: 0 };
  }

  // Create reversal transactions
  const now = new Date().toISOString();
  const reversalTransactions = existingTransactions.map((tx: any) => ({
    company_id: tx.company_id,
    enrollment_id: tx.enrollment_id,
    employee_id: tx.employee_id,
    transaction_type: "reversal",
    amount: -tx.amount,
    source: "payroll_reversal",
    payroll_run_id: payrollRunId,
    status: "completed",
    processed_at: now,
    processed_by: reversedBy,
    notes: `Reversal of transaction ${tx.id}`,
  }));

  const { error: insertError } = await supabase
    .from("savings_transactions")
    .insert(reversalTransactions);

  if (insertError) {
    return { success: false, reversedCount: 0, error: insertError.message };
  }

  // Mark original transactions as reversed
  const { error: updateError } = await supabase
    .from("savings_transactions")
    .update({ status: "reversed" })
    .eq("payroll_run_id", payrollRunId)
    .eq("status", "completed");

  if (updateError) {
    console.error("Warning: Could not mark original transactions as reversed:", updateError);
  }

  return { success: true, reversedCount: reversalTransactions.length };
}

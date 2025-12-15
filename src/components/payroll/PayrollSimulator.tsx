import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, RefreshCw } from "lucide-react";

interface PayrollSimulatorProps {
  companyId: string;
  employeeId: string;
  payPeriodId: string;
}

interface SimulationResult {
  employee: {
    name: string;
    employee_id: string;
    position: string;
  };
  salary: {
    base_salary: number;
    hourly_rate: number;
    currency: string;
    frequency: string;
  };
  earnings: {
    regular_hours: number;
    overtime_hours: number;
    regular_pay: number;
    overtime_pay: number;
    additional_comp: Array<{ name: string; amount: number }>;
    allowances: Array<{ name: string; amount: number; is_taxable: boolean; is_bik: boolean }>;
    total_gross: number;
  };
  deductions: {
    pretax: Array<{ name: string; amount: number; type: string }>;
    taxes: { income_tax: number; social_security: number; medicare: number };
    posttax: Array<{ name: string; amount: number; type: string }>;
    total_deductions: number;
  };
  net_pay: number;
  rules_applied: Array<{ name: string; type: string; multiplier: number }>;
}

export function PayrollSimulator({ companyId, employeeId, payPeriodId }: PayrollSimulatorProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const runSimulation = async () => {
    setIsCalculating(true);
    
    try {
      // Fetch employee info
      const { data: employee } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', employeeId)
        .single();

      // Fetch employee position with compensation
      const { data: positionData } = await supabase
        .from('employee_positions')
        .select(`
          compensation_amount,
          compensation_currency,
          compensation_frequency,
          positions (title, standard_hours, standard_work_period)
        `)
        .eq('employee_id', employeeId)
        .eq('is_primary', true)
        .eq('is_active', true)
        .maybeSingle();

      // Fetch additional employee compensation
      const { data: employeeComp } = await supabase
        .from('employee_compensation')
        .select(`
          amount,
          currency,
          frequency,
          pay_elements (name, code, element_type)
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      // Fetch work records with periods
      const { data: workRecords } = await supabase
        .from('employee_work_records')
        .select(`
          *,
          payroll_rules(name, rule_type, overtime_multiplier, weekend_multiplier, holiday_multiplier)
        `)
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId);

      // Fetch allowances
      const { data: allowances } = await supabase
        .from('employee_period_allowances')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId);

      // Fetch deductions
      const { data: deductions } = await supabase
        .from('employee_period_deductions')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('pay_period_id', payPeriodId);

      // Fetch pay period info for period-based calculations
      const { data: payPeriod } = await supabase
        .from('pay_periods')
        .select('period_start, period_end, pay_groups(pay_frequency)')
        .eq('id', payPeriodId)
        .single();

      // Calculate hourly rate from position compensation
      const posComp = positionData?.compensation_amount || 0;
      const posFreq = positionData?.compensation_frequency || 'monthly';
      const standardHours = (positionData?.positions as any)?.standard_hours || 40;
      
      // Convert salary to hourly rate based on frequency
      // Assuming standard work periods per year
      const hoursPerYear = standardHours * 52; // 52 weeks
      let annualSalary = posComp;
      
      switch (posFreq) {
        case 'monthly':
          annualSalary = posComp * 12;
          break;
        case 'biweekly':
        case 'fortnightly':
          annualSalary = posComp * 26;
          break;
        case 'weekly':
          annualSalary = posComp * 52;
          break;
        case 'annual':
          annualSalary = posComp;
          break;
      }
      
      const hourlyRate = hoursPerYear > 0 ? annualSalary / hoursPerYear : 0;

      // Calculate period-based base salary (for salaried employees)
      const payFrequency = (payPeriod?.pay_groups as any)?.pay_frequency || 'monthly';
      let periodBaseSalary = posComp;
      
      // Adjust base salary to match pay period frequency
      if (posFreq !== payFrequency) {
        switch (payFrequency) {
          case 'monthly':
            periodBaseSalary = annualSalary / 12;
            break;
          case 'biweekly':
          case 'fortnightly':
            periodBaseSalary = annualSalary / 26;
            break;
          case 'weekly':
            periodBaseSalary = annualSalary / 52;
            break;
          case 'semimonthly':
            periodBaseSalary = annualSalary / 24;
            break;
        }
      }

      // Calculate totals from work records
      const regularHours = (workRecords || []).reduce((sum, r) => sum + (r.regular_hours || 0), 0);
      const overtimeHours = (workRecords || []).reduce((sum, r) => sum + (r.overtime_hours || 0), 0);
      
      // Use base salary for regular pay, hourly rate for overtime
      const regularPay = periodBaseSalary;
      const overtimePay = overtimeHours * hourlyRate * 1.5;

      // Process additional compensation items (convert to period amount)
      const additionalCompList = (employeeComp || []).map(c => {
        let periodAmount = c.amount || 0;
        const freq = c.frequency || 'monthly';
        
        // Convert to pay period frequency
        if (freq !== payFrequency) {
          let annualAmount = periodAmount;
          switch (freq) {
            case 'monthly': annualAmount = periodAmount * 12; break;
            case 'biweekly': annualAmount = periodAmount * 26; break;
            case 'weekly': annualAmount = periodAmount * 52; break;
            case 'annual': annualAmount = periodAmount; break;
          }
          
          switch (payFrequency) {
            case 'monthly': periodAmount = annualAmount / 12; break;
            case 'biweekly': periodAmount = annualAmount / 26; break;
            case 'weekly': periodAmount = annualAmount / 52; break;
            case 'semimonthly': periodAmount = annualAmount / 24; break;
          }
        }
        
        return {
          name: (c.pay_elements as any)?.name || 'Additional Compensation',
          amount: periodAmount
        };
      });

      const totalAdditionalComp = additionalCompList.reduce((sum, c) => sum + c.amount, 0);

      const allowanceList = (allowances || []).map(a => ({
        name: a.allowance_name,
        amount: a.amount,
        is_taxable: a.is_taxable,
        is_bik: a.is_benefit_in_kind
      }));

      const totalAllowances = allowanceList.reduce((sum, a) => sum + a.amount, 0);
      const totalGross = regularPay + overtimePay + totalAdditionalComp + totalAllowances;

      // Calculate deductions
      const pretaxDeductions = (deductions || [])
        .filter(d => d.is_pretax)
        .map(d => ({ name: d.deduction_name, amount: d.amount, type: d.deduction_type || 'other' }));
      
      const posttaxDeductions = (deductions || [])
        .filter(d => !d.is_pretax)
        .map(d => ({ name: d.deduction_name, amount: d.amount, type: d.deduction_type || 'other' }));

      const totalPretax = pretaxDeductions.reduce((sum, d) => sum + d.amount, 0);
      const taxableIncome = totalGross - totalPretax;

      // Simulate taxes (simplified)
      const incomeTax = taxableIncome * 0.22;
      const socialSecurity = Math.min(taxableIncome * 0.062, 9932.40);
      const medicare = taxableIncome * 0.0145;

      const totalPosttax = posttaxDeductions.reduce((sum, d) => sum + d.amount, 0);
      const totalDeductions = totalPretax + incomeTax + socialSecurity + medicare + totalPosttax;
      const netPay = totalGross - totalDeductions;

      // Collect unique rules applied
      const rulesApplied = new Map();
      (workRecords || []).forEach(r => {
        if (r.payroll_rules) {
          rulesApplied.set(r.payroll_rules.name, {
            name: r.payroll_rules.name,
            type: r.payroll_rules.rule_type,
            multiplier: r.payroll_rules.overtime_multiplier
          });
        }
      });

      setResult({
        employee: {
          name: employee?.full_name || 'N/A',
          employee_id: employeeId.slice(0, 8).toUpperCase(),
          position: (positionData?.positions as any)?.title || 'N/A'
        },
        salary: {
          base_salary: periodBaseSalary,
          hourly_rate: hourlyRate,
          currency: positionData?.compensation_currency || 'USD',
          frequency: payFrequency
        },
        earnings: {
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          regular_pay: regularPay,
          overtime_pay: overtimePay,
          additional_comp: additionalCompList,
          allowances: allowanceList,
          total_gross: totalGross
        },
        deductions: {
          pretax: pretaxDeductions,
          taxes: {
            income_tax: incomeTax,
            social_security: socialSecurity,
            medicare: medicare
          },
          posttax: posttaxDeductions,
          total_deductions: totalDeductions
        },
        net_pay: netPay,
        rules_applied: Array.from(rulesApplied.values())
      });

      toast.success("Payroll simulation complete");
    } catch (error) {
      toast.error("Failed to run simulation");
    }
    
    setIsCalculating(false);
  };

  useEffect(() => {
    runSimulation();
  }, [employeeId, payPeriodId]);

  if (!result) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Employee Info */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Employee</p>
          <p className="font-medium">{result.employee.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Employee ID</p>
          <p className="font-medium">{result.employee.employee_id}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Position</p>
          <p className="font-medium">{result.employee.position}</p>
        </div>
      </div>

      {/* Rules Applied */}
      {result.rules_applied.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Rules Applied</h4>
          <div className="flex gap-2 flex-wrap">
            {result.rules_applied.map((rule, idx) => (
              <Badge key={idx} variant="outline">
                {rule.name} ({rule.type}) - {rule.multiplier}x OT
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Salary Info */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Base Salary</p>
            <p className="font-semibold">${result.salary.base_salary.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Hourly Rate</p>
            <p className="font-semibold">${result.salary.hourly_rate.toFixed(2)}/hr</p>
          </div>
          <div>
            <p className="text-muted-foreground">Currency</p>
            <p className="font-semibold">{result.salary.currency}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pay Frequency</p>
            <p className="font-semibold capitalize">{result.salary.frequency}</p>
          </div>
        </div>
      </div>

      {/* Earnings */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Earnings</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Base Salary ({result.salary.frequency})</TableCell>
                <TableCell className="text-right">${result.earnings.regular_pay.toFixed(2)}</TableCell>
              </TableRow>
              {result.earnings.overtime_hours > 0 && (
                <TableRow>
                  <TableCell>Overtime ({result.earnings.overtime_hours}h @ ${result.salary.hourly_rate.toFixed(2)} × 1.5)</TableCell>
                  <TableCell className="text-right">${result.earnings.overtime_pay.toFixed(2)}</TableCell>
                </TableRow>
              )}
              {result.earnings.additional_comp.map((comp, idx) => (
                <TableRow key={`comp-${idx}`}>
                  <TableCell>{comp.name}</TableCell>
                  <TableCell className="text-right">${comp.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {result.earnings.allowances.map((allowance, idx) => (
                <TableRow key={`allow-${idx}`}>
                  <TableCell className="flex items-center gap-2">
                    {allowance.name}
                    {allowance.is_bik && <Badge variant="secondary" className="text-xs">BIK</Badge>}
                    {!allowance.is_taxable && <Badge variant="outline" className="text-xs">Non-taxable</Badge>}
                  </TableCell>
                  <TableCell className="text-right">${allowance.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-medium bg-muted/50">
                <TableCell>Total Gross Pay</TableCell>
                <TableCell className="text-right">${result.earnings.total_gross.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Deductions</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <Table>
            <TableBody>
              {result.deductions.pretax.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-muted-foreground font-medium">
                      Pre-tax Deductions
                    </TableCell>
                  </TableRow>
                  {result.deductions.pretax.map((d, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">{d.name}</TableCell>
                      <TableCell className="text-right text-destructive">-${d.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              
              <TableRow>
                <TableCell colSpan={2} className="text-sm text-muted-foreground font-medium">
                  Taxes
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Federal Income Tax</TableCell>
                <TableCell className="text-right text-destructive">-${result.deductions.taxes.income_tax.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Social Security</TableCell>
                <TableCell className="text-right text-destructive">-${result.deductions.taxes.social_security.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Medicare</TableCell>
                <TableCell className="text-right text-destructive">-${result.deductions.taxes.medicare.toFixed(2)}</TableCell>
              </TableRow>

              {result.deductions.posttax.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-muted-foreground font-medium">
                      Post-tax Deductions
                    </TableCell>
                  </TableRow>
                  {result.deductions.posttax.map((d, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">{d.name}</TableCell>
                      <TableCell className="text-right text-destructive">-${d.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              <TableRow className="font-medium bg-muted/50">
                <TableCell>Total Deductions</TableCell>
                <TableCell className="text-right text-destructive">-${result.deductions.total_deductions.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Net Pay */}
      <div className="p-4 bg-primary/10 rounded-lg flex justify-between items-center">
        <span className="text-lg font-medium">Net Pay</span>
        <span className="text-2xl font-bold text-primary">${result.net_pay.toFixed(2)}</span>
      </div>

      <Button onClick={runSimulation} disabled={isCalculating} className="w-full gap-2">
        <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
        Recalculate
      </Button>
    </div>
  );
}

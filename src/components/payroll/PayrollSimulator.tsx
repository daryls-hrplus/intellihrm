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
  earnings: {
    regular_hours: number;
    overtime_hours: number;
    regular_pay: number;
    overtime_pay: number;
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

      // Fetch employee position
      const { data: positions } = await supabase
        .from('employee_positions')
        .select('position:positions(title)')
        .eq('employee_id', employeeId)
        .eq('is_primary', true)
        .limit(1);

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

      // Calculate totals
      const regularHours = (workRecords || []).reduce((sum, r) => sum + (r.regular_hours || 0), 0);
      const overtimeHours = (workRecords || []).reduce((sum, r) => sum + (r.overtime_hours || 0), 0);
      
      // Assume hourly rate for simulation (would normally come from position compensation)
      const hourlyRate = 25; // Default for simulation
      const regularPay = regularHours * hourlyRate;
      const overtimePay = overtimeHours * hourlyRate * 1.5;

      const allowanceList = (allowances || []).map(a => ({
        name: a.allowance_name,
        amount: a.amount,
        is_taxable: a.is_taxable,
        is_bik: a.is_benefit_in_kind
      }));

      const totalAllowances = allowanceList.reduce((sum, a) => sum + a.amount, 0);
      const totalGross = regularPay + overtimePay + totalAllowances;

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
          position: (positions?.[0]?.position as { title: string } | null)?.title || 'N/A'
        },
        earnings: {
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          regular_pay: regularPay,
          overtime_pay: overtimePay,
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

      {/* Earnings */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Earnings</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Regular Hours ({result.earnings.regular_hours}h)</TableCell>
                <TableCell className="text-right">${result.earnings.regular_pay.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Overtime Hours ({result.earnings.overtime_hours}h @ 1.5x)</TableCell>
                <TableCell className="text-right">${result.earnings.overtime_pay.toFixed(2)}</TableCell>
              </TableRow>
              {result.earnings.allowances.map((allowance, idx) => (
                <TableRow key={idx}>
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

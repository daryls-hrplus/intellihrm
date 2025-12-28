import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGLCalculation } from "@/hooks/useGLCalculation";
import { BookOpen, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SimulationResultData {
  earnings?: {
    total_gross?: number;
    regular_pay?: number;
    overtime_pay?: number;
    additional_comp?: Array<{ amount: number }>;
    allowances?: Array<{ amount: number }>;
  };
  deductions?: {
    total_deductions?: number;
    statutory?: Array<{ 
      employee_amount: number; 
      employer_amount: number;
      code: string;
    }>;
    pretax?: Array<{ amount: number; type?: string }>;
    posttax?: Array<{ amount: number; type?: string }>;
  };
  net_pay?: number;
}

interface GLSimulationPreviewProps {
  companyId: string;
  employeeId?: string;
  payPeriodId?: string;
  payGroupId?: string;
  simulationResult?: SimulationResultData | null;
}

export function GLSimulationPreview({ 
  companyId, 
  employeeId,
  payPeriodId,
  payGroupId,
  simulationResult 
}: GLSimulationPreviewProps) {
  const { t } = useTranslation();
  const { simulateEmployeeGL, isSimulating } = useGLCalculation();
  const [result, setResult] = useState<any>(null);

  // Build simulation data from payroll simulation result
  const buildSimulationData = () => {
    if (!simulationResult) return null;

    const grossPay = simulationResult.earnings?.total_gross || 0;
    const netPay = simulationResult.net_pay || 0;
    
    // Calculate tax deductions from statutory
    const taxDeductions = (simulationResult.deductions?.statutory || [])
      .filter(s => ['PAYE', 'income_tax'].includes(s.code))
      .reduce((sum, s) => sum + s.employee_amount, 0);
    
    // Calculate benefit deductions from statutory (non-tax items like NIS, health)
    const benefitDeductions = (simulationResult.deductions?.statutory || [])
      .filter(s => !['PAYE', 'income_tax'].includes(s.code))
      .reduce((sum, s) => sum + s.employee_amount, 0);
    
    // Employer taxes
    const employerTaxes = (simulationResult.deductions?.statutory || [])
      .filter(s => ['PAYE', 'income_tax'].includes(s.code))
      .reduce((sum, s) => sum + s.employer_amount, 0);
    
    // Employer benefits (NIS, health employer portions)
    const employerBenefits = (simulationResult.deductions?.statutory || [])
      .filter(s => !['PAYE', 'income_tax'].includes(s.code))
      .reduce((sum, s) => sum + s.employer_amount, 0);
    
    // Retirement/pension from pretax deductions
    const employerRetirement = (simulationResult.deductions?.pretax || [])
      .filter(d => d.type?.toLowerCase().includes('retirement') || d.type?.toLowerCase().includes('pension'))
      .reduce((sum, d) => sum + d.amount, 0);
    
    // Savings deductions
    const savingsEmployeeTotal = (simulationResult.deductions?.pretax || [])
      .filter(d => d.type?.toLowerCase().includes('savings'))
      .reduce((sum, d) => sum + d.amount, 0);
    
    const savingsEmployerTotal = 0; // Would need employer match data

    return {
      grossPay,
      netPay,
      taxDeductions,
      benefitDeductions,
      employerTaxes,
      employerBenefits,
      employerRetirement,
      savingsEmployeeTotal,
      savingsEmployerTotal
    };
  };

  const handleSimulate = async () => {
    const simData = buildSimulationData();
    if (!simData) {
      return;
    }
    const simResult = await simulateEmployeeGL(companyId, simData);
    setResult(simResult);
  };

  // Auto-run simulation when simulation result changes
  useEffect(() => {
    if (simulationResult) {
      handleSimulate();
    }
  }, [simulationResult]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (!simulationResult) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>{t('payroll.gl.runSimulationFirst', 'Run payroll simulation first to preview GL entries')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!result && !isSimulating && (
        <div className="text-center py-4">
          <p className="text-muted-foreground mb-4">
            {t('payroll.gl.simulationDesc', 'Preview how this payroll would be routed to GL accounts')}
          </p>
          <Button onClick={handleSimulate} disabled={isSimulating}>
            <BookOpen className="h-4 w-4 mr-2" />
            {t('payroll.gl.simulateGL', 'Simulate GL Entries')}
          </Button>
        </div>
      )}

      {isSimulating && (
        <div className="text-center py-4">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">{t('common.loading', 'Loading...')}</p>
        </div>
      )}

      {result && !isSimulating && (
        <>
          {result.warnings?.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {result.warnings.map((w: string, i: number) => (
                  <div key={i}>{w}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {result.entries?.length === 0 ? (
            <Alert>
              <AlertDescription>
                {t('payroll.gl.noMappings', 'No GL mappings configured. Set up mappings in GL Interface → Account Mappings.')}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-500/10 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Total Debits</div>
                  <div className="text-lg font-bold text-green-600">{formatCurrency(result.totalDebits || 0)}</div>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border">
                  <div className="text-sm text-muted-foreground">Total Credits</div>
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(result.totalCredits || 0)}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg border">
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="text-lg font-bold flex items-center justify-center gap-1">
                    {result.isBalanced ? (
                      <><CheckCircle2 className="h-4 w-4 text-green-600" /> OK</>
                    ) : (
                      <><AlertTriangle className="h-4 w-4 text-destructive" /> {formatCurrency(Math.abs((result.totalDebits || 0) - (result.totalCredits || 0)))}</>
                    )}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="w-16">Type</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>GL String</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead>Override Rule</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(result.entries || []).map((entry: any) => (
                      <TableRow key={entry.entryNumber}>
                        <TableCell className="font-mono text-sm">{entry.entryNumber}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={entry.entryType === 'debit' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {entry.entryType === 'debit' ? 'DR' : 'CR'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <div>{entry.accountCode}</div>
                          <div className="text-xs text-muted-foreground">{entry.accountName}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-primary">
                          {entry.composedGLString || '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {entry.entryType === 'debit' ? formatCurrency(entry.amount) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {entry.entryType === 'credit' ? formatCurrency(entry.amount) : '-'}
                        </TableCell>
                        <TableCell>
                          {entry.overrideRuleApplied ? (
                            <Badge variant="outline" className="text-xs">{entry.overrideRuleApplied}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">Default</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleSimulate} disabled={isSimulating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSimulating ? 'animate-spin' : ''}`} />
              {t('common.refresh', 'Refresh')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
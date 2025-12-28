import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGLCalculation } from "@/hooks/useGLCalculation";
import { BookOpen, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GLSimulationPreviewProps {
  companyId: string;
  simulationData: {
    grossPay: number;
    netPay: number;
    taxDeductions: number;
    benefitDeductions: number;
    employerTaxes: number;
    employerBenefits: number;
    employerRetirement: number;
    savingsEmployeeTotal: number;
    savingsEmployerTotal: number;
  };
}

export function GLSimulationPreview({ companyId, simulationData }: GLSimulationPreviewProps) {
  const { t } = useTranslation();
  const { simulateEmployeeGL, isSimulating } = useGLCalculation();
  const [result, setResult] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSimulate = async () => {
    const simResult = await simulateEmployeeGL(companyId, simulationData);
    setResult(simResult);
    setIsExpanded(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t('payroll.gl.simulationPreview', 'GL Simulation Preview')}
              </div>
              <div className="flex items-center gap-2">
                {result && (
                  <Badge variant={result.isBalanced ? "default" : "destructive"}>
                    {result.isBalanced ? "Balanced" : "Unbalanced"}
                  </Badge>
                )}
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {!result && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  {t('payroll.gl.simulationDesc', 'Preview how this payroll would be routed to GL accounts')}
                </p>
                <Button onClick={handleSimulate} disabled={isSimulating}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {isSimulating ? t('common.loading', 'Loading...') : t('payroll.gl.simulateGL', 'Simulate GL Entries')}
                </Button>
              </div>
            )}

            {result && (
              <>
                {result.warnings.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {result.warnings.map((w: string, i: number) => (
                        <div key={i}>{w}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}

                {result.entries.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      {t('payroll.gl.noMappings', 'No GL mappings configured. Set up mappings in GL Interface → Account Mappings.')}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Debits</div>
                        <div className="text-lg font-bold text-green-600">{formatCurrency(result.totalDebits)}</div>
                      </div>
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Credits</div>
                        <div className="text-lg font-bold text-blue-600">{formatCurrency(result.totalCredits)}</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Balance</div>
                        <div className="text-lg font-bold flex items-center justify-center gap-1">
                          {result.isBalanced ? (
                            <><CheckCircle2 className="h-4 w-4 text-green-600" /> OK</>
                          ) : (
                            <><AlertTriangle className="h-4 w-4 text-destructive" /> {formatCurrency(Math.abs(result.totalDebits - result.totalCredits))}</>
                          )}
                        </div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead>GL String</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                          <TableHead>Override</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.entries.map((entry: any) => (
                          <TableRow key={entry.entryNumber}>
                            <TableCell className="font-mono">{entry.entryNumber}</TableCell>
                            <TableCell>
                              <Badge variant={entry.entryType === 'debit' ? 'outline' : 'secondary'}>
                                {entry.entryType.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {entry.accountCode} - {entry.accountName}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              {entry.composedGLString}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {entry.entryType === 'debit' ? formatCurrency(entry.amount) : '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {entry.entryType === 'credit' ? formatCurrency(entry.amount) : '-'}
                            </TableCell>
                            <TableCell>
                              {entry.overrideRuleApplied ? (
                                <Badge variant="outline" className="text-xs">{entry.overrideRuleApplied}</Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={handleSimulate} disabled={isSimulating}>
                    {t('common.refresh', 'Refresh')}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Loader2, Play, Calculator, FileText, CheckCircle, 
  AlertTriangle, Users, DollarSign, Clock, Stamp,
  RefreshCw, Eye, Download
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PayrollRunEmployee {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_number: string;
  department: string;
  gross_pay: number;
  net_pay: number;
  total_deductions: number;
  isr: number;
  imss_employee: number;
  cfdi_status: 'pending' | 'stamped' | 'error' | 'not_generated';
  cfdi_uuid: string | null;
  included: boolean;
  calculation_status: 'pending' | 'calculated' | 'error';
  error_message?: string;
}

interface PayrollRun {
  id: string;
  run_number: string;
  status: string;
  pay_period_start: string;
  pay_period_end: string;
  payment_date: string | null;
  employee_count: number;
  total_gross_pay: number;
  total_net_pay: number;
  total_deductions: number;
  total_taxes: number;
  cfdi_generated_count: number;
  cfdi_stamped_count: number;
}

interface MexicanPayrollRunProps {
  companyId: string;
  payrollRunId?: string;
  onComplete?: () => void;
}

type WorkflowStep = 'select' | 'calculate' | 'review' | 'generate_cfdi' | 'stamp' | 'complete';

const WORKFLOW_STEPS: { key: WorkflowStep; label: string; icon: React.ReactNode }[] = [
  { key: 'select', label: 'Select Employees', icon: <Users className="h-4 w-4" /> },
  { key: 'calculate', label: 'Calculate Payroll', icon: <Calculator className="h-4 w-4" /> },
  { key: 'review', label: 'Review & Approve', icon: <Eye className="h-4 w-4" /> },
  { key: 'generate_cfdi', label: 'Generate CFDIs', icon: <FileText className="h-4 w-4" /> },
  { key: 'stamp', label: 'Stamp CFDIs', icon: <Stamp className="h-4 w-4" /> },
  { key: 'complete', label: 'Complete', icon: <CheckCircle className="h-4 w-4" /> },
];

export function MexicanPayrollRun({ companyId, payrollRunId, onComplete }: MexicanPayrollRunProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('select');
  const [employees, setEmployees] = useState<PayrollRunEmployee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; employee: PayrollRunEmployee | null }>({ open: false, employee: null });
  const { toast } = useToast();

  useEffect(() => {
    loadPayrollData();
  }, [companyId, payrollRunId]);

  const loadPayrollData = async () => {
    setIsLoading(true);
    try {
      // Load employees
      const { data: employeesData, error: empError } = await supabase
        .from('profiles')
        .select('id, full_name, department_id, email, employment_status')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (empError) throw empError;

      // Get Mexican employee data
      const { data: mxData } = await supabase
        .from('mx_employee_data')
        .select('*');

      const mxDataMap = new Map((mxData || []).map((d: Record<string, unknown>) => [d.employee_id as string, d]));

      // Get departments
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name');
      
      const deptMap = new Map((deptData || []).map(d => [d.id, d.name]));

      // If we have a payroll run ID, load existing calculations
      let existingCalculations: Record<string, unknown>[] = [];
      if (payrollRunId) {
        const { data: runData } = await supabase
          .from('payroll_runs')
          .select('*')
          .eq('id', payrollRunId)
          .single();

        if (runData) {
          setPayrollRun({
            id: runData.id,
            run_number: runData.run_number || '',
            status: runData.status,
            pay_period_start: runData.created_at,
            pay_period_end: runData.created_at,
            payment_date: runData.payment_date,
            employee_count: runData.employee_count || 0,
            total_gross_pay: Number(runData.total_gross_pay) || 0,
            total_net_pay: Number(runData.total_net_pay) || 0,
            total_deductions: Number(runData.total_deductions) || 0,
            total_taxes: Number(runData.total_taxes) || 0,
            cfdi_generated_count: 0,
            cfdi_stamped_count: 0
          });

          // Determine current step based on status
          if (runData.status === 'draft') setCurrentStep('select');
          else if (runData.status === 'calculated') setCurrentStep('review');
          else if (runData.status === 'approved') setCurrentStep('generate_cfdi');
          else if (runData.status === 'cfdi_generated') setCurrentStep('stamp');
          else if (runData.status === 'completed') setCurrentStep('complete');
        }

        const { data: calcData } = await supabase
          .from('payroll_run_employees')
          .select('*')
          .eq('payroll_run_id', payrollRunId);
        
        existingCalculations = calcData || [];
      }

      const calcMap = new Map(existingCalculations.map((c: Record<string, unknown>) => [c.employee_id as string, c]));

      const mappedEmployees: PayrollRunEmployee[] = (employeesData || []).map((emp) => {
        const mxInfo = mxDataMap.get(emp.id);
        const calc = calcMap.get(emp.id) as Record<string, unknown> | undefined;

        return {
          id: emp.id,
          employee_id: emp.id,
          employee_name: emp.full_name || emp.email || 'Unknown',
          employee_number: emp.id.substring(0, 8),
          department: deptMap.get(emp.department_id || '') || '-',
          gross_pay: calc ? Number(calc.gross_pay || 0) : 0,
          net_pay: calc ? Number(calc.net_pay || 0) : 0,
          total_deductions: calc ? Number(calc.total_deductions || 0) : 0,
          isr: 0,
          imss_employee: 0,
          cfdi_status: 'not_generated',
          cfdi_uuid: null,
          included: calc ? Boolean(calc.included) : !!mxInfo,
          calculation_status: calc ? 'calculated' : 'pending',
        };
      });

      setEmployees(mappedEmployees);
      setSelectedEmployees(new Set(mappedEmployees.filter(e => e.included).map(e => e.id)));
    } catch (error) {
      console.error('Error loading payroll data:', error);
      toast({
        title: 'Error loading data',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(new Set(employees.map(e => e.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const calculatePayroll = async () => {
    if (selectedEmployees.size === 0) {
      toast({
        title: 'No employees selected',
        description: 'Please select at least one employee',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Initializing payroll calculation...');

    try {
      const selectedList = employees.filter(e => selectedEmployees.has(e.id));
      const total = selectedList.length;
      let processed = 0;

      const updatedEmployees = [...employees];

      for (const emp of selectedList) {
        setProcessingMessage(`Calculating payroll for ${emp.employee_name}...`);
        
        try {
          const { data, error } = await supabase.functions.invoke('mx-payroll-calculate', {
            body: { 
              employeeId: emp.employee_id, 
              companyId,
              grossPay: 15000, // This would come from salary data
              period: 'biweekly'
            }
          });

          if (error) throw error;

          const idx = updatedEmployees.findIndex(e => e.id === emp.id);
          if (idx !== -1 && data) {
            updatedEmployees[idx] = {
              ...updatedEmployees[idx],
              gross_pay: data.grossPay || 0,
              net_pay: data.netPay || 0,
              total_deductions: data.totalDeductions || 0,
              isr: data.isr?.netTax || 0,
              imss_employee: data.imss?.employeeTotal || 0,
              calculation_status: 'calculated'
            };
          }
        } catch (calcError) {
          console.error(`Error calculating for ${emp.employee_name}:`, calcError);
          const idx = updatedEmployees.findIndex(e => e.id === emp.id);
          if (idx !== -1) {
            updatedEmployees[idx] = {
              ...updatedEmployees[idx],
              calculation_status: 'error',
              error_message: calcError instanceof Error ? calcError.message : 'Calculation failed'
            };
          }
        }

        processed++;
        setProcessingProgress((processed / total) * 100);
      }

      setEmployees(updatedEmployees);
      
      // Update totals
      const calculated = updatedEmployees.filter(e => e.calculation_status === 'calculated');
      const totals = calculated.reduce((acc, e) => ({
        gross: acc.gross + e.gross_pay,
        net: acc.net + e.net_pay,
        deductions: acc.deductions + e.total_deductions
      }), { gross: 0, net: 0, deductions: 0 });

      setPayrollRun(prev => prev ? {
        ...prev,
        total_gross_pay: totals.gross,
        total_net_pay: totals.net,
        total_deductions: totals.deductions,
        employee_count: calculated.length
      } : null);

      setCurrentStep('review');
      toast({
        title: 'Calculation complete',
        description: `Calculated payroll for ${calculated.length} employees`
      });
    } catch (error) {
      toast({
        title: 'Calculation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingMessage('');
    }
  };

  const generateCFDIs = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Generating CFDI records...');

    try {
      const calculatedEmployees = employees.filter(
        e => selectedEmployees.has(e.id) && e.calculation_status === 'calculated'
      );
      const total = calculatedEmployees.length;
      let processed = 0;

      const updatedEmployees = [...employees];

      for (const emp of calculatedEmployees) {
        setProcessingMessage(`Generating CFDI for ${emp.employee_name}...`);
        
        try {
          // Use edge function to create CFDI record
          const { data, error } = await supabase.functions.invoke('mx-cfdi-create', {
            body: {
              payrollRunId: payrollRun?.id || null,
              companyId,
              employeeId: emp.employee_id,
              folio: `${payrollRun?.run_number || 'MX'}-${emp.employee_number}`,
              serie: 'NOM'
            }
          });

          if (error) throw error;
          if (!data?.success) throw new Error(data?.error || 'Failed to create CFDI');

          const empIdx = updatedEmployees.findIndex(e => e.id === emp.id);
          if (empIdx !== -1) {
            updatedEmployees[empIdx] = {
              ...updatedEmployees[empIdx],
              cfdi_status: 'pending'
            };
          }

          const idx = updatedEmployees.findIndex(e => e.id === emp.id);
          if (idx !== -1) {
            updatedEmployees[idx] = {
              ...updatedEmployees[idx],
              cfdi_status: 'pending'
            };
          }
        } catch (genError) {
          console.error(`Error generating CFDI for ${emp.employee_name}:`, genError);
          const idx = updatedEmployees.findIndex(e => e.id === emp.id);
          if (idx !== -1) {
            updatedEmployees[idx] = {
              ...updatedEmployees[idx],
              cfdi_status: 'error'
            };
          }
        }

        processed++;
        setProcessingProgress((processed / total) * 100);
      }

      setEmployees(updatedEmployees);
      setCurrentStep('stamp');
      
      const generated = updatedEmployees.filter(e => e.cfdi_status === 'pending');
      toast({
        title: 'CFDIs generated',
        description: `Generated ${generated.length} CFDI records ready for stamping`
      });
    } catch (error) {
      toast({
        title: 'CFDI generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingMessage('');
    }
  };

  const stampAllCFDIs = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Stamping CFDIs with PAC...');

    try {
      const pendingCFDIs = employees.filter(e => e.cfdi_status === 'pending');
      const total = pendingCFDIs.length;
      let processed = 0;
      let stampedCount = 0;

      const updatedEmployees = [...employees];

      for (const emp of pendingCFDIs) {
        setProcessingMessage(`Stamping CFDI for ${emp.employee_name}...`);
        
        try {
          // Get the CFDI record ID and stamp via edge function
          const { data: cfdiData, error: findError } = await supabase.functions.invoke('mx-cfdi-find-pending', {
            body: { employeeId: emp.employee_id, companyId }
          });

          if (findError) throw findError;

          if (cfdiData?.cfdiRecordId) {
            const { data, error } = await supabase.functions.invoke('mx-cfdi-stamp', {
              body: { cfdiRecordId: cfdiData.cfdiRecordId, companyId }
            });

            if (error) throw error;

            if (data?.success) {
              const idx = updatedEmployees.findIndex(e => e.id === emp.id);
              if (idx !== -1) {
                updatedEmployees[idx] = {
                  ...updatedEmployees[idx],
                  cfdi_status: 'stamped',
                  cfdi_uuid: data.uuid
                };
              }
              stampedCount++;
            }
          }
        } catch (stampError) {
          console.error(`Error stamping CFDI for ${emp.employee_name}:`, stampError);
          const idx = updatedEmployees.findIndex(e => e.id === emp.id);
          if (idx !== -1) {
            updatedEmployees[idx] = {
              ...updatedEmployees[idx],
              cfdi_status: 'error'
            };
          }
        }

        processed++;
        setProcessingProgress((processed / total) * 100);
      }

      setEmployees(updatedEmployees);
      
      if (stampedCount === total) {
        setCurrentStep('complete');
        toast({
          title: 'All CFDIs stamped',
          description: `Successfully stamped ${stampedCount} CFDIs`
        });
      } else {
        toast({
          title: 'Stamping completed with errors',
          description: `Stamped ${stampedCount} of ${total} CFDIs`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Stamping failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingMessage('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const getStepIndex = (step: WorkflowStep) => WORKFLOW_STEPS.findIndex(s => s.key === step);
  const currentStepIndex = getStepIndex(currentStep);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  index < currentStepIndex 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : index === currentStepIndex 
                      ? 'border-primary text-primary' 
                      : 'border-muted text-muted-foreground'
                }`}>
                  {index < currentStepIndex ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing Overlay */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">{processingMessage}</span>
              </div>
              <Progress value={processingProgress} />
              <p className="text-sm text-muted-foreground">
                {Math.round(processingProgress)}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedEmployees.size}</div>
            <p className="text-xs text-muted-foreground">of {employees.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Gross Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(employees.filter(e => selectedEmployees.has(e.id)).reduce((sum, e) => sum + e.gross_pay, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Net Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(employees.filter(e => selectedEmployees.has(e.id)).reduce((sum, e) => sum + e.net_pay, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CFDIs Stamped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(e => e.cfdi_status === 'stamped').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {employees.filter(e => e.cfdi_status !== 'not_generated').length} generated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {currentStep === 'select' && 'Select Employees for Payroll'}
                {currentStep === 'calculate' && 'Calculating Payroll'}
                {currentStep === 'review' && 'Review Calculations'}
                {currentStep === 'generate_cfdi' && 'Generate CFDI Records'}
                {currentStep === 'stamp' && 'Stamp CFDIs'}
                {currentStep === 'complete' && 'Payroll Complete'}
              </CardTitle>
              <CardDescription>
                {currentStep === 'select' && 'Choose which employees to include in this payroll run'}
                {currentStep === 'review' && 'Review calculated amounts before generating CFDIs'}
                {currentStep === 'stamp' && 'Send CFDIs to PAC for stamping'}
                {currentStep === 'complete' && 'All CFDIs have been stamped and payroll is complete'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {currentStep === 'select' && (
                <Button onClick={calculatePayroll} disabled={isProcessing || selectedEmployees.size === 0}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Payroll
                </Button>
              )}
              {currentStep === 'review' && (
                <Button onClick={generateCFDIs} disabled={isProcessing}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate CFDIs
                </Button>
              )}
              {currentStep === 'stamp' && (
                <Button onClick={stampAllCFDIs} disabled={isProcessing}>
                  <Stamp className="h-4 w-4 mr-2" />
                  Stamp All CFDIs
                </Button>
              )}
              {currentStep === 'complete' && (
                <Button onClick={onComplete}>
                  <Download className="h-4 w-4 mr-2" />
                  Export & Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {currentStep === 'select' && (
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedEmployees.size === employees.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Gross Pay</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id} className={!selectedEmployees.has(emp.id) ? 'opacity-50' : ''}>
                  {currentStep === 'select' && (
                    <TableCell>
                      <Checkbox 
                        checked={selectedEmployees.has(emp.id)}
                        onCheckedChange={(checked) => handleSelectEmployee(emp.id, !!checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div>
                      <div className="font-medium">{emp.employee_name}</div>
                      <div className="text-sm text-muted-foreground">{emp.employee_number}</div>
                    </div>
                  </TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell className="text-right">{formatCurrency(emp.gross_pay)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(emp.total_deductions)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(emp.net_pay)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {emp.calculation_status === 'pending' && (
                        <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                      )}
                      {emp.calculation_status === 'calculated' && emp.cfdi_status === 'not_generated' && (
                        <Badge variant="secondary"><Calculator className="h-3 w-3 mr-1" />Calculated</Badge>
                      )}
                      {emp.cfdi_status === 'pending' && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          <FileText className="h-3 w-3 mr-1" />CFDI Pending
                        </Badge>
                      )}
                      {emp.cfdi_status === 'stamped' && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />Stamped
                        </Badge>
                      )}
                      {(emp.calculation_status === 'error' || emp.cfdi_status === 'error') && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />Error
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDetailDialog({ open: true, employee: emp })}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employee Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => !open && setDetailDialog({ open: false, employee: null })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailDialog.employee?.employee_name}</DialogTitle>
            <DialogDescription>
              Employee #{detailDialog.employee?.employee_number}
            </DialogDescription>
          </DialogHeader>
          
          {detailDialog.employee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Pay</p>
                  <p className="text-lg font-semibold">{formatCurrency(detailDialog.employee.gross_pay)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Pay</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(detailDialog.employee.net_pay)}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Deductions</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ISR (Income Tax)</span>
                    <span className="text-sm">{formatCurrency(detailDialog.employee.isr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">IMSS (Employee)</span>
                    <span className="text-sm">{formatCurrency(detailDialog.employee.imss_employee)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(detailDialog.employee.total_deductions)}</span>
                  </div>
                </div>
              </div>

              {detailDialog.employee.cfdi_uuid && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">CFDI Information</p>
                  <p className="text-xs font-mono bg-muted p-2 rounded">{detailDialog.employee.cfdi_uuid}</p>
                </div>
              )}

              {detailDialog.employee.error_message && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-destructive mb-2">Error</p>
                  <p className="text-sm text-muted-foreground">{detailDialog.employee.error_message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

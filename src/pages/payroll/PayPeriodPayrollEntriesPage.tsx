import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { WorkRecordsSection } from "@/components/payroll/WorkRecordsSection";
import { AllowancesSection } from "@/components/payroll/AllowancesSection";
import { DeductionsSection } from "@/components/payroll/DeductionsSection";
import { RegularDeductionsSection } from "@/components/payroll/RegularDeductionsSection";
import { PayrollSimulator } from "@/components/payroll/PayrollSimulator";
import { SalarySummarySection } from "@/components/payroll/SalarySummarySection";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface Company {
  id: string;
  name: string;
}

interface PayGroup {
  id: string;
  name: string;
  pay_frequency: string;
}

interface PayPeriod {
  id: string;
  period_number: string;
  period_start: string;
  period_end: string;
  pay_date: string;
}

interface Employee {
  id: string;
  full_name: string;
  positions: EmployeePosition[];
}

interface EmployeePosition {
  id: string;
  position_id: string;
  position_title: string;
  compensation_amount: number | null;
  compensation_currency: string | null;
  compensation_frequency: string | null;
  is_primary: boolean;
}

export default function PayPeriodPayrollEntriesPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [payGroups, setPayGroups] = useState<PayGroup[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedPayGroup, setSelectedPayGroup] = useState<string>("");
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  
  const [showSimulator, setShowSimulator] = useState(false);
  const [deductionsKey, setDeductionsKey] = useState(0);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadPayGroups();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedPayGroup) {
      loadPayPeriods();
      loadEmployees();
    } else {
      setEmployees([]);
      setSelectedEmployee("");
    }
  }, [selectedPayGroup]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error(t("payroll.salaryOvertime.failedToLoadCompanies"));
      return;
    }
    setCompanies(data || []);
  };

  const loadPayGroups = async () => {
    const { data, error } = await supabase
      .from('pay_groups')
      .select('id, name, pay_frequency')
      .eq('company_id', selectedCompany)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error(t("payroll.salaryOvertime.failedToLoadPayGroups"));
      return;
    }
    setPayGroups(data || []);
  };

  const loadPayPeriods = async () => {
    const { data, error } = await supabase
      .from('pay_periods')
      .select('id, period_number, period_start, period_end, pay_date')
      .eq('pay_group_id', selectedPayGroup)
      .order('period_number', { ascending: false });
    
    if (error) {
      toast.error(t("payroll.salaryOvertime.failedToLoadPayPeriods"));
      return;
    }
    setPayPeriods(data || []);
  };

  const loadEmployees = async () => {
    if (!selectedPayGroup) {
      setEmployees([]);
      return;
    }

    // Query employee_positions for the selected pay group
    const { data: positionsData, error: posError } = await supabase
      .from('employee_positions')
      .select(`
        id,
        employee_id,
        position_id,
        compensation_amount,
        compensation_currency,
        compensation_frequency,
        is_primary,
        positions (title),
        profiles!employee_positions_employee_id_fkey (id, full_name)
      `)
      .eq('pay_group_id', selectedPayGroup)
      .eq('is_active', true);

    if (posError) {
      console.error('Error loading employees:', posError);
      toast.error(t("payroll.salaryOvertime.failedToLoadEmployees"));
      return;
    }

    // Group positions by employee
    const employeeMap = new Map<string, Employee>();
    
    (positionsData || []).forEach((pos: any) => {
      const employeeId = pos.profiles?.id;
      const employeeName = pos.profiles?.full_name || 'Unknown';
      
      if (!employeeId) return;

      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          id: employeeId,
          full_name: employeeName,
          positions: []
        });
      }

      employeeMap.get(employeeId)!.positions.push({
        id: pos.id,
        position_id: pos.position_id,
        position_title: (pos.positions as any)?.title || 'N/A',
        compensation_amount: pos.compensation_amount,
        compensation_currency: pos.compensation_currency,
        compensation_frequency: pos.compensation_frequency,
        is_primary: pos.is_primary
      });
    });

    // Sort by name
    const employeeList = Array.from(employeeMap.values())
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
    
    setEmployees(employeeList);
  };

  const handleRegularDeductionsApplied = () => {
    // Refresh the deductions section
    setDeductionsKey(prev => prev + 1);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.payroll"), href: "/payroll" },
            { label: "Pay Period Payroll Entries" },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pay Period Payroll Entries</h1>
            <p className="text-muted-foreground">Manage compensation, allowances, and deductions for a pay period</p>
          </div>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("payroll.salaryOvertime.selectEmployeePayPeriod")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t("payroll.salaryOvertime.company")}</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.salaryOvertime.selectCompany")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.salaryOvertime.payGroup")}</Label>
              <Select 
                value={selectedPayGroup} 
                onValueChange={setSelectedPayGroup}
                disabled={!selectedCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.salaryOvertime.selectPayGroup")} />
                </SelectTrigger>
                <SelectContent>
                  {payGroups.map((pg) => (
                    <SelectItem key={pg.id} value={pg.id}>
                      {pg.name} ({pg.pay_frequency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.salaryOvertime.payPeriod")}</Label>
              <Select 
                value={selectedPayPeriod} 
                onValueChange={setSelectedPayPeriod}
                disabled={!selectedPayGroup}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.salaryOvertime.selectPayPeriod")} />
                </SelectTrigger>
                <SelectContent>
                  {payPeriods.map((pp) => (
                    <SelectItem key={pp.id} value={pp.id}>
                      {t("payroll.salaryOvertime.cycle")} {pp.period_number}: {format(parseISO(pp.period_start), 'MMM d')} - {format(parseISO(pp.period_end), 'MMM d, yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.salaryOvertime.employee")}</Label>
              <Select 
                value={selectedEmployee} 
                onValueChange={setSelectedEmployee}
                disabled={!selectedCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.salaryOvertime.selectEmployee")} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEmployee && selectedPayPeriod && (
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowSimulator(true)} className="gap-2">
                <Calculator className="h-4 w-4" />
                {t("payroll.salaryOvertime.simulatePayrollCalculation")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEmployee && selectedPayPeriod && (
        <>
          {/* Salary Summary Section - Shows all positions in the pay group */}
          <SalarySummarySection 
            companyId={selectedCompany}
            employeeId={selectedEmployee}
            payGroupId={selectedPayGroup}
            payPeriodId={selectedPayPeriod}
          />

          {/* Work Records Section */}
          <WorkRecordsSection 
            companyId={selectedCompany}
            employeeId={selectedEmployee}
            payPeriodId={selectedPayPeriod}
            payGroupId={selectedPayGroup}
          />

          {/* Allowances Section */}
          <AllowancesSection 
            companyId={selectedCompany}
            employeeId={selectedEmployee}
            payPeriodId={selectedPayPeriod}
          />

          {/* Regular Deductions Section - Pull from employee setup */}
          <RegularDeductionsSection 
            companyId={selectedCompany}
            employeeId={selectedEmployee}
            payPeriodId={selectedPayPeriod}
            onApplyDeductions={handleRegularDeductionsApplied}
          />

          {/* Period-Specific Deductions Section */}
          <DeductionsSection 
            key={deductionsKey}
            companyId={selectedCompany}
            employeeId={selectedEmployee}
            payPeriodId={selectedPayPeriod}
          />
        </>
      )}

      {/* Payroll Simulator Dialog */}
      <Dialog open={showSimulator} onOpenChange={setShowSimulator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("payroll.salaryOvertime.payrollCalculationSimulation")}</DialogTitle>
          </DialogHeader>
          {selectedEmployee && selectedPayPeriod && (
            <PayrollSimulator 
              companyId={selectedCompany}
              employeeId={selectedEmployee}
              payPeriodId={selectedPayPeriod}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
}

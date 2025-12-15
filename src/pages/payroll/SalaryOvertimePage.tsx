import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, Plus, Clock, DollarSign, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { WorkRecordsSection } from "@/components/payroll/WorkRecordsSection";
import { AllowancesSection } from "@/components/payroll/AllowancesSection";
import { DeductionsSection } from "@/components/payroll/DeductionsSection";
import { PayrollSimulator } from "@/components/payroll/PayrollSimulator";
import { useTranslation } from "react-i18next";

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
}

export default function SalaryOvertimePage() {
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

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadPayGroups();
      loadEmployees();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedPayGroup) {
      loadPayPeriods();
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
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', selectedCompany)
      .order('full_name');
    
    if (error) {
      toast.error(t("payroll.salaryOvertime.failedToLoadEmployees"));
      return;
    }
    setEmployees(data || []);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("payroll.salaryOvertime.title")}</h1>
          <p className="text-muted-foreground">
            {t("payroll.salaryOvertime.subtitle")}
          </p>
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
          {/* Work Records Section */}
          <WorkRecordsSection 
            companyId={selectedCompany}
            employeeId={selectedEmployee}
            payPeriodId={selectedPayPeriod}
          />

          {/* Allowances Section */}
          <AllowancesSection 
            companyId={selectedCompany}
            employeeId={selectedEmployee}
            payPeriodId={selectedPayPeriod}
          />

          {/* Deductions Section */}
          <DeductionsSection 
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
  );
}

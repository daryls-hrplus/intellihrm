import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  Users, 
  FileText, 
  Play, 
  FileSpreadsheet,
  Flag,
  AlertCircle,
  Calculator,
  BarChart3,
  Calendar,
  Edit,
  User,
  GitCompare,
  History,
  Settings
} from "lucide-react";
import {
  MexicanCompanySetup,
  MexicanEmployeeData,
  CFDIDashboard,
  MexicanPayrollRun,
  SUAIDSEGenerator,
  MexicanBenefitsCalculator,
  INFONAVITManager,
  FONACOTManager,
  MexicanAnnualISR,
  TaxCertificates,
  MexicanPayrollAnalytics,
  ComplianceCalendar,
  PayrollAdjustments,
  EmployeeSelfService,
  MultiPeriodComparison,
  AuditTrail,
  PACIntegration
} from "@/components/payroll/mexico";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
}

export default function MexicoPayrollPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("company");

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchEmployees(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name, code')
      .order('name');
    if (data) {
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const fetchEmployees = async (companyId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('company_id', companyId)
      .order('full_name');
    if (data) {
      setEmployees(data);
      if (data.length > 0) {
        setSelectedEmployeeId(data[0].id);
      } else {
        setSelectedEmployeeId("");
      }
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Mexico" }
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Flag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mexico Payroll</h1>
              <p className="text-muted-foreground">
                Complete Mexican payroll management with CFDI, IMSS, and SAT compliance
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <span className="text-lg">🇲🇽</span>
            MX
          </Badge>
        </div>

        {/* Company and Employee Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Select Context</CardTitle>
            <CardDescription>Choose the company and employee for Mexico payroll operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} ({company.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employee (for Employee Data tab)</Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name || emp.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedCompanyId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a company to access Mexico payroll features.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="company" className="gap-1">
                <Building2 className="h-4 w-4" />
                <span className="hidden md:inline">Company</span>
              </TabsTrigger>
              <TabsTrigger value="employees" className="gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Employees</span>
              </TabsTrigger>
              <TabsTrigger value="payroll-run" className="gap-1">
                <Play className="h-4 w-4" />
                <span className="hidden md:inline">Run</span>
              </TabsTrigger>
              <TabsTrigger value="cfdi" className="gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">CFDI</span>
              </TabsTrigger>
              <TabsTrigger value="sua-idse" className="gap-1">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden md:inline">SUA</span>
              </TabsTrigger>
              <TabsTrigger value="benefits" className="gap-1">
                🎁
                <span className="hidden md:inline">Benefits</span>
              </TabsTrigger>
              <TabsTrigger value="infonavit" className="gap-1">
                🏠
                <span className="hidden md:inline">INFONAVIT</span>
              </TabsTrigger>
              <TabsTrigger value="fonacot" className="gap-1">
                💳
                <span className="hidden md:inline">FONACOT</span>
              </TabsTrigger>
              <TabsTrigger value="annual-isr" className="gap-1">
                <Calculator className="h-4 w-4" />
                <span className="hidden md:inline">Annual ISR</span>
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-1">
                📄
                <span className="hidden md:inline">Certificates</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="adjustments" className="gap-1">
                <Edit className="h-4 w-4" />
                <span className="hidden md:inline">Adjustments</span>
              </TabsTrigger>
              <TabsTrigger value="self-service" className="gap-1">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Self-Service</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-1">
                <GitCompare className="h-4 w-4" />
                <span className="hidden md:inline">Compare</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-1">
                <History className="h-4 w-4" />
                <span className="hidden md:inline">Audit</span>
              </TabsTrigger>
              <TabsTrigger value="pac" className="gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">PAC</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company">
              <MexicanCompanySetup companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="employees">
              {selectedEmployeeId ? (
                <MexicanEmployeeData employeeId={selectedEmployeeId} />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select an employee to view or edit their Mexican tax data.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="payroll-run">
              <MexicanPayrollRun companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="cfdi">
              <CFDIDashboard companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="sua-idse">
              <SUAIDSEGenerator />
            </TabsContent>

            <TabsContent value="benefits">
              <MexicanBenefitsCalculator companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="infonavit">
              <INFONAVITManager companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="fonacot">
              <FONACOTManager companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="annual-isr">
              <MexicanAnnualISR companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="certificates">
              <TaxCertificates companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="analytics">
              <MexicanPayrollAnalytics companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="calendar">
              <ComplianceCalendar companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="adjustments">
              <PayrollAdjustments companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="self-service">
              {selectedEmployeeId ? (
                <EmployeeSelfService employeeId={selectedEmployeeId} />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select an employee to view their self-service portal.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="comparison">
              <MultiPeriodComparison companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="audit">
              <AuditTrail companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="pac">
              <PACIntegration companyId={selectedCompanyId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Download, FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { getTodayString } from "@/utils/dateUtils";

export default function BenefitComplianceReportsPage() {
  const { t } = useTranslation();
  const { logExport } = useAuditLog();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [complianceData, setComplianceData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchComplianceData();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
  };

  const fetchComplianceData = async () => {
    setIsLoading(true);
    try {
      // Fetch enrollments with plan details
      const { data: enrollments } = await supabase
        .from("benefit_enrollments")
        .select(`
          *,
          employee:profiles(full_name, email),
          plan:benefit_plans(*, category:benefit_categories(*))
        `)
        .eq("status", "active");

      // Filter by company
      const companyEnrollments = (enrollments || []).filter(
        (e: any) => e.plan?.company_id === selectedCompany
      );

      // Fetch employees
      const { data: employees } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("company_id", selectedCompany);

      // Fetch plans
      const { data: plans } = await supabase
        .from("benefit_plans")
        .select("*")
        .eq("company_id", selectedCompany)
        .eq("is_active", true);

      // Calculate compliance metrics
      const totalEmployees = employees?.length || 0;
      const enrolledEmployees = new Set(companyEnrollments.map((e: any) => e.employee_id)).size;
      const coverageRate = totalEmployees > 0 ? (enrolledEmployees / totalEmployees) * 100 : 0;

      // Check for required benefits coverage
      const healthPlans = (plans || []).filter((p: any) => p.plan_type === "health");
      const hasHealthCoverage = healthPlans.length > 0;

      // Check for employees without coverage
      const enrolledIds = new Set(companyEnrollments.map((e: any) => e.employee_id));
      const uncoveredEmployees = (employees || []).filter((e: any) => !enrolledIds.has(e.id));

      // Check for expired enrollments
      const today = getTodayString();
      const expiredEnrollments = companyEnrollments.filter(
        (e: any) => e.termination_date && e.termination_date < today
      );

      // Build compliance issues
      const issues = [];
      if (!hasHealthCoverage) {
        issues.push({ type: "warning", message: "No active health insurance plans configured" });
      }
      if (uncoveredEmployees.length > 0) {
        issues.push({ 
          type: "info", 
          message: `${uncoveredEmployees.length} employee(s) have no benefit enrollments` 
        });
      }
      if (expiredEnrollments.length > 0) {
        issues.push({ 
          type: "warning", 
          message: `${expiredEnrollments.length} enrollment(s) need termination processing` 
        });
      }
      if (coverageRate >= 95) {
        issues.push({ type: "success", message: "Excellent benefit coverage rate (95%+)" });
      }

      setComplianceData({
        totalEmployees,
        enrolledEmployees,
        coverageRate,
        totalPlans: plans?.length || 0,
        activeEnrollments: companyEnrollments.length,
        uncoveredEmployees,
        issues,
        enrollmentsByType: groupBy(companyEnrollments, (e: any) => e.plan?.category?.category_type || "Other")
      });

    } catch (error) {
      console.error("Error fetching compliance data:", error);
      toast.error("Failed to load compliance data");
    } finally {
      setIsLoading(false);
    }
  };

  const groupBy = (array: any[], keyFn: (item: any) => string) => {
    return array.reduce((result, item) => {
      const key = keyFn(item);
      (result[key] = result[key] || []).push(item);
      return result;
    }, {});
  };

  const exportReport = async (reportType: string) => {
    try {
      const company = companies.find(c => c.id === selectedCompany);
      const rows: string[] = [];
      
      if (reportType === "coverage") {
        rows.push("Employee,Email,Has Coverage,Plans Enrolled");
        const { data: employees } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("company_id", selectedCompany);
        
        const { data: enrollments } = await supabase
          .from("benefit_enrollments")
          .select("employee_id, plan:benefit_plans(name)")
          .eq("status", "active");

        const enrollmentMap: Record<string, string[]> = {};
        (enrollments || []).forEach((e: any) => {
          if (!enrollmentMap[e.employee_id]) {
            enrollmentMap[e.employee_id] = [];
          }
          enrollmentMap[e.employee_id].push(e.plan?.name || "Unknown");
        });

        (employees || []).forEach((emp: any) => {
          const plans = enrollmentMap[emp.id] || [];
          rows.push(`"${emp.full_name}","${emp.email}","${plans.length > 0 ? 'Yes' : 'No'}","${plans.join('; ')}"`);
        });
      } else if (reportType === "summary") {
        rows.push("Metric,Value");
        rows.push(`Total Employees,${complianceData.totalEmployees}`);
        rows.push(`Enrolled Employees,${complianceData.enrolledEmployees}`);
        rows.push(`Coverage Rate,${complianceData.coverageRate?.toFixed(1)}%`);
        rows.push(`Active Plans,${complianceData.totalPlans}`);
        rows.push(`Active Enrollments,${complianceData.activeEnrollments}`);
      }

      const csv = rows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `benefit_${reportType}_report_${company?.name || "company"}_${getTodayString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      await logExport("benefit_compliance_report", { reportType, company: company?.name });
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Benefits", href: "/benefits" },
          { label: "Compliance Reports" }
        ]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compliance Reports</h1>
            <p className="text-muted-foreground">Benefits compliance monitoring and reporting</p>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {complianceData.issues?.map((issue: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {issue.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {issue.type === "warning" && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                {issue.type === "info" && <FileText className="h-5 w-5 text-blue-500" />}
                <span>{issue.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Coverage Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complianceData.coverageRate?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {complianceData.enrolledEmployees || 0} of {complianceData.totalEmployees || 0} employees
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complianceData.totalPlans || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complianceData.activeEnrollments || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Uncovered Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {complianceData.uncoveredEmployees?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Report</CardTitle>
              <CardDescription>
                Detailed employee benefit coverage status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => exportReport("coverage")} className="w-full">
                <Download className="h-4 w-4 mr-2" /> Export Coverage Report
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Summary Report</CardTitle>
              <CardDescription>
                High-level compliance metrics summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => exportReport("summary")} className="w-full">
                <Download className="h-4 w-4 mr-2" /> Export Summary Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Uncovered Employees */}
        {complianceData.uncoveredEmployees?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Employees Without Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceData.uncoveredEmployees.map((emp: any) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.full_name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">No Coverage</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Enrollment by Type */}
        {complianceData.enrollmentsByType && Object.keys(complianceData.enrollmentsByType).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Enrollments by Benefit Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Benefit Type</TableHead>
                    <TableHead>Enrollments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(complianceData.enrollmentsByType).map(([type, enrollments]: [string, any]) => (
                    <TableRow key={type}>
                      <TableCell className="font-medium">{type}</TableCell>
                      <TableCell>{enrollments.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

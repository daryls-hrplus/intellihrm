import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Calendar, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function OpenEnrollmentTrackerPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [enrollmentPeriods, setEnrollmentPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [enrollmentStats, setEnrollmentStats] = useState<any>({});
  const [employeeStatus, setEmployeeStatus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchEnrollmentPeriods();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedPeriod) {
      fetchEnrollmentProgress();
    }
  }, [selectedPeriod]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
  };

  const fetchEnrollmentPeriods = async () => {
    const { data } = await supabase
      .from("benefit_enrollment_periods")
      .select("*")
      .eq("company_id", selectedCompany)
      .order("start_date", { ascending: false });
    
    setEnrollmentPeriods(data || []);
    if (data && data.length > 0) {
      setSelectedPeriod(data[0].id);
    }
  };

  const fetchEnrollmentProgress = async () => {
    setIsLoading(true);
    try {
      // Get period details
      const period = enrollmentPeriods.find(p => p.id === selectedPeriod);
      if (!period) return;

      // Get all eligible employees for this company
      const { data: employees } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("company_id", selectedCompany);

      // Get enrollments for this period
      const { data: enrollments } = await supabase
        .from("benefit_enrollments")
        .select(`
          *,
          employee:profiles(full_name, email),
          plan:benefit_plans(name)
        `)
        .eq("enrollment_period_id", selectedPeriod);

      const totalEmployees = employees?.length || 0;
      const enrolledEmployees = new Set((enrollments || []).map((e: any) => e.employee_id)).size;
      const completionRate = totalEmployees > 0 ? (enrolledEmployees / totalEmployees) * 100 : 0;

      // Calculate days remaining
      const today = new Date();
      const endDate = new Date(period.end_date);
      const startDate = new Date(period.start_date);
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = totalDays - daysRemaining;
      const timeProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 100;

      setEnrollmentStats({
        totalEmployees,
        enrolledEmployees,
        pendingEmployees: totalEmployees - enrolledEmployees,
        completionRate,
        daysRemaining,
        timeProgress,
        isActive: today >= startDate && today <= endDate
      });

      // Build employee status list
      const enrolledIds = new Set((enrollments || []).map((e: any) => e.employee_id));
      const statusList = (employees || []).map((emp: any) => {
        const empEnrollments = (enrollments || []).filter((e: any) => e.employee_id === emp.id);
        return {
          ...emp,
          hasEnrolled: enrolledIds.has(emp.id),
          enrollmentCount: empEnrollments.length,
          plans: empEnrollments.map((e: any) => e.plan?.name).join(", ")
        };
      });

      setEmployeeStatus(statusList.sort((a: any, b: any) => a.hasEnrolled - b.hasEnrolled));

    } catch (error) {
      console.error("Error fetching enrollment progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPeriod = enrollmentPeriods.find(p => p.id === selectedPeriod);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Benefits", href: "/benefits" },
          { label: "Open Enrollment Tracker" }
        ]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Open Enrollment Tracker</h1>
            <p className="text-muted-foreground">Monitor enrollment period progress</p>
          </div>
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {enrollmentPeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name} ({period.start_date} - {period.end_date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {currentPeriod && (
          <>
            {/* Period Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{currentPeriod.name}</CardTitle>
                  <Badge variant={enrollmentStats.isActive ? "default" : "secondary"}>
                    {enrollmentStats.isActive ? "Active" : "Closed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Enrollment Progress</span>
                      <span className="font-medium">{Math.round(enrollmentStats.completionRate || 0)}%</span>
                    </div>
                    <Progress value={enrollmentStats.completionRate || 0} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {enrollmentStats.enrolledEmployees} of {enrollmentStats.totalEmployees} employees enrolled
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time Remaining</span>
                      <span className="font-medium">{enrollmentStats.daysRemaining} days</span>
                    </div>
                    <Progress value={enrollmentStats.timeProgress || 0} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {currentPeriod.start_date} to {currentPeriod.end_date}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Eligible</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enrollmentStats.totalEmployees || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{enrollmentStats.enrolledEmployees || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{enrollmentStats.pendingEmployees || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Days Left</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enrollmentStats.daysRemaining || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Employee Status */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Enrollment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plans Enrolled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeStatus.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      employeeStatus.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.full_name}</TableCell>
                          <TableCell>{emp.email}</TableCell>
                          <TableCell>
                            <Badge variant={emp.hasEnrolled ? "default" : "secondary"}>
                              {emp.hasEnrolled ? "Enrolled" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {emp.hasEnrolled ? (
                              <span className="text-sm">{emp.plans || `${emp.enrollmentCount} plan(s)`}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}

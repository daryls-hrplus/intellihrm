import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, DollarSign, Heart, FileText, Loader2 } from "lucide-react";

interface DirectReport {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  position_title: string;
}

interface TeamEnrollment {
  id: string;
  employee_id: string;
  employee_name: string;
  plan_name: string;
  category_name: string;
  category_type: string;
  coverage_level: string;
  effective_date: string;
  employer_contribution: number;
  employee_contribution: number;
  status: string;
}

export default function MssBenefitsPage() {
  const { user } = useAuth();
  const [directReports, setDirectReports] = useState<DirectReport[]>([]);
  const [enrollments, setEnrollments] = useState<TeamEnrollment[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({ employer: 0, employee: 0, plans: 0 });

  useEffect(() => {
    if (user) {
      fetchDirectReports();
    }
  }, [user]);

  useEffect(() => {
    if (directReports.length > 0) {
      fetchTeamEnrollments();
    }
  }, [directReports, selectedEmployee]);

  const fetchDirectReports = async () => {
    try {
      const { data, error } = await supabase.rpc("get_manager_direct_reports", {
        p_manager_id: user?.id,
      });

      if (error) throw error;
      setDirectReports(data || []);
    } catch (error) {
      console.error("Error fetching direct reports:", error);
    }
  };

  const fetchTeamEnrollments = async () => {
    setIsLoading(true);
    try {
      const employeeIds = selectedEmployee === "all"
        ? directReports.map((dr) => dr.employee_id)
        : [selectedEmployee];

      if (employeeIds.length === 0) {
        setEnrollments([]);
        setTotals({ employer: 0, employee: 0, plans: 0 });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("benefit_enrollments")
        .select(`
          id,
          employee_id,
          coverage_level,
          effective_date,
          employer_contribution,
          employee_contribution,
          status,
          plan:benefit_plans(
            name,
            category:benefit_categories(name, category_type)
          ),
          employee:profiles!benefit_enrollments_employee_id_fkey(full_name)
        `)
        .in("employee_id", employeeIds)
        .eq("status", "active");

      if (error) throw error;

      const mappedEnrollments: TeamEnrollment[] = (data || []).map((e: any) => ({
        id: e.id,
        employee_id: e.employee_id,
        employee_name: e.employee?.full_name || "Unknown",
        plan_name: e.plan?.name || "Unknown Plan",
        category_name: e.plan?.category?.name || "",
        category_type: e.plan?.category?.category_type || "",
        coverage_level: e.coverage_level || "Individual",
        effective_date: e.effective_date,
        employer_contribution: e.employer_contribution || 0,
        employee_contribution: e.employee_contribution || 0,
        status: e.status,
      }));

      setEnrollments(mappedEnrollments);
      setTotals({
        employer: mappedEnrollments.reduce((sum, e) => sum + e.employer_contribution, 0),
        employee: mappedEnrollments.reduce((sum, e) => sum + e.employee_contribution, 0),
        plans: mappedEnrollments.length,
      });
    } catch (error) {
      console.error("Error fetching team enrollments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (categoryType: string) => {
    switch (categoryType?.toLowerCase()) {
      case "health": return <Heart className="h-4 w-4 text-red-500" />;
      case "retirement": return <DollarSign className="h-4 w-4 text-green-500" />;
      case "life": return <Shield className="h-4 w-4 text-blue-500" />;
      case "wellness": return <Users className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Group enrollments by employee
  const enrollmentsByEmployee = enrollments.reduce((acc, e) => {
    if (!acc[e.employee_id]) {
      acc[e.employee_id] = { name: e.employee_name, enrollments: [] };
    }
    acc[e.employee_id].enrollments.push(e);
    return acc;
  }, {} as Record<string, { name: string; enrollments: TeamEnrollment[] }>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Manager Self Service", href: "/mss" },
          { label: "Team Benefits" }
        ]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team Benefits</h1>
            <p className="text-muted-foreground">View benefit enrollments for your direct reports</p>
          </div>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Direct Reports</SelectItem>
              {directReports.map((dr) => (
                <SelectItem key={dr.employee_id} value={dr.employee_id}>
                  {dr.employee_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{directReports.length}</div>
              <p className="text-xs text-muted-foreground">Direct reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.plans}</div>
              <p className="text-xs text-muted-foreground">Benefit plans</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Monthly Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(totals.employer + totals.employee).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Employer: ${totals.employer.toLocaleString()} | Employee: ${totals.employee.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="by-employee" className="space-y-4">
          <TabsList>
            <TabsTrigger value="by-employee">By Employee</TabsTrigger>
            <TabsTrigger value="all-enrollments">All Enrollments</TabsTrigger>
          </TabsList>

          <TabsContent value="by-employee">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : directReports.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No direct reports found.
                </CardContent>
              </Card>
            ) : Object.keys(enrollmentsByEmployee).length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No benefit enrollments found for your team.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {Object.entries(enrollmentsByEmployee).map(([employeeId, data]) => (
                  <Card key={employeeId}>
                    <CardHeader>
                      <CardTitle className="text-lg">{data.name}</CardTitle>
                      <CardDescription>{data.enrollments.length} active plan(s)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        {data.enrollments.map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(enrollment.category_type)}
                              <div>
                                <p className="font-medium text-sm">{enrollment.plan_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {enrollment.category_name} • {enrollment.coverage_level}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-medium">${enrollment.employer_contribution}/mo</p>
                              <p className="text-xs text-muted-foreground">employer</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all-enrollments">
            <Card>
              <CardHeader>
                <CardTitle>All Team Enrollments</CardTitle>
                <CardDescription>Complete list of benefit enrollments across your team</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : enrollments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No benefit enrollments found.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Coverage</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead className="text-right">Employer</TableHead>
                        <TableHead className="text-right">Employee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{enrollment.employee_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(enrollment.category_type)}
                              {enrollment.plan_name}
                            </div>
                          </TableCell>
                          <TableCell>{enrollment.category_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{enrollment.coverage_level}</Badge>
                          </TableCell>
                          <TableCell>{enrollment.effective_date}</TableCell>
                          <TableCell className="text-right text-green-600">
                            ${enrollment.employer_contribution.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${enrollment.employee_contribution.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

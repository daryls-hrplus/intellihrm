import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle,
  Loader2,
  Users,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DirectReport {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface TeamEnrollment {
  id: string;
  user_id: string;
  enrolled_at: string;
  due_date: string | null;
  completed_at: string | null;
  progress_percentage: number;
  status: string;
  course: {
    id: string;
    title: string;
    code: string;
    duration_minutes: number;
  };
  user: DirectReport;
}

interface TrainingRequest {
  id: string;
  employee_id: string;
  course_name: string;
  course_type: string;
  status: string;
  requested_at: string;
  estimated_cost: number | null;
  employee: DirectReport;
}

export default function MssTrainingPage() {
  const { user } = useAuth();
  const [directReports, setDirectReports] = useState<DirectReport[]>([]);
  const [teamEnrollments, setTeamEnrollments] = useState<TeamEnrollment[]>([]);
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch direct reports
      // @ts-ignore - Supabase type instantiation issue
      const { data: reports, error: reportsError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("manager_id", user!.id);

      if (reportsError) throw reportsError;
      // @ts-ignore
      setDirectReports(reports || []);

      if (reports && reports.length > 0) {
        const reportIds = reports.map((r) => r.id);

        // Fetch team enrollments
        // @ts-ignore - Supabase type instantiation issue
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("lms_enrollments")
          .select(`
            id, user_id, enrolled_at, due_date, completed_at, progress_percentage, status,
            course:lms_courses(id, title, code, duration_minutes),
            user:profiles(id, full_name, email, avatar_url)
          `)
          .in("user_id", reportIds)
          .order("enrolled_at", { ascending: false });

        if (enrollmentsError) throw enrollmentsError;
        // @ts-ignore
        setTeamEnrollments(enrollments || []);

        // Fetch training requests
        // @ts-ignore - Supabase type instantiation issue
        const { data: requests, error: requestsError } = await supabase
          .from("training_requests")
          .select(`
            id, employee_id, course_name, course_type, status, requested_at, estimated_cost,
            employee:profiles(id, full_name, email, avatar_url)
          `)
          .in("employee_id", reportIds)
          .order("requested_at", { ascending: false });

        if (requestsError) throw requestsError;
        // @ts-ignore
        setTrainingRequests(requests || []);
      }
    } catch (error) {
      console.error("Error fetching training data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmployee = (employeeId: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedEmployees(newExpanded);
  };

  const inProgressEnrollments = teamEnrollments.filter(
    (e) => e.status === "enrolled" || e.status === "in_progress"
  );
  const completedEnrollments = teamEnrollments.filter(
    (e) => e.status === "completed"
  );
  const overdueEnrollments = teamEnrollments.filter(
    (e) => e.due_date && new Date(e.due_date) < new Date() && e.status !== "completed"
  );
  const pendingRequests = trainingRequests.filter((r) => r.status === "pending");

  const stats = {
    totalTeam: directReports.length,
    inProgress: inProgressEnrollments.length,
    completed: completedEnrollments.length,
    overdue: overdueEnrollments.length,
    pendingRequests: pendingRequests.length,
  };

  const getEnrollmentsByEmployee = () => {
    const byEmployee: Record<string, TeamEnrollment[]> = {};
    teamEnrollments.forEach((enrollment) => {
      if (!byEmployee[enrollment.user_id]) {
        byEmployee[enrollment.user_id] = [];
      }
      byEmployee[enrollment.user_id].push(enrollment);
    });
    return byEmployee;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-info">In Progress</Badge>;
      case "enrolled":
        return <Badge variant="outline">Not Started</Badge>;
      case "expired":
        return <Badge className="bg-destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success">Approved</Badge>;
      case "pending":
        return <Badge className="bg-warning">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const enrollmentsByEmployee = getEnrollmentsByEmployee();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Manager Self Service", href: "/mss" },
            { label: "Team Training" },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Team Training
            </h1>
            <p className="text-muted-foreground">
              Monitor your team's training progress and approve requests
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-2xl font-bold">{stats.totalTeam}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <TrendingUp className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : directReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold text-foreground">
                No direct reports
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You don't have any direct reports assigned
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="by_employee">By Employee</TabsTrigger>
              <TabsTrigger value="requests">
                Requests ({pendingRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Training Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamEnrollments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No training enrollments found
                          </TableCell>
                        </TableRow>
                      ) : (
                        teamEnrollments.slice(0, 10).map((enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell>
                              {enrollment.user?.full_name}
                            </TableCell>
                            <TableCell>{enrollment.course?.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={enrollment.progress_percentage}
                                  className="h-2 w-20"
                                />
                                <span className="text-sm">
                                  {enrollment.progress_percentage}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {enrollment.due_date
                                ? new Date(enrollment.due_date).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="by_employee" className="mt-6 space-y-4">
              {directReports.map((employee) => {
                const employeeEnrollments = enrollmentsByEmployee[employee.id] || [];
                const isExpanded = expandedEmployees.has(employee.id);

                return (
                  <Collapsible key={employee.id} open={isExpanded}>
                    <Card>
                      <CollapsibleTrigger
                        className="w-full"
                        onClick={() => toggleEmployee(employee.id)}
                      >
                        <CardHeader className="cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <div className="text-left">
                                <CardTitle className="text-base">
                                  {employee.full_name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {employee.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">
                                {employeeEnrollments.length} courses
                              </Badge>
                              <Badge className="bg-success">
                                {employeeEnrollments.filter((e) => e.status === "completed").length} completed
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {employeeEnrollments.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">
                              No training enrollments
                            </p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Course</TableHead>
                                  <TableHead>Progress</TableHead>
                                  <TableHead>Due Date</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {employeeEnrollments.map((enrollment) => (
                                  <TableRow key={enrollment.id}>
                                    <TableCell>{enrollment.course?.title}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Progress
                                          value={enrollment.progress_percentage}
                                          className="h-2 w-20"
                                        />
                                        <span className="text-sm">
                                          {enrollment.progress_percentage}%
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {enrollment.due_date
                                        ? new Date(enrollment.due_date).toLocaleDateString()
                                        : "-"}
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(enrollment.status)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </TabsContent>

            <TabsContent value="requests" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Est. Cost</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No training requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        trainingRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              {request.employee?.full_name}
                            </TableCell>
                            <TableCell>{request.course_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{request.course_type}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(request.requested_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {request.estimated_cost
                                ? `$${request.estimated_cost.toLocaleString()}`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {getRequestStatusBadge(request.status)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, GraduationCap, Search, Users } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";

interface EmployeeEnrollment {
  id: string;
  employee_name: string;
  employee_id: string;
  course_title: string;
  status: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
}

export default function EmployeeLearningPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [enrollments, setEnrollments] = useState<EmployeeEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, [selectedCompanyId, selectedDepartmentId]);

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("lms_enrollments")
        .select(`
          id,
          status,
          progress,
          enrolled_at,
          completed_at,
          user_id,
          course:lms_courses(title),
          profile:profiles(first_name, last_name, employee_id)
        `)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      const formattedData: EmployeeEnrollment[] = (data || []).map((enrollment: any) => ({
        id: enrollment.id,
        employee_name: `${enrollment.profile?.first_name || ""} ${enrollment.profile?.last_name || ""}`.trim() || "Unknown",
        employee_id: enrollment.profile?.employee_id || enrollment.user_id,
        course_title: enrollment.course?.title || "Unknown Course",
        status: enrollment.status,
        progress: enrollment.progress || 0,
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
      }));

      setEnrollments(formattedData);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.employee_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-warning/10 text-warning border-warning/20">In Progress</Badge>;
      case "enrolled":
        return <Badge className="bg-info/10 text-info border-info/20">Enrolled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/training")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <GraduationCap className="h-5 w-5 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("training.modules.employeeLearning.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("training.modules.employeeLearning.description")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={(id) => {
                setSelectedCompanyId(id);
                setSelectedDepartmentId("all");
              }}
            />
            <DepartmentFilter
              companyId={selectedCompanyId}
              selectedDepartmentId={selectedDepartmentId}
              onDepartmentChange={setSelectedDepartmentId}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Enrollments
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("training.modules.employeeLearning.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t("training.modules.employeeLearning.allStatuses")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("training.modules.employeeLearning.allStatuses")}</SelectItem>
                    <SelectItem value="enrolled">{t("training.modules.employeeLearning.enrolled")}</SelectItem>
                    <SelectItem value="in_progress">{t("training.modules.employeeLearning.inProgress")}</SelectItem>
                    <SelectItem value="completed">{t("training.modules.employeeLearning.completed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("training.modules.employeeLearning.noEnrollments")}</p>
                <p className="text-sm text-muted-foreground">{t("training.modules.employeeLearning.adjustFilters")}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left text-sm font-medium">Employee</th>
                      <th className="p-3 text-left text-sm font-medium">Course</th>
                      <th className="p-3 text-left text-sm font-medium">Status</th>
                      <th className="p-3 text-left text-sm font-medium">Progress</th>
                      <th className="p-3 text-left text-sm font-medium">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="border-b last:border-0">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{enrollment.employee_name}</p>
                            <p className="text-sm text-muted-foreground">{enrollment.employee_id}</p>
                          </div>
                        </td>
                        <td className="p-3">{enrollment.course_title}</td>
                        <td className="p-3">{getStatusBadge(enrollment.status)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={enrollment.progress} className="w-24 h-2" />
                            <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

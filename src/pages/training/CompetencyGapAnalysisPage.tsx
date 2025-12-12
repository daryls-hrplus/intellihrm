import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Briefcase,
  GraduationCap,
  Building2,
  FolderTree,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  company_id: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface Position {
  id: string;
  title: string;
  job_id: string | null;
  department_id: string | null;
}

interface EmployeePosition {
  employee_id: string;
  position_id: string;
  employee: Employee;
  position: Position;
}

interface JobCompetency {
  competency_id: string;
  competency_level_id: string | null;
  competency_name: string;
  competency_code: string;
  required_level_name: string | null;
  required_level_order: number | null;
  weighting: number;
  is_required: boolean;
}

interface EmployeeCompetency {
  competency_id: string;
  competency_level_id: string | null;
  competency_name: string;
  competency_code: string;
  achieved_level_name: string | null;
  achieved_level_order: number | null;
  weighting: number;
}

interface GapAnalysisResult {
  competency_id: string;
  competency_name: string;
  competency_code: string;
  required_level: string | null;
  required_level_order: number | null;
  achieved_level: string | null;
  achieved_level_order: number | null;
  is_required: boolean;
  weighting: number;
  gap_status: "met" | "partial" | "missing";
  gap_score: number;
}

interface EmployeeGapSummary {
  employee_id: string;
  employee_name: string;
  position_title: string;
  total_required: number;
  competencies_met: number;
  competencies_partial: number;
  competencies_missing: number;
  overall_score: number;
  gaps: GapAnalysisResult[];
}

export default function CompetencyGapAnalysisPage() {
  const { user, isAdmin, hasRole } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<EmployeePosition[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [gapAnalysis, setGapAnalysis] = useState<EmployeeGapSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const canViewAll = isAdmin || hasRole("hr_manager");

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchDepartments(selectedCompanyId);
      setSelectedDepartmentId("");
      setSelectedEmployeeId("");
      setEmployees([]);
      setGapAnalysis(null);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedDepartmentId) {
      fetchEmployees(selectedDepartmentId);
      setSelectedEmployeeId("");
      setGapAnalysis(null);
    }
  }, [selectedDepartmentId]);

  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const fetchDepartments = async (companyId: string) => {
    setIsLoadingDepartments(true);
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name, code, company_id")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const fetchEmployees = async (departmentId: string) => {
    setIsLoadingEmployees(true);
    try {
      const { data, error } = await supabase
        .from("employee_positions")
        .select(`
          employee_id,
          position_id,
          profiles:employee_id (id, full_name, email),
          positions:position_id (id, title, job_id, department_id)
        `)
        .eq("is_active", true);

      if (error) throw error;

      const mapped: EmployeePosition[] = (data || [])
        .filter((ep: any) => ep.profiles && ep.positions && ep.positions.department_id === departmentId)
        .map((ep: any) => ({
          employee_id: ep.employee_id,
          position_id: ep.position_id,
          employee: {
            id: ep.profiles.id,
            full_name: ep.profiles.full_name || ep.profiles.email,
            email: ep.profiles.email,
          },
          position: {
            id: ep.positions.id,
            title: ep.positions.title,
            job_id: ep.positions.job_id,
            department_id: ep.positions.department_id,
          },
        }));

      // Remove duplicates by employee_id
      const unique = mapped.filter(
        (ep, index, self) =>
          index === self.findIndex((e) => e.employee_id === ep.employee_id)
      );

      setEmployees(unique);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const analyzeGaps = async (employeePosition: EmployeePosition) => {
    if (!employeePosition.position.job_id) {
      setGapAnalysis({
        employee_id: employeePosition.employee_id,
        employee_name: employeePosition.employee.full_name,
        position_title: employeePosition.position.title,
        total_required: 0,
        competencies_met: 0,
        competencies_partial: 0,
        competencies_missing: 0,
        overall_score: 0,
        gaps: [],
      });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch job competencies (requirements)
      const { data: jobCompData, error: jobCompError } = await supabase
        .from("job_competencies")
        .select(`
          competency_id,
          competency_level_id,
          weighting,
          is_required,
          competencies (name, code),
          competency_levels (name, level_order)
        `)
        .eq("job_id", employeePosition.position.job_id)
        .or("end_date.is.null,end_date.gte." + new Date().toISOString().split("T")[0]);

      if (jobCompError) throw jobCompError;

      const jobCompetencies: JobCompetency[] = (jobCompData || []).map((jc: any) => ({
        competency_id: jc.competency_id,
        competency_level_id: jc.competency_level_id,
        competency_name: jc.competencies?.name || "Unknown",
        competency_code: jc.competencies?.code || "",
        required_level_name: jc.competency_levels?.name || null,
        required_level_order: jc.competency_levels?.level_order || null,
        weighting: jc.weighting,
        is_required: jc.is_required,
      }));

      // Fetch employee competencies
      const { data: empCompData, error: empCompError } = await supabase
        .from("employee_competencies")
        .select(`
          competency_id,
          competency_level_id,
          weighting,
          competencies (name, code),
          competency_levels (name, level_order)
        `)
        .eq("employee_id", employeePosition.employee_id)
        .or("end_date.is.null,end_date.gte." + new Date().toISOString().split("T")[0]);

      if (empCompError) throw empCompError;

      const employeeCompetencies: EmployeeCompetency[] = (empCompData || []).map((ec: any) => ({
        competency_id: ec.competency_id,
        competency_level_id: ec.competency_level_id,
        competency_name: ec.competencies?.name || "Unknown",
        competency_code: ec.competencies?.code || "",
        achieved_level_name: ec.competency_levels?.name || null,
        achieved_level_order: ec.competency_levels?.level_order || null,
        weighting: ec.weighting,
      }));

      // Perform gap analysis
      const gaps: GapAnalysisResult[] = jobCompetencies.map((jc) => {
        const empComp = employeeCompetencies.find(
          (ec) => ec.competency_id === jc.competency_id
        );

        let gap_status: "met" | "partial" | "missing" = "missing";
        let gap_score = 0;

        if (empComp) {
          if (jc.required_level_order === null) {
            // No specific level required, having the competency is enough
            gap_status = "met";
            gap_score = 100;
          } else if (empComp.achieved_level_order !== null) {
            if (empComp.achieved_level_order >= jc.required_level_order) {
              gap_status = "met";
              gap_score = 100;
            } else {
              gap_status = "partial";
              gap_score = Math.round(
                (empComp.achieved_level_order / jc.required_level_order) * 100
              );
            }
          } else {
            // Has competency but no level specified
            gap_status = "partial";
            gap_score = 50;
          }
        }

        return {
          competency_id: jc.competency_id,
          competency_name: jc.competency_name,
          competency_code: jc.competency_code,
          required_level: jc.required_level_name,
          required_level_order: jc.required_level_order,
          achieved_level: empComp?.achieved_level_name || null,
          achieved_level_order: empComp?.achieved_level_order || null,
          is_required: jc.is_required,
          weighting: jc.weighting,
          gap_status,
          gap_score,
        };
      });

      const met = gaps.filter((g) => g.gap_status === "met").length;
      const partial = gaps.filter((g) => g.gap_status === "partial").length;
      const missing = gaps.filter((g) => g.gap_status === "missing").length;
      const totalWeight = gaps.reduce((sum, g) => sum + g.weighting, 0);
      const weightedScore =
        totalWeight > 0
          ? Math.round(
              gaps.reduce((sum, g) => sum + g.gap_score * g.weighting, 0) / totalWeight
            )
          : 0;

      setGapAnalysis({
        employee_id: employeePosition.employee_id,
        employee_name: employeePosition.employee.full_name,
        position_title: employeePosition.position.title,
        total_required: gaps.length,
        competencies_met: met,
        competencies_partial: partial,
        competencies_missing: missing,
        overall_score: weightedScore,
        gaps,
      });

      // Update stats
    } catch (error) {
      console.error("Error analyzing gaps:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    const ep = employees.find((e) => e.employee_id === employeeId);
    if (ep) {
      analyzeGaps(ep);
    }
  };

  const getStatusIcon = (status: "met" | "partial" | "missing") => {
    switch (status) {
      case "met":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "partial":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "missing":
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: "met" | "partial" | "missing") => {
    switch (status) {
      case "met":
        return <Badge className="bg-success/10 text-success border-success/20">Met</Badge>;
      case "partial":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Partial</Badge>;
      case "missing":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Missing</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const filteredDepartments = departments.filter(d => d.company_id === selectedCompanyId);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Training", href: "/training" },
            { label: "Competency Gap Analysis" },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Competency Gap Analysis
            </h1>
            <p className="text-muted-foreground">
              Compare job requirements with employee competencies
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company
                </Label>
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                  disabled={isLoadingCompanies}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  Department
                </Label>
                <Select
                  value={selectedDepartmentId}
                  onValueChange={setSelectedDepartmentId}
                  disabled={!selectedCompanyId || isLoadingDepartments}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedCompanyId ? "Select company first" : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Employee
                </Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={handleEmployeeChange}
                  disabled={!selectedDepartmentId || isLoadingEmployees}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedDepartmentId ? "Select department first" : employees.length === 0 ? "No employees found" : "Select employee"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((ep) => (
                      <SelectItem key={ep.employee_id} value={ep.employee_id}>
                        {ep.employee.full_name} - {ep.position.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : gapAnalysis ? (
          <>
            {/* Summary Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(gapAnalysis.overall_score)}`}>
                        {gapAnalysis.overall_score}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <Progress value={gapAnalysis.overall_score} className="mt-3" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Competencies Met</p>
                      <p className="text-3xl font-bold text-success">
                        {gapAnalysis.competencies_met}
                      </p>
                    </div>
                    <div className="rounded-lg bg-success/10 p-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Partial Gaps</p>
                      <p className="text-3xl font-bold text-warning">
                        {gapAnalysis.competencies_partial}
                      </p>
                    </div>
                    <div className="rounded-lg bg-warning/10 p-3">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Missing</p>
                      <p className="text-3xl font-bold text-destructive">
                        {gapAnalysis.competencies_missing}
                      </p>
                    </div>
                    <div className="rounded-lg bg-destructive/10 p-3">
                      <XCircle className="h-5 w-5 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employee Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {gapAnalysis.employee_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{gapAnalysis.position_title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{gapAnalysis.total_required} competencies required</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gap Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Competency Gap Details</CardTitle>
              </CardHeader>
              <CardContent>
                {gapAnalysis.gaps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No competency requirements defined for this position's job.</p>
                    <p className="text-sm mt-2">
                      Add competencies to the job to enable gap analysis.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Competency</TableHead>
                          <TableHead>Required Level</TableHead>
                          <TableHead>Achieved Level</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gapAnalysis.gaps
                          .sort((a, b) => {
                            // Sort by status: missing first, then partial, then met
                            const order = { missing: 0, partial: 1, met: 2 };
                            return order[a.gap_status] - order[b.gap_status];
                          })
                          .map((gap) => (
                            <TableRow key={gap.competency_id}>
                              <TableCell>{getStatusIcon(gap.gap_status)}</TableCell>
                              <TableCell className="font-medium">
                                {gap.competency_name}
                                <span className="text-muted-foreground ml-1">
                                  ({gap.competency_code})
                                </span>
                              </TableCell>
                              <TableCell>
                                {gap.required_level || (
                                  <span className="text-muted-foreground">Any</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {gap.achieved_level || (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{gap.weighting}%</Badge>
                              </TableCell>
                              <TableCell>
                                {gap.is_required ? (
                                  <Badge variant="default">Yes</Badge>
                                ) : (
                                  <Badge variant="secondary">No</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-semibold ${getScoreColor(gap.gap_score)}`}>
                                  {gap.gap_score}%
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Training Recommendations */}
            {gapAnalysis.gaps.filter((g) => g.gap_status !== "met").length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Training Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gapAnalysis.gaps
                      .filter((g) => g.gap_status !== "met")
                      .sort((a, b) => {
                        // Prioritize required competencies and lower scores
                        if (a.is_required !== b.is_required) return a.is_required ? -1 : 1;
                        return a.gap_score - b.gap_score;
                      })
                      .map((gap) => (
                        <div
                          key={gap.competency_id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(gap.gap_status)}
                            <div>
                              <p className="font-medium">{gap.competency_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {gap.gap_status === "missing"
                                  ? `Develop ${gap.required_level || "basic"} proficiency`
                                  : `Upgrade from ${gap.achieved_level} to ${gap.required_level}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {gap.is_required && (
                              <Badge variant="destructive" className="text-xs">
                                Priority
                              </Badge>
                            )}
                            <Button size="sm" variant="outline">
                              Find Courses
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : !selectedEmployeeId ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Select an employee to view their competency gap analysis
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}
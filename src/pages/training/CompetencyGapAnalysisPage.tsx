import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Save,
  ClipboardList,
  Calendar,
  Pencil,
  Trash2,
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
  required_level_id: string | null;
  required_level_order: number | null;
  achieved_level: string | null;
  achieved_level_id: string | null;
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
  job_id: string | null;
  total_required: number;
  competencies_met: number;
  competencies_partial: number;
  competencies_missing: number;
  overall_score: number;
  gaps: GapAnalysisResult[];
}

interface SavedGap {
  id: string;
  employee_id: string;
  competency_id: string;
  job_id: string | null;
  required_level_id: string | null;
  current_level_id: string | null;
  required_weighting: number;
  gap_score: number;
  status: string;
  priority: string;
  notes: string | null;
  action_plan: string | null;
  target_date: string | null;
  created_at: string;
  employee_name?: string;
  competency_name?: string;
}

export default function CompetencyGapAnalysisPage() {
  const { user, isAdmin, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState("analyze");
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
  
  // Saved gaps state
  const [savedGaps, setSavedGaps] = useState<SavedGap[]>([]);
  const [isLoadingSavedGaps, setIsLoadingSavedGaps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedGapsToSave, setSelectedGapsToSave] = useState<Set<string>>(new Set());
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGap, setEditingGap] = useState<SavedGap | null>(null);
  const [editForm, setEditForm] = useState({
    status: "pending",
    priority: "medium",
    notes: "",
    action_plan: "",
    target_date: "",
  });

  const canViewAll = isAdmin || hasRole("hr_manager");

  useEffect(() => {
    fetchCompanies();
    fetchSavedGaps();
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
      // First get positions in the department
      const { data: posData, error: posError } = await supabase
        .from("positions")
        .select("id, title, department_id, job_family_id")
        .eq("department_id", departmentId)
        .eq("is_active", true);

      if (posError) throw posError;

      const positionIds = (posData || []).map(p => p.id);

      if (positionIds.length === 0) {
        setEmployees([]);
        setIsLoadingEmployees(false);
        return;
      }

      // Then get employee positions for those positions
      const { data, error } = await supabase
        .from("employee_positions")
        .select(`
          employee_id,
          position_id,
          profiles:employee_id (id, full_name, email)
        `)
        .in("position_id", positionIds)
        .eq("is_active", true);

      if (error) throw error;

      // Build a lookup for position data
      const posLookup = new Map((posData || []).map(p => [p.id, p]));

      const mapped: EmployeePosition[] = (data || [])
        .filter((ep: any) => ep.profiles)
        .map((ep: any) => {
          const pos = posLookup.get(ep.position_id);
          return {
            employee_id: ep.employee_id,
            position_id: ep.position_id,
            employee: {
              id: ep.profiles.id,
              full_name: ep.profiles.full_name || ep.profiles.email,
              email: ep.profiles.email,
            },
            position: {
              id: ep.position_id,
              title: pos?.title || "Unknown",
              job_id: null, // Will need job linking via job_family
              department_id: pos?.department_id || null,
            },
          };
        });

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

  const fetchSavedGaps = async () => {
    setIsLoadingSavedGaps(true);
    try {
      const { data, error } = await supabase
        .from("competency_gaps")
        .select(`
          *,
          profiles:employee_id (full_name),
          competencies:competency_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: SavedGap[] = (data || []).map((g: any) => ({
        ...g,
        employee_name: g.profiles?.full_name || "Unknown",
        competency_name: g.competencies?.name || "Unknown",
      }));

      setSavedGaps(mapped);
    } catch (error) {
      console.error("Error fetching saved gaps:", error);
    } finally {
      setIsLoadingSavedGaps(false);
    }
  };

  const analyzeGaps = async (employeePosition: EmployeePosition) => {
    setSelectedGapsToSave(new Set());
    
    if (!employeePosition.position.job_id) {
      setGapAnalysis({
        employee_id: employeePosition.employee_id,
        employee_name: employeePosition.employee.full_name,
        position_title: employeePosition.position.title,
        job_id: null,
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
          required_level_id: jc.competency_level_id,
          required_level_order: jc.required_level_order,
          achieved_level: empComp?.achieved_level_name || null,
          achieved_level_id: empComp?.competency_level_id || null,
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
        job_id: employeePosition.position.job_id,
        total_required: gaps.length,
        competencies_met: met,
        competencies_partial: partial,
        competencies_missing: missing,
        overall_score: weightedScore,
        gaps,
      });
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

  const toggleGapSelection = (competencyId: string) => {
    const newSelected = new Set(selectedGapsToSave);
    if (newSelected.has(competencyId)) {
      newSelected.delete(competencyId);
    } else {
      newSelected.add(competencyId);
    }
    setSelectedGapsToSave(newSelected);
  };

  const selectAllGaps = () => {
    if (!gapAnalysis) return;
    const gapsToSelect = gapAnalysis.gaps
      .filter(g => g.gap_status !== "met")
      .map(g => g.competency_id);
    setSelectedGapsToSave(new Set(gapsToSelect));
  };

  const clearGapSelection = () => {
    setSelectedGapsToSave(new Set());
  };

  const saveSelectedGaps = async () => {
    if (!gapAnalysis || selectedGapsToSave.size === 0) return;

    setIsSaving(true);
    try {
      const gapsToSave = gapAnalysis.gaps.filter(
        g => selectedGapsToSave.has(g.competency_id) && g.gap_status !== "met"
      );

      const records = gapsToSave.map(gap => ({
        employee_id: gapAnalysis.employee_id,
        competency_id: gap.competency_id,
        job_id: gapAnalysis.job_id,
        required_level_id: gap.required_level_id,
        current_level_id: gap.achieved_level_id,
        required_weighting: gap.weighting,
        gap_score: gap.gap_score,
        status: "pending",
        priority: gap.is_required ? "high" : "medium",
        created_by: user?.id,
      }));

      const { error } = await supabase
        .from("competency_gaps")
        .upsert(records, { onConflict: "employee_id,competency_id,job_id" });

      if (error) throw error;

      toast.success(`${records.length} gap(s) saved for tracking`);
      setSelectedGapsToSave(new Set());
      fetchSavedGaps();
    } catch (error: any) {
      console.error("Error saving gaps:", error);
      toast.error("Failed to save gaps");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (gap: SavedGap) => {
    setEditingGap(gap);
    setEditForm({
      status: gap.status,
      priority: gap.priority,
      notes: gap.notes || "",
      action_plan: gap.action_plan || "",
      target_date: gap.target_date || "",
    });
    setEditDialogOpen(true);
  };

  const saveGapEdits = async () => {
    if (!editingGap) return;

    try {
      const { error } = await supabase
        .from("competency_gaps")
        .update({
          status: editForm.status,
          priority: editForm.priority,
          notes: editForm.notes || null,
          action_plan: editForm.action_plan || null,
          target_date: editForm.target_date || null,
        })
        .eq("id", editingGap.id);

      if (error) throw error;

      toast.success("Gap updated successfully");
      setEditDialogOpen(false);
      fetchSavedGaps();
    } catch (error) {
      console.error("Error updating gap:", error);
      toast.error("Failed to update gap");
    }
  };

  const deleteGap = async (gapId: string) => {
    try {
      const { error } = await supabase
        .from("competency_gaps")
        .delete()
        .eq("id", gapId);

      if (error) throw error;

      toast.success("Gap removed from tracking");
      fetchSavedGaps();
    } catch (error) {
      console.error("Error deleting gap:", error);
      toast.error("Failed to remove gap");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-muted text-muted-foreground";
      case "in_progress": return "bg-primary/10 text-primary";
      case "addressed": return "bg-success/10 text-success";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive";
      case "medium": return "bg-warning/10 text-warning";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Analyze Gaps
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Gaps to Address
              {savedGaps.length > 0 && (
                <Badge variant="secondary" className="ml-1">{savedGaps.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6 mt-6">
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Competency Gap Details</CardTitle>
                {gapAnalysis.gaps.filter(g => g.gap_status !== "met").length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllGaps}>
                      Select All Gaps
                    </Button>
                    {selectedGapsToSave.size > 0 && (
                      <>
                        <Button variant="ghost" size="sm" onClick={clearGapSelection}>
                          Clear
                        </Button>
                        <Button size="sm" onClick={saveSelectedGaps} disabled={isSaving}>
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save {selectedGapsToSave.size} Gap(s)
                        </Button>
                      </>
                    )}
                  </div>
                )}
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
                          <TableHead className="w-12">Track</TableHead>
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
                              <TableCell>
                                {gap.gap_status !== "met" && (
                                  <input
                                    type="checkbox"
                                    checked={selectedGapsToSave.has(gap.competency_id)}
                                    onChange={() => toggleGapSelection(gap.competency_id)}
                                    className="h-4 w-4 rounded border-input"
                                  />
                                )}
                              </TableCell>
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
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Competency Gaps to Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSavedGaps ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : savedGaps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No competency gaps saved for tracking yet.</p>
                    <p className="text-sm mt-2">
                      Analyze an employee's gaps and save them for HR planning.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Competency</TableHead>
                          <TableHead>Gap Score</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Target Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {savedGaps.map((gap) => (
                          <TableRow key={gap.id}>
                            <TableCell className="font-medium">
                              {gap.employee_name}
                            </TableCell>
                            <TableCell>{gap.competency_name}</TableCell>
                            <TableCell>
                              <span className={`font-semibold ${getScoreColor(gap.gap_score)}`}>
                                {gap.gap_score}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityBadgeColor(gap.priority)}>
                                {gap.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(gap.status)}>
                                {gap.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {gap.target_date ? (
                                <span className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(gap.target_date).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(gap)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteGap(gap.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Gap Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Gap Action Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="addressed">Addressed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={editForm.priority}
                    onValueChange={(v) => setEditForm({ ...editForm, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <input
                  type="date"
                  value={editForm.target_date}
                  onChange={(e) => setEditForm({ ...editForm, target_date: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Add notes about this gap..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Action Plan</Label>
                <Textarea
                  value={editForm.action_plan}
                  onChange={(e) => setEditForm({ ...editForm, action_plan: e.target.value })}
                  placeholder="Describe the plan to address this gap..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveGapEdits}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
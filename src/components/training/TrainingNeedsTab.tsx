import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TrainingNeedsTabProps {
  companyId: string;
}

interface TrainingNeed {
  id: string;
  skill_gap_description: string;
  priority: string;
  status: string;
  target_date: string | null;
  recommended_training: string | null;
  employee: { full_name: string } | null;
  department: { name: string } | null;
  competency: { name: string } | null;
  course: { title: string } | null;
}

interface Analysis {
  id: string;
  name: string;
  analysis_type: string;
  analysis_date: string;
  status: string;
  department: { name: string } | null;
}

export function TrainingNeedsTab({ companyId }: TrainingNeedsTabProps) {
  const [needs, setNeeds] = useState<TrainingNeed[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [competencies, setCompetencies] = useState<{ id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [needDialogOpen, setNeedDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"needs" | "analyses">("needs");
  const [needFormData, setNeedFormData] = useState({
    employee_id: "",
    department_id: "",
    competency_id: "",
    skill_gap_description: "",
    priority: "medium",
    recommended_training: "",
    recommended_course_id: "",
    target_date: "",
    notes: "",
  });
  const [analysisFormData, setAnalysisFormData] = useState({
    name: "",
    analysis_type: "organizational",
    department_id: "",
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    const [needsRes, analysesRes, deptsRes, empsRes, compsRes, coursesRes] = await Promise.all([
      supabase
        .from("training_needs")
        .select("*, employee:profiles(full_name), department:departments(name), competency:competencies(name), course:lms_courses(title)")
        .eq("company_id", companyId)
        .order("priority") as any,
      supabase
        .from("training_needs_analysis")
        .select("*, department:departments(name)")
        .eq("company_id", companyId)
        .order("analysis_date", { ascending: false }) as any,
      supabase.from("departments").select("id, name").eq("company_id", companyId).eq("is_active", true),
      supabase.from("profiles").select("id, full_name").eq("company_id", companyId).eq("is_active", true),
      supabase.from("competencies").select("id, name").eq("company_id", companyId).eq("is_active", true),
      supabase.from("lms_courses").select("id, title").eq("company_id", companyId).eq("is_active", true),
    ]);

    if (needsRes.data) setNeeds(needsRes.data);
    if (analysesRes.data) setAnalyses(analysesRes.data);
    if (deptsRes.data) setDepartments(deptsRes.data);
    if (empsRes.data) setEmployees(empsRes.data);
    if (compsRes.data) setCompetencies(compsRes.data);
    if (coursesRes.data) setCourses(coursesRes.data);
    setLoading(false);
  };

  const handleNeedSubmit = async () => {
    if (!needFormData.skill_gap_description) {
      toast.error("Skill gap description is required");
      return;
    }

    const { error } = await supabase.from("training_needs").insert({
      company_id: companyId,
      employee_id: needFormData.employee_id || null,
      department_id: needFormData.department_id || null,
      competency_id: needFormData.competency_id || null,
      skill_gap_description: needFormData.skill_gap_description,
      priority: needFormData.priority,
      recommended_training: needFormData.recommended_training || null,
      recommended_course_id: needFormData.recommended_course_id || null,
      target_date: needFormData.target_date || null,
      notes: needFormData.notes || null,
      status: "identified",
    });

    if (error) {
      toast.error("Failed to create need");
    } else {
      toast.success("Training need created");
      setNeedDialogOpen(false);
      setNeedFormData({
        employee_id: "",
        department_id: "",
        competency_id: "",
        skill_gap_description: "",
        priority: "medium",
        recommended_training: "",
        recommended_course_id: "",
        target_date: "",
        notes: "",
      });
      loadData();
    }
  };

  const handleAnalysisSubmit = async () => {
    if (!analysisFormData.name) {
      toast.error("Name is required");
      return;
    }

    const { error } = await supabase.from("training_needs_analysis").insert({
      company_id: companyId,
      name: analysisFormData.name,
      analysis_type: analysisFormData.analysis_type,
      department_id: analysisFormData.department_id || null,
      status: "draft",
    });

    if (error) {
      toast.error("Failed to create analysis");
    } else {
      toast.success("Analysis created");
      setAnalysisDialogOpen(false);
      setAnalysisFormData({ name: "", analysis_type: "organizational", department_id: "" });
      loadData();
    }
  };

  const updateNeedStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("training_needs")
      .update({ status, addressed_at: status === "addressed" ? new Date().toISOString() : null })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success("Status updated");
      loadData();
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      critical: "destructive",
      high: "default",
      medium: "secondary",
      low: "outline",
    };
    return <Badge variant={variants[priority] || "secondary"} className="capitalize">{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      identified: "bg-yellow-100 text-yellow-800",
      planned: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      addressed: "bg-green-100 text-green-800",
    };
    return <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>{status.replace("_", " ")}</Badge>;
  };

  const stats = {
    total: needs.length,
    critical: needs.filter((n) => n.priority === "critical").length,
    addressed: needs.filter((n) => n.status === "addressed").length,
    inProgress: needs.filter((n) => n.status === "in_progress").length,
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Needs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Critical</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.critical}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Addressed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.addressed}</div></CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={activeTab === "needs" ? "default" : "outline"} onClick={() => setActiveTab("needs")}>Training Needs</Button>
        <Button variant={activeTab === "analyses" ? "default" : "outline"} onClick={() => setActiveTab("analyses")}>Analyses</Button>
      </div>

      {activeTab === "needs" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Identified Training Needs</CardTitle>
              <CardDescription>Track skill gaps and training requirements</CardDescription>
            </div>
            <Dialog open={needDialogOpen} onOpenChange={setNeedDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Need</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Identify Training Need</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee (optional)</Label>
                    <Select value={needFormData.employee_id} onValueChange={(v) => setNeedFormData({ ...needFormData, employee_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => (<SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department (optional)</Label>
                    <Select value={needFormData.department_id} onValueChange={(v) => setNeedFormData({ ...needFormData, department_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Skill Gap Description *</Label>
                    <Textarea value={needFormData.skill_gap_description} onChange={(e) => setNeedFormData({ ...needFormData, skill_gap_description: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Competency</Label>
                    <Select value={needFormData.competency_id} onValueChange={(v) => setNeedFormData({ ...needFormData, competency_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select competency" /></SelectTrigger>
                      <SelectContent>
                        {competencies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={needFormData.priority} onValueChange={(v) => setNeedFormData({ ...needFormData, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recommended Course</Label>
                    <Select value={needFormData.recommended_course_id} onValueChange={(v) => setNeedFormData({ ...needFormData, recommended_course_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Date</Label>
                    <Input type="date" value={needFormData.target_date} onChange={(e) => setNeedFormData({ ...needFormData, target_date: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setNeedDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleNeedSubmit}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Employee/Dept</TableHead>
                  <TableHead>Competency</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needs.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="max-w-xs truncate">{n.skill_gap_description}</TableCell>
                    <TableCell>{n.employee?.full_name || n.department?.name || "-"}</TableCell>
                    <TableCell>{n.competency?.name || "-"}</TableCell>
                    <TableCell>{getPriorityBadge(n.priority)}</TableCell>
                    <TableCell>{getStatusBadge(n.status)}</TableCell>
                    <TableCell>{n.target_date ? format(new Date(n.target_date), "MMM d, yyyy") : "-"}</TableCell>
                    <TableCell>
                      <Select value={n.status} onValueChange={(v) => updateNeedStatus(n.id, v)}>
                        <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="identified">Identified</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="addressed">Addressed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {needs.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No training needs identified</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "analyses" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Training Needs Analyses</CardTitle>
            <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New Analysis</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Analysis</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={analysisFormData.name} onChange={(e) => setAnalysisFormData({ ...analysisFormData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={analysisFormData.analysis_type} onValueChange={(v) => setAnalysisFormData({ ...analysisFormData, analysis_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organizational">Organizational</SelectItem>
                        <SelectItem value="departmental">Departmental</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {analysisFormData.analysis_type === "departmental" && (
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={analysisFormData.department_id} onValueChange={(v) => setAnalysisFormData({ ...analysisFormData, department_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setAnalysisDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAnalysisSubmit}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="capitalize">{a.analysis_type}</TableCell>
                    <TableCell>{a.department?.name || "-"}</TableCell>
                    <TableCell>{format(new Date(a.analysis_date), "MMM d, yyyy")}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {analyses.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No analyses created</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

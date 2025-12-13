import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, AlertTriangle, Eye, Edit, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PIP {
  id: string;
  employee_id: string;
  manager_id: string | null;
  title: string;
  reason: string;
  start_date: string;
  end_date: string;
  status: string;
  improvement_areas: string[];
  success_criteria: string | null;
  employee?: { full_name: string };
  manager?: { full_name: string };
  milestones?: { id: string; status: string }[];
}

interface PerformanceImprovementPlansTabProps {
  companyId: string;
}

export function PerformanceImprovementPlansTab({ companyId }: PerformanceImprovementPlansTabProps) {
  const { user } = useAuth();
  const [pips, setPips] = useState<PIP[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPip, setSelectedPip] = useState<PIP | null>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    title: "",
    reason: "",
    start_date: "",
    end_date: "",
    improvement_areas: "",
    success_criteria: "",
    support_provided: "",
    consequences: "",
  });

  useEffect(() => {
    if (companyId) fetchData();
  }, [companyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pipsRes, employeesRes] = await Promise.all([
        // @ts-ignore
        supabase
          .from("performance_improvement_plans")
          .select(`
            *,
            employee:profiles!performance_improvement_plans_employee_id_fkey(full_name),
            manager:profiles!performance_improvement_plans_manager_id_fkey(full_name),
            milestones:pip_milestones(id, status)
          `)
          .eq("company_id", companyId)
          .order("created_at", { ascending: false }),
        // @ts-ignore
        supabase
          .from("profiles")
          .select("id, full_name")
          .eq("company_id", companyId)
          .eq("is_active", true),
      ]);

      // @ts-ignore - Supabase type issue
      if (pipsRes.data) setPips(pipsRes.data);
      // @ts-ignore
      if (employeesRes.data) setEmployees(employeesRes.data);
    } catch (error) {
      console.error("Error fetching PIPs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.title || !formData.reason || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const pipData = {
      company_id: companyId,
      employee_id: formData.employee_id,
      manager_id: user?.id,
      title: formData.title,
      reason: formData.reason,
      start_date: formData.start_date,
      end_date: formData.end_date,
      improvement_areas: formData.improvement_areas.split("\n").filter(Boolean),
      success_criteria: formData.success_criteria || null,
      support_provided: formData.support_provided || null,
      consequences: formData.consequences || null,
      created_by: user?.id,
    };

    try {
      if (selectedPip) {
        const { error } = await supabase
          .from("performance_improvement_plans")
          .update(pipData)
          .eq("id", selectedPip.id);
        if (error) throw error;
        toast.success("PIP updated successfully");
      } else {
        const { error } = await supabase
          .from("performance_improvement_plans")
          .insert(pipData);
        if (error) throw error;
        toast.success("PIP created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving PIP:", error);
      toast.error("Failed to save PIP");
    }
  };

  const resetForm = () => {
    setSelectedPip(null);
    setFormData({
      employee_id: "",
      title: "",
      reason: "",
      start_date: "",
      end_date: "",
      improvement_areas: "",
      success_criteria: "",
      support_provided: "",
      consequences: "",
    });
  };

  const openEditDialog = (pip: PIP) => {
    setSelectedPip(pip);
    setFormData({
      employee_id: pip.employee_id,
      title: pip.title,
      reason: pip.reason,
      start_date: pip.start_date,
      end_date: pip.end_date,
      improvement_areas: (pip.improvement_areas || []).join("\n"),
      success_criteria: pip.success_criteria || "",
      support_provided: "",
      consequences: "",
    });
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      active: "bg-warning text-warning-foreground",
      completed: "bg-info text-info-foreground",
      successful: "bg-success text-success-foreground",
      terminated: "bg-destructive text-destructive-foreground",
      extended: "bg-orange-500 text-white",
    };
    return <Badge className={colors[status] || "bg-muted"}>{status}</Badge>;
  };

  const getMilestoneProgress = (milestones: { id: string; status: string }[] = []) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.status === "completed").length;
    return Math.round((completed / milestones.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance Improvement Plans</h3>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create PIP
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pips.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No performance improvement plans found
              </TableCell>
            </TableRow>
          ) : (
            pips.map((pip) => (
              <TableRow key={pip.id}>
                <TableCell>{pip.employee?.full_name}</TableCell>
                <TableCell>{pip.title}</TableCell>
                <TableCell>
                  {new Date(pip.start_date).toLocaleDateString()} - {new Date(pip.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={getMilestoneProgress(pip.milestones)} className="h-2 w-20" />
                    <span className="text-sm">{getMilestoneProgress(pip.milestones)}%</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(pip.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(pip)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPip ? "Edit" : "Create"} Performance Improvement Plan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="PIP Title"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason for PIP *</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Describe the performance issues that led to this PIP"
              />
            </div>
            <div className="space-y-2">
              <Label>Improvement Areas (one per line)</Label>
              <Textarea
                value={formData.improvement_areas}
                onChange={(e) => setFormData({ ...formData, improvement_areas: e.target.value })}
                placeholder="List areas requiring improvement"
              />
            </div>
            <div className="space-y-2">
              <Label>Success Criteria</Label>
              <Textarea
                value={formData.success_criteria}
                onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
                placeholder="Define what success looks like"
              />
            </div>
            <div className="space-y-2">
              <Label>Support Provided</Label>
              <Textarea
                value={formData.support_provided}
                onChange={(e) => setFormData({ ...formData, support_provided: e.target.value })}
                placeholder="Resources, training, coaching to be provided"
              />
            </div>
            <div className="space-y-2">
              <Label>Consequences</Label>
              <Textarea
                value={formData.consequences}
                onChange={(e) => setFormData({ ...formData, consequences: e.target.value })}
                placeholder="What happens if goals are not met"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{selectedPip ? "Update" : "Create"} PIP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

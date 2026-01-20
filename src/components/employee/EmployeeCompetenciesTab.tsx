import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Award, RefreshCw, Briefcase, User } from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { useAuditLog } from "@/hooks/useAuditLog";
import { fetchCompetencyCascade, syncJobCompetenciesToEmployee, CascadedCompetency } from "@/hooks/useCompetencyCascade";

interface EmployeeCompetency {
  id: string;
  employee_id: string;
  competency_id: string;
  competency_level_id: string | null;
  weighting: number;
  proficiency_date: string | null;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  competencies?: { name: string; code: string };
  competency_levels?: { name: string; code: string } | null;
}

interface Competency {
  id: string;
  name: string;
  code: string;
  company_id: string;
}

interface CompetencyLevel {
  id: string;
  competency_id: string;
  name: string;
  code: string;
  level_order: number;
}

interface EmployeeCompetenciesTabProps {
  employeeId: string;
}

function datesOverlap(
  start1: string,
  end1: string | null,
  start2: string,
  end2: string | null
): boolean {
  const e1 = end1 || "9999-12-31";
  const e2 = end2 || "9999-12-31";
  return start1 <= e2 && start2 <= e1;
}

export function EmployeeCompetenciesTab({ employeeId }: EmployeeCompetenciesTabProps) {
  const [employeeCompetencies, setEmployeeCompetencies] = useState<EmployeeCompetency[]>([]);
  const [jobCompetencies, setJobCompetencies] = useState<CascadedCompetency[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [competencyLevels, setCompetencyLevels] = useState<CompetencyLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { logAction } = useAuditLog();
  const [formData, setFormData] = useState({
    competency_id: "",
    competency_level_id: "",
    weighting: "10",
    proficiency_date: "",
    notes: "",
    start_date: getTodayString(),
    end_date: "",
  });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCompetencies();
    fetchCompetencies();
  }, [employeeId]);

  useEffect(() => {
    if (formData.competency_id) {
      fetchCompetencyLevels(formData.competency_id);
    } else {
      setCompetencyLevels([]);
    }
  }, [formData.competency_id]);

  const fetchAllCompetencies = async () => {
    setIsLoading(true);
    try {
      // Fetch employee competencies - join with skills_competencies
      const { data, error } = await supabase
        .from("employee_competencies")
        .select(`
          *,
          skills_competencies(id, name, code),
          competency_levels(name, code)
        `)
        .eq("employee_id", employeeId)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching employee competencies:", error);
        toast.error("Failed to load competencies");
      } else {
        // Map skills_competencies to competencies for backward compatibility
        const mapped = (data || []).map((ec: any) => ({
          ...ec,
          competencies: ec.skills_competencies ? {
            name: ec.skills_competencies.name,
            code: ec.skills_competencies.code,
          } : ec.competencies,
        }));
        setEmployeeCompetencies(mapped);
      }

      // Fetch job competencies using cascade
      const cascadeResult = await fetchCompetencyCascade(employeeId);
      setJobCompetencies(cascadeResult.fromJob);
      
      // Get current job ID for sync
      const { data: positions } = await supabase
        .from("employee_positions")
        .select("positions!inner(job_id)")
        .eq("employee_id", employeeId)
        .eq("is_active", true)
        .limit(1);
      
      if (positions && positions.length > 0) {
        setCurrentJobId((positions[0] as any).positions?.job_id || null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompetencies = async () => {
    // Fetch employee's company_id first
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", employeeId)
      .single();
    
    const employeeCompanyId = profile?.company_id;
    
    // Fetch from unified skills_competencies table
    const { data, error } = await supabase
      .from("skills_competencies")
      .select(`
        id, 
        name, 
        code,
        is_global,
        company_capabilities(company_id)
      `)
      .eq("type", "COMPETENCY")
      .eq("status", "active")
      .order("name");

    if (error) {
      console.error("Error fetching competencies:", error);
    } else {
      // Filter to only include competencies that are global OR linked to employee's company
      const filtered = (data || []).filter((c: any) => {
        if (c.is_global) return true;
        if (!employeeCompanyId) return false;
        const linkedCompanies = c.company_capabilities || [];
        return linkedCompanies.some((cc: any) => cc.company_id === employeeCompanyId);
      });
      setCompetencies(filtered.map((c: any) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        company_id: employeeCompanyId || '',
      })));
    }
  };

  const fetchCompetencyLevels = async (competencyId: string) => {
    const { data, error } = await supabase
      .from("competency_levels")
      .select("id, competency_id, name, code, level_order")
      .eq("competency_id", competencyId)
      .eq("is_active", true)
      .order("level_order");

    if (error) {
      console.error("Error fetching competency levels:", error);
    } else {
      setCompetencyLevels(data || []);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      competency_id: "",
      competency_level_id: "",
      weighting: "10",
      proficiency_date: "",
      notes: "",
      start_date: getTodayString(),
      end_date: "",
    });
    setDialogOpen(true);
  };

  const calculateOverlappingWeight = (
    newStartDate: string,
    newEndDate: string | null
  ): number => {
    const competencyGroups = new Map<string, EmployeeCompetency[]>();
    for (const ec of employeeCompetencies) {
      const existing = competencyGroups.get(ec.competency_id) || [];
      existing.push(ec);
      competencyGroups.set(ec.competency_id, existing);
    }

    let totalWeight = 0;
    for (const [, entries] of competencyGroups) {
      const overlappingEntries = entries.filter((ec) =>
        datesOverlap(newStartDate, newEndDate, ec.start_date, ec.end_date)
      );
      if (overlappingEntries.length > 0) {
        const maxWeight = Math.max(...overlappingEntries.map((e) => Number(e.weighting)));
        totalWeight += maxWeight;
      }
    }
    return totalWeight;
  };

  const handleSave = async () => {
    if (!formData.competency_id) {
      toast.error("Please select a competency");
      return;
    }

    if (!formData.start_date) {
      toast.error("Please enter a start date");
      return;
    }

    const weighting = parseFloat(formData.weighting);
    if (isNaN(weighting) || weighting < 0 || weighting > 100) {
      toast.error("Weighting must be between 0 and 100");
      return;
    }

    const currentOverlappingWeight = calculateOverlappingWeight(
      formData.start_date,
      formData.end_date || null
    );

    if (currentOverlappingWeight + weighting > 100) {
      toast.error(
        `Total weighting would exceed 100%. Current: ${currentOverlappingWeight}%, max you can add: ${100 - currentOverlappingWeight}%`
      );
      return;
    }

    setIsSaving(true);
    const payload = {
      employee_id: employeeId,
      competency_id: formData.competency_id,
      competency_level_id: formData.competency_level_id || null,
      weighting: weighting,
      proficiency_date: formData.proficiency_date || null,
      notes: formData.notes.trim() || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
    };

    const { data, error } = await supabase
      .from("employee_competencies")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error adding employee competency:", error);
      if (error.message?.includes("Overlapping date ranges")) {
        toast.error("This competency already has an entry for overlapping dates");
      } else {
        toast.error("Failed to add competency");
      }
    } else {
      const competency = competencies.find(c => c.id === formData.competency_id);
      await logAction({
        action: 'CREATE',
        entityType: 'employee_competency',
        entityId: data.id,
        entityName: competency?.name,
        newValues: payload,
      });
      toast.success("Competency added successfully");
      fetchAllCompetencies();
      setDialogOpen(false);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase
      .from("employee_competencies")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting employee competency:", error);
      toast.error("Failed to remove competency");
    } else {
      await logAction({
        action: 'DELETE',
        entityType: 'employee_competency',
        entityId: id,
        entityName: name,
      });
      toast.success("Competency removed");
      fetchAllCompetencies();
    }
  };

  const handleSyncFromJob = async () => {
    if (!currentJobId) {
      toast.error("No job profile found for this employee");
      return;
    }
    
    setIsSyncing(true);
    try {
      const result = await syncJobCompetenciesToEmployee(employeeId, currentJobId);
      
      if (result.errors.length > 0) {
        toast.error(result.errors.join(", "));
      } else if (result.synced === 0) {
        toast.info("All job competencies are already assigned");
      } else {
        toast.success(`Synced ${result.synced} competencies from job profile`);
        await logAction({
          action: 'CREATE',
          entityType: 'employee_competency_sync',
          entityId: employeeId,
          entityName: `Synced ${result.synced} competencies`,
        });
        fetchAllCompetencies();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Separate employee competencies into those from job and individual additions
  const { inheritedCompetencies, additionalCompetencies } = useMemo(() => {
    const jobCompIds = new Set(jobCompetencies.map(jc => jc.competency_id));
    const inherited = employeeCompetencies.filter(ec => jobCompIds.has(ec.competency_id));
    const additional = employeeCompetencies.filter(ec => !jobCompIds.has(ec.competency_id));
    return { inheritedCompetencies: inherited, additionalCompetencies: additional };
  }, [employeeCompetencies, jobCompetencies]);

  const totalWeight = employeeCompetencies.reduce((sum, ec) => sum + Number(ec.weighting), 0);
  const jobTotalWeight = jobCompetencies.reduce((sum, jc) => sum + Number(jc.weighting), 0);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Employee Competencies
              </CardTitle>
              <CardDescription className="mt-1">
                Competencies are inherited from job profile and can be extended with individual assignments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {currentJobId && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSyncFromJob}
                  disabled={isSyncing || jobCompetencies.length === 0}
                >
                  {isSyncing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Sync from Job
                </Button>
              )}
              <Button size="sm" onClick={handleOpenDialog} disabled={competencies.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Competency
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* From Job Profile Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            From Job Profile
            <Badge variant="secondary" className="ml-2">
              {jobCompetencies.length} competencies • {jobTotalWeight}% weight
            </Badge>
          </CardTitle>
          <CardDescription>
            These competencies are automatically inherited from the employee's job profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : jobCompetencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No competencies defined in job profile</p>
              <p className="text-sm mt-1">Configure competencies in Workforce → Jobs</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competency</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-[100px]">Weight %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobCompetencies.map((jc) => {
                    const hasOverride = employeeCompetencies.some(ec => ec.competency_id === jc.competency_id);
                    return (
                      <TableRow key={jc.competency_id}>
                        <TableCell className="font-medium">
                          {jc.name} {jc.code && <span className="text-muted-foreground">({jc.code})</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <Briefcase className="h-3 w-3" />
                            Job Profile
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{jc.weighting}%</Badge>
                        </TableCell>
                        <TableCell>
                          {hasOverride ? (
                            <Badge variant="secondary" className="gap-1">
                              <User className="h-3 w-3" />
                              Overridden
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Assignments Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Individual Assignments
            <Badge variant="secondary" className="ml-2">
              {employeeCompetencies.length} total • {totalWeight}% weight
            </Badge>
          </CardTitle>
          <CardDescription>
            Additional competencies assigned directly to this employee (overrides job profile where applicable)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competency</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-[100px]">Weight %</TableHead>
                  <TableHead>Proficiency Date</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : employeeCompetencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No individual competencies assigned
                    </TableCell>
                  </TableRow>
                ) : (
                  employeeCompetencies.map((ec) => {
                    const isFromJob = jobCompetencies.some(jc => jc.competency_id === ec.competency_id);
                    return (
                      <TableRow key={ec.id}>
                        <TableCell className="font-medium">
                          {ec.competencies?.name} ({ec.competencies?.code})
                        </TableCell>
                        <TableCell>
                          {ec.competency_levels ? (
                            <Badge variant="secondary">{ec.competency_levels.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isFromJob ? (
                            <Badge variant="outline" className="gap-1 text-amber-700 border-amber-300 bg-amber-50">
                              Override
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <User className="h-3 w-3" />
                              Individual
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ec.weighting}%</Badge>
                        </TableCell>
                        <TableCell>
                          {ec.proficiency_date
                            ? formatDateForDisplay(ec.proficiency_date, "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell>{formatDateForDisplay(ec.start_date, "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {ec.end_date ? formatDateForDisplay(ec.end_date, "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ec.id, ec.competencies?.name || "")}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Competency Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee Competency</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Competency *</Label>
              <Select
                value={formData.competency_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, competency_id: value, competency_level_id: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select competency" />
                </SelectTrigger>
                <SelectContent>
                  {competencies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proficiency Level</Label>
              <Select
                value={formData.competency_level_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, competency_level_id: value === "__none__" ? "" : value })
                }
                disabled={!formData.competency_id || competencyLevels.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={competencyLevels.length === 0 ? "No levels defined" : "Select level (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not specified</SelectItem>
                  {competencyLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} ({level.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weighting (0-100%) *</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weighting}
                  onChange={(e) => setFormData({ ...formData, weighting: e.target.value })}
                  placeholder="e.g., 20"
                />
              </div>
              <div className="space-y-2">
                <Label>Proficiency Date</Label>
                <Input
                  type="date"
                  value={formData.proficiency_date}
                  onChange={(e) => setFormData({ ...formData, proficiency_date: e.target.value })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Total weight for overlapping competencies cannot exceed 100%
            </p>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Competency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

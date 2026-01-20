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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Award, RefreshCw, Briefcase, User, Target, ChevronsUpDown, Check, Clock } from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { useAuditLog } from "@/hooks/useAuditLog";
import { fetchCompetencyCascade, syncJobCompetenciesToEmployee, CascadedCompetency } from "@/hooks/useCompetencyCascade";
import { cn } from "@/lib/utils";
import { ProficiencyLevelPicker, ProficiencyLevelBadge } from "@/components/capabilities/ProficiencyLevelPicker";
import { ProficiencyGapBadge } from "@/components/employee/ProficiencyGapBadge";

interface EmployeeCompetency {
  id: string;
  employee_id: string;
  competency_id: string;
  required_proficiency_level: number | null;
  assessed_proficiency_level: number | null;
  assessed_date: string | null;
  assessment_source: string | null;
  is_required: boolean;
  weighting: number;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  skills_competencies?: { id: string; name: string; code: string; category: string | null };
}

interface Competency {
  id: string;
  name: string;
  code: string;
  category: string | null;
  company_id: string;
}

interface EmployeeCompetenciesTabProps {
  employeeId: string;
}

export function EmployeeCompetenciesTab({ employeeId }: EmployeeCompetenciesTabProps) {
  const [employeeCompetencies, setEmployeeCompetencies] = useState<EmployeeCompetency[]>([]);
  const [jobCompetencies, setJobCompetencies] = useState<CascadedCompetency[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const { logAction } = useAuditLog();
  const [formData, setFormData] = useState({
    competency_id: "",
    required_proficiency_level: 3,
    is_required: true,
    weighting: "10",
    notes: "",
    start_date: getTodayString(),
    end_date: "",
  });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCompetencies();
    fetchCompetenciesList();
  }, [employeeId]);

  const fetchAllCompetencies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("employee_competencies")
        .select(`
          id,
          employee_id,
          competency_id,
          required_proficiency_level,
          assessed_proficiency_level,
          assessed_date,
          assessment_source,
          is_required,
          weighting,
          notes,
          start_date,
          end_date,
          skills_competencies(id, name, code, category)
        `)
        .eq("employee_id", employeeId)
        .is("end_date", null)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching employee competencies:", error);
        toast.error("Failed to load competencies");
      } else {
        setEmployeeCompetencies(data || []);
      }

      const cascadeResult = await fetchCompetencyCascade(employeeId);
      setJobCompetencies(cascadeResult.fromJob);
      
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

  const fetchCompetenciesList = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", employeeId)
      .single();
    
    const employeeCompanyId = profile?.company_id;
    
    const { data, error } = await supabase
      .from("skills_competencies")
      .select(`id, name, code, category, is_global, company_capabilities(company_id)`)
      .eq("type", "COMPETENCY")
      .eq("status", "active")
      .order("category")
      .order("name");

    if (!error && data) {
      const filtered = data.filter((c: any) => {
        if (c.is_global) return true;
        if (!employeeCompanyId) return false;
        return (c.company_capabilities || []).some((cc: any) => cc.company_id === employeeCompanyId);
      });
      setCompetencies(filtered.map((c: any) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        category: c.category,
        company_id: employeeCompanyId || '',
      })));
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      competency_id: "",
      required_proficiency_level: 3,
      is_required: true,
      weighting: "10",
      notes: "",
      start_date: getTodayString(),
      end_date: "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.competency_id) {
      toast.error("Please select a competency");
      return;
    }

    const weighting = parseFloat(formData.weighting);
    if (isNaN(weighting) || weighting < 0 || weighting > 100) {
      toast.error("Weighting must be between 0 and 100");
      return;
    }

    setIsSaving(true);
    const payload = {
      employee_id: employeeId,
      competency_id: formData.competency_id,
      required_proficiency_level: formData.required_proficiency_level,
      assessed_proficiency_level: null,
      assessment_source: 'pending',
      is_required: formData.is_required,
      weighting: weighting,
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
      toast.error("Failed to add competency");
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
    const { error } = await supabase.from("employee_competencies").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove competency");
    } else {
      await logAction({ action: 'DELETE', entityType: 'employee_competency', entityId: id, entityName: name });
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
        fetchAllCompetencies();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const totalWeight = employeeCompetencies.reduce((sum, ec) => sum + Number(ec.weighting), 0);
  const jobTotalWeight = jobCompetencies.reduce((sum, jc) => sum + Number(jc.weighting), 0);

  const groupedCompetencies = useMemo(() => {
    const groups: Record<string, Competency[]> = {};
    competencies.forEach(c => {
      const cat = c.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });
    return groups;
  }, [competencies]);

  const assignedIds = new Set(employeeCompetencies.map(ec => ec.competency_id));
  const selectedCompetency = competencies.find(c => c.id === formData.competency_id);

  return (
    <div className="space-y-6">
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
                <Button variant="outline" size="sm" onClick={handleSyncFromJob} disabled={isSyncing}>
                  {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Sync from Job
                </Button>
              )}
              <Button size="sm" onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Competency
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* From Job Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            From Job Profile
            <Badge variant="secondary" className="ml-2">{jobCompetencies.length} competencies • {jobTotalWeight}% weight</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : jobCompetencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No competencies defined in job profile</div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competency</TableHead>
                    <TableHead>Required Level</TableHead>
                    <TableHead>Weight %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobCompetencies.map((jc) => (
                    <TableRow key={jc.competency_id}>
                      <TableCell className="font-medium">{jc.name} {jc.code && <span className="text-muted-foreground">({jc.code})</span>}</TableCell>
                      <TableCell><ProficiencyLevelBadge level={jc.required_level || 3} size="sm" /></TableCell>
                      <TableCell><Badge variant="outline">{jc.weighting}%</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Assignments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Individual Assignments
            <Badge variant="secondary" className="ml-2">{employeeCompetencies.length} total • {totalWeight}% weight</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competency</TableHead>
                  <TableHead>Required Level</TableHead>
                  <TableHead>Assessed Level</TableHead>
                  <TableHead>Gap</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
                ) : employeeCompetencies.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No individual competencies assigned</TableCell></TableRow>
                ) : (
                  employeeCompetencies.map((ec) => (
                    <TableRow key={ec.id}>
                      <TableCell className="font-medium">
                        {ec.skills_competencies?.name || "Unknown"}
                        {ec.skills_competencies?.code && <span className="text-muted-foreground ml-1">({ec.skills_competencies.code})</span>}
                        {ec.skills_competencies?.category && <Badge variant="outline" className="ml-2">{ec.skills_competencies.category}</Badge>}
                      </TableCell>
                      <TableCell>{ec.required_proficiency_level ? <ProficiencyLevelBadge level={ec.required_proficiency_level} size="sm" /> : "—"}</TableCell>
                      <TableCell>
                        {ec.assessed_proficiency_level ? (
                          <ProficiencyLevelBadge level={ec.assessed_proficiency_level} size="sm" />
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell><ProficiencyGapBadge required={ec.required_proficiency_level} assessed={ec.assessed_proficiency_level} /></TableCell>
                      <TableCell><Badge variant="outline">{ec.weighting}%</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(ec.id, ec.skills_competencies?.name || "")}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
            <DialogTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Add Competency</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Competency *</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {selectedCompetency ? `${selectedCompetency.name} (${selectedCompetency.code})` : "Select competency..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search competencies..." />
                    <CommandList>
                      <CommandEmpty>No competency found.</CommandEmpty>
                      {Object.entries(groupedCompetencies).map(([category, items]) => (
                        <CommandGroup key={category} heading={category}>
                          {items.map((c) => {
                            const isAssigned = assignedIds.has(c.id);
                            return (
                              <CommandItem
                                key={c.id}
                                value={`${c.name} ${c.code}`}
                                disabled={isAssigned}
                                onSelect={() => {
                                  if (!isAssigned) {
                                    setFormData({ ...formData, competency_id: c.id });
                                    setComboboxOpen(false);
                                  }
                                }}
                                className={cn(isAssigned && "opacity-50")}
                              >
                                <Check className={cn("mr-2 h-4 w-4", formData.competency_id === c.id ? "opacity-100" : "opacity-0")} />
                                {c.name} ({c.code})
                                {isAssigned && <Badge variant="secondary" className="ml-auto">Assigned</Badge>}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Required Proficiency Level *</Label>
              <ProficiencyLevelPicker
                value={formData.required_proficiency_level}
                onChange={(level) => setFormData({ ...formData, required_proficiency_level: level || 3 })}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={formData.is_required} onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })} />
              <Label>Required Competency</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight (0-100%)</Label>
                <Input type="number" min="0" max="100" value={formData.weighting} onChange={(e) => setFormData({ ...formData, weighting: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
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

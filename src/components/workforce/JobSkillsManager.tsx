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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Loader2, Wrench, Info, ChevronsUpDown, Check, Trash2 } from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { ProficiencyLevelPicker } from "@/components/capabilities/ProficiencyLevelPicker";
import { cn } from "@/lib/utils";

interface JobSkillRequirement {
  id: string;
  job_id: string;
  capability_id: string;
  required_proficiency_level: number;
  weighting: number;
  is_required: boolean;
  is_preferred: boolean;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  skills_competencies?: {
    name: string;
    code: string;
    type: string;
    category: string;
    description?: string;
  };
}

interface Skill {
  id: string;
  name: string;
  code: string;
  type: string;
  category: string;
  description?: string;
}

interface JobSkillsManagerProps {
  jobId: string;
  companyId: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical",
  functional: "Functional",
  behavioral: "Behavioral",
  leadership: "Leadership",
  core: "Core",
};

export function JobSkillsManager({ jobId, companyId }: JobSkillsManagerProps) {
  const [requirements, setRequirements] = useState<JobSkillRequirement[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<JobSkillRequirement | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const [formData, setFormData] = useState({
    capability_id: "",
    required_proficiency_level: "3",
    is_required: true,
    is_preferred: false,
    notes: "",
    start_date: getTodayString(),
    end_date: "",
  });

  useEffect(() => {
    fetchRequirements();
    fetchSkills();
  }, [jobId, companyId]);

  const fetchRequirements = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("job_capability_requirements")
      .select(`
        *,
        skills_competencies(name, code, type, category, description)
      `)
      .eq("job_id", jobId)
      .order("is_required", { ascending: false });

    if (error) {
      console.error("Error fetching job skill requirements:", error);
      toast.error("Failed to load skill requirements");
    } else {
      // Filter to only skills
      const skillReqs = (data || []).filter(
        (r) => r.skills_competencies?.type === "SKILL"
      );
      setRequirements(skillReqs);
    }
    setIsLoading(false);
  };

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from("skills_competencies")
      .select("id, name, code, type, category, description")
      .eq("status", "active")
      .eq("type", "SKILL")
      .or(`company_id.eq.${companyId},company_id.is.null`)
      .order("name");

    if (error) {
      console.error("Error fetching skills:", error);
    } else {
      setSkills(data || []);
    }
  };

  // Group skills by category
  const groupedSkills = useMemo(() => {
    const groups: Record<string, Skill[]> = {};
    skills.forEach((s) => {
      const category = s.category || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(s);
    });
    return groups;
  }, [skills]);

  const existingSkillIds = useMemo(
    () => requirements.map((r) => r.capability_id),
    [requirements]
  );

  const handleOpenDialog = (preselectedSkill?: Skill) => {
    setEditingRequirement(null);
    setFormData({
      capability_id: preselectedSkill?.id || "",
      required_proficiency_level: "3",
      is_required: true,
      is_preferred: false,
      notes: "",
      start_date: getTodayString(),
      end_date: "",
    });
    setDialogOpen(true);
  };

  const handleEditRequirement = (requirement: JobSkillRequirement) => {
    setEditingRequirement(requirement);
    setFormData({
      capability_id: requirement.capability_id,
      required_proficiency_level: requirement.required_proficiency_level.toString(),
      is_required: requirement.is_required,
      is_preferred: requirement.is_preferred,
      notes: requirement.notes || "",
      start_date: requirement.start_date,
      end_date: requirement.end_date || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.capability_id) {
      toast.error("Please select a skill");
      return;
    }

    if (!formData.start_date) {
      toast.error("Please enter a start date");
      return;
    }

    setIsSaving(true);
    const payload = {
      job_id: jobId,
      capability_id: formData.capability_id,
      required_proficiency_level: parseInt(formData.required_proficiency_level),
      weighting: 0, // Skills don't have weighting - they're not scored in appraisals
      is_required: formData.is_required,
      is_preferred: formData.is_preferred,
      notes: formData.notes.trim() || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
    };

    if (editingRequirement) {
      const { error } = await supabase
        .from("job_capability_requirements")
        .update(payload)
        .eq("id", editingRequirement.id);

      if (error) {
        console.error("Error updating skill requirement:", error);
        toast.error("Failed to update skill requirement");
      } else {
        toast.success("Skill requirement updated");
        fetchRequirements();
        setDialogOpen(false);
        setEditingRequirement(null);
      }
    } else {
      const { error } = await supabase.from("job_capability_requirements").insert([payload]);

      if (error) {
        console.error("Error adding skill requirement:", error);
        if (error.message?.includes("job_capability_no_overlap")) {
          toast.error("This skill already has an entry for overlapping dates");
        } else {
          toast.error("Failed to add skill requirement");
        }
      } else {
        toast.success("Skill requirement added successfully");
        fetchRequirements();
        setDialogOpen(false);
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("job_capability_requirements").delete().eq("id", id);

    if (error) {
      console.error("Error deleting skill requirement:", error);
      toast.error("Failed to remove skill requirement");
    } else {
      toast.success("Skill requirement removed");
      fetchRequirements();
    }
  };

  const selectedSkill = skills.find((s) => s.id === formData.capability_id);

  return (
    <div className="space-y-4">
      {/* Info callout explaining job skills */}
      <Alert className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800">
        <Wrench className="h-4 w-4 text-teal-600" />
        <AlertDescription className="text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-teal-800 dark:text-teal-300">
              Job Skills — Capability Requirements
            </span>
            <span className="text-teal-700 dark:text-teal-400">
              Job Skills define the capabilities required to perform this job. They are used for{" "}
              <strong>recruitment</strong>, <strong>learning paths</strong>, and{" "}
              <strong>succession readiness</strong> — but are{" "}
              <strong>NOT scored in performance appraisals</strong>.
            </span>
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {requirements.length} skill{requirements.length !== 1 ? "s" : ""} defined
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : requirements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
          <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No job skills defined yet.</p>
          <p className="text-xs mt-1">Add skills to define capability requirements for this job.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Required Level</TableHead>
                <TableHead>Required/Preferred</TableHead>
                <TableHead>Effective</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requirements.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{req.skills_competencies?.name}</span>
                      <span className="text-xs text-muted-foreground">{req.skills_competencies?.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {CATEGORY_LABELS[req.skills_competencies?.category || ""] || req.skills_competencies?.category || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                      L{req.required_proficiency_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {req.is_required ? (
                      <Badge variant="default">Required</Badge>
                    ) : req.is_preferred ? (
                      <Badge variant="secondary">Preferred</Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateForDisplay(req.start_date)}
                    {req.end_date && ` - ${formatDateForDisplay(req.end_date)}`}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditRequirement(req)}
                      >
                        <Wrench className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(req.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRequirement ? "Edit Skill Requirement" : "Add Job Skill"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Skill *</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between"
                    disabled={!!editingRequirement}
                  >
                    {selectedSkill ? selectedSkill.name : "Select skill..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search skills..." />
                    <CommandList>
                      <CommandEmpty>No skills found.</CommandEmpty>
                      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                        <CommandGroup key={category} heading={CATEGORY_LABELS[category] || category}>
                          {categorySkills.map((skill) => {
                            const isExisting = existingSkillIds.includes(skill.id);
                            return (
                              <CommandItem
                                key={skill.id}
                                value={skill.name}
                                onSelect={() => {
                                  setFormData({ ...formData, capability_id: skill.id });
                                  setComboboxOpen(false);
                                }}
                                disabled={isExisting}
                                className={cn(isExisting && "opacity-50")}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.capability_id === skill.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{skill.name}</div>
                                  <div className="text-xs text-muted-foreground">{skill.code}</div>
                                </div>
                                {isExisting && (
                                  <Badge variant="secondary" className="text-xs">Added</Badge>
                                )}
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
              <Label>Required Proficiency Level</Label>
              <ProficiencyLevelPicker
                value={parseInt(formData.required_proficiency_level)}
                onChange={(level) => setFormData({ ...formData, required_proficiency_level: level.toString() })}
              />
            </div>

            <div className="space-y-3">
              <Label>Requirement Type</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_required}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_required: checked, is_preferred: checked ? false : formData.is_preferred })
                    }
                  />
                  <span className="text-sm">Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_preferred}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_preferred: checked, is_required: checked ? false : formData.is_required })
                    }
                  />
                  <span className="text-sm">Preferred</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective From *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Effective Until</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRequirement ? "Update" : "Add Skill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

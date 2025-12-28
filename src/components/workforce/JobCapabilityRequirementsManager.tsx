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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Loader2, Target, Info, ChevronsUpDown, Check, ArrowRight, Sparkles } from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { ProficiencyLevelPicker } from "@/components/capabilities/ProficiencyLevelPicker";
import { CompetencyRequirementRow } from "./CompetencyRequirementRow";
import { AICompetencySuggestions } from "./AICompetencySuggestions";
import { cn } from "@/lib/utils";

interface JobCapabilityRequirement {
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

interface Capability {
  id: string;
  name: string;
  code: string;
  type: string;
  category: string;
  description?: string;
}

interface LinkedSkill {
  id: string;
  skill_id: string;
  min_proficiency_level: number | null;
  weight: number;
  is_required: boolean;
  skill: {
    id: string;
    name: string;
    code: string;
    category: string;
  } | null;
  override?: {
    id: string;
    override_proficiency_level: number;
    override_reason: string | null;
  } | null;
}

interface JobInfo {
  name: string;
  description?: string;
  job_level?: string;
  job_grade?: string;
}

interface JobCapabilityRequirementsManagerProps {
  jobId: string;
  companyId: string;
}

export function JobCapabilityRequirementsManager({ 
  jobId, 
  companyId 
}: JobCapabilityRequirementsManagerProps) {
  const [requirements, setRequirements] = useState<JobCapabilityRequirement[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [linkedSkillsMap, setLinkedSkillsMap] = useState<Record<string, LinkedSkill[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<JobCapabilityRequirement | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  
  const [formData, setFormData] = useState({
    capability_id: "",
    required_proficiency_level: "3",
    weighting: "10",
    is_required: true,
    is_preferred: false,
    notes: "",
    start_date: getTodayString(),
    end_date: "",
  });

  useEffect(() => {
    fetchRequirements();
    fetchCapabilities();
    fetchJobInfo();
  }, [jobId, companyId]);

  const fetchJobInfo = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("name, description, job_level, job_grade")
      .eq("id", jobId)
      .single();
    
    if (!error && data) {
      setJobInfo(data);
    }
  };

  const fetchRequirements = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("job_capability_requirements")
      .select(`
        *,
        skills_competencies(name, code, type, category, description)
      `)
      .eq("job_id", jobId)
      .order("weighting", { ascending: false });

    if (error) {
      console.error("Error fetching job capability requirements:", error);
      toast.error("Failed to load capability requirements");
    } else {
      // Filter to only competencies for the primary view
      const competencyReqs = (data || []).filter(
        (r) => r.skills_competencies?.type === "COMPETENCY"
      );
      setRequirements(competencyReqs);
      
      // Fetch linked skills for all competencies
      if (competencyReqs.length > 0) {
        fetchLinkedSkills(competencyReqs.map((r) => r.capability_id), competencyReqs);
      }
    }
    setIsLoading(false);
  };

  const fetchLinkedSkills = async (competencyIds: string[], reqs: JobCapabilityRequirement[]) => {
    setIsLoadingSkills(true);
    const { data, error } = await supabase
      .from("competency_skill_mappings")
      .select(`
        id,
        skill_id,
        min_proficiency_level,
        weight,
        is_required,
        skill:skills_competencies!competency_skill_mappings_skill_id_fkey(id, name, code, category)
      `)
      .in("competency_id", competencyIds);

    if (error) {
      console.error("Error fetching linked skills:", error);
    } else {
      // Fetch any job-specific overrides
      const reqIds = reqs.map(r => r.id);
      const { data: overrides } = await supabase
        .from("job_skill_overrides")
        .select("*")
        .eq("job_id", jobId)
        .in("competency_requirement_id", reqIds);

      // Group skills by competency_id
      const skillsMap: Record<string, LinkedSkill[]> = {};
      competencyIds.forEach((id) => {
        skillsMap[id] = [];
      });
      
      // We need to re-query to get competency_id in the mapping
      const { data: mappings } = await supabase
        .from("competency_skill_mappings")
        .select("*")
        .in("competency_id", competencyIds);
      
      if (mappings) {
        mappings.forEach((mapping) => {
          const skillData = data?.find((d) => d.id === mapping.id);
          if (skillData && skillsMap[mapping.competency_id]) {
            // Find if there's an override for this skill
            const competencyReq = reqs.find(r => r.capability_id === mapping.competency_id);
            const override = overrides?.find(
              o => o.skill_id === skillData.skill_id && o.competency_requirement_id === competencyReq?.id
            );
            
            skillsMap[mapping.competency_id].push({
              ...skillData,
              skill: skillData.skill as any,
              override: override ? {
                id: override.id,
                override_proficiency_level: override.override_proficiency_level,
                override_reason: override.override_reason,
              } : null,
            });
          }
        });
      }
      
      setLinkedSkillsMap(skillsMap);
    }
    setIsLoadingSkills(false);
  };

  const fetchCapabilities = async () => {
    const { data, error } = await supabase
      .from("skills_competencies")
      .select("id, name, code, type, category, description")
      .eq("status", "active")
      .eq("type", "COMPETENCY") // Only fetch competencies for the dropdown
      .or(`company_id.eq.${companyId},company_id.is.null`)
      .order("name");

    if (error) {
      console.error("Error fetching capabilities:", error);
    } else {
      setCapabilities(data || []);
    }
  };

  // Group competencies by category
  const groupedCompetencies = useMemo(() => {
    const groups: Record<string, Capability[]> = {};
    capabilities.forEach((c) => {
      const category = c.category || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(c);
    });
    return groups;
  }, [capabilities]);

  const existingRequirementIds = useMemo(
    () => requirements.map((r) => r.capability_id),
    [requirements]
  );

  const handleOpenDialog = (preselectedCapability?: Capability, suggestedLevel?: number, suggestedWeight?: number) => {
    setEditingRequirement(null);
    setFormData({
      capability_id: preselectedCapability?.id || "",
      required_proficiency_level: suggestedLevel?.toString() || "3",
      weighting: suggestedWeight?.toString() || "10",
      is_required: true,
      is_preferred: false,
      notes: "",
      start_date: getTodayString(),
      end_date: "",
    });
    setDialogOpen(true);
  };

  const handleEditRequirement = (requirement: JobCapabilityRequirement) => {
    setEditingRequirement(requirement);
    setFormData({
      capability_id: requirement.capability_id,
      required_proficiency_level: requirement.required_proficiency_level.toString(),
      weighting: requirement.weighting.toString(),
      is_required: requirement.is_required,
      is_preferred: requirement.is_preferred,
      notes: requirement.notes || "",
      start_date: requirement.start_date,
      end_date: requirement.end_date || "",
    });
    setDialogOpen(true);
  };

  const handleAISuggestionSelect = (capability: Capability, suggestedLevel?: number, suggestedWeight?: number) => {
    handleOpenDialog(capability, suggestedLevel, suggestedWeight);
  };

  const calculateOverlappingWeight = (
    newStartDate: string,
    newEndDate: string | null
  ): number => {
    const e1 = newEndDate || "9999-12-31";
    
    return requirements
      .filter((req) => {
        const e2 = req.end_date || "9999-12-31";
        return newStartDate <= e2 && req.start_date <= e1;
      })
      .reduce((sum, req) => sum + Number(req.weighting), 0);
  };

  const handleSave = async () => {
    if (!formData.capability_id) {
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

    // Exclude current requirement when checking overlap for edits
    const currentOverlappingWeight = requirements
      .filter((req) => {
        if (editingRequirement && req.id === editingRequirement.id) return false;
        const e1 = formData.end_date || "9999-12-31";
        const e2 = req.end_date || "9999-12-31";
        return formData.start_date <= e2 && req.start_date <= e1;
      })
      .reduce((sum, req) => sum + Number(req.weighting), 0);
    
    if (currentOverlappingWeight + weighting > 100) {
      toast.error(
        `Total weighting would exceed 100%. Current: ${currentOverlappingWeight}%, max you can add: ${100 - currentOverlappingWeight}%`
      );
      return;
    }

    setIsSaving(true);
    const payload = {
      job_id: jobId,
      capability_id: formData.capability_id,
      required_proficiency_level: parseInt(formData.required_proficiency_level),
      weighting: weighting,
      is_required: formData.is_required,
      is_preferred: formData.is_preferred,
      notes: formData.notes.trim() || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
    };

    if (editingRequirement) {
      // Update existing requirement
      const { error } = await supabase
        .from("job_capability_requirements")
        .update(payload)
        .eq("id", editingRequirement.id);

      if (error) {
        console.error("Error updating capability requirement:", error);
        toast.error("Failed to update competency requirement");
      } else {
        toast.success("Competency requirement updated");
        fetchRequirements();
        setDialogOpen(false);
        setEditingRequirement(null);
      }
    } else {
      // Insert new requirement
      const { error } = await supabase.from("job_capability_requirements").insert([payload]);

      if (error) {
        console.error("Error adding capability requirement:", error);
        if (error.message?.includes("job_capability_no_overlap")) {
          toast.error("This competency already has an entry for overlapping dates");
        } else {
          toast.error("Failed to add competency requirement");
        }
      } else {
        toast.success("Competency requirement added successfully");
        fetchRequirements();
        setDialogOpen(false);
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("job_capability_requirements").delete().eq("id", id);

    if (error) {
      console.error("Error deleting capability requirement:", error);
      toast.error("Failed to remove competency requirement");
    } else {
      toast.success("Competency requirement removed");
      fetchRequirements();
    }
  };

  const handleSkillOverride = async (
    requirementId: string,
    skillId: string,
    overrideLevel: number | null,
    reason: string | null,
    existingOverrideId?: string
  ) => {
    if (existingOverrideId && overrideLevel === null) {
      // Remove override
      const { error } = await supabase
        .from("job_skill_overrides")
        .delete()
        .eq("id", existingOverrideId);
      
      if (error) {
        toast.error("Failed to remove override");
        return;
      }
      toast.success("Override removed - using baseline level");
    } else if (existingOverrideId) {
      // Update existing override
      const { error } = await supabase
        .from("job_skill_overrides")
        .update({
          override_proficiency_level: overrideLevel,
          override_reason: reason,
        })
        .eq("id", existingOverrideId);
      
      if (error) {
        toast.error("Failed to update override");
        return;
      }
      toast.success("Skill level override updated");
    } else if (overrideLevel !== null) {
      // Create new override
      const { error } = await supabase
        .from("job_skill_overrides")
        .insert({
          job_id: jobId,
          competency_requirement_id: requirementId,
          skill_id: skillId,
          override_proficiency_level: overrideLevel,
          override_reason: reason,
        });
      
      if (error) {
        toast.error("Failed to save override");
        return;
      }
      toast.success("Skill level override saved");
    }
    
    // Refresh linked skills to show updated overrides
    fetchLinkedSkills(requirements.map(r => r.capability_id), requirements);
  };

  const totalWeight = requirements
    .filter((r) => !r.end_date)
    .reduce((sum, r) => sum + Number(r.weighting), 0);

  const selectedCapability = capabilities.find((c) => c.id === formData.capability_id);

  return (
    <div className="space-y-4">
      {/* Info callout explaining competency-first approach */}
      <Alert className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
        <Target className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-purple-800 dark:text-purple-300">
              Competency-First Approach
            </span>
            <span className="text-purple-700 dark:text-purple-400">
              Competencies are evaluated in <strong>performance appraisals</strong>. Skills are linked underneath each competency for context and learning paths.
            </span>
            <div className="flex items-center gap-2 mt-1 text-xs text-purple-600 dark:text-purple-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Competency
              </span>
              <ArrowRight className="h-3 w-3" />
              <span>Appraisal Evaluation</span>
              <ArrowRight className="h-3 w-3" />
              <span>Performance Score</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* AI Suggestions Section */}
      {jobInfo && (
        <AICompetencySuggestions
          jobName={jobInfo.name}
          jobDescription={jobInfo.description}
          jobLevel={jobInfo.job_level}
          jobGrade={jobInfo.job_grade}
          companyId={companyId}
          availableCompetencies={capabilities}
          existingRequirementIds={existingRequirementIds}
          onSelectCompetency={handleAISuggestionSelect}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold">Competency Requirements</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Define the competencies required for this job role. Competencies flow directly to performance appraisals. Expand each competency to see linked skills.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge variant="outline">Total Weight: {totalWeight}%</Badge>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()} disabled={capabilities.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Competency
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competency</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Required Level</TableHead>
              <TableHead className="w-[100px]">Weight %</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[80px]">Required</TableHead>
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
            ) : requirements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Target className="h-8 w-8 opacity-50" />
                    <p>No competency requirements defined for this job</p>
                    <p className="text-xs">Add competencies to define what's evaluated in appraisals</p>
                    {jobInfo && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleOpenDialog()}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Add First Competency
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requirements.map((req) => (
                <CompetencyRequirementRow
                  key={req.id}
                  requirement={req}
                  linkedSkills={linkedSkillsMap[req.capability_id] || []}
                  onDelete={handleDelete}
                  onEdit={handleEditRequirement}
                  onSkillOverride={(skillId, level, reason, existingId) => 
                    handleSkillOverride(req.id, skillId, level, reason, existingId)
                  }
                  isLoadingSkills={isLoadingSkills}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Competency Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setEditingRequirement(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              {editingRequirement ? "Edit Competency Requirement" : "Add Competency Requirement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Competency *</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between"
                  >
                    {selectedCapability ? (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        {selectedCapability.name}
                        <span className="text-muted-foreground">({selectedCapability.code})</span>
                      </div>
                    ) : (
                      "Select competency..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search competencies..." />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No competency found.</CommandEmpty>
                      {Object.entries(groupedCompetencies).map(([category, comps]) => (
                        <CommandGroup key={category} heading={category.charAt(0).toUpperCase() + category.slice(1)}>
                          {comps.map((c) => {
                            const isAdded = existingRequirementIds.includes(c.id);
                            return (
                              <CommandItem
                                key={c.id}
                                value={c.name}
                                disabled={isAdded}
                                onSelect={() => {
                                  setFormData({ ...formData, capability_id: c.id });
                                  setComboboxOpen(false);
                                }}
                                className={cn(
                                  "flex items-center gap-2",
                                  isAdded && "opacity-50"
                                )}
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    formData.capability_id === c.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                <div className="flex flex-col">
                                  <span>{c.name} ({c.code})</span>
                                  {c.description && (
                                    <span className="text-xs text-muted-foreground truncate max-w-[350px]">
                                      {c.description}
                                    </span>
                                  )}
                                </div>
                                {isAdded && (
                                  <Badge variant="secondary" className="ml-auto text-xs">
                                    Already added
                                  </Badge>
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
              {selectedCapability && (
                <p className="text-xs text-muted-foreground capitalize">
                  Category: {selectedCapability.category}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Required Proficiency Level *</Label>
              <ProficiencyLevelPicker
                value={parseInt(formData.required_proficiency_level) || null}
                onChange={(value) =>
                  setFormData({ ...formData, required_proficiency_level: value?.toString() || "3" })
                }
                showDescription
                showAppraisalContext
              />
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
              <p className="text-xs text-muted-foreground">
                Total weight for active requirements cannot exceed 100%
              </p>
            </div>

            <div className="space-y-3">
              <Label>Requirement Type</Label>
              <RadioGroup
                value={formData.is_required ? 'required' : formData.is_preferred ? 'preferred' : 'optional'}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    is_required: value === 'required',
                    is_preferred: value === 'preferred'
                  });
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="required" id="req-required" className="mt-0.5" />
                  <div className="space-y-1">
                    <Label htmlFor="req-required" className="font-medium cursor-pointer">Required</Label>
                    <p className="text-xs text-muted-foreground">
                      Must-have competency — candidates without it may be disqualified
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="preferred" id="req-preferred" className="mt-0.5" />
                  <div className="space-y-1">
                    <Label htmlFor="req-preferred" className="font-medium cursor-pointer">Preferred</Label>
                    <p className="text-xs text-muted-foreground">
                      Nice-to-have competency — adds value but not essential for the role
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="optional" id="req-optional" className="mt-0.5" />
                  <div className="space-y-1">
                    <Label htmlFor="req-optional" className="font-medium cursor-pointer">Optional</Label>
                    <p className="text-xs text-muted-foreground">
                      Tracked for development purposes but not evaluated in hiring decisions
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

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
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              setEditingRequirement(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRequirement ? "Save Changes" : "Add Competency"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

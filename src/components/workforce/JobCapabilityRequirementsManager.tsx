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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Trash2, Loader2, Zap, Info, Filter } from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

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
  };
}

interface Capability {
  id: string;
  name: string;
  code: string;
  type: string;
  category: string;
}

interface JobCapabilityRequirementsManagerProps {
  jobId: string;
  companyId: string;
}

type FilterType = "all" | "SKILL" | "COMPETENCY";

const PROFICIENCY_LEVELS = [
  { value: 1, label: "Level 1 - Novice" },
  { value: 2, label: "Level 2 - Beginner" },
  { value: 3, label: "Level 3 - Intermediate" },
  { value: 4, label: "Level 4 - Advanced" },
  { value: 5, label: "Level 5 - Expert" },
];

const getProficiencyLabel = (level: number): string => {
  return PROFICIENCY_LEVELS.find(p => p.value === level)?.label || `Level ${level}`;
};

const getTypeBadgeStyles = (type: string) => {
  if (type === "SKILL") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
  }
  return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
};

export function JobCapabilityRequirementsManager({ 
  jobId, 
  companyId 
}: JobCapabilityRequirementsManagerProps) {
  const [requirements, setRequirements] = useState<JobCapabilityRequirement[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
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
  }, [jobId, companyId]);

  const fetchRequirements = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("job_capability_requirements")
      .select(`
        *,
        skills_competencies(name, code, type, category)
      `)
      .eq("job_id", jobId)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching job capability requirements:", error);
      toast.error("Failed to load capability requirements");
    } else {
      setRequirements(data || []);
    }
    setIsLoading(false);
  };

  const fetchCapabilities = async () => {
    const { data, error } = await supabase
      .from("skills_competencies")
      .select("id, name, code, type, category")
      .eq("status", "active")
      .or(`company_id.eq.${companyId},company_id.is.null`)
      .order("type")
      .order("name");

    if (error) {
      console.error("Error fetching capabilities:", error);
    } else {
      setCapabilities(data || []);
    }
  };

  // Group capabilities by type for the dropdown
  const groupedCapabilities = useMemo(() => {
    const skills = capabilities.filter(c => c.type === "SKILL");
    const competencies = capabilities.filter(c => c.type === "COMPETENCY");
    return { skills, competencies };
  }, [capabilities]);

  // Filter requirements based on selected type
  const filteredRequirements = useMemo(() => {
    if (typeFilter === "all") return requirements;
    return requirements.filter(r => r.skills_competencies?.type === typeFilter);
  }, [requirements, typeFilter]);

  const handleOpenDialog = () => {
    setFormData({
      capability_id: "",
      required_proficiency_level: "3",
      weighting: "10",
      is_required: true,
      is_preferred: false,
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
    const e1 = newEndDate || "9999-12-31";
    
    return requirements
      .filter(req => {
        const e2 = req.end_date || "9999-12-31";
        return newStartDate <= e2 && req.start_date <= e1;
      })
      .reduce((sum, req) => sum + Number(req.weighting), 0);
  };

  const handleSave = async () => {
    if (!formData.capability_id) {
      toast.error("Please select a skill or competency");
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

    const { error } = await supabase.from("job_capability_requirements").insert([payload]);

    if (error) {
      console.error("Error adding capability requirement:", error);
      if (error.message?.includes("job_capability_no_overlap")) {
        toast.error("This capability already has an entry for overlapping dates");
      } else {
        toast.error("Failed to add capability requirement");
      }
    } else {
      toast.success("Capability requirement added successfully");
      fetchRequirements();
      setDialogOpen(false);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("job_capability_requirements").delete().eq("id", id);

    if (error) {
      console.error("Error deleting capability requirement:", error);
      toast.error("Failed to remove capability requirement");
    } else {
      toast.success("Capability requirement removed");
      fetchRequirements();
    }
  };

  const totalWeight = requirements
    .filter(r => !r.end_date)
    .reduce((sum, r) => sum + Number(r.weighting), 0);

  const selectedCapability = capabilities.find(c => c.id === formData.capability_id);

  // Count by type for filter badges
  const skillsCount = requirements.filter(r => r.skills_competencies?.type === "SKILL").length;
  const competenciesCount = requirements.filter(r => r.skills_competencies?.type === "COMPETENCY").length;

  return (
    <div className="space-y-4">
      {/* Info callout explaining the difference */}
      <Alert className="bg-muted/50 border-muted-foreground/20">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Skills</strong> are specific, teachable abilities (e.g., Excel, SQL, Project Management). 
          <strong className="ml-1">Competencies</strong> are broader behavioral capabilities (e.g., Leadership, Problem-Solving, Communication).
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Required Skills & Competencies</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Define the skills and competencies required for this job role, along with the expected proficiency level and importance weighting.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge variant="outline">Total Weight: {totalWeight}%</Badge>
        </div>
        <Button size="sm" onClick={handleOpenDialog} disabled={capabilities.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Requirement
        </Button>
      </div>

      {/* Type Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
        <div className="flex gap-1">
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("all")}
            className="h-7 text-xs"
          >
            All ({requirements.length})
          </Button>
          <Button
            variant={typeFilter === "SKILL" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("SKILL")}
            className="h-7 text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
            Skills ({skillsCount})
          </Button>
          <Button
            variant={typeFilter === "COMPETENCY" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("COMPETENCY")}
            className="h-7 text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5" />
            Competencies ({competenciesCount})
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
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
                <TableCell colSpan={9} className="text-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredRequirements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                  {requirements.length === 0 
                    ? "No capability requirements defined for this job" 
                    : "No matching requirements for the selected filter"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRequirements.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">
                    {req.skills_competencies?.name}
                    <span className="text-muted-foreground ml-1">({req.skills_competencies?.code})</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getTypeBadgeStyles(req.skills_competencies?.type || "")}
                    >
                      {req.skills_competencies?.type === "SKILL" ? "Skill" : "Competency"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-muted-foreground">
                      {req.skills_competencies?.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      Level {req.required_proficiency_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{req.weighting}%</Badge>
                  </TableCell>
                  <TableCell>{formatDateForDisplay(req.start_date)}</TableCell>
                  <TableCell>
                    {req.end_date ? formatDateForDisplay(req.end_date) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={req.is_required ? "default" : "secondary"}>
                      {req.is_required ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(req.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Skill or Competency Requirement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Skill or Competency *</Label>
              <Select
                value={formData.capability_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, capability_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill or competency" />
                </SelectTrigger>
                <SelectContent>
                  {groupedCapabilities.skills.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Skills
                      </SelectLabel>
                      {groupedCapabilities.skills.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <span>{c.name} ({c.code})</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getTypeBadgeStyles(c.type)}`}
                            >
                              Skill
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {groupedCapabilities.competencies.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Competencies
                      </SelectLabel>
                      {groupedCapabilities.competencies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <span>{c.name} ({c.code})</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getTypeBadgeStyles(c.type)}`}
                            >
                              Competency
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
              {selectedCapability && (
                <p className="text-xs text-muted-foreground capitalize">
                  Category: {selectedCapability.category}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Required Proficiency Level *</Label>
              <Select
                value={formData.required_proficiency_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, required_proficiency_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      {level.label}
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

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                />
                <Label>Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_preferred}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_preferred: checked })}
                />
                <Label>Preferred</Label>
              </div>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Requirement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

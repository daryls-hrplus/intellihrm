import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Award } from "lucide-react";
import { format } from "date-fns";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

interface JobCompetency {
  id: string;
  job_id: string;
  competency_id: string;
  competency_level_id: string | null;
  weighting: number;
  is_required: boolean;
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
}

interface CompetencyLevel {
  id: string;
  competency_id: string;
  name: string;
  code: string;
  level_order: number;
}

interface JobCompetenciesManagerProps {
  jobId: string;
  companyId: string;
}

// Check if two date ranges overlap (using string comparison for dates in YYYY-MM-DD format)
function datesOverlap(
  start1: string,
  end1: string | null,
  start2: string,
  end2: string | null
): boolean {
  const e1 = end1 || "9999-12-31";
  const e2 = end2 || "9999-12-31";
  // Ranges overlap if start1 <= end2 AND start2 <= end1
  return start1 <= e2 && start2 <= e1;
}

export function JobCompetenciesManager({ jobId, companyId }: JobCompetenciesManagerProps) {
  const [jobCompetencies, setJobCompetencies] = useState<JobCompetency[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [competencyLevels, setCompetencyLevels] = useState<CompetencyLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    competency_id: "",
    competency_level_id: "",
    weighting: "10",
    is_required: true,
    notes: "",
    start_date: getTodayString(),
    end_date: "",
  });

  useEffect(() => {
    fetchJobCompetencies();
    fetchCompetencies();
  }, [jobId, companyId]);

  useEffect(() => {
    if (formData.competency_id) {
      fetchCompetencyLevels(formData.competency_id);
    } else {
      setCompetencyLevels([]);
    }
  }, [formData.competency_id]);

  const fetchJobCompetencies = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("job_competencies")
      .select(`
        *,
        competencies(name, code),
        competency_levels(name, code)
      `)
      .eq("job_id", jobId)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching job competencies:", error);
      toast.error("Failed to load job competencies");
    } else {
      setJobCompetencies(data || []);
    }
    setIsLoading(false);
  };

  const fetchCompetencies = async () => {
    const { data, error } = await supabase
      .from("competencies")
      .select("id, name, code")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching competencies:", error);
    } else {
      setCompetencies(data || []);
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
      is_required: true,
      notes: "",
      start_date: getTodayString(),
      end_date: "",
    });
    setDialogOpen(true);
  };

  // Calculate total weighting for competencies that overlap with the new entry's date range
  const calculateOverlappingWeight = (
    newStartDate: string,
    newEndDate: string | null
  ): number => {
    console.log("DEBUG calculateOverlappingWeight:", { 
      newStartDate, 
      newEndDate, 
      jobCompetenciesCount: jobCompetencies.length,
      jobCompetencies: jobCompetencies.map(jc => ({ 
        id: jc.id, 
        start_date: jc.start_date, 
        end_date: jc.end_date, 
        weighting: jc.weighting 
      }))
    });

    // Group competencies by competency_id
    const competencyGroups = new Map<string, JobCompetency[]>();
    for (const jc of jobCompetencies) {
      const existing = competencyGroups.get(jc.competency_id) || [];
      existing.push(jc);
      competencyGroups.set(jc.competency_id, existing);
    }

    let totalWeight = 0;

    // For each unique competency, only count the weight if there's an overlapping entry
    for (const [compId, entries] of competencyGroups) {
      // Find entries that overlap with the new date range
      const overlappingEntries = entries.filter((jc) => {
        const overlaps = datesOverlap(newStartDate, newEndDate, jc.start_date, jc.end_date);
        console.log("DEBUG overlap check:", { newStartDate, newEndDate, jcStart: jc.start_date, jcEnd: jc.end_date, overlaps });
        return overlaps;
      });

      if (overlappingEntries.length > 0) {
        // Take the max weight from overlapping entries (they shouldn't overlap with each other)
        const maxWeight = Math.max(...overlappingEntries.map((e) => Number(e.weighting)));
        totalWeight += maxWeight;
      }
    }

    console.log("DEBUG totalWeight:", totalWeight);
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

    // Validate total weight for overlapping period
    const currentOverlappingWeight = calculateOverlappingWeight(
      formData.start_date,
      formData.end_date || null
    );
    
    if (currentOverlappingWeight + weighting > 100) {
      toast.error(
        `Total weighting would exceed 100%. Current overlapping weight: ${currentOverlappingWeight}%, max you can add: ${100 - currentOverlappingWeight}%`
      );
      return;
    }

    setIsSaving(true);
    const payload = {
      job_id: jobId,
      competency_id: formData.competency_id,
      competency_level_id: formData.competency_level_id || null,
      weighting: weighting,
      is_required: formData.is_required,
      notes: formData.notes.trim() || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
    };

    const { error } = await supabase.from("job_competencies").insert([payload]);

    if (error) {
      console.error("Error adding job competency:", error);
      if (error.message?.includes("Overlapping date ranges")) {
        toast.error("This competency already has an entry for overlapping dates");
      } else {
        toast.error("Failed to add competency");
      }
    } else {
      toast.success("Competency added successfully");
      fetchJobCompetencies();
      setDialogOpen(false);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("job_competencies").delete().eq("id", id);

    if (error) {
      console.error("Error deleting job competency:", error);
      toast.error("Failed to remove competency");
    } else {
      toast.success("Competency removed");
      fetchJobCompetencies();
    }
  };

  // Simple sum of all weights for display (active competencies currently assigned)
  const totalWeight = jobCompetencies.reduce((sum, jc) => sum + Number(jc.weighting), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Required Competencies</h3>
          <Badge variant="outline">Total Weight: {totalWeight}%</Badge>
        </div>
        <Button size="sm" onClick={handleOpenDialog} disabled={competencies.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Competency
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competency</TableHead>
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
                <TableCell colSpan={7} className="text-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : jobCompetencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No competencies assigned to this job
                </TableCell>
              </TableRow>
            ) : (
              jobCompetencies.map((jc) => (
                <TableRow key={jc.id}>
                  <TableCell className="font-medium">
                    {jc.competencies?.name} ({jc.competencies?.code})
                  </TableCell>
                  <TableCell>
                    {jc.competency_levels ? (
                      <Badge variant="secondary">{jc.competency_levels.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Any level</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{jc.weighting}%</Badge>
                  </TableCell>
                  <TableCell>{formatDateForDisplay(jc.start_date)}</TableCell>
                  <TableCell>
                    {jc.end_date ? formatDateForDisplay(jc.end_date) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={jc.is_required ? "default" : "secondary"}>
                      {jc.is_required ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(jc.id)}
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
            <DialogTitle>Add Competency to Job</DialogTitle>
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
              <Label>Required Level</Label>
              <Select
                value={formData.competency_level_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, competency_level_id: value === "__any__" ? "" : value })
                }
                disabled={!formData.competency_id || competencyLevels.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={competencyLevels.length === 0 ? "No levels defined" : "Select level (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any level</SelectItem>
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
                Total weight for overlapping competencies cannot exceed 100%
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
              />
              <Label>Required competency</Label>
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
              Add Competency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

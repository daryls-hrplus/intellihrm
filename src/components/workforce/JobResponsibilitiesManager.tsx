import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, AlertCircle, ChevronDown, ChevronUp, Target } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResponsibilityCategoryBadge, ResponsibilityCategory } from "./ResponsibilityCategoryBadge";
import { ComplexityLevelIndicator } from "./ComplexityLevelIndicator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

interface JobResponsibility {
  id: string;
  job_id: string;
  responsibility_id: string;
  weighting: number;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  responsibility_name?: string;
  responsibility_category?: ResponsibilityCategory | null;
  responsibility_complexity?: number | null;
  responsibility_kras?: string[];
}

interface Responsibility {
  id: string;
  name: string;
  code: string;
  category?: ResponsibilityCategory | null;
  complexity_level?: number | null;
  key_result_areas?: string[];
}

interface JobResponsibilitiesManagerProps {
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
  return start1 <= e2 && start2 <= e1;
}

export function JobResponsibilitiesManager({ jobId, companyId }: JobResponsibilitiesManagerProps) {
  const [jobResponsibilities, setJobResponsibilities] = useState<JobResponsibility[]>([]);
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    responsibility_id: "",
    weighting: 0,
    notes: "",
    start_date: getTodayString(),
    end_date: "",
  });

  const toggleRowExpanded = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalWeight = jobResponsibilities.reduce((sum, jr) => sum + Number(jr.weighting), 0);

  useEffect(() => {
    fetchJobResponsibilities();
    fetchResponsibilities();
  }, [jobId, companyId]);

  const fetchJobResponsibilities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("job_responsibilities")
      .select(`
        id,
        job_id,
        responsibility_id,
        weighting,
        notes,
        start_date,
        end_date,
        responsibilities (name, category, complexity_level, key_result_areas)
      `)
      .eq("job_id", jobId)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching job responsibilities:", error);
      toast.error("Failed to load job responsibilities");
    } else {
      const mapped = (data || []).map((jr: any) => ({
        ...jr,
        responsibility_name: jr.responsibilities?.name,
        responsibility_category: jr.responsibilities?.category,
        responsibility_complexity: jr.responsibilities?.complexity_level,
        responsibility_kras: Array.isArray(jr.responsibilities?.key_result_areas) 
          ? jr.responsibilities.key_result_areas 
          : [],
      }));
      setJobResponsibilities(mapped);
    }
    setLoading(false);
  };

  const fetchResponsibilities = async () => {
    const { data, error } = await supabase
      .from("responsibilities")
      .select("id, name, code, category, complexity_level, key_result_areas")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching responsibilities:", error);
    } else {
      setResponsibilities((data || []).map((r: any) => ({
        ...r,
        key_result_areas: Array.isArray(r.key_result_areas) ? r.key_result_areas : [],
      })));
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      responsibility_id: "",
      weighting: 0,
      notes: "",
      start_date: getTodayString(),
      end_date: "",
    });
    setDialogOpen(true);
  };

  // Calculate total weighting for responsibilities that overlap with the new entry's date range
  const calculateOverlappingWeight = (
    newStartDate: string,
    newEndDate: string | null
  ): number => {
    // Group responsibilities by responsibility_id
    const responsibilityGroups = new Map<string, JobResponsibility[]>();
    for (const jr of jobResponsibilities) {
      const existing = responsibilityGroups.get(jr.responsibility_id) || [];
      existing.push(jr);
      responsibilityGroups.set(jr.responsibility_id, existing);
    }

    let totalWeight = 0;

    // For each unique responsibility, only count the weight if there's an overlapping entry
    for (const [respId, entries] of responsibilityGroups) {
      const overlappingEntries = entries.filter((jr) =>
        datesOverlap(newStartDate, newEndDate, jr.start_date, jr.end_date)
      );

      if (overlappingEntries.length > 0) {
        const maxWeight = Math.max(...overlappingEntries.map((e) => Number(e.weighting)));
        totalWeight += maxWeight;
      }
    }

    return totalWeight;
  };

  const handleSave = async () => {
    if (!formData.responsibility_id) {
      toast.error("Please select a responsibility");
      return;
    }

    if (!formData.start_date) {
      toast.error("Please enter a start date");
      return;
    }

    if (formData.weighting <= 0 || formData.weighting > 100) {
      toast.error("Weight must be between 1 and 100");
      return;
    }

    // Validate total weight for overlapping period
    const currentOverlappingWeight = calculateOverlappingWeight(
      formData.start_date,
      formData.end_date || null
    );

    if (currentOverlappingWeight + formData.weighting > 100) {
      toast.error(
        `Total weighting would exceed 100%. Current overlapping weight: ${currentOverlappingWeight}%, max you can add: ${100 - currentOverlappingWeight}%`
      );
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("job_responsibilities")
      .insert({
        job_id: jobId,
        responsibility_id: formData.responsibility_id,
        weighting: formData.weighting,
        notes: formData.notes || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
      });

    if (error) {
      if (error.message?.includes("Overlapping date ranges")) {
        toast.error("This responsibility already has an entry for overlapping dates");
      } else if (error.code === "23505") {
        toast.error("This responsibility is already assigned to this job for this period");
      } else {
        console.error("Error saving job responsibility:", error);
        toast.error("Failed to add responsibility");
      }
    } else {
      toast.success("Responsibility added to job");
      setDialogOpen(false);
      fetchJobResponsibilities();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("job_responsibilities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting job responsibility:", error);
      toast.error("Failed to remove responsibility");
    } else {
      toast.success("Responsibility removed from job");
      fetchJobResponsibilities();
    }
  };

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading responsibilities...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Job Responsibilities</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total Weight: {totalWeight}%</span>
          </div>
        </div>
        <Button size="sm" onClick={handleOpenDialog} disabled={responsibilities.length === 0}>
          <Plus className="h-4 w-4 mr-1" />
          Add Responsibility
        </Button>
      </div>

      {totalWeight > 100 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Total weight exceeds 100%. Please adjust the weights.
          </AlertDescription>
        </Alert>
      )}

      {jobResponsibilities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No responsibilities assigned to this job yet.
        </div>
      ) : (
        <div className="space-y-2">
          {jobResponsibilities.map((jr) => {
            const hasKRAs = jr.responsibility_kras && jr.responsibility_kras.length > 0;
            const isExpanded = expandedRows.has(jr.id);
            
            return (
              <div key={jr.id} className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 p-3 bg-card">
                  {/* Expand button if has KRAs */}
                  <div className="w-6">
                    {hasKRAs && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleRowExpanded(jr.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {/* Responsibility info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{jr.responsibility_name}</span>
                      <ResponsibilityCategoryBadge category={jr.responsibility_category} size="sm" showIcon={false} />
                      <ComplexityLevelIndicator level={jr.responsibility_complexity} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{formatDateForDisplay(jr.start_date)} → {jr.end_date ? formatDateForDisplay(jr.end_date) : "Ongoing"}</span>
                      {jr.notes && <span className="truncate max-w-[200px]">{jr.notes}</span>}
                    </div>
                  </div>
                  
                  {/* Weight */}
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-lg">{jr.weighting}%</span>
                  </div>
                  
                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(jr.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                {/* Expandable KRAs section */}
                {hasKRAs && isExpanded && (
                  <div className="px-4 py-3 bg-muted/30 border-t">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Key Result Areas</div>
                    <div className="space-y-1.5">
                      {jr.responsibility_kras?.map((kra, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <Target className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                          <span>{kra}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Responsibility to Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Responsibility *</Label>
              <Select
                value={formData.responsibility_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, responsibility_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select responsibility" />
                </SelectTrigger>
                <SelectContent>
                  {responsibilities.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.code})
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
              <Label>Weight % *</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={formData.weighting}
                onChange={(e) =>
                  setFormData({ ...formData, weighting: Number(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                Total weight for overlapping responsibilities cannot exceed 100%
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

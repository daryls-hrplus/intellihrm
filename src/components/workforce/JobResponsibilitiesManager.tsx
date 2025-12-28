import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Trash2, AlertCircle, ChevronDown, ChevronUp, Target, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResponsibilityCategoryBadge, ResponsibilityCategory } from "./ResponsibilityCategoryBadge";
import { ComplexityLevelIndicator } from "./ComplexityLevelIndicator";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { JobKRAContextualizationDialog } from "./JobKRAContextualizationDialog";
import { useJobResponsibilityKRAs, GenericKRA } from "@/hooks/useJobResponsibilityKRAs";

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
  description?: string | null;
  category?: ResponsibilityCategory | null;
  complexity_level?: number | null;
  key_result_areas?: string[];
}

interface FamilyDefaultResponsibility {
  responsibility_id: string;
  suggested_weight: number;
}

interface JobFamily {
  id: string;
  name: string;
  default_responsibilities: FamilyDefaultResponsibility[];
}

interface JobResponsibilitiesManagerProps {
  jobId: string;
  companyId: string;
  jobFamilyId?: string;
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

export function JobResponsibilitiesManager({ jobId, companyId, jobFamilyId }: JobResponsibilitiesManagerProps) {
  const [jobResponsibilities, setJobResponsibilities] = useState<JobResponsibility[]>([]);
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [jobFamily, setJobFamily] = useState<JobFamily | null>(null);
  const [jobDetails, setJobDetails] = useState<{ name: string; description?: string; grade?: string; level?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [kraDialogOpen, setKraDialogOpen] = useState(false);
  const [selectedJobResponsibility, setSelectedJobResponsibility] = useState<JobResponsibility | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    responsibility_id: "",
    weighting: 0,
    notes: "",
    start_date: getTodayString(),
    end_date: "",
  });

  const { generateWithAI, saveAIGeneratedKRAs, generating } = useJobResponsibilityKRAs(selectedJobResponsibility?.id || "");

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
    fetchJobDetails();
    if (jobFamilyId) {
      fetchJobFamily();
    }
  }, [jobId, companyId, jobFamilyId]);

  const fetchJobDetails = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("name, description, job_grade, job_level")
      .eq("id", jobId)
      .single();

    if (!error && data) {
      setJobDetails({
        name: data.name,
        description: data.description || undefined,
        grade: data.job_grade || undefined,
        level: data.job_level || undefined,
      });
    }
  };

  const fetchJobFamily = async () => {
    if (!jobFamilyId) return;
    
    const { data, error } = await supabase
      .from("job_families")
      .select("id, name, default_responsibilities")
      .eq("id", jobFamilyId)
      .single();

    if (error) {
      console.error("Error fetching job family:", error);
    } else if (data) {
      // Parse default_responsibilities JSONB
      const defaults = Array.isArray(data.default_responsibilities) 
        ? data.default_responsibilities.map((d: any) => ({
            responsibility_id: d.responsibility_id,
            suggested_weight: d.suggested_weight || 0,
          }))
        : [];
      setJobFamily({
        id: data.id,
        name: data.name,
        default_responsibilities: defaults,
      });
    }
  };

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
      .select("id, name, code, description, category, complexity_level, key_result_areas")
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

  // Get the selected responsibility details for preview
  const selectedResponsibility = responsibilities.find(r => r.id === formData.responsibility_id);

  // Create a map of recommended responsibility IDs to their suggested weights
  const recommendedMap = new Map<string, number>();
  if (jobFamily?.default_responsibilities) {
    jobFamily.default_responsibilities.forEach(d => {
      recommendedMap.set(d.responsibility_id, d.suggested_weight);
    });
  }

  // Split responsibilities into recommended and other groups
  const recommendedResponsibilities = responsibilities.filter(r => recommendedMap.has(r.id));
  const otherResponsibilities = responsibilities.filter(r => !recommendedMap.has(r.id));

  // Get suggested weight for selected responsibility (if recommended)
  const getSuggestedWeight = (responsibilityId: string): number | null => {
    return recommendedMap.get(responsibilityId) ?? null;
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

  // Handle responsibility selection with auto-fill weight
  const handleResponsibilitySelect = (responsibilityId: string) => {
    const suggestedWeight = getSuggestedWeight(responsibilityId);
    setFormData(prev => ({
      ...prev,
      responsibility_id: responsibilityId,
      // Auto-fill weight if this is a recommended responsibility
      weighting: suggestedWeight !== null ? suggestedWeight : prev.weighting,
    }));
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Responsibility to Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Section 1: Select & Preview */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Responsibility *</Label>
                  {jobFamily && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Family: {jobFamily.name}
                    </span>
                  )}
                </div>
                <Select
                  value={formData.responsibility_id}
                  onValueChange={handleResponsibilitySelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select responsibility from library" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {/* Recommended responsibilities (from job family) */}
                    {recommendedResponsibilities.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="flex items-center gap-1.5 text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          Recommended for {jobFamily?.name || "Job Family"}
                        </SelectLabel>
                        {recommendedResponsibilities.map((r) => {
                          const suggestedWeight = getSuggestedWeight(r.id);
                          return (
                            <SelectItem key={r.id} value={r.id}>
                              <div className="flex items-center gap-2">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                                <span className="font-medium">{r.name}</span>
                                {suggestedWeight && (
                                  <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                                    {suggestedWeight}%
                                  </span>
                                )}
                                <ResponsibilityCategoryBadge category={r.category} size="sm" showIcon={false} />
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    )}

                    {/* Other responsibilities */}
                    {otherResponsibilities.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground">
                          {recommendedResponsibilities.length > 0 ? "Other Responsibilities" : "All Responsibilities"}
                        </SelectLabel>
                        {otherResponsibilities.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            <div className="flex items-center gap-2">
                              <span>{r.name}</span>
                              <span className="text-muted-foreground text-xs">({r.code})</span>
                              <ResponsibilityCategoryBadge category={r.category} size="sm" showIcon={false} />
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Responsibility Preview */}
              {selectedResponsibility && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Responsibility Preview</h4>
                      {recommendedMap.has(selectedResponsibility.id) && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 fill-amber-500" />
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">Read-only from library</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <ResponsibilityCategoryBadge category={selectedResponsibility.category} showIcon />
                    <ComplexityLevelIndicator level={selectedResponsibility.complexity_level} showLabel />
                  </div>

                  {selectedResponsibility.description && (
                    <p className="text-sm text-muted-foreground">{selectedResponsibility.description}</p>
                  )}

                  {selectedResponsibility.key_result_areas && selectedResponsibility.key_result_areas.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Target className="h-3.5 w-3.5" />
                        Key Result Areas ({selectedResponsibility.key_result_areas.length})
                      </div>
                      <div className="grid gap-1.5">
                        {selectedResponsibility.key_result_areas.map((kra, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm bg-background rounded px-2 py-1.5">
                            <span className="text-primary font-medium shrink-0">{index + 1}.</span>
                            <span>{kra}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!selectedResponsibility.key_result_areas || selectedResponsibility.key_result_areas.length === 0) && (
                    <p className="text-xs text-muted-foreground italic">No Key Result Areas defined for this responsibility</p>
                  )}
                </div>
              )}
            </div>

            {/* Section 2: Assignment Details */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground">Assignment Details</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Weight % *</Label>
                    {formData.responsibility_id && getSuggestedWeight(formData.responsibility_id) !== null && (
                      <span className="text-xs text-amber-600">
                        Suggested: {getSuggestedWeight(formData.responsibility_id)}%
                      </span>
                    )}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.weighting}
                    onChange={(e) =>
                      setFormData({ ...formData, weighting: Number(e.target.value) })
                    }
                  />
                </div>
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
              <p className="text-xs text-muted-foreground">
                Total weight for overlapping responsibilities cannot exceed 100%
              </p>

              <div className="space-y-2">
                <Label>Assignment Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes about this responsibility assignment..."
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.responsibility_id}>
              {saving ? "Saving..." : "Add to Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

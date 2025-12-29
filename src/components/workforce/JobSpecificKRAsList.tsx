import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Pencil, 
  Check, 
  X, 
  Trash2, 
  RotateCcw,
  Sparkles,
  Bot
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEASUREMENT_METHODS } from "@/types/responsibilityKRA";

interface JobSpecificKRA {
  id: string;
  job_responsibility_id: string;
  responsibility_kra_id: string | null;
  name: string;
  job_specific_target: string | null;
  measurement_method: string | null;
  weight: number;
  is_inherited: boolean;
  ai_generated: boolean;
  sequence_order: number;
}

interface JobSpecificKRAsListProps {
  jobResponsibilityId: string;
  genericKRAs: string[];
  onContextualizeClick: () => void;
}

export function JobSpecificKRAsList({
  jobResponsibilityId,
  genericKRAs,
  onContextualizeClick,
}: JobSpecificKRAsListProps) {
  const [jobKRAs, setJobKRAs] = useState<JobSpecificKRA[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", target: "", method: "" });
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchJobKRAs = useCallback(async () => {
    if (!jobResponsibilityId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_responsibility_kras")
        .select("*")
        .eq("job_responsibility_id", jobResponsibilityId)
        .order("sequence_order");

      if (error) throw error;
      setJobKRAs(data || []);
    } catch (error) {
      console.error("Error fetching job-specific KRAs:", error);
    } finally {
      setLoading(false);
    }
  }, [jobResponsibilityId]);

  useEffect(() => {
    fetchJobKRAs();
  }, [fetchJobKRAs]);

  const hasJobSpecificKRAs = jobKRAs.length > 0;

  const startEditing = (kra: JobSpecificKRA) => {
    setEditingId(kra.id);
    setEditForm({
      name: kra.name || "",
      target: kra.job_specific_target || "",
      method: kra.measurement_method || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ name: "", target: "", method: "" });
  };

  const saveEdit = async (kraId: string) => {
    if (!editForm.name.trim()) {
      toast.error("KRA name is required");
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("job_responsibility_kras")
        .update({
          name: editForm.name.trim(),
          job_specific_target: editForm.target.trim() ? editForm.target.trim() : null,
          measurement_method: editForm.method ? editForm.method : null,
          is_inherited: false,
          customized_at: new Date().toISOString(),
        })
        .eq("id", kraId);

      if (error) throw error;
      
      await fetchJobKRAs();
      setEditingId(null);
      toast.success("KRA updated");
    } catch (error: any) {
      console.error("Error updating KRA:", error);
      toast.error(error?.message ? `Failed to update KRA: ${error.message}` : "Failed to update KRA");
    } finally {
      setSaving(false);
    }
  };

  const deleteKRA = async (kraId: string) => {
    try {
      const { error } = await supabase
        .from("job_responsibility_kras")
        .delete()
        .eq("id", kraId);

      if (error) throw error;
      
      await fetchJobKRAs();
      toast.success("KRA removed");
    } catch (error) {
      console.error("Error deleting KRA:", error);
      toast.error("Failed to remove KRA");
    }
  };

  const createEditableKRAsFromGeneric = async () => {
    if (!jobResponsibilityId || genericKRAs.length === 0) return;

    setCreating(true);
    try {
      const krasToInsert = genericKRAs.map((name, index) => ({
        job_responsibility_id: jobResponsibilityId,
        responsibility_kra_id: null,
        name,
        job_specific_target: null,
        measurement_method: null,
        weight: 0,
        is_inherited: true,
        inherited_at: new Date().toISOString(),
        ai_generated: false,
        ai_source: null,
        customized_at: null,
        sequence_order: index,
      }));

      const { error } = await supabase
        .from("job_responsibility_kras")
        .insert(krasToInsert);

      if (error) throw error;

      await fetchJobKRAs();
      toast.success("Editable KRAs created");
    } catch (error: any) {
      console.error("Error creating editable KRAs:", error);
      toast.error(error?.message ? `Failed to create KRAs: ${error.message}` : "Failed to create KRAs");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-3 bg-muted/30 border-t">
        <div className="text-xs text-muted-foreground">Loading KRAs...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-muted/30 border-t space-y-3">
      {/* Job-Specific KRAs Section */}
      {hasJobSpecificKRAs && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-primary flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Job-Specific KRAs
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs gap-1"
              onClick={onContextualizeClick}
            >
              <RotateCcw className="h-3 w-3" />
              Regenerate
            </Button>
          </div>
          <div className="space-y-2">
            {jobKRAs.map((kra) => (
              <div
                key={kra.id}
                className="border rounded-md p-3 bg-card space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Target className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-medium text-sm truncate">{kra.name}</span>
                    {kra.ai_generated && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="secondary" className="text-xs gap-1 shrink-0">
                              <Bot className="h-3 w-3" />
                              AI
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>Generated by AI</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {editingId !== kra.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => startEditing(kra)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => deleteKRA(kra.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {editingId === kra.id ? (
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="text-xs text-muted-foreground">KRA Name</label>
                      <Textarea
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Key Result Area description..."
                        rows={2}
                        className="text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Target</label>
                      <Textarea
                        value={editForm.target}
                        onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}
                        placeholder="Specific, measurable target..."
                        rows={2}
                        className="text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Measurement Method</label>
                      <Select
                        value={editForm.method}
                        onValueChange={(value) => setEditForm({ ...editForm, method: value })}
                      >
                        <SelectTrigger className="text-sm mt-1">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEASUREMENT_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => saveEdit(kra.id)}
                        disabled={saving || !editForm.name.trim()}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={cancelEditing}
                        disabled={saving}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-sm">
                    {kra.job_specific_target && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground shrink-0 text-xs">Target:</span>
                        <span className="text-xs">{kra.job_specific_target}</span>
                      </div>
                    )}
                    {kra.measurement_method && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground shrink-0 text-xs">Method:</span>
                        <span className="text-xs">
                          {MEASUREMENT_METHODS.find(m => m.value === kra.measurement_method)?.label || kra.measurement_method}
                        </span>
                      </div>
                    )}
                    {!kra.job_specific_target && !kra.measurement_method && (
                      <span className="text-xs text-muted-foreground italic">
                        No target set - click edit to add
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generic KRAs Section (only show if no job-specific KRAs exist) */}
      {!hasJobSpecificKRAs && genericKRAs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">
              Key Result Areas (Generic)
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={createEditableKRAsFromGeneric}
                disabled={creating}
              >
                <Pencil className="h-3 w-3" />
                Edit manually
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={onContextualizeClick}
              >
                <Sparkles className="h-3 w-3" />
                Contextualize for Job
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            {genericKRAs.map((kra, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Target className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{kra}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show both if job-specific KRAs exist but user might want to see generic */}
      {hasJobSpecificKRAs && genericKRAs.length > 0 && (
        <div className="border-t pt-2">
          <details className="group">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
              View original generic KRAs ({genericKRAs.length})
            </summary>
            <div className="mt-2 space-y-1.5 pl-4">
              {genericKRAs.map((kra, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Target className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{kra}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* No KRAs at all */}
      {!hasJobSpecificKRAs && genericKRAs.length === 0 && (
        <div className="text-xs text-muted-foreground italic">
          No Key Result Areas defined for this responsibility.
        </div>
      )}
    </div>
  );
}

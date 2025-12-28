import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Target, Check, RefreshCw, ArrowRight } from "lucide-react";
import { GenericKRA, ContextualizedKRA } from "@/hooks/useJobResponsibilityKRAs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEASUREMENT_METHODS } from "@/types/responsibilityKRA";

interface JobKRAContextualizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  genericKRAs: GenericKRA[];
  jobName: string;
  jobDescription?: string;
  jobGrade?: string;
  jobLevel?: string;
  onGenerate: () => Promise<ContextualizedKRA[]>;
  onSave: (kras: Array<{
    responsibility_kra_id: string;
    name: string;
    target: string;
    method: string;
  }>) => Promise<void>;
  generating?: boolean;
}

interface EditableKRA {
  id: string;
  name: string;
  originalTarget: string | null;
  target: string;
  method: string;
  isContextualized: boolean;
}

export function JobKRAContextualizationDialog({
  open,
  onOpenChange,
  genericKRAs,
  jobName,
  jobDescription,
  jobGrade,
  jobLevel,
  onGenerate,
  onSave,
  generating = false,
}: JobKRAContextualizationDialogProps) {
  const [editableKRAs, setEditableKRAs] = useState<EditableKRA[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (open) {
      // Initialize with generic KRAs
      setEditableKRAs(
        genericKRAs.map((kra) => ({
          id: kra.id,
          name: kra.name,
          originalTarget: kra.target_metric,
          target: kra.target_metric || "",
          method: "",
          isContextualized: false,
        }))
      );
      setHasGenerated(false);
    }
  }, [open, genericKRAs]);

  const handleGenerate = async () => {
    const results = await onGenerate();
    
    if (results.length > 0) {
      setEditableKRAs((prev) =>
        prev.map((kra) => {
          const match = results.find((r) => r.id === kra.id);
          if (match) {
            return {
              ...kra,
              target: match.target || kra.target,
              method: match.method || kra.method,
              isContextualized: true,
            };
          }
          return kra;
        })
      );
      setHasGenerated(true);
    }
  };

  const handleKRAChange = (id: string, field: "target" | "method", value: string) => {
    setEditableKRAs((prev) =>
      prev.map((kra) =>
        kra.id === id ? { ...kra, [field]: value, isContextualized: true } : kra
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(
        editableKRAs.map((kra) => ({
          responsibility_kra_id: kra.id,
          name: kra.name,
          target: kra.target,
          method: kra.method,
        }))
      );
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Contextualize KRAs for Job
          </DialogTitle>
          <DialogDescription>
            Generate job-specific targets for each KRA based on the job context, or customize manually.
          </DialogDescription>
        </DialogHeader>

        {/* Job Context Summary */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
          <div className="font-medium">{jobName}</div>
          <div className="flex gap-2 flex-wrap">
            {jobGrade && <Badge variant="outline">Grade: {jobGrade}</Badge>}
            {jobLevel && <Badge variant="outline">Level: {jobLevel}</Badge>}
          </div>
          {jobDescription && (
            <p className="text-muted-foreground text-xs line-clamp-2">{jobDescription}</p>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            variant="default"
            onClick={handleGenerate}
            disabled={generating || genericKRAs.length === 0}
            className="gap-2"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {hasGenerated ? "Regenerate with AI" : "Generate Job-Specific Targets with AI"}
              </>
            )}
          </Button>
        </div>

        {/* KRA List */}
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {editableKRAs.map((kra, index) => (
              <div
                key={kra.id}
                className="border rounded-lg p-4 space-y-3 bg-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">{kra.name}</span>
                  </div>
                  {kra.isContextualized && (
                    <Badge className="bg-blue-500 text-white shrink-0">
                      <Check className="h-3 w-3 mr-1" />
                      Contextualized
                    </Badge>
                  )}
                </div>

                {kra.originalTarget && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="font-medium">Generic:</span>
                    <span>{kra.originalTarget}</span>
                    {kra.target !== kra.originalTarget && (
                      <ArrowRight className="h-3 w-3" />
                    )}
                  </div>
                )}

                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Job-Specific Target</Label>
                    <Textarea
                      value={kra.target}
                      onChange={(e) => handleKRAChange(kra.id, "target", e.target.value)}
                      placeholder="Enter specific, measurable target for this job level..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Measurement Method</Label>
                    <Select
                      value={kra.method}
                      onValueChange={(value) => handleKRAChange(kra.id, "method", value)}
                    >
                      <SelectTrigger className="text-sm">
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
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Job-Specific KRAs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

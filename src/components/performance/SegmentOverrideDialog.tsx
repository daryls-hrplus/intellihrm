import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RoleSegment } from "@/hooks/useAppraisalRoleSegments";
import { AlertTriangle, Save, History, Edit2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface SegmentOverride {
  id: string;
  segment_id: string;
  original_percentage: number;
  new_percentage: number;
  justification: string;
  overridden_by: string;
  overridden_at: string;
  overridden_by_name?: string;
}

interface SegmentOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  segments: RoleSegment[];
  onSuccess: () => void;
}

export function SegmentOverrideDialog({
  open,
  onOpenChange,
  participantId,
  segments,
  onSuccess,
}: SegmentOverrideDialogProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [editedSegments, setEditedSegments] = useState<
    { id: string; contribution_percentage: number }[]
  >([]);
  const [justification, setJustification] = useState("");
  const [overrideHistory, setOverrideHistory] = useState<SegmentOverride[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (open && segments.length > 0) {
      setEditedSegments(
        segments.map((s) => ({
          id: s.id,
          contribution_percentage: s.contribution_percentage,
        }))
      );
      fetchOverrideHistory();
    }
  }, [open, segments]);

  const fetchOverrideHistory = async () => {
    const { data } = await (supabase
      .from("segment_override_audit" as any)
      .select(`
        *,
        profiles:overridden_by (first_name, last_name)
      `)
      .eq("participant_id", participantId)
      .order("overridden_at", { ascending: false }) as any);

    if (data) {
      setOverrideHistory(
        data.map((h: any) => ({
          ...h,
          overridden_by_name: h.profiles
            ? `${h.profiles.first_name} ${h.profiles.last_name}`
            : "Unknown",
        }))
      );
    }
  };

  const totalPercentage = editedSegments.reduce(
    (sum, s) => sum + s.contribution_percentage,
    0
  );
  const isValid = Math.abs(totalPercentage - 100) < 0.01;

  const handlePercentageChange = (segmentId: string, value: number) => {
    setEditedSegments((prev) =>
      prev.map((s) =>
        s.id === segmentId ? { ...s, contribution_percentage: value } : s
      )
    );
  };

  const handleSave = async () => {
    if (!isValid) {
      toast.error("Percentages must total 100%");
      return;
    }

    if (!justification.trim()) {
      toast.error("Please provide a justification for the override");
      return;
    }

    setSaving(true);
    try {
      // Create audit records for each changed segment
      const auditRecords = [];
      for (const edited of editedSegments) {
        const original = segments.find((s) => s.id === edited.id);
        if (original && original.contribution_percentage !== edited.contribution_percentage) {
          auditRecords.push({
            participant_id: participantId,
            segment_id: edited.id,
            original_percentage: original.contribution_percentage,
            new_percentage: edited.contribution_percentage,
            justification: justification.trim(),
            overridden_by: user?.id,
          });
        }
      }

      // Insert audit records
      if (auditRecords.length > 0) {
        const { error: auditError } = await (supabase
          .from("segment_override_audit" as any)
          .insert(auditRecords) as any);

        if (auditError) throw auditError;
      }

      // Update each segment
      for (const edited of editedSegments) {
        await supabase
          .from("appraisal_role_segments")
          .update({ contribution_percentage: edited.contribution_percentage })
          .eq("id", edited.id);
      }

      toast.success("Segment percentages updated with audit trail");
      setJustification("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving overrides:", error);
      toast.error(error.message || "Failed to save overrides");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Adjust Role Segment Weights
          </DialogTitle>
          <DialogDescription>
            Override auto-calculated contribution percentages. All changes are
            audited.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Segment Editors */}
          <div className="space-y-3">
            {segments.map((segment) => {
              const edited = editedSegments.find((e) => e.id === segment.id);
              const hasChanged =
                edited &&
                edited.contribution_percentage !== segment.contribution_percentage;

              return (
                <Card
                  key={segment.id}
                  className={hasChanged ? "border-warning" : ""}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {segment.position_title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(segment.segment_start_date), "MMM d")} -{" "}
                          {format(parseISO(segment.segment_end_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={edited?.contribution_percentage || 0}
                          onChange={(e) =>
                            handlePercentageChange(
                              segment.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 text-right"
                        />
                        <span className="text-sm">%</span>
                        {hasChanged && (
                          <Badge variant="outline" className="text-warning border-warning">
                            Changed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Total Validation */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              isValid ? "bg-success/10" : "bg-destructive/10"
            }`}
          >
            <span className="text-sm font-medium">Total</span>
            <span
              className={`text-lg font-bold ${
                isValid ? "text-success" : "text-destructive"
              }`}
            >
              {totalPercentage.toFixed(0)}%
            </span>
          </div>

          {!isValid && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Percentages must total exactly 100%
              </AlertDescription>
            </Alert>
          )}

          {/* Justification */}
          <div className="space-y-2">
            <Label htmlFor="justification">
              Justification for Override <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain why the auto-calculated percentages need adjustment..."
              rows={3}
            />
          </div>

          {/* Audit History Toggle */}
          {overrideHistory.length > 0 && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-3 w-3 mr-1" />
                {showHistory ? "Hide" : "Show"} Override History (
                {overrideHistory.length})
              </Button>

              {showHistory && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {overrideHistory.map((record) => (
                    <div
                      key={record.id}
                      className="p-2 text-xs bg-muted/50 rounded"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {record.original_percentage}% → {record.new_percentage}%
                        </span>
                        <span className="text-muted-foreground">
                          {format(parseISO(record.overridden_at), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        By: {record.overridden_by_name}
                      </p>
                      <p className="mt-1">{record.justification}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !isValid}>
            <Save className="h-4 w-4 mr-2" />
            Save with Audit Trail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

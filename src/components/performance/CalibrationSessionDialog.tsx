import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Calendar, Users, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { useOverallRatingScales } from "@/hooks/useRatingScales";
import type { CalibrationSession } from "@/hooks/useCalibrationSessions";

interface AppraisalCycle {
  id: string;
  name: string;
}

interface CalibrationSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  editingSession: CalibrationSession | null;
  appraisalCycles: AppraisalCycle[];
  onSuccess: () => void;
}

export function CalibrationSessionDialog({
  open,
  onOpenChange,
  companyId,
  editingSession,
  appraisalCycles,
  onSuccess,
}: CalibrationSessionDialogProps) {
  const { t } = useLanguage();
  const { scales: overallScales } = useOverallRatingScales({ companyId });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    appraisal_cycle_id: "",
    overall_scale_id: "",
    scheduled_date: "",
    status: "pending" as CalibrationSession['status'],
    force_distribution: false,
    max_rating_5_percent: 10,
  });

  const selectedScale = overallScales.find(s => s.id === formData.overall_scale_id);

  useEffect(() => {
    if (editingSession) {
      setFormData({
        name: editingSession.name,
        description: editingSession.description || "",
        appraisal_cycle_id: editingSession.appraisal_cycle_id || "",
        overall_scale_id: editingSession.overall_scale_id || "",
        scheduled_date: editingSession.scheduled_date 
          ? new Date(editingSession.scheduled_date).toISOString().slice(0, 16) 
          : "",
        status: editingSession.status,
        force_distribution: editingSession.calibration_rules?.force_distribution || false,
        max_rating_5_percent: editingSession.calibration_rules?.max_rating_5_percent || 10,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        appraisal_cycle_id: "",
        overall_scale_id: "",
        scheduled_date: "",
        status: "pending",
        force_distribution: false,
        max_rating_5_percent: 10,
      });
    }
  }, [editingSession, open]);

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const calibrationRules = formData.force_distribution ? {
        force_distribution: true,
        max_rating_5_percent: formData.max_rating_5_percent,
      } : null;

      const submitData = {
        name: formData.name,
        description: formData.description || null,
        appraisal_cycle_id: formData.appraisal_cycle_id || null,
        overall_scale_id: formData.overall_scale_id || null,
        scheduled_date: formData.scheduled_date ? new Date(formData.scheduled_date).toISOString() : null,
        status: formData.status,
        calibration_rules: calibrationRules,
      };

      if (editingSession) {
        const { error } = await supabase
          .from("calibration_sessions")
          .update(submitData)
          .eq("id", editingSession.id);

        if (error) throw error;
        toast.success("Calibration session updated");
      } else {
        const { error } = await supabase
          .from("calibration_sessions")
          .insert([{ ...submitData, company_id: companyId }]);

        if (error) throw error;
        toast.success("Calibration session created");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "scheduled", label: "Scheduled" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingSession ? "Edit Calibration Session" : "Schedule Calibration Session"}
          </DialogTitle>
          <DialogDescription>
            Plan and manage rating calibration sessions for consistent evaluations
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 -mx-6 px-6 overflow-y-auto overscroll-contain">
          <div className="space-y-5 py-2">
            <Alert className="bg-muted/50">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Calibration sessions bring managers together to review and align on performance ratings, 
                ensuring consistency and fairness across teams and departments.
              </AlertDescription>
            </Alert>

            {/* Name */}
            <div className="space-y-2">
              <Label>Session Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Q4 2024 Performance Calibration"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Session objectives and agenda..."
                rows={2}
              />
            </div>

            {/* Appraisal Cycle */}
            <div className="space-y-2">
              <Label>Appraisal Cycle</Label>
              <Select
                value={formData.appraisal_cycle_id}
                onValueChange={(v) => setFormData({ ...formData, appraisal_cycle_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select appraisal cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {appraisalCycles.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Overall Rating Scale */}
            <div className="space-y-2">
              <Label>Overall Rating Scale</Label>
              <Select
                value={formData.overall_scale_id}
                onValueChange={(v) => setFormData({ ...formData, overall_scale_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating scale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {overallScales.map((scale) => (
                    <SelectItem key={scale.id} value={scale.id}>
                      {scale.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedScale?.has_forced_distribution && (
                <p className="text-xs text-muted-foreground">
                  This scale has forced distribution targets configured
                </p>
              )}
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduled Date & Time
              </Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as CalibrationSession['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calibration Rules */}
            <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
              <Label className="text-sm font-medium">Calibration Rules</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Enforce Distribution</Label>
                  <p className="text-xs text-muted-foreground">
                    Require ratings to match target distribution
                  </p>
                </div>
                <Switch
                  checked={formData.force_distribution}
                  onCheckedChange={(checked) => setFormData({ ...formData, force_distribution: checked })}
                />
              </div>

              {formData.force_distribution && (
                <div className="space-y-2">
                  <Label className="text-sm">Max Top Rating %</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={formData.max_rating_5_percent}
                      onChange={(e) => setFormData({ ...formData, max_rating_5_percent: parseInt(e.target.value) || 10 })}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      Maximum percentage of employees who can receive the top rating
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : editingSession ? "Update Session" : "Schedule Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

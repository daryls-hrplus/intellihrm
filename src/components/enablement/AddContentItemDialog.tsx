import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { WorkflowColumn } from "@/types/enablement";

interface AddContentItemDialogProps {
  releaseId?: string;
  onSuccess?: () => void;
}

const MODULES = [
  "WORKFORCE",
  "LEAVE",
  "PAYROLL",
  "TIME_ATTENDANCE",
  "BENEFITS",
  "TRAINING",
  "PERFORMANCE",
  "SUCCESSION",
  "RECRUITMENT",
  "HSE",
  "EMPLOYEE_RELATIONS",
  "PROPERTY",
  "ADMIN",
];

const PRIORITIES = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function AddContentItemDialog({ releaseId, onSuccess }: AddContentItemDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    feature_code: "",
    module_code: "",
    priority: "medium" as string,
    estimated_hours: "",
    time_estimate_notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.feature_code || !formData.module_code) {
      toast.error("Feature code and module are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("enablement_content_status").insert({
        feature_code: formData.feature_code,
        module_code: formData.module_code,
        release_id: releaseId || null,
        workflow_status: "backlog" as WorkflowColumn,
        priority: formData.priority,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        time_estimate_notes: formData.time_estimate_notes || null,
        documentation_status: "not_started",
        scorm_lite_status: "not_started",
        rise_course_status: "not_started",
        video_status: "not_started",
        dap_guide_status: "not_started",
      });

      if (error) throw error;

      toast.success("Content item added to backlog");
      setOpen(false);
      setFormData({
        feature_code: "",
        module_code: "",
        priority: "medium",
        estimated_hours: "",
        time_estimate_notes: "",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error adding content item:", error);
      toast.error("Failed to add content item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Content Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Content Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feature_code">Feature Code / Name *</Label>
            <Input
              id="feature_code"
              value={formData.feature_code}
              onChange={(e) => setFormData({ ...formData, feature_code: e.target.value })}
              placeholder="e.g., LEAVE_REQUEST_SUBMIT"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="module_code">Module *</Label>
            <Select
              value={formData.module_code}
              onValueChange={(value) => setFormData({ ...formData, module_code: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_hours">Estimated Hours</Label>
            <Input
              id="estimated_hours"
              type="number"
              step="0.5"
              min="0"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
              placeholder="e.g., 4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.time_estimate_notes}
              onChange={(e) => setFormData({ ...formData, time_estimate_notes: e.target.value })}
              placeholder="Any additional notes about this content item..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add to Backlog"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

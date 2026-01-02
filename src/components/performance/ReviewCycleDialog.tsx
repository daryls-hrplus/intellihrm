import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Calendar, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { checkCycleOverlap } from "@/utils/cycleOverlapCheck";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { formatDateForDisplay } from "@/utils/dateUtils";

// Review cycle types
const REVIEW_CYCLE_TYPES = [
  { value: "standard", label: "Standard 360°", description: "Full multi-rater feedback cycle" },
  { value: "manager_360", label: "Manager/Leadership 360°", description: "Leadership assessment with upward feedback" },
  { value: "peer_only", label: "Peer Review Only", description: "Feedback from peers only" },
  { value: "upward", label: "Upward Feedback", description: "Direct reports evaluating managers" },
] as const;

type ReviewCycleType = typeof REVIEW_CYCLE_TYPES[number]["value"];

interface ReviewCycle {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  self_review_deadline: string | null;
  peer_nomination_deadline: string | null;
  feedback_deadline: string | null;
  status: string;
  include_self_review: boolean;
  include_manager_review: boolean;
  include_peer_review: boolean;
  include_direct_report_review: boolean;
  min_peer_reviewers: number;
  max_peer_reviewers: number;
  cycle_type?: string;
}

interface ReviewCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: ReviewCycle | null;
  companyId: string | undefined;
  onSuccess: () => void;
  isManagerCycle?: boolean;
}

export function ReviewCycleDialog({
  open,
  onOpenChange,
  cycle,
  companyId,
  onSuccess,
  isManagerCycle = false,
}: ReviewCycleDialogProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  
  // Overlap detection state
  const [overlappingCycles, setOverlappingCycles] = useState<Array<{ id: string; name: string; start_date: string; end_date: string; cycle_type: string }>>([]);
  const [overlapAcknowledged, setOverlapAcknowledged] = useState(false);

  // Determine initial cycle_type based on props for backward compatibility
  const getInitialCycleType = (): ReviewCycleType => {
    if (isManagerCycle) return "manager_360";
    return "standard";
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    self_review_deadline: "",
    peer_nomination_deadline: "",
    feedback_deadline: "",
    include_self_review: true,
    include_manager_review: true,
    include_peer_review: true,
    include_direct_report_review: true,
    min_peer_reviewers: 3,
    max_peer_reviewers: 5,
    cycle_type: getInitialCycleType(),
  });

  useEffect(() => {
    if (cycle) {
      setFormData({
        name: cycle.name,
        description: cycle.description || "",
        start_date: cycle.start_date,
        end_date: cycle.end_date,
        self_review_deadline: cycle.self_review_deadline || "",
        peer_nomination_deadline: cycle.peer_nomination_deadline || "",
        feedback_deadline: cycle.feedback_deadline || "",
        include_self_review: cycle.include_self_review,
        include_manager_review: cycle.include_manager_review,
        include_peer_review: cycle.include_peer_review,
        include_direct_report_review: cycle.include_direct_report_review,
        min_peer_reviewers: cycle.min_peer_reviewers || 3,
        max_peer_reviewers: cycle.max_peer_reviewers || 5,
        cycle_type: (cycle.cycle_type as ReviewCycleType) || getInitialCycleType(),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        self_review_deadline: "",
        peer_nomination_deadline: "",
        feedback_deadline: "",
        include_self_review: true,
        include_manager_review: true,
        include_peer_review: true,
        include_direct_report_review: true,
        min_peer_reviewers: 3,
        max_peer_reviewers: 5,
        cycle_type: getInitialCycleType(),
      });
    }
    // Reset overlap state
    setOverlappingCycles([]);
    setOverlapAcknowledged(false);
  }, [cycle, open, isManagerCycle]);

  // Reset overlap acknowledgment when dates or type change
  useEffect(() => {
    setOverlapAcknowledged(false);
  }, [formData.start_date, formData.end_date, formData.cycle_type]);

  // Debounced overlap check
  const performOverlapCheck = useCallback(async () => {
    if (!companyId || !formData.start_date || !formData.end_date || !formData.cycle_type) {
      setOverlappingCycles([]);
      return;
    }
    const result = await checkCycleOverlap({
      table: 'review_cycles',
      companyId,
      cycleType: formData.cycle_type,
      startDate: formData.start_date,
      endDate: formData.end_date,
      excludeId: cycle?.id,
    });
    setOverlappingCycles(result.overlappingCycles);
  }, [companyId, formData.start_date, formData.end_date, formData.cycle_type, cycle?.id]);

  const debouncedOverlapCheck = useDebouncedCallback(performOverlapCheck, 500);

  useEffect(() => {
    if (open) {
      debouncedOverlapCheck();
    }
  }, [formData.start_date, formData.end_date, formData.cycle_type, open, debouncedOverlapCheck]);

  const hasUnacknowledgedOverlap = overlappingCycles.length > 0 && !overlapAcknowledged;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !user?.id) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        company_id: companyId,
        self_review_deadline: formData.self_review_deadline || null,
        peer_nomination_deadline: formData.peer_nomination_deadline || null,
        feedback_deadline: formData.feedback_deadline || null,
        created_by: user.id,
        is_manager_cycle: formData.cycle_type === "manager_360",
        cycle_type: formData.cycle_type,
      };

      if (cycle) {
        const { error } = await supabase
          .from("review_cycles")
          .update(payload)
          .eq("id", cycle.id);

        if (error) throw error;
        toast.success("Review cycle updated");
      } else {
        const { error } = await supabase
          .from("review_cycles")
          .insert([payload]);

        if (error) throw error;
        toast.success("Review cycle created");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving review cycle:", error);
      // Handle database constraint error for overlapping cycles
      if (error.message?.includes('no_overlapping_review_cycles') || error.code === '23P01') {
        toast.error("Cannot save: This cycle overlaps with an existing cycle of the same type.");
      } else {
        toast.error("Failed to save review cycle");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cycle ? "Edit Review Cycle" : "Create Review Cycle"}
          </DialogTitle>
          <DialogDescription>
            Configure a 360° feedback review cycle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Cycle Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Q4 2024 Performance Review"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cycle_type">Cycle Type *</Label>
                <Select
                  value={formData.cycle_type}
                  onValueChange={(value: ReviewCycleType) => setFormData({ ...formData, cycle_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVIEW_CYCLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {REVIEW_CYCLE_TYPES.find(t => t.value === formData.cycle_type)?.description}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose of this review cycle..."
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <DatePicker
                  value={formData.start_date}
                  onChange={(date) => setFormData({ ...formData, start_date: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <DatePicker
                  value={formData.end_date}
                  onChange={(date) => setFormData({ ...formData, end_date: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Select end date"
                />
              </div>
            </div>

            {/* Overlap Warning */}
            {overlappingCycles.length > 0 && (
              <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Overlap Detected</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    This {REVIEW_CYCLE_TYPES.find(t => t.value === formData.cycle_type)?.label} cycle overlaps with:
                  </p>
                  <ul className="text-sm text-amber-700 dark:text-amber-400 list-disc list-inside mt-1">
                    {overlappingCycles.map(c => (
                      <li key={c.id}>
                        {c.name} ({formatDateForDisplay(c.start_date)} - {formatDateForDisplay(c.end_date)})
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 mt-3">
                    <Checkbox
                      id="review-overlap-ack"
                      checked={overlapAcknowledged}
                      onCheckedChange={(checked) => setOverlapAcknowledged(checked === true)}
                    />
                    <label htmlFor="review-overlap-ack" className="text-sm text-amber-700 dark:text-amber-400 cursor-pointer">
                      I understand and want to proceed with overlapping cycles
                    </label>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Self Review Deadline</Label>
                <DatePicker
                  value={formData.self_review_deadline}
                  onChange={(date) => setFormData({ ...formData, self_review_deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Select deadline"
                />
              </div>
              <div className="space-y-2">
                <Label>Peer Nomination Deadline</Label>
                <DatePicker
                  value={formData.peer_nomination_deadline}
                  onChange={(date) => setFormData({ ...formData, peer_nomination_deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Select deadline"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Feedback Deadline</Label>
                <DatePicker
                  value={formData.feedback_deadline}
                  onChange={(date) => setFormData({ ...formData, feedback_deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Select deadline"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Feedback Sources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Feedback Sources</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Self Review</p>
                  <p className="text-sm text-muted-foreground">
                    Employees assess their own performance
                  </p>
                </div>
                <Switch
                  checked={formData.include_self_review}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, include_self_review: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Manager Review</p>
                  <p className="text-sm text-muted-foreground">
                    Direct manager provides feedback
                  </p>
                </div>
                <Switch
                  checked={formData.include_manager_review}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, include_manager_review: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Peer Review</p>
                  <p className="text-sm text-muted-foreground">
                    Colleagues provide anonymous feedback
                  </p>
                </div>
                <Switch
                  checked={formData.include_peer_review}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, include_peer_review: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Direct Report Review</p>
                  <p className="text-sm text-muted-foreground">
                    Direct reports provide anonymous upward feedback
                  </p>
                </div>
                <Switch
                  checked={formData.include_direct_report_review}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, include_direct_report_review: checked })
                  }
                />
              </div>
            </div>
          </div>

          {formData.include_peer_review && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Peer Review Settings</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="min_peer_reviewers">Minimum Peer Reviewers</Label>
                    <Input
                      id="min_peer_reviewers"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.min_peer_reviewers}
                      onChange={(e) =>
                        setFormData({ ...formData, min_peer_reviewers: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_peer_reviewers">Maximum Peer Reviewers</Label>
                    <Input
                      id="max_peer_reviewers"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.max_peer_reviewers}
                      onChange={(e) =>
                        setFormData({ ...formData, max_peer_reviewers: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || hasUnacknowledgedOverlap}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : cycle ? (
                "Update Cycle"
              ) : (
                "Create Cycle"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
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
import { Loader2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
}

interface ReviewCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: ReviewCycle | null;
  companyId: string | undefined;
  onSuccess: () => void;
}

export function ReviewCycleDialog({
  open,
  onOpenChange,
  cycle,
  companyId,
  onSuccess,
}: ReviewCycleDialogProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
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
      });
    }
  }, [cycle, open]);

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
    } catch (error) {
      console.error("Error saving review cycle:", error);
      toast.error("Failed to save review cycle");
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
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="self_review_deadline">Self Review Deadline</Label>
                <Input
                  id="self_review_deadline"
                  type="date"
                  value={formData.self_review_deadline}
                  onChange={(e) => setFormData({ ...formData, self_review_deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peer_nomination_deadline">Peer Nomination Deadline</Label>
                <Input
                  id="peer_nomination_deadline"
                  type="date"
                  value={formData.peer_nomination_deadline}
                  onChange={(e) => setFormData({ ...formData, peer_nomination_deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="feedback_deadline">Feedback Deadline</Label>
                <Input
                  id="feedback_deadline"
                  type="date"
                  value={formData.feedback_deadline}
                  onChange={(e) => setFormData({ ...formData, feedback_deadline: e.target.value })}
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
            <Button type="submit" disabled={saving}>
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
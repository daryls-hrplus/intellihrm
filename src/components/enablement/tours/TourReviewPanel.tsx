import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Send,
  Eye,
  Sparkles,
  User,
  Calendar,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface TourWithDetails {
  id: string;
  tour_code: string;
  tour_name: string;
  description: string | null;
  module_code: string;
  feature_code: string | null;
  tour_type: string;
  trigger_route: string | null;
  is_active: boolean;
  review_status: string | null;
  generated_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  rejected_reason: string | null;
  created_at: string;
  estimated_duration_seconds: number | null;
  enablement_tour_steps?: { count: number }[];
}

interface TourReviewPanelProps {
  tour: TourWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ReviewAction = "submit_review" | "approve" | "reject" | "publish";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: null },
  in_review: { label: "In Review", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200", icon: <Clock className="h-3 w-3" /> },
  approved: { label: "Approved", color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-200", icon: <XCircle className="h-3 w-3" /> },
  published: { label: "Published", color: "bg-green-500/10 text-green-600 border-green-200", icon: <Eye className="h-3 w-3" /> },
};

const GENERATED_BY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  manual: { label: "Manual", icon: <User className="h-3 w-3" /> },
  ai: { label: "AI Generated", icon: <Sparkles className="h-3 w-3" /> },
  release_trigger: { label: "Release Triggered", icon: <Calendar className="h-3 w-3" /> },
};

export function TourReviewPanel({ tour, open, onOpenChange }: TourReviewPanelProps) {
  const queryClient = useQueryClient();
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [confirmAction, setConfirmAction] = useState<ReviewAction | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ action, notes }: { action: ReviewAction; notes?: string }) => {
      if (!tour) throw new Error("No tour selected");

      let updates: Record<string, any> = {
        reviewed_at: new Date().toISOString(),
      };

      switch (action) {
        case "submit_review":
          updates.review_status = "in_review";
          break;
        case "approve":
          updates.review_status = "approved";
          updates.review_notes = notes;
          break;
        case "reject":
          updates.review_status = "rejected";
          updates.rejected_reason = notes;
          break;
        case "publish":
          updates.review_status = "published";
          updates.is_active = true;
          break;
      }

      const { error } = await supabase
        .from("enablement_tours")
        .update(updates)
        .eq("id", tour.id);

      if (error) throw error;
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tours"] });
      const messages: Record<ReviewAction, string> = {
        submit_review: "Tour submitted for review",
        approve: "Tour approved",
        reject: "Tour rejected",
        publish: "Tour published and activated",
      };
      toast.success(messages[action]);
      setReviewNotes("");
      setRejectReason("");
      setConfirmAction(null);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  if (!tour) return null;

  const status = tour.review_status || "draft";
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const generatedByConfig = tour.generated_by ? GENERATED_BY_LABELS[tour.generated_by] : null;

  const canSubmitForReview = status === "draft" || status === "rejected";
  const canApproveOrReject = status === "in_review";
  const canPublish = status === "approved";

  const handleAction = (action: ReviewAction) => {
    if (action === "reject") {
      setConfirmAction(action);
    } else if (action === "publish") {
      setConfirmAction(action);
    } else {
      updateStatusMutation.mutate({ action, notes: reviewNotes });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Tour Review</SheetTitle>
            <SheetDescription>Review and manage tour workflow status</SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-200px)] mt-6">
            <div className="space-y-6 pr-4">
              {/* Tour Info Card */}
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{tour.tour_name}</CardTitle>
                    <Badge className={statusConfig.color}>
                      {statusConfig.icon}
                      <span className="ml-1">{statusConfig.label}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 py-2">
                  <p className="text-sm text-muted-foreground">
                    {tour.description || "No description"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <code className="text-xs">{tour.tour_code}</code>
                    </Badge>
                    <Badge variant="secondary">{tour.tour_type}</Badge>
                    {tour.estimated_duration_seconds && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {tour.estimated_duration_seconds}s
                      </Badge>
                    )}
                    {generatedByConfig && (
                      <Badge variant="outline" className="bg-primary/5">
                        {generatedByConfig.icon}
                        <span className="ml-1">{generatedByConfig.label}</span>
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Steps Count */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {tour.enablement_tour_steps?.[0]?.count || 0} tour steps configured
                </span>
              </div>

              {/* Previous Review Info */}
              {tour.reviewed_at && (
                <Card className="bg-muted/30">
                  <CardContent className="py-3 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Last reviewed: {format(parseISO(tour.reviewed_at), "PPp")}
                    </div>
                    {tour.review_notes && (
                      <div>
                        <Label className="text-xs">Review Notes</Label>
                        <p className="text-sm mt-1">{tour.review_notes}</p>
                      </div>
                    )}
                    {tour.rejected_reason && (
                      <div>
                        <Label className="text-xs text-destructive">Rejection Reason</Label>
                        <p className="text-sm mt-1 text-destructive">{tour.rejected_reason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Review Actions */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Workflow Actions</h4>

                {canSubmitForReview && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleAction("submit_review")}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Review
                  </Button>
                )}

                {canApproveOrReject && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="notes">Review Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes for approval or feedback..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="default"
                        onClick={() => handleAction("approve")}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        className="flex-1"
                        variant="destructive"
                        onClick={() => setConfirmAction("reject")}
                        disabled={updateStatusMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {canPublish && (
                  <Button
                    className="w-full"
                    onClick={() => handleAction("publish")}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Publish Tour
                  </Button>
                )}

                {status === "published" && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    This tour is live and visible to users
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={confirmAction === "reject"} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Tour</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this tour. The author will see this feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateStatusMutation.mutate({ action: "reject", notes: rejectReason })}
              disabled={!rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Tour
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={confirmAction === "publish"} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Tour</AlertDialogTitle>
            <AlertDialogDescription>
              This will activate the tour and make it visible to users based on its trigger settings.
              Are you sure you want to publish "{tour.tour_name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => updateStatusMutation.mutate({ action: "publish" })}>
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

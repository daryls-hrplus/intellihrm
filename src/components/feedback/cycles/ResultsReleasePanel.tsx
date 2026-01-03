import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Clock, 
  CheckCircle, 
  Unlock, 
  Calendar,
  Bell,
  Loader2,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ResultsPreviewDialog } from "./ResultsPreviewDialog";
import { VisibilityRules, DEFAULT_VISIBILITY_RULES } from "./CycleVisibilityRulesEditor";

interface ResultsReleasePanelProps {
  cycleId: string;
  cycleName: string;
  cycleStatus: string;
  resultsReleasedAt: string | null;
  resultsReleasedBy: string | null;
  releaseSettings: {
    auto_release_on_close: boolean;
    release_delay_days: number;
    require_hr_approval: boolean;
    notify_on_release: boolean;
  };
  visibilityRules?: VisibilityRules;
  companyId?: string;
  onReleased: () => void;
}

export function ResultsReleasePanel({
  cycleId,
  cycleName,
  cycleStatus,
  resultsReleasedAt,
  resultsReleasedBy,
  releaseSettings,
  visibilityRules = DEFAULT_VISIBILITY_RULES,
  companyId,
  onReleased,
}: ResultsReleasePanelProps) {
  const { user } = useAuth();
  const [releasing, setReleasing] = useState(false);
  const [releaserName, setReleaserName] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch releaser name if we have the ID
  useState(() => {
    if (resultsReleasedBy) {
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", resultsReleasedBy)
        .single()
        .then(({ data }) => {
          setReleaserName(data?.full_name || null);
        });
    }
  });

  const handleRelease = async () => {
    if (!user?.id) return;
    
    setReleasing(true);
    try {
      const { error } = await supabase
        .from("review_cycles")
        .update({
          results_released_at: new Date().toISOString(),
          results_released_by: user.id,
        })
        .eq("id", cycleId);

      if (error) throw error;

      toast.success("Results released successfully");
      onReleased();
    } catch (error) {
      console.error("Error releasing results:", error);
      toast.error("Failed to release results");
    } finally {
      setReleasing(false);
    }
  };

  const isReleased = !!resultsReleasedAt;
  const isCycleClosed = cycleStatus === "completed";
  const needsManualRelease = releaseSettings.require_hr_approval && !releaseSettings.auto_release_on_close;

  // If auto-release and no HR approval needed
  if (!needsManualRelease && !isReleased && isCycleClosed) {
    return null; // Results are automatically available
  }

  return (
    <Card className={isReleased ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isReleased ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <Clock className="h-5 w-5 text-warning" />
            )}
            <div>
              <CardTitle className="text-base">Results Release Status</CardTitle>
              <CardDescription>
                {isReleased 
                  ? "Results are available to employees and managers"
                  : "Results are pending release"
                }
              </CardDescription>
            </div>
          </div>
          <Badge variant={isReleased ? "default" : "secondary"}>
            {isReleased ? "Released" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isReleased ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Released on {format(new Date(resultsReleasedAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            {releaserName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Released by: {releaserName}</span>
              </div>
            )}
            {releaseSettings.notify_on_release && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bell className="h-4 w-4" />
                <span>Notifications sent to participants</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isCycleClosed 
                ? "The cycle has closed. Release results to make them available to employees and managers."
                : "Results will be available for release once the cycle is completed."
              }
            </p>
            
            {isCycleClosed && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Results As
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={releasing}>
                      {releasing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Releasing...
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Release Results Now
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Release 360 Feedback Results</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will make results for "{cycleName}" available to employees and managers 
                        based on the configured visibility rules. 
                        {releaseSettings.notify_on_release && " Email notifications will be sent to all participants."}
                        <br /><br />
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRelease}>
                        Release Results
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            <ResultsPreviewDialog
              open={previewOpen}
              onOpenChange={setPreviewOpen}
              cycleId={cycleId}
              cycleName={cycleName}
              visibilityRules={visibilityRules}
              companyId={companyId}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

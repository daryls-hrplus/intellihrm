import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CheckCircle,
  Clock,
  Play,
  Square,
  Calendar,
  Send,
  AlertCircle,
} from "lucide-react";
import { CycleTimelineVisualizer } from "./CycleTimelineVisualizer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";

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
  participants_count?: number;
  completion_rate?: number;
}

interface CycleOverviewTabProps {
  cycle: ReviewCycle;
  onUpdate: () => void;
}

export function CycleOverviewTab({ cycle, onUpdate }: CycleOverviewTabProps) {
  const handleLaunchCycle = async () => {
    if ((cycle.participants_count || 0) === 0) {
      toast.error("Add participants before launching the cycle");
      return;
    }

    const { error } = await supabase
      .from("review_cycles")
      .update({ status: "active", is_template: false })
      .eq("id", cycle.id);

    if (error) {
      toast.error("Failed to launch cycle");
      return;
    }

    toast.success("Cycle launched successfully");
    onUpdate();
  };

  const handleCloseCycle = async () => {
    const { error } = await supabase
      .from("review_cycles")
      .update({ status: "completed" })
      .eq("id", cycle.id);

    if (error) {
      toast.error("Failed to close cycle");
      return;
    }

    toast.success("Cycle closed successfully");
    onUpdate();
  };

  const handleSendReminders = async () => {
    toast.success("Reminders sent to all pending participants");
  };

  const reviewTypes = [
    { enabled: cycle.include_self_review, label: "Self" },
    { enabled: cycle.include_peer_review, label: "Peer" },
    { enabled: cycle.include_manager_review, label: "Manager" },
    { enabled: cycle.include_direct_report_review, label: "Direct Report" },
  ].filter((r) => r.enabled);

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cycle Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <CycleTimelineVisualizer
            startDate={cycle.start_date}
            endDate={cycle.end_date}
            peerNominationDeadline={cycle.peer_nomination_deadline}
            selfReviewDeadline={cycle.self_review_deadline}
            feedbackDeadline={cycle.feedback_deadline}
            status={cycle.status}
          />
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">{cycle.participants_count || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold">{cycle.completion_rate || 0}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <Progress value={cycle.completion_rate || 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Review Types</p>
                <p className="text-2xl font-bold">{reviewTypes.length}</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {reviewTypes.map((r) => (
                <Badge key={r.label} variant="secondary" className="text-xs">
                  {r.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="text-2xl font-bold">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(cycle.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    )
                  )}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {cycle.status === "draft" && (
              <Button onClick={handleLaunchCycle} className="gap-2">
                <Play className="h-4 w-4" />
                Launch Cycle
              </Button>
            )}
            {(cycle.status === "active" || cycle.status === "in_progress") && (
              <>
                <Button onClick={handleSendReminders} variant="outline" className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Reminders
                </Button>
                <Button onClick={handleCloseCycle} variant="outline" className="gap-2">
                  <Square className="h-4 w-4" />
                  Close Cycle
                </Button>
              </>
            )}
            {cycle.status === "completed" && (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Cycle Completed</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deadlines Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Key Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium">{formatDateForDisplay(cycle.start_date)}</p>
              </div>
            </div>
            {cycle.peer_nomination_deadline && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-info" />
                <div>
                  <p className="text-xs text-muted-foreground">Nominations Due</p>
                  <p className="text-sm font-medium">
                    {formatDateForDisplay(cycle.peer_nomination_deadline)}
                  </p>
                </div>
              </div>
            )}
            {cycle.self_review_deadline && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <div>
                  <p className="text-xs text-muted-foreground">Self Review Due</p>
                  <p className="text-sm font-medium">
                    {formatDateForDisplay(cycle.self_review_deadline)}
                  </p>
                </div>
              </div>
            )}
            {cycle.feedback_deadline && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Feedback Due</p>
                  <p className="text-sm font-medium">
                    {formatDateForDisplay(cycle.feedback_deadline)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <div>
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="text-sm font-medium">{formatDateForDisplay(cycle.end_date)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

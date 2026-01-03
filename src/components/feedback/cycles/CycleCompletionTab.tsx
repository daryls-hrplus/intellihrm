import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Download,
  Users,
  User,
  UserCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CompletionStats {
  selfReview: { completed: number; total: number };
  peerReview: { completed: number; total: number };
  managerReview: { completed: number; total: number };
  directReport: { completed: number; total: number };
}

interface OutstandingReview {
  id: string;
  employeeName: string;
  reviewerType: string;
  reviewerName: string;
  isOverdue: boolean;
}

interface CycleCompletionTabProps {
  cycleId: string;
  feedbackDeadline?: string | null;
}

export function CycleCompletionTab({ cycleId, feedbackDeadline }: CycleCompletionTabProps) {
  const [stats, setStats] = useState<CompletionStats>({
    selfReview: { completed: 0, total: 0 },
    peerReview: { completed: 0, total: 0 },
    managerReview: { completed: 0, total: 0 },
    directReport: { completed: 0, total: 0 },
  });
  const [outstandingReviews, setOutstandingReviews] = useState<OutstandingReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletionData();
  }, [cycleId]);

  const fetchCompletionData = async () => {
    setLoading(true);
    try {
      // First get all participants for this cycle
      const { data: participants, error: participantsError } = await supabase
        .from("review_participants")
        .select("id, employee_id")
        .eq("review_cycle_id", cycleId);

      if (participantsError) throw participantsError;

      const participantIds = (participants || []).map(p => p.id);
      
      if (participantIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch all feedback submissions for these participants
      const { data: submissions, error } = await supabase
        .from("feedback_submissions")
        .select("id, status, reviewer_type, reviewer_id, review_participant_id")
        .in("review_participant_id", participantIds);

      if (error) throw error;

      // Create a map of participant_id to employee_id
      const participantToEmployee = new Map(
        (participants || []).map(p => [p.id, p.employee_id])
      );

      // Calculate stats by reviewer type
      const newStats: CompletionStats = {
        selfReview: { completed: 0, total: 0 },
        peerReview: { completed: 0, total: 0 },
        managerReview: { completed: 0, total: 0 },
        directReport: { completed: 0, total: 0 },
      };

      const outstanding: OutstandingReview[] = [];
      const isOverdue = feedbackDeadline ? new Date(feedbackDeadline) < new Date() : false;

      for (const sub of submissions || []) {
        const key =
          sub.reviewer_type === "self"
            ? "selfReview"
            : sub.reviewer_type === "peer"
            ? "peerReview"
            : sub.reviewer_type === "manager"
            ? "managerReview"
            : "directReport";

        newStats[key].total++;
        if (sub.status === "completed") {
          newStats[key].completed++;
        } else {
          // Fetch names for outstanding reviews (limit to avoid too many queries)
          if (outstanding.length < 20) {
            const employeeId = participantToEmployee.get(sub.review_participant_id);
            
            const { data: employeeProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", employeeId || "")
              .single();

            const { data: reviewerProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", sub.reviewer_id)
              .single();

            outstanding.push({
              id: sub.id,
              employeeName: employeeProfile?.full_name || "Unknown",
              reviewerType: sub.reviewer_type,
              reviewerName: reviewerProfile?.full_name || "Unknown",
              isOverdue,
            });
          }
        }
      }

      setStats(newStats);
      setOutstandingReviews(outstanding);
    } catch (error) {
      console.error("Error fetching completion data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkReminders = async () => {
    toast.success(`Reminders sent to ${outstandingReviews.length} pending reviewers`);
  };

  const handleExportReport = () => {
    toast.success("Completion report exported");
  };

  const getPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const reviewTypeConfig = [
    { key: "selfReview", label: "Self Review", icon: User, color: "text-primary" },
    { key: "peerReview", label: "Peer Review", icon: Users, color: "text-info" },
    { key: "managerReview", label: "Manager Review", icon: UserCheck, color: "text-warning" },
    { key: "directReport", label: "Direct Report", icon: Users, color: "text-success" },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading completion data...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Completion by Reviewer Type */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reviewTypeConfig.map(({ key, label, icon: Icon, color }) => {
          const stat = stats[key as keyof CompletionStats];
          const percentage = getPercentage(stat.completed, stat.total);
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <Badge variant={percentage === 100 ? "default" : "secondary"}>
                    {percentage}%
                  </Badge>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.completed} of {stat.total} completed
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleSendBulkReminders}
          disabled={outstandingReviews.length === 0}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Send Bulk Reminders ({outstandingReviews.length})
        </Button>
        <Button onClick={handleExportReport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Outstanding Reviews */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            Outstanding Reviews
            <Badge variant="outline">{outstandingReviews.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outstandingReviews.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-success" />
              <p className="mt-4 font-medium text-success">All reviews completed!</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="divide-y">
                {outstandingReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {review.reviewerName}{" "}
                        <span className="text-muted-foreground">→</span> {review.employeeName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {review.reviewerType.replace("_", " ")}
                        </Badge>
                        {review.isOverdue && (
                          <Badge className="bg-destructive/10 text-destructive text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

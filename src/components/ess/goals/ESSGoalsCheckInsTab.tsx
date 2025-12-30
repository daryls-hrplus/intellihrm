import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { differenceInDays } from "date-fns";

interface CheckIn {
  id: string;
  goal_id: string;
  check_in_date: string | null;
  progress_at_check_in: number | null;
  employee_commentary: string | null;
  manager_feedback: string | null;
  status: string;
  created_at: string;
  goal?: {
    title: string;
    status: string;
  };
}

interface ESSGoalsCheckInsTabProps {
  userId: string;
  onCheckIn?: (goalId: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  employee_submitted: { label: "Submitted", color: "bg-primary/10 text-primary", icon: ClipboardCheck },
  completed: { label: "Reviewed", color: "bg-success/10 text-success", icon: CheckCircle },
};

export function ESSGoalsCheckInsTab({ userId, onCheckIn }: ESSGoalsCheckInsTabProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckIns();
  }, [userId]);

  const fetchCheckIns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_check_ins")
        .select(`
          *,
          goal:performance_goals!goal_id(title, status)
        `)
        .eq("employee_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      // Map database fields to our interface
      const mappedData = (data || []).map((d: any) => ({
        id: d.id,
        goal_id: d.goal_id,
        check_in_date: d.check_in_date,
        progress_at_check_in: d.progress_at_check_in,
        employee_commentary: d.employee_commentary,
        manager_feedback: d.coaching_notes, // Map coaching_notes to manager_feedback
        status: d.status,
        created_at: d.created_at,
        goal: d.goal,
      }));
      setCheckIns(mappedData);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCheckIns = checkIns.filter(c => c.status === "pending");
  const submittedCheckIns = checkIns.filter(c => c.status === "employee_submitted");
  const completedCheckIns = checkIns.filter(c => c.status === "completed");

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading check-ins...</div>;
  }

  if (checkIns.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No check-ins yet</h3>
          <p className="text-muted-foreground">
            Your goal check-ins will appear here once you start submitting them
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCheckIns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Awaiting Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedCheckIns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCheckIns.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Check-ins */}
      {pendingCheckIns.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Action Required ({pendingCheckIns.length})
          </h3>
          {pendingCheckIns.map(checkIn => {
            const daysLeft = checkIn.check_in_date
              ? differenceInDays(new Date(checkIn.check_in_date), new Date())
              : null;
            const isOverdue = daysLeft !== null && daysLeft < 0;

            return (
              <Card key={checkIn.id} className={isOverdue ? "border-destructive/50" : "border-warning/50"}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{checkIn.goal?.title || "Goal"}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        {checkIn.check_in_date && (
                          <span className={isOverdue ? "text-destructive font-medium" : ""}>
                            {isOverdue
                              ? `Overdue by ${Math.abs(daysLeft!)} days`
                              : daysLeft === 0
                                ? "Due today"
                                : `Due in ${daysLeft} days`}
                          </span>
                        )}
                      </div>
                    </div>
                    {onCheckIn && (
                      <Button size="sm" onClick={() => onCheckIn(checkIn.goal_id)}>
                        <ClipboardCheck className="h-4 w-4 mr-1" />
                        Submit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* All Check-ins */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Check-in History</h3>
        {checkIns.map(checkIn => {
          const statusConfig = STATUS_CONFIG[checkIn.status] || STATUS_CONFIG.pending;
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={checkIn.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{checkIn.goal?.title || "Goal"}</h4>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    {checkIn.employee_commentary && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {checkIn.employee_commentary}
                      </p>
                    )}
                    {checkIn.manager_feedback && (
                      <div className="mt-2 p-2 rounded bg-muted/50">
                        <p className="text-sm flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Manager: </span>
                            {checkIn.manager_feedback}
                          </span>
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>Submitted {formatDateForDisplay(checkIn.created_at, "MMM d, yyyy")}</span>
                      {checkIn.progress_at_check_in !== null && (
                        <span>Progress: {checkIn.progress_at_check_in}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

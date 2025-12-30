import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { DISPUTE_CATEGORY_LABELS, DISPUTE_STATUS_LABELS } from "@/types/goalRatings";
import type { DisputeCategory, DisputeStatus } from "@/types/goalRatings";

interface DisputedSubmission {
  id: string;
  goal_id: string;
  employee_id: string;
  final_score: number | null;
  is_disputed: boolean;
  disputed_at: string | null;
  dispute_reason: string | null;
  dispute_category: string | null;
  dispute_status: string | null;
  dispute_resolution: string | null;
  dispute_resolved_at: string | null;
  goal?: {
    title: string;
  };
}

interface ESSGoalsDisputesTabProps {
  userId: string;
  companyId: string;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  open: Clock,
  under_review: AlertTriangle,
  resolved: CheckCircle,
  rejected: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-warning/10 text-warning",
  under_review: "bg-primary/10 text-primary",
  resolved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

export function ESSGoalsDisputesTab({ userId, companyId }: ESSGoalsDisputesTabProps) {
  const [disputes, setDisputes] = useState<DisputedSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, [userId, companyId]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_rating_submissions")
        .select(`
          *,
          goal:performance_goals!goal_id(title)
        `)
        .eq("employee_id", userId)
        .eq("company_id", companyId)
        .eq("is_disputed", true)
        .order("disputed_at", { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDisputes = disputes.filter(d => d.dispute_status === "open" || d.dispute_status === "under_review");
  const resolvedDisputes = disputes.filter(d => d.dispute_status === "resolved");
  const rejectedDisputes = disputes.filter(d => d.dispute_status === "rejected");

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading disputes...</div>;
  }

  if (disputes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No disputes filed</h3>
          <p className="text-muted-foreground">
            If you disagree with a rating, you can dispute it after acknowledging. Disputes will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={openDisputes.length > 0 ? "border-warning/50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Open / Under Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openDisputes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedDisputes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedDisputes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Disputes */}
      {openDisputes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Active Disputes ({openDisputes.length})
          </h3>
          {openDisputes.map(dispute => (
            <DisputeCard key={dispute.id} dispute={dispute} />
          ))}
        </div>
      )}

      {/* All Disputes History */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Dispute History</h3>
        {disputes.map(dispute => (
          <DisputeCard key={dispute.id} dispute={dispute} />
        ))}
      </div>
    </div>
  );
}

function DisputeCard({ dispute }: { dispute: DisputedSubmission }) {
  const StatusIcon = STATUS_ICONS[dispute.dispute_status || "open"] || Clock;
  const statusLabel = dispute.dispute_status 
    ? DISPUTE_STATUS_LABELS[dispute.dispute_status as DisputeStatus]?.label 
    : "Open";
  const statusColor = STATUS_COLORS[dispute.dispute_status || "open"] || STATUS_COLORS.open;
  const categoryLabel = dispute.dispute_category 
    ? DISPUTE_CATEGORY_LABELS[dispute.dispute_category as DisputeCategory]?.label 
    : "General";

  return (
    <Card className={dispute.dispute_status === "open" || dispute.dispute_status === "under_review" ? "border-warning/50" : ""}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium">{dispute.goal?.title || "Goal"}</h4>
              <Badge className={statusColor}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusLabel}
              </Badge>
              <Badge variant="outline">{categoryLabel}</Badge>
            </div>

            {dispute.final_score !== null && (
              <p className="text-sm text-muted-foreground mt-1">
                Disputed Rating: <span className="font-medium text-foreground">{dispute.final_score.toFixed(1)}</span>
              </p>
            )}
            
            {dispute.dispute_reason && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                "{dispute.dispute_reason}"
              </p>
            )}

            {dispute.dispute_resolution && (
              <div className="mt-3 p-3 rounded bg-muted/50">
                <p className="text-sm flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">Resolution: </span>
                    {dispute.dispute_resolution}
                  </span>
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              {dispute.disputed_at && (
                <span>Filed {formatDateForDisplay(dispute.disputed_at, "MMM d, yyyy")}</span>
              )}
              {dispute.dispute_resolved_at && (
                <span>Resolved {formatDateForDisplay(dispute.dispute_resolved_at, "MMM d, yyyy")}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

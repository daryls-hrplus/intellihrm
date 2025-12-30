import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileEdit, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { CHANGE_TYPE_LABELS, ADJUSTMENT_REASON_LABELS, APPROVAL_STATUS_LABELS, APPROVAL_STATUS_COLORS } from "@/types/goalAdjustments";

interface GoalAdjustment {
  id: string;
  goal_id: string;
  change_type: string;
  adjustment_reason: string | null;
  business_justification: string | null;
  previous_value: any;
  new_value: any;
  approval_status: string;
  approval_notes: string | null;
  created_at: string;
  goal?: {
    title: string;
  };
}

interface ESSGoalsAdjustmentsTabProps {
  userId: string;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

export function ESSGoalsAdjustmentsTab({ userId }: ESSGoalsAdjustmentsTabProps) {
  const [adjustments, setAdjustments] = useState<GoalAdjustment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdjustments();
  }, [userId]);

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      // Use any to avoid TS2589 type recursion error
      const supabaseAny = supabase as any;
      const { data: adjustmentsData, error: adjustmentsError } = await supabaseAny
        .from("goal_adjustments")
        .select("id, goal_id, change_type, adjustment_reason, business_justification, previous_value, new_value, approval_status, approval_notes, created_at")
        .eq("requested_by", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (adjustmentsError) throw adjustmentsError;
      
      // Fetch goal titles for these adjustments
      const goalIds = [...new Set((adjustmentsData || []).map((a: any) => a.goal_id as string))];
      let goalsMap: Record<string, string> = {};
      
      if (goalIds.length > 0) {
        const { data: goalsData } = await supabaseAny
          .from("performance_goals")
          .select("id, title")
          .in("id", goalIds);
        
        goalsMap = (goalsData || []).reduce((acc: Record<string, string>, g: any) => {
          acc[g.id] = g.title;
          return acc;
        }, {} as Record<string, string>);
      }

      // Map to our interface
      const mappedData: GoalAdjustment[] = (adjustmentsData || []).map((d: any) => ({
        id: d.id,
        goal_id: d.goal_id,
        change_type: d.change_type,
        adjustment_reason: d.adjustment_reason,
        business_justification: d.business_justification,
        previous_value: d.previous_value,
        new_value: d.new_value,
        approval_status: d.approval_status,
        approval_notes: d.approval_notes,
        created_at: d.created_at,
        goal: { title: goalsMap[d.goal_id] || "Goal" },
      }));
      setAdjustments(mappedData);
    } catch (error) {
      console.error("Error fetching adjustments:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingAdjustments = adjustments.filter(a => a.approval_status === "pending");
  const approvedAdjustments = adjustments.filter(a => a.approval_status === "approved");
  const rejectedAdjustments = adjustments.filter(a => a.approval_status === "rejected");

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading adjustments...</div>;
  }

  if (adjustments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileEdit className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No adjustment requests</h3>
          <p className="text-muted-foreground">
            When you request changes to your goals, they'll appear here for tracking
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={pendingAdjustments.length > 0 ? "border-warning/50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAdjustments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedAdjustments.length}</div>
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
            <div className="text-2xl font-bold">{rejectedAdjustments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Adjustments */}
      {pendingAdjustments.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Awaiting Manager Approval ({pendingAdjustments.length})
          </h3>
          {pendingAdjustments.map(adjustment => (
            <AdjustmentCard key={adjustment.id} adjustment={adjustment} />
          ))}
        </div>
      )}

      {/* All Adjustments History */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Adjustment History</h3>
        {adjustments.map(adjustment => (
          <AdjustmentCard key={adjustment.id} adjustment={adjustment} showHistory />
        ))}
      </div>
    </div>
  );
}

function AdjustmentCard({ adjustment, showHistory = false }: { adjustment: GoalAdjustment; showHistory?: boolean }) {
  const StatusIcon = STATUS_ICONS[adjustment.approval_status] || Clock;
  const statusLabel = APPROVAL_STATUS_LABELS[adjustment.approval_status as keyof typeof APPROVAL_STATUS_LABELS] || adjustment.approval_status;
  const statusColor = APPROVAL_STATUS_COLORS[adjustment.approval_status as keyof typeof APPROVAL_STATUS_COLORS] || "bg-muted text-muted-foreground";
  const changeTypeLabel = CHANGE_TYPE_LABELS[adjustment.change_type as keyof typeof CHANGE_TYPE_LABELS] || adjustment.change_type;
  const reasonLabel = adjustment.adjustment_reason 
    ? (ADJUSTMENT_REASON_LABELS[adjustment.adjustment_reason as keyof typeof ADJUSTMENT_REASON_LABELS] || adjustment.adjustment_reason)
    : "Not specified";

  return (
    <Card className={adjustment.approval_status === "pending" ? "border-warning/50" : ""}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium">{adjustment.goal?.title || "Goal"}</h4>
              <Badge className={statusColor}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusLabel}
              </Badge>
              <Badge variant="outline">{changeTypeLabel}</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              Reason: {reasonLabel}
            </p>
            
            {adjustment.business_justification && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                "{adjustment.business_justification}"
              </p>
            )}

            {/* Show value change if available */}
            {adjustment.previous_value && adjustment.new_value && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-muted-foreground line-through">
                  {typeof adjustment.previous_value === "object" 
                    ? JSON.stringify(adjustment.previous_value) 
                    : adjustment.previous_value}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground font-medium">
                  {typeof adjustment.new_value === "object" 
                    ? JSON.stringify(adjustment.new_value) 
                    : adjustment.new_value}
                </span>
              </div>
            )}

            {adjustment.approval_notes && (
              <div className="mt-2 p-2 rounded bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Manager notes: </span>
                  {adjustment.approval_notes}
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Requested {formatDateForDisplay(adjustment.created_at, "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

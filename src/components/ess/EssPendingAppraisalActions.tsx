import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  ChevronRight,
  Shield,
  Clock
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface PendingAction {
  id: string;
  rule_name: string;
  action_type: string;
  action_message: string | null;
  is_mandatory: boolean;
  triggered_section: string | null;
  cycle_name: string;
  status: string;
}

export function EssPendingAppraisalActions() {
  const { user } = useAuth();

  const { data: pendingActions, isLoading } = useQuery({
    queryKey: ["ess-pending-appraisal-actions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get participant IDs for this employee
      const { data: participants } = await supabase
        .from("appraisal_participants")
        .select("id, cycle:appraisal_cycles(name)")
        .eq("employee_id", user.id)
        .in("status", ["in_progress", "submitted"]);

      if (!participants || participants.length === 0) return [];

      const participantIds = participants.map(p => p.id);

      // Get pending executions for these participants
      const { data: executions } = await supabase
        .from("appraisal_action_executions")
        .select(`
          id,
          status,
          triggered_section,
          rule:appraisal_outcome_action_rules(
            rule_name,
            action_type,
            action_message,
            action_is_mandatory
          ),
          participant_id
        `)
        .in("participant_id", participantIds)
        .eq("status", "pending");

      if (!executions) return [];

      // Map to friendly format
      return executions.map(exec => {
        const participant = participants.find(p => p.id === exec.participant_id);
        return {
          id: exec.id,
          rule_name: (exec.rule as any)?.rule_name || "Unknown Rule",
          action_type: (exec.rule as any)?.action_type || "unknown",
          action_message: (exec.rule as any)?.action_message,
          is_mandatory: (exec.rule as any)?.action_is_mandatory || false,
          triggered_section: exec.triggered_section,
          cycle_name: (participant?.cycle as any)?.name || "Appraisal",
          status: exec.status,
        } as PendingAction;
      });
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!pendingActions || pendingActions.length === 0) {
    return null; // Don't show card if no pending actions
  }

  const mandatoryCount = pendingActions.filter(a => a.is_mandatory).length;
  const advisoryCount = pendingActions.filter(a => !a.is_mandatory).length;

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "create_idp":
      case "require_development_plan":
        return <FileText className="h-4 w-4" />;
      case "create_pip":
        return <AlertTriangle className="h-4 w-4" />;
      case "schedule_coaching":
        return <Clock className="h-4 w-4" />;
      default:
        return <ChevronRight className="h-4 w-4" />;
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case "create_idp": return "Development Plan Required";
      case "create_pip": return "Improvement Plan Required";
      case "require_development_plan": return "Development Plan Required";
      case "schedule_coaching": return "Coaching Session Required";
      case "require_comment": return "Comment Required";
      default: return "Action Required";
    }
  };

  return (
    <Card className="border-warning/50 bg-warning/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-warning" />
            <CardTitle className="text-base">Appraisal Actions</CardTitle>
          </div>
          <div className="flex gap-2">
            {mandatoryCount > 0 && (
              <Badge variant="destructive">{mandatoryCount} Required</Badge>
            )}
            {advisoryCount > 0 && (
              <Badge variant="secondary">{advisoryCount} Recommended</Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Actions triggered by your performance appraisal outcomes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mandatoryCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have {mandatoryCount} required action{mandatoryCount > 1 ? "s" : ""} that must be completed.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {pendingActions.slice(0, 3).map((action) => (
            <div
              key={action.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                action.is_mandatory 
                  ? "border-destructive/30 bg-destructive/5" 
                  : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={action.is_mandatory ? "text-destructive" : "text-muted-foreground"}>
                  {getActionIcon(action.action_type)}
                </div>
                <div>
                  <p className="text-sm font-medium">{getActionLabel(action.action_type)}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.cycle_name}
                    {action.triggered_section && ` • ${action.triggered_section}`}
                  </p>
                </div>
              </div>
              <Badge variant={action.is_mandatory ? "destructive" : "secondary"}>
                {action.is_mandatory ? "Required" : "Recommended"}
              </Badge>
            </div>
          ))}
        </div>

        {pendingActions.length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            +{pendingActions.length - 3} more action{pendingActions.length - 3 > 1 ? "s" : ""}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" asChild>
            <NavLink to="/ess/my-appraisals">
              View My Appraisals
              <ChevronRight className="ml-1 h-4 w-4" />
            </NavLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
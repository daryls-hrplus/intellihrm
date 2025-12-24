import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  User,
  ChevronDown,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ApprovalStep {
  id: string;
  step_order: number;
  status: string;
  approver_id: string;
  comments: string | null;
  decided_at: string | null;
  created_at: string;
  approver?: { full_name: string } | null;
}

interface GoalApprovalStatusProps {
  goalId: string;
  goalStatus: string;
  compact?: boolean;
}

const statusConfig = {
  pending: { icon: Clock, color: "text-warning", bgColor: "bg-warning/10", label: "Pending" },
  approved: { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10", label: "Approved" },
  rejected: { icon: XCircle, color: "text-destructive", bgColor: "bg-destructive/10", label: "Rejected" },
  returned: { icon: RotateCcw, color: "text-info", bgColor: "bg-info/10", label: "Returned" },
};

export function GoalApprovalStatus({ goalId, goalStatus, compact = false }: GoalApprovalStatusProps) {
  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovalSteps();
  }, [goalId]);

  const fetchApprovalSteps = async () => {
    try {
      const { data, error } = await supabase
        .from("goal_approvals")
        .select(`
          *,
          approver:profiles!goal_approvals_approver_id_fkey(full_name)
        `)
        .eq("goal_id", goalId)
        .order("step_order");

      if (error) throw error;
      setApprovalSteps((data || []) as ApprovalStep[]);
    } catch (error) {
      console.error("Error fetching approval steps:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Badge variant="outline">Loading...</Badge>;
  }

  // If no approval steps and goal is draft, show draft status
  if (approvalSteps.length === 0) {
    if (goalStatus === "draft") {
      return (
        <Badge variant="secondary" className="text-xs">
          Draft - Not Submitted
        </Badge>
      );
    }
    return null;
  }

  // Find current status
  const pendingStep = approvalSteps.find(s => s.status === "pending");
  const rejectedStep = approvalSteps.find(s => s.status === "rejected");
  const returnedStep = approvalSteps.find(s => s.status === "returned");
  const allApproved = approvalSteps.length > 0 && approvalSteps.every(s => s.status === "approved");

  let currentStatus: keyof typeof statusConfig = "pending";
  if (rejectedStep) currentStatus = "rejected";
  else if (returnedStep) currentStatus = "returned";
  else if (allApproved) currentStatus = "approved";

  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
            <Icon className={`h-3 w-3 ${config.color}`} />
            {config.label}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <ApprovalStepsDetail steps={approvalSteps} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={`p-3 rounded-lg ${config.bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className="font-medium text-sm">{config.label}</span>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Info className="h-3 w-3 mr-1" />
              Details
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <ApprovalStepsDetail steps={approvalSteps} />
          </PopoverContent>
        </Popover>
      </div>
      {pendingStep && (
        <p className="text-xs text-muted-foreground mt-1">
          Waiting for: {pendingStep.approver?.full_name || "Approver"}
        </p>
      )}
    </div>
  );
}

function ApprovalStepsDetail({ steps }: { steps: ApprovalStep[] }) {
  return (
    <div className="p-4 space-y-3">
      <h4 className="font-medium text-sm">Approval Chain</h4>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const config = statusConfig[step.status as keyof typeof statusConfig] || statusConfig.pending;
          const Icon = config.icon;
          
          return (
            <div key={step.id}>
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-full ${config.bgColor}`}>
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Step {step.step_order}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3" />
                    {step.approver?.full_name || "Unknown"}
                  </p>
                  {step.decided_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(step.decided_at), { addSuffix: true })}
                    </p>
                  )}
                  {step.comments && (
                    <p className="text-xs mt-1 p-2 bg-muted rounded">
                      "{step.comments}"
                    </p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <Separator className="my-2 ml-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

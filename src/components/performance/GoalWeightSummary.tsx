import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Scale,
  TrendingUp,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WeightSummary, WeightStatus } from "@/hooks/useGoalWeights";

interface GoalWeightSummaryProps {
  summary: WeightSummary;
  employeeName?: string;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const statusConfig: Record<WeightStatus, {
  label: string;
  icon: React.ReactNode;
  className: string;
  progressClassName: string;
  description: string;
}> = {
  complete: {
    label: "Complete",
    icon: <CheckCircle className="h-4 w-4" />,
    className: "text-success bg-success/10 border-success/20",
    progressClassName: "[&>div]:bg-success",
    description: "Goal weights are properly allocated",
  },
  under: {
    label: "Incomplete",
    icon: <AlertTriangle className="h-4 w-4" />,
    className: "text-warning bg-warning/10 border-warning/20",
    progressClassName: "[&>div]:bg-warning",
    description: "More weight needs to be allocated to goals",
  },
  over: {
    label: "Over-allocated",
    icon: <AlertCircle className="h-4 w-4" />,
    className: "text-destructive bg-destructive/10 border-destructive/20",
    progressClassName: "[&>div]:bg-destructive",
    description: "Total weight exceeds 100%",
  },
};

export function GoalWeightSummary({
  summary,
  employeeName,
  showDetails = true,
  compact = false,
  className,
}: GoalWeightSummaryProps) {
  const config = statusConfig[summary.status];
  const progressValue = Math.min(summary.totalWeight, 100);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("p-1 rounded", config.className)}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <Progress 
            value={progressValue} 
            className={cn("h-2", config.progressClassName)} 
          />
        </div>
        <span className={cn("text-sm font-medium tabular-nums", 
          summary.status === "complete" ? "text-success" :
          summary.status === "over" ? "text-destructive" : "text-warning"
        )}>
          {summary.totalWeight}%
        </span>
      </div>
    );
  }

  return (
    <Card className={cn("border", className)}>
      <CardContent className="pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="font-medium text-sm">
                {employeeName ? `${employeeName}'s Weight Allocation` : "Weight Allocation"}
              </h4>
              {showDetails && (
                <p className="text-xs text-muted-foreground">
                  {summary.goalCount} goal{summary.goalCount !== 1 ? "s" : ""} assigned
                </p>
              )}
            </div>
          </div>
          <Badge variant="outline" className={config.className}>
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Weight</span>
            <span className={cn("font-semibold tabular-nums",
              summary.status === "complete" ? "text-success" :
              summary.status === "over" ? "text-destructive" : "text-warning"
            )}>
              {summary.totalWeight}% / 100%
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progressValue} 
              className={cn("h-3", config.progressClassName)} 
            />
            {/* 100% marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-foreground/30" 
              style={{ left: '100%', transform: 'translateX(-1px)' }} 
            />
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>Target: 100%</span>
            </div>
            {summary.status === "under" && (
              <div className="flex items-center gap-1 text-warning">
                <TrendingUp className="h-3 w-3" />
                <span>{summary.remainingWeight}% remaining</span>
              </div>
            )}
            {summary.status === "over" && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{Math.abs(summary.remainingWeight)}% over</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {showDetails && summary.status !== "complete" && (
          <Alert className={cn("mt-4", config.className)}>
            <AlertDescription className="text-xs">
              {config.description}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Inline version for table rows
export function GoalWeightBadge({ summary }: { summary: WeightSummary }) {
  const config = statusConfig[summary.status];
  
  return (
    <Badge variant="outline" className={cn("gap-1", config.className)}>
      {config.icon}
      <span className="tabular-nums">{summary.totalWeight}%</span>
    </Badge>
  );
}

// Warning alert for save validation
interface GoalWeightWarningProps {
  currentTotal: number;
  proposedWeight: number;
  existingWeight?: number;
  onProceed: () => void;
  onCancel: () => void;
}

export function GoalWeightWarning({
  currentTotal,
  proposedWeight,
  existingWeight = 0,
  onProceed,
  onCancel,
}: GoalWeightWarningProps) {
  const newTotal = currentTotal - existingWeight + proposedWeight;
  const status: WeightStatus = newTotal === 100 ? "complete" : newTotal < 100 ? "under" : "over";
  const config = statusConfig[status];

  return (
    <Alert className={cn("border-2", config.className)}>
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1">Weight Allocation Warning</h4>
          <p className="text-xs mb-3">
            {status === "under" && (
              <>After saving, total weight will be <strong>{newTotal}%</strong>. 
              You'll need to allocate <strong>{100 - newTotal}%</strong> more to reach 100%.</>
            )}
            {status === "over" && (
              <>After saving, total weight will be <strong>{newTotal}%</strong>. 
              This exceeds 100% by <strong>{newTotal - 100}%</strong>.</>
            )}
            {status === "complete" && (
              <>After saving, total weight will be exactly <strong>100%</strong>. Perfect!</>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onProceed}
              className="text-xs font-medium px-3 py-1.5 rounded bg-foreground/10 hover:bg-foreground/20 transition-colors"
            >
              Save Anyway
            </button>
            <button
              onClick={onCancel}
              className="text-xs px-3 py-1.5 rounded hover:bg-foreground/5 transition-colors"
            >
              Adjust Weight
            </button>
          </div>
        </div>
      </div>
    </Alert>
  );
}

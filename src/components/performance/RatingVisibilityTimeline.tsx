import { CheckCircle, Circle, Clock, AlertTriangle, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { GoalRatingSubmission, RatingSubmissionStatus } from "@/types/goalRatings";

interface RatingVisibilityTimelineProps {
  submission: GoalRatingSubmission | null;
  className?: string;
}

const TIMELINE_STEPS: {
  status: RatingSubmissionStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  { status: "draft", label: "Draft", icon: Circle },
  { status: "self_submitted", label: "Self-Rating", icon: Clock },
  { status: "manager_submitted", label: "Manager Rated", icon: Clock },
  { status: "released", label: "Released", icon: CheckCircle },
  { status: "acknowledged", label: "Acknowledged", icon: FileCheck },
];

const STATUS_ORDER: Record<RatingSubmissionStatus, number> = {
  draft: 0,
  self_submitted: 1,
  manager_submitted: 2,
  released: 3,
  acknowledged: 4,
  disputed: 3, // Disputed branches from released
};

export function RatingVisibilityTimeline({ submission, className }: RatingVisibilityTimelineProps) {
  const currentStatus = submission?.status || "draft";
  const currentIndex = STATUS_ORDER[currentStatus];
  const isDisputed = submission?.is_disputed;

  const getStepDate = (status: RatingSubmissionStatus): string | null => {
    if (!submission) return null;
    switch (status) {
      case "self_submitted":
        return submission.self_rating_at || null;
      case "manager_submitted":
        return submission.manager_rating_at || null;
      case "released":
        return submission.released_at || null;
      case "acknowledged":
        return submission.acknowledged_at || null;
      default:
        return null;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-300"
          style={{ width: `${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
        />

        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = STATUS_ORDER[step.status] < currentIndex;
          const isCurrent = step.status === currentStatus;
          const Icon = step.icon;
          const stepDate = getStepDate(step.status);

          return (
            <div
              key={step.status}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 text-center max-w-[80px]",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {stepDate && (
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {format(new Date(stepDate), "MMM d")}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Dispute indicator */}
      {isDisputed && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <div className="flex-1">
            <span className="text-sm font-medium text-destructive">Rating Disputed</span>
            {submission?.disputed_at && (
              <span className="text-xs text-muted-foreground ml-2">
                on {format(new Date(submission.disputed_at), "MMM d, yyyy")}
              </span>
            )}
          </div>
          {submission?.dispute_status && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded",
                submission.dispute_status === "open"
                  ? "bg-yellow-100 text-yellow-800"
                  : submission.dispute_status === "under_review"
                  ? "bg-blue-100 text-blue-800"
                  : submission.dispute_status === "resolved"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {submission.dispute_status}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

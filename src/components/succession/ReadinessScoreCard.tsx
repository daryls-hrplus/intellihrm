import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ReadinessAssessmentEvent } from "@/hooks/succession/useReadinessAssessment";

interface ReadinessScoreCardProps {
  event: ReadinessAssessmentEvent;
  showDetails?: boolean;
}

const READINESS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Ready Now": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  "Ready in 1-3 Years": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  "Ready in 3-5 Years": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  "Ready in Over 5 Years": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
  "Not a Successor": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
};

export function ReadinessScoreCard({ event, showDetails = true }: ReadinessScoreCardProps) {
  const colors = READINESS_COLORS[event.readiness_band || ""] || READINESS_COLORS["Ready in 3-5 Years"];
  const score = event.overall_score || 0;

  const getStatusIcon = () => {
    switch (event.status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <Card className={`${colors.border} border-2`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Readiness Assessment
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon()}
                  <span className="text-xs capitalize">{event.status}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {event.status === "completed" && event.completed_at
                  ? `Completed on ${format(parseISO(event.completed_at), "MMM d, yyyy")}`
                  : event.due_date
                  ? `Due: ${format(parseISO(event.due_date), "MMM d, yyyy")}`
                  : "Assessment in progress"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {event.form?.name && (
          <CardDescription className="text-xs">
            Form: {event.form.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        {event.status === "completed" && event.overall_score !== null ? (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg ${colors.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${colors.text}`}>
                  {event.readiness_band || "Calculating..."}
                </span>
                <span className={`text-2xl font-bold ${colors.text}`}>
                  {Math.round(score)}%
                </span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
            
            {showDetails && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Assessors:</span>
                  <Badge variant="outline" className="text-xs">
                    All Complete
                  </Badge>
                </div>
                {event.completed_at && (
                  <div className="text-right text-muted-foreground">
                    {format(parseISO(event.completed_at), "MMM d, yyyy")}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">
                {event.status === "pending"
                  ? "Assessment not started"
                  : "Assessment in progress"}
              </p>
              {event.due_date && (
                <p className="text-xs text-muted-foreground mt-1">
                  Due: {format(parseISO(event.due_date), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for lists
export function ReadinessScoreBadge({ score, band }: { score: number | null; band: string | null }) {
  if (score === null || band === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Not Assessed
      </Badge>
    );
  }

  const colors = READINESS_COLORS[band] || READINESS_COLORS["Ready in 3-5 Years"];

  return (
    <Badge className={`${colors.bg} ${colors.text} ${colors.border} border`}>
      {band} ({Math.round(score)}%)
    </Badge>
  );
}

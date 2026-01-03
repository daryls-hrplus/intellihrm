import { useMemo } from "react";
import { format, isAfter, isBefore, isWithinInterval, parseISO } from "date-fns";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CycleTimelineVisualizerProps {
  startDate: string;
  endDate: string;
  peerNominationDeadline?: string | null;
  selfReviewDeadline?: string | null;
  feedbackDeadline?: string | null;
  status: string;
}

interface TimelinePhase {
  id: string;
  label: string;
  date: string | null;
  status: "completed" | "current" | "upcoming";
}

export function CycleTimelineVisualizer({
  startDate,
  endDate,
  peerNominationDeadline,
  selfReviewDeadline,
  feedbackDeadline,
  status,
}: CycleTimelineVisualizerProps) {
  const today = new Date();

  const phases = useMemo(() => {
    const allPhases: TimelinePhase[] = [
      { id: "start", label: "Start", date: startDate, status: "upcoming" },
    ];

    // Add optional phases if they exist
    if (peerNominationDeadline) {
      allPhases.push({
        id: "nominations",
        label: "Nominations",
        date: peerNominationDeadline,
        status: "upcoming",
      });
    }

    if (selfReviewDeadline) {
      allPhases.push({
        id: "self-review",
        label: "Self Review",
        date: selfReviewDeadline,
        status: "upcoming",
      });
    }

    if (feedbackDeadline) {
      allPhases.push({
        id: "feedback",
        label: "Feedback",
        date: feedbackDeadline,
        status: "upcoming",
      });
    }

    allPhases.push({ id: "end", label: "End", date: endDate, status: "upcoming" });

    // Sort phases by date
    allPhases.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Determine status for each phase
    let foundCurrent = false;
    return allPhases.map((phase, index) => {
      if (!phase.date) return phase;

      const phaseDate = parseISO(phase.date);

      if (status === "completed" || status === "cancelled") {
        return { ...phase, status: "completed" as const };
      }

      if (status === "draft") {
        return { ...phase, status: "upcoming" as const };
      }

      // For active/in_progress cycles
      if (isBefore(phaseDate, today)) {
        return { ...phase, status: "completed" as const };
      } else if (!foundCurrent) {
        foundCurrent = true;
        return { ...phase, status: "current" as const };
      }
      return { ...phase, status: "upcoming" as const };
    });
  }, [startDate, endDate, peerNominationDeadline, selfReviewDeadline, feedbackDeadline, status]);

  const getStatusIcon = (phaseStatus: TimelinePhase["status"]) => {
    switch (phaseStatus) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "current":
        return <Clock className="h-4 w-4 text-primary animate-pulse" />;
      case "upcoming":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNodeClasses = (phaseStatus: TimelinePhase["status"]) => {
    switch (phaseStatus) {
      case "completed":
        return "bg-success border-success text-success-foreground";
      case "current":
        return "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20";
      case "upcoming":
        return "bg-muted border-muted-foreground/30 text-muted-foreground";
    }
  };

  const getLineClasses = (fromStatus: TimelinePhase["status"], toStatus: TimelinePhase["status"]) => {
    if (fromStatus === "completed" && (toStatus === "completed" || toStatus === "current")) {
      return "bg-success";
    }
    return "bg-muted-foreground/30";
  };

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {phases.map((phase, index) => (
          <div key={phase.id} className="flex flex-col items-center relative z-10">
            {/* Node */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                    getNodeClasses(phase.status)
                  )}
                >
                  {getStatusIcon(phase.status)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{phase.label}</p>
                {phase.date && (
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(phase.date), "MMM d, yyyy")}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>

            {/* Label */}
            <div className="mt-2 text-center">
              <p
                className={cn(
                  "text-xs font-medium",
                  phase.status === "current" ? "text-primary" : "text-muted-foreground"
                )}
              >
                {phase.label}
              </p>
              {phase.date && (
                <p className="text-[10px] text-muted-foreground">
                  {format(parseISO(phase.date), "MMM d")}
                </p>
              )}
            </div>

            {/* Connecting line (except for last node) */}
            {index < phases.length - 1 && (
              <div
                className={cn(
                  "absolute top-4 left-[calc(50%+16px)] h-0.5 w-[calc(100%-32px)]",
                  getLineClasses(phase.status, phases[index + 1].status)
                )}
                style={{
                  width: `calc(${100 / (phases.length - 1)}vw - 64px)`,
                  maxWidth: "150px",
                }}
              />
            )}
          </div>
        ))}

        {/* Background connecting line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted-foreground/20 -z-0" />
      </div>

      {/* Current phase indicator */}
      {status !== "draft" && status !== "completed" && status !== "cancelled" && (
        <div className="mt-3 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            Current: {phases.find((p) => p.status === "current")?.label || "In Progress"}
          </span>
        </div>
      )}
    </div>
  );
}

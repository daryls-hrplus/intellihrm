import { cn } from "@/lib/utils";
import { useEnablementProgress } from "@/hooks/useEnablementProgress";
import { Sparkles, ClipboardCheck, Rocket, BookOpen, Check, AlertCircle, Loader2 } from "lucide-react";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

interface WorkflowStep {
  id: "create" | "review" | "release" | "library";
  label: string;
  icon: typeof Sparkles;
  getCount: (progress: ReturnType<typeof useEnablementProgress>) => number;
  getStatus: (progress: ReturnType<typeof useEnablementProgress>) => "complete" | "active" | "warning" | "pending";
  href: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "create",
    label: "Create",
    icon: Sparkles,
    getCount: (p) => p.totalContent,
    getStatus: (p) => p.totalContent > 0 ? "complete" : "active",
    href: "/enablement/create",
  },
  {
    id: "review",
    label: "Review",
    icon: ClipboardCheck,
    getCount: (p) => p.pendingReviewCount,
    getStatus: (p) => {
      if (p.pendingReviewCount > 5) return "warning";
      if (p.pendingReviewCount > 0) return "active";
      if (p.approvedCount > 0 || p.publishedCount > 0) return "complete";
      return "pending";
    },
    href: "/enablement/review",
  },
  {
    id: "release",
    label: "Release",
    icon: Rocket,
    getCount: (p) => p.approvedCount,
    getStatus: (p) => {
      if (p.approvedCount > 10) return "warning";
      if (p.approvedCount > 0 || p.readyToPublishCount > 0) return "active";
      if (p.publishedCount > 0) return "complete";
      return "pending";
    },
    href: "/enablement/release-center",
  },
  {
    id: "library",
    label: "Library",
    icon: BookOpen,
    getCount: (p) => p.publishedCount,
    getStatus: (p) => p.publishedCount > 0 ? "complete" : "pending",
    href: "/enablement/manuals",
  },
];

export function EnablementWorkflowStepper() {
  const progress = useEnablementProgress();
  const { navigateToList } = useWorkspaceNavigation();

  if (progress.isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Workflow Progress
        </h3>
      </div>
      
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, index) => {
          const status = step.getStatus(progress);
          const count = step.getCount(progress);
          const isActive = progress.currentPhase === step.id;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step */}
              <button
                onClick={() => navigateToList({
                  route: step.href,
                  title: step.label,
                  moduleCode: "enablement",
                  icon: step.icon,
                })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:bg-muted/50 min-w-[100px]",
                  isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                {/* Status Indicator */}
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    status === "complete" && "bg-emerald-500/10 border-emerald-500 text-emerald-500",
                    status === "active" && "bg-primary/10 border-primary text-primary",
                    status === "warning" && "bg-amber-500/10 border-amber-500 text-amber-500",
                    status === "pending" && "bg-muted border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {status === "complete" ? (
                    <Check className="h-5 w-5" />
                  ) : status === "warning" ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                  
                  {/* Count Badge */}
                  {count > 0 && (
                    <span
                      className={cn(
                        "absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full text-xs font-medium px-1",
                        status === "warning" && "bg-amber-500 text-amber-950",
                        status === "active" && "bg-primary text-primary-foreground",
                        status === "complete" && "bg-emerald-500 text-emerald-950",
                        status === "pending" && "bg-muted-foreground text-muted"
                      )}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      status === "pending" && "text-muted-foreground",
                      isActive && "text-primary"
                    )}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Action needed
                    </p>
                  )}
                </div>
              </button>

              {/* Connector */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={cn(
                      "h-0.5 w-full rounded-full",
                      WORKFLOW_STEPS.slice(0, index + 1).every(
                        (s) => s.getStatus(progress) === "complete"
                      )
                        ? "bg-emerald-500"
                        : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

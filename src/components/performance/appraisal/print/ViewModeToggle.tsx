import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { User, UserCog, FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "employee" | "manager" | "hr";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
  disabled?: boolean;
}

const VIEW_MODE_CONFIG = {
  employee: {
    label: "Employee View",
    shortLabel: "Employee",
    icon: User,
    description: "Self-assessment columns, own comments, evidence upload",
    color: "data-[state=on]:bg-blue-100 data-[state=on]:text-blue-800 dark:data-[state=on]:bg-blue-900/30 dark:data-[state=on]:text-blue-300",
  },
  manager: {
    label: "Manager View",
    shortLabel: "Manager",
    icon: UserCog,
    description: "Manager rating column, employee's self-ratings visible, gap analysis",
    color: "data-[state=on]:bg-purple-100 data-[state=on]:text-purple-800 dark:data-[state=on]:bg-purple-900/30 dark:data-[state=on]:text-purple-300",
  },
  hr: {
    label: "HR / Print View",
    shortLabel: "HR/Print",
    icon: FileText,
    description: "All columns, all comments, complete evidence, signatures",
    color: "data-[state=on]:bg-green-100 data-[state=on]:text-green-800 dark:data-[state=on]:bg-green-900/30 dark:data-[state=on]:text-green-300",
  },
} as const;

export function ViewModeToggle({
  value,
  onChange,
  className,
  disabled = false,
}: ViewModeToggleProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span>Preview as:</span>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => val && onChange(val as ViewMode)}
        disabled={disabled}
        className="justify-start"
      >
        {(Object.entries(VIEW_MODE_CONFIG) as [ViewMode, typeof VIEW_MODE_CONFIG[ViewMode]][]).map(
          ([mode, config]) => {
            const Icon = config.icon;
            return (
              <ToggleGroupItem
                key={mode}
                value={mode}
                aria-label={config.label}
                className={cn(
                  "gap-2 px-4 py-2 transition-all",
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.shortLabel}</span>
              </ToggleGroupItem>
            );
          }
        )}
      </ToggleGroup>
      <p className="text-xs text-muted-foreground">
        {VIEW_MODE_CONFIG[value].description}
      </p>
    </div>
  );
}

// Helper function to determine what's visible in each view mode
export function getViewModeVisibility(mode: ViewMode) {
  return {
    showEmployeeRating: mode !== "manager", // Employee can see their own, HR sees all
    showManagerRating: mode !== "employee" || false, // Manager and HR see manager ratings (employee only after release)
    showEmployeeComments: true, // Always visible
    showManagerComments: mode !== "employee", // Employee might not see manager comments until released
    showHRComments: mode === "hr",
    showGapAnalysis: mode !== "employee", // Gap shown to manager and HR
    showEvidenceUpload: mode === "employee", // Only employee can upload
    showEvidenceReview: mode !== "employee", // Manager and HR review evidence
    showSignatures: mode === "hr",
    showScoreSummary: mode === "hr",
    isEditable: mode !== "hr", // HR view is read-only/print
    canRateSelf: mode === "employee",
    canRateEmployee: mode === "manager",
  };
}

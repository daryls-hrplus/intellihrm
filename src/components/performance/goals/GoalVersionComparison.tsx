import { ArrowRight, Minus, Plus, Equal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ComparisonValue {
  field: string;
  label: string;
  previousValue: unknown;
  newValue: unknown;
  changeType: "added" | "removed" | "modified" | "unchanged";
}

interface GoalVersionComparisonProps {
  previousValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  title?: string;
  compact?: boolean;
}

// Field display labels
const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  target_value: "Target Value",
  current_value: "Current Value",
  progress_percentage: "Progress",
  due_date: "Due Date",
  start_date: "Start Date",
  status: "Status",
  weighting: "Weight",
  unit_of_measure: "Unit",
  goal_level: "Goal Level",
  goal_type: "Goal Type",
  category: "Category",
  priority: "Priority",
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getChangeType(prev: unknown, next: unknown): "added" | "removed" | "modified" | "unchanged" {
  if (prev === undefined && next !== undefined) return "added";
  if (prev !== undefined && next === undefined) return "removed";
  if (JSON.stringify(prev) !== JSON.stringify(next)) return "modified";
  return "unchanged";
}

function getChangeIcon(changeType: "added" | "removed" | "modified" | "unchanged") {
  switch (changeType) {
    case "added":
      return <Plus className="h-3 w-3 text-green-500" />;
    case "removed":
      return <Minus className="h-3 w-3 text-destructive" />;
    case "modified":
      return <ArrowRight className="h-3 w-3 text-primary" />;
    default:
      return <Equal className="h-3 w-3 text-muted-foreground" />;
  }
}

function getChangeBadgeVariant(changeType: "added" | "removed" | "modified" | "unchanged") {
  switch (changeType) {
    case "added":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "removed":
      return "bg-destructive/10 text-destructive";
    case "modified":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function GoalVersionComparison({
  previousValues,
  newValues,
  title = "Version Comparison",
  compact = false,
}: GoalVersionComparisonProps) {
  // Merge all keys from both objects
  const allKeys = new Set([
    ...Object.keys(previousValues || {}),
    ...Object.keys(newValues || {}),
  ]);

  // Build comparison data
  const comparisons: ComparisonValue[] = Array.from(allKeys)
    .filter((key) => !["id", "created_at", "updated_at", "company_id", "employee_id"].includes(key))
    .map((key) => {
      const prev = previousValues?.[key];
      const next = newValues?.[key];
      return {
        field: key,
        label: FIELD_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        previousValue: prev,
        newValue: next,
        changeType: getChangeType(prev, next),
      };
    })
    .filter((comp) => compact ? comp.changeType !== "unchanged" : true)
    .sort((a, b) => {
      // Sort by change type: modified first, then added, removed, unchanged
      const order = { modified: 0, added: 1, removed: 2, unchanged: 3 };
      return order[a.changeType] - order[b.changeType];
    });

  const changedCount = comparisons.filter((c) => c.changeType !== "unchanged").length;

  if (comparisons.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        No changes to display
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{changedCount} field(s) changed</span>
        </div>
        {comparisons.map((comp) => (
          <div
            key={comp.field}
            className="flex items-center gap-2 text-sm rounded-md border p-2"
          >
            {getChangeIcon(comp.changeType)}
            <span className="font-medium min-w-[100px]">{comp.label}</span>
            <span className="text-muted-foreground line-through truncate max-w-[120px]">
              {formatValue(comp.previousValue)}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[120px]">
              {formatValue(comp.newValue)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          {title}
          <Badge variant="secondary">{changedCount} change(s)</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[24px_1fr_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground pb-2">
            <div></div>
            <div>Field</div>
            <div>Previous</div>
            <div>New</div>
          </div>
          <Separator />
          
          {/* Rows */}
          {comparisons.map((comp, idx) => (
            <div
              key={comp.field}
              className={`grid grid-cols-[24px_1fr_1fr_1fr] gap-2 items-center py-2 text-sm ${
                idx < comparisons.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div className="flex items-center justify-center">
                {getChangeIcon(comp.changeType)}
              </div>
              <div className="font-medium flex items-center gap-2">
                {comp.label}
                {comp.changeType !== "unchanged" && (
                  <Badge className={`text-[10px] px-1.5 py-0 ${getChangeBadgeVariant(comp.changeType)}`}>
                    {comp.changeType}
                  </Badge>
                )}
              </div>
              <div
                className={`truncate ${
                  comp.changeType === "removed" || comp.changeType === "modified"
                    ? "text-muted-foreground line-through"
                    : "text-muted-foreground"
                }`}
                title={formatValue(comp.previousValue)}
              >
                {formatValue(comp.previousValue)}
              </div>
              <div
                className={`truncate ${
                  comp.changeType === "added" || comp.changeType === "modified"
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
                title={formatValue(comp.newValue)}
              >
                {formatValue(comp.newValue)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Inline version for dialogs
export function GoalVersionComparisonInline({
  previousValues,
  newValues,
}: {
  previousValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
}) {
  return (
    <GoalVersionComparison
      previousValues={previousValues}
      newValues={newValues}
      compact
    />
  );
}

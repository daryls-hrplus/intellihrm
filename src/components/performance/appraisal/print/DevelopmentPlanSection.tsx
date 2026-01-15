import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Target,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppraisalItem } from "./AppraisalItemsTable";

export interface DevelopmentAction {
  id: string;
  area: string;
  action: string;
  actionType: "training" | "assignment" | "mentorship" | "self-study" | "coaching";
  priority: "high" | "medium" | "low";
  targetDate?: string;
  owner: "employee" | "manager" | "hr";
  status?: "not_started" | "in_progress" | "completed";
  notes?: string;
}

interface DevelopmentPlanSectionProps {
  items: AppraisalItem[];
  actions?: DevelopmentAction[];
  followUpDate?: string;
  className?: string;
}

const actionTypeConfig = {
  training: {
    icon: GraduationCap,
    label: "Training Course",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  assignment: {
    icon: Target,
    label: "Stretch Assignment",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  mentorship: {
    icon: Users,
    label: "Mentorship",
    badgeClass: "bg-green-50 text-green-700 border-green-200",
  },
  "self-study": {
    icon: BookOpen,
    label: "Self-Study",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  coaching: {
    icon: User,
    label: "Coaching",
    badgeClass: "bg-pink-50 text-pink-700 border-pink-200",
  },
};

const priorityConfig = {
  high: { label: "High", class: "bg-red-100 text-red-700 border-red-200" },
  medium: { label: "Medium", class: "bg-amber-100 text-amber-700 border-amber-200" },
  low: { label: "Low", class: "bg-green-100 text-green-700 border-green-200" },
};

const ownerConfig = {
  employee: { label: "Employee", icon: User },
  manager: { label: "Manager", icon: Users },
  hr: { label: "HR", icon: GraduationCap },
};

const statusConfig = {
  not_started: { label: "Not Started", class: "text-muted-foreground" },
  in_progress: { label: "In Progress", class: "text-blue-600" },
  completed: { label: "Completed", class: "text-green-600" },
};

// Generate sample development actions from gap analysis
function generateSampleActions(items: AppraisalItem[]): DevelopmentAction[] {
  const gapItems = items
    .filter((item) => (item.gap || 0) < 0)
    .sort((a, b) => (a.gap || 0) - (b.gap || 0))
    .slice(0, 4);

  return gapItems.map((item, index) => ({
    id: `dev-${index}`,
    area: item.name,
    action: getRecommendedAction(item, index),
    actionType: getActionType(index),
    priority: getPriority(item.gap || 0),
    targetDate: getTargetDate(index),
    owner: getOwner(index),
    status: "not_started" as const,
    notes: item.gapExplanation,
  }));
}

function getRecommendedAction(item: AppraisalItem, index: number): string {
  const actions = [
    `Complete ${item.name} fundamentals training course`,
    `Shadow senior team member on ${item.name.toLowerCase()} projects`,
    `Participate in ${item.name.toLowerCase()} workshop series`,
    `Set up regular coaching sessions focusing on ${item.name.toLowerCase()}`,
  ];
  return actions[index % actions.length];
}

function getActionType(index: number): DevelopmentAction["actionType"] {
  const types: DevelopmentAction["actionType"][] = ["training", "mentorship", "assignment", "coaching"];
  return types[index % types.length];
}

function getPriority(gap: number): DevelopmentAction["priority"] {
  if (gap <= -2) return "high";
  if (gap === -1) return "medium";
  return "low";
}

function getTargetDate(index: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + (index + 1));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getOwner(index: number): DevelopmentAction["owner"] {
  const owners: DevelopmentAction["owner"][] = ["employee", "manager", "employee", "hr"];
  return owners[index % owners.length];
}

export function DevelopmentPlanSection({
  items,
  actions,
  followUpDate,
  className,
}: DevelopmentPlanSectionProps) {
  // Use provided actions or generate from gap analysis
  const developmentActions = actions || generateSampleActions(items);

  // Calculate development areas from items with gaps
  const developmentAreas = items
    .filter((item) => (item.gap || 0) < 0)
    .sort((a, b) => (a.gap || 0) - (b.gap || 0));

  if (developmentAreas.length === 0 && developmentActions.length === 0) {
    return (
      <div className={cn("development-plan-section mb-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Development Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic text-center py-4">
              No development gaps identified. Employee is meeting or exceeding expectations in all areas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("development-plan-section space-y-4 mb-6 print:break-inside-avoid", className)}>
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Development Plan</h2>
      </div>

      {/* Identified Development Areas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Identified Development Areas</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {developmentAreas.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Gap: {item.gap}
                  </Badge>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Required: Level {item.requiredLevel} | Current: Level {item.managerRating || "N/A"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recommended Development Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm print-table">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3 font-semibold">Area</th>
                  <th className="text-left py-2 px-3 font-semibold">Action</th>
                  <th className="text-left py-2 px-3 font-semibold">Type</th>
                  <th className="text-left py-2 px-3 font-semibold">Priority</th>
                  <th className="text-left py-2 px-3 font-semibold">Target Date</th>
                  <th className="text-left py-2 px-3 font-semibold">Owner</th>
                </tr>
              </thead>
              <tbody>
                {developmentActions.map((action) => {
                  const typeConfig = actionTypeConfig[action.actionType];
                  const TypeIcon = typeConfig.icon;
                  const OwnerIcon = ownerConfig[action.owner].icon;

                  return (
                    <tr key={action.id} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium">{action.area}</td>
                      <td className="py-2 px-3">{action.action}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className={cn("gap-1", typeConfig.badgeClass)}>
                          <TypeIcon className="h-3 w-3" />
                          {typeConfig.label}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className={priorityConfig[action.priority].class}>
                          {priorityConfig[action.priority].label}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {action.targetDate}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="flex items-center gap-1">
                          <OwnerIcon className="h-3 w-3" />
                          {ownerConfig[action.owner].label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Timeline / Milestones */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Development Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex-1 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">30 Days</p>
                <p className="text-sm mt-1">Initial training enrollment</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">60 Days</p>
                <p className="text-sm mt-1">Progress check-in with manager</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs text-green-600 font-medium">90 Days</p>
                <p className="text-sm mt-1">Demonstrate skill improvement</p>
              </div>
            </div>
          </div>

          {followUpDate && (
            <div className="mt-4 pt-4 border-t text-sm text-center">
              <span className="text-muted-foreground">Next Scheduled Review: </span>
              <span className="font-semibold">{followUpDate}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

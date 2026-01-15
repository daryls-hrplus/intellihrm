import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList,
  User,
  Users,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionItem {
  id: string;
  description: string;
  owner: "employee" | "manager" | "hr";
  dueDate?: string;
  status?: "pending" | "in_progress" | "completed";
  category?: "follow_up" | "development" | "goal_setting" | "documentation";
}

interface NextStepsSectionProps {
  actionItems?: ActionItem[];
  nextReviewDate?: string;
  acknowledgmentText?: string;
  className?: string;
}

const ownerConfig = {
  employee: { label: "Employee", icon: User, class: "bg-blue-50 text-blue-700 border-blue-200" },
  manager: { label: "Manager", icon: Users, class: "bg-purple-50 text-purple-700 border-purple-200" },
  hr: { label: "HR", icon: Building2, class: "bg-green-50 text-green-700 border-green-200" },
};

const categoryConfig = {
  follow_up: { label: "Follow-up", class: "bg-gray-100 text-gray-700" },
  development: { label: "Development", class: "bg-amber-100 text-amber-700" },
  goal_setting: { label: "Goal Setting", class: "bg-blue-100 text-blue-700" },
  documentation: { label: "Documentation", class: "bg-purple-100 text-purple-700" },
};

const statusConfig = {
  pending: { label: "Pending", class: "text-muted-foreground" },
  in_progress: { label: "In Progress", class: "text-blue-600" },
  completed: { label: "Completed", class: "text-green-600" },
};

// Default action items if none provided
const defaultActionItems: ActionItem[] = [
  {
    id: "1",
    description: "Schedule development plan review meeting",
    owner: "manager",
    dueDate: "Within 2 weeks",
    status: "pending",
    category: "follow_up",
  },
  {
    id: "2",
    description: "Enroll in recommended training courses",
    owner: "employee",
    dueDate: "Within 30 days",
    status: "pending",
    category: "development",
  },
  {
    id: "3",
    description: "Update individual goals based on appraisal feedback",
    owner: "employee",
    dueDate: "Within 2 weeks",
    status: "pending",
    category: "goal_setting",
  },
  {
    id: "4",
    description: "Archive signed appraisal document in HR system",
    owner: "hr",
    dueDate: "Upon completion",
    status: "pending",
    category: "documentation",
  },
  {
    id: "5",
    description: "Schedule 90-day progress check-in",
    owner: "manager",
    dueDate: "90 days from now",
    status: "pending",
    category: "follow_up",
  },
];

export function NextStepsSection({
  actionItems = defaultActionItems,
  nextReviewDate,
  acknowledgmentText,
  className,
}: NextStepsSectionProps) {
  // Group action items by owner
  const groupedByOwner = actionItems.reduce((acc, item) => {
    if (!acc[item.owner]) acc[item.owner] = [];
    acc[item.owner].push(item);
    return acc;
  }, {} as Record<string, ActionItem[]>);

  return (
    <div className={cn("next-steps-section space-y-4 mb-6 print:break-inside-avoid", className)}>
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Next Steps & Action Items</h2>
      </div>

      {/* Action Items Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Action Items</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm print-table">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3 font-semibold w-8"></th>
                  <th className="text-left py-2 px-3 font-semibold">Action</th>
                  <th className="text-left py-2 px-3 font-semibold">Category</th>
                  <th className="text-left py-2 px-3 font-semibold">Owner</th>
                  <th className="text-left py-2 px-3 font-semibold">Due Date</th>
                  <th className="text-left py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {actionItems.map((item) => {
                  const owner = ownerConfig[item.owner];
                  const OwnerIcon = owner.icon;
                  const category = item.category ? categoryConfig[item.category] : null;
                  const status = item.status ? statusConfig[item.status] : statusConfig.pending;

                  return (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 px-3">
                        <Checkbox disabled checked={item.status === "completed"} />
                      </td>
                      <td className="py-2 px-3">{item.description}</td>
                      <td className="py-2 px-3">
                        {category && (
                          <Badge variant="outline" className={category.class}>
                            {category.label}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className={cn("gap-1", owner.class)}>
                          <OwnerIcon className="h-3 w-3" />
                          {owner.label}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {item.dueDate || "TBD"}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={cn("flex items-center gap-1", status.class)}>
                          {item.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                          {status.label}
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

      {/* Actions by Owner Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["employee", "manager", "hr"] as const).map((ownerKey) => {
          const items = groupedByOwner[ownerKey] || [];
          const config = ownerConfig[ownerKey];
          const OwnerIcon = config.icon;

          return (
            <Card key={ownerKey} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("p-1.5 rounded", config.class)}>
                  <OwnerIcon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">{config.label} Actions</span>
                <Badge variant="secondary" className="ml-auto">
                  {items.length}
                </Badge>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {items.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="line-clamp-2">{item.description}</span>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="italic">No actions assigned</li>
                )}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* Follow-up Schedule */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Follow-up Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Next Review Date
              </p>
              <p className="font-semibold">
                {nextReviewDate || "To be scheduled"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Progress Check-in
              </p>
              <p className="font-semibold">90 days from appraisal completion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acknowledgment */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-sm text-center text-muted-foreground italic">
            {acknowledgmentText ||
              "By signing this document, both parties acknowledge the review of the above action items and commit to their timely completion. Progress will be reviewed at the next scheduled check-in."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, UserCheck } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "leave_approved",
    title: "Leave Request Approved",
    description: "Sarah Chen's vacation request was approved",
    time: "10 minutes ago",
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  {
    id: 2,
    type: "employee_onboarded",
    title: "New Employee Onboarded",
    description: "Michael Brown joined Engineering department",
    time: "1 hour ago",
    icon: UserCheck,
    iconColor: "text-primary",
  },
  {
    id: 3,
    type: "pending_approval",
    title: "Pending Expense Approval",
    description: "3 expense reports awaiting your review",
    time: "2 hours ago",
    icon: Clock,
    iconColor: "text-warning",
  },
  {
    id: 4,
    type: "safety_alert",
    title: "Safety Training Due",
    description: "15 employees need to complete safety training",
    time: "3 hours ago",
    icon: AlertCircle,
    iconColor: "text-destructive",
  },
];

export function RecentActivity() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">Recent Activity</h3>
        <button className="text-sm font-medium text-primary hover:underline">View all</button>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
            >
              <div className={cn("mt-0.5 shrink-0", activity.iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-card-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

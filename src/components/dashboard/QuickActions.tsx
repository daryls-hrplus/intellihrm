import { cn } from "@/lib/utils";
import {
  UserPlus,
  FileText,
  Calendar,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    title: "Add Employee",
    description: "Onboard a new team member",
    href: "/workforce/employees/new",
    icon: UserPlus,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Submit Leave Request",
    description: "Request time off",
    href: "/leave/request",
    icon: Calendar,
    color: "bg-info/10 text-info",
  },
  {
    title: "New Job Posting",
    description: "Create recruitment listing",
    href: "/recruitment/new",
    icon: FileText,
    color: "bg-success/10 text-success",
  },
  {
    title: "Start Appraisal",
    description: "Begin performance review",
    href: "/performance/appraisals/new",
    icon: ClipboardList,
    color: "bg-warning/10 text-warning",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "200ms" }}>
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="group flex items-center gap-4 rounded-lg border border-border p-4 transition-all hover:border-primary/30 hover:bg-accent/50"
            >
              <div className={cn("rounded-lg p-2.5", action.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{action.title}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

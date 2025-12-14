import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  FileText,
  Calendar,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function QuickActions() {
  const { t } = useTranslation();
  const { isAdmin, isHRManager } = useAuth();

  const actions = [
    {
      title: t("dashboard.quickActions.addEmployee", "Add Employee"),
      description: t("dashboard.quickActions.addEmployeeDesc", "Onboard a new team member"),
      href: "/workforce/employees",
      icon: UserPlus,
      color: "bg-primary/10 text-primary",
      requiresHR: true,
    },
    {
      title: t("dashboard.quickActions.submitLeave", "Submit Leave Request"),
      description: t("dashboard.quickActions.submitLeaveDesc", "Request time off"),
      href: "/ess/leave",
      icon: Calendar,
      color: "bg-info/10 text-info",
      requiresHR: false,
    },
    {
      title: t("dashboard.quickActions.newJobPosting", "New Job Posting"),
      description: t("dashboard.quickActions.newJobPostingDesc", "Create recruitment listing"),
      href: "/recruitment",
      icon: FileText,
      color: "bg-success/10 text-success",
      requiresHR: true,
    },
    {
      title: t("dashboard.quickActions.startAppraisal", "Start Appraisal"),
      description: t("dashboard.quickActions.startAppraisalDesc", "Begin performance review"),
      href: "/performance/appraisals",
      icon: ClipboardList,
      color: "bg-warning/10 text-warning",
      requiresHR: true,
    },
  ];

  // Filter actions based on user role
  const filteredActions = actions.filter(action => {
    if (action.requiresHR) {
      return isAdmin || isHRManager;
    }
    return true;
  });

  return (
    <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "200ms" }}>
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">
        {t("dashboard.quickActionsTitle", "Quick Actions")}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredActions.map((action) => {
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

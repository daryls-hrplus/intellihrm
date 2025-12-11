import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import {
  Heart,
  MessageSquare,
  FileText,
  AlertCircle,
  Scale,
  ChevronRight,
} from "lucide-react";

const employeeRelationsModules = [
  {
    title: "Grievances",
    description: "File and track employee grievances",
    href: "/employee-relations/grievances",
    icon: AlertCircle,
    color: "bg-destructive/10 text-destructive",
  },
  {
    title: "Disciplinary Actions",
    description: "Manage disciplinary processes",
    href: "/employee-relations/disciplinary",
    icon: Scale,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Feedback & Surveys",
    description: "Employee satisfaction surveys",
    href: "/employee-relations/surveys",
    icon: MessageSquare,
    color: "bg-success/10 text-success",
  },
  {
    title: "Policies",
    description: "Employee relations policies",
    href: "/employee-relations/policies",
    icon: FileText,
    color: "bg-info/10 text-info",
  },
  {
    title: "Wellness Programs",
    description: "Employee wellness initiatives",
    href: "/employee-relations/wellness",
    icon: Heart,
    color: "bg-primary/10 text-primary",
  },
];

export default function EmployeeRelationsDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Employee Relations
              </h1>
              <p className="text-muted-foreground">
                Workplace relations and employee support
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employeeRelationsModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.href}
                to={module.href}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-3 ${module.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </div>
                <h3 className="mt-4 font-semibold text-card-foreground">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.description}
                </p>
              </NavLink>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
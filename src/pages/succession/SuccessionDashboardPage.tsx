import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import {
  TrendingUp,
  Users,
  BarChart3,
  Target,
  FileText,
  ChevronRight,
} from "lucide-react";

const successionModules = [
  {
    title: "Talent Pool",
    description: "High-potential employee pipeline",
    href: "/succession/talent-pool",
    icon: Users,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Succession Plans",
    description: "Role succession planning",
    href: "/succession/plans",
    icon: TrendingUp,
    color: "bg-success/10 text-success",
  },
  {
    title: "Career Paths",
    description: "Define career progression tracks",
    href: "/succession/career-paths",
    icon: Target,
    color: "bg-info/10 text-info",
  },
  {
    title: "Readiness Assessment",
    description: "Evaluate successor readiness",
    href: "/succession/readiness",
    icon: BarChart3,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Succession Reports",
    description: "Analytics and insights",
    href: "/succession/reports",
    icon: FileText,
    color: "bg-destructive/10 text-destructive",
  },
];

export default function SuccessionDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Succession Planning
              </h1>
              <p className="text-muted-foreground">
                Talent pipeline and career development
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {successionModules.map((module, index) => {
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
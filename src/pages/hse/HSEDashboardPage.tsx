import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  FileText,
  ClipboardCheck,
  HardHat,
  ChevronRight,
} from "lucide-react";

const hseModules = [
  {
    title: "Incident Reports",
    description: "Report and track safety incidents",
    href: "/hse/incidents",
    icon: AlertTriangle,
    color: "bg-destructive/10 text-destructive",
  },
  {
    title: "Safety Training",
    description: "Mandatory safety courses",
    href: "/hse/training",
    icon: HardHat,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Compliance",
    description: "Regulatory compliance tracking",
    href: "/hse/compliance",
    icon: ClipboardCheck,
    color: "bg-success/10 text-success",
  },
  {
    title: "Safety Policies",
    description: "Company safety guidelines",
    href: "/hse/policies",
    icon: FileText,
    color: "bg-info/10 text-info",
  },
  {
    title: "Risk Assessment",
    description: "Workplace hazard evaluation",
    href: "/hse/risk-assessment",
    icon: Shield,
    color: "bg-primary/10 text-primary",
  },
];

export default function HSEDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Health & Safety
              </h1>
              <p className="text-muted-foreground">
                Workplace safety and compliance
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hseModules.map((module, index) => {
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
import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import {
  Gift,
  Heart,
  Shield,
  Stethoscope,
  Plane,
  ChevronRight,
  CheckCircle,
  Users,
} from "lucide-react";

const benefitsModules = [
  {
    title: "My Benefits",
    description: "View your enrolled benefits",
    href: "/benefits/my-benefits",
    icon: Gift,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Health Insurance",
    description: "Medical, dental, and vision plans",
    href: "/benefits/health",
    icon: Stethoscope,
    color: "bg-success/10 text-success",
  },
  {
    title: "Life Insurance",
    description: "Life and disability coverage",
    href: "/benefits/life-insurance",
    icon: Shield,
    color: "bg-info/10 text-info",
  },
  {
    title: "Retirement Plans",
    description: "401(k) and pension plans",
    href: "/benefits/retirement",
    icon: Heart,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Paid Time Off",
    description: "Vacation and PTO benefits",
    href: "/benefits/pto",
    icon: Plane,
    color: "bg-destructive/10 text-destructive",
  },
];

const statCards = [
  { label: "Active Plans", value: 4, icon: CheckCircle, color: "bg-success/10 text-success" },
  { label: "Enrolled Users", value: 142, icon: Users, color: "bg-primary/10 text-primary" },
  { label: "Health Plans", value: 3, icon: Stethoscope, color: "bg-info/10 text-info" },
  { label: "PTO Balance", value: "18 days", icon: Plane, color: "bg-warning/10 text-warning" },
];

export default function BenefitsDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Benefits
              </h1>
              <p className="text-muted-foreground">
                Employee benefits and perks
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefitsModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.href}
                to={module.href}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${(index + 4) * 50}ms` }}
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
import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useHSE } from "@/hooks/useHSE";
import { differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  AlertTriangle,
  FileText,
  ClipboardCheck,
  HardHat,
  ChevronRight,
  CheckCircle,
  Clock,
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
    href: "/hse/safety-training",
    icon: HardHat,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Compliance",
    description: "Regulatory compliance tracking",
    href: "/hse/compliance",
    icon: ClipboardCheck,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Safety Policies",
    description: "Company safety guidelines",
    href: "/hse/safety-policies",
    icon: FileText,
    color: "bg-sky-500/10 text-sky-600",
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
  const { incidents, trainingRecords, complianceRequirements, incidentsLoading, recordsLoading, complianceLoading } = useHSE();

  const isLoading = incidentsLoading || recordsLoading || complianceLoading;

  // Calculate days without incident
  const closedIncidents = incidents?.filter(i => i.status === 'closed') || [];
  const lastIncidentDate = closedIncidents.length > 0 
    ? closedIncidents.sort((a, b) => new Date(b.incident_date).getTime() - new Date(a.incident_date).getTime())[0]?.incident_date
    : null;
  const daysWithoutIncident = lastIncidentDate 
    ? differenceInDays(new Date(), new Date(lastIncidentDate))
    : incidents?.length === 0 ? 365 : 0;

  // Calculate open incidents
  const openIncidents = incidents?.filter(i => i.status === 'open' || i.status === 'investigating').length || 0;

  // Calculate pending training (status is not 'passed')
  const pendingTraining = trainingRecords?.filter(t => t.status !== 'passed').length || 0;

  // Calculate compliance rate
  const totalCompliance = complianceRequirements?.length || 0;
  const compliantCount = complianceRequirements?.filter(c => c.status === 'compliant').length || 0;
  const complianceRate = totalCompliance > 0 ? Math.round((compliantCount / totalCompliance) * 100) : 100;

  const statCards = [
    { label: "Days Without Incident", value: daysWithoutIncident, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Open Incidents", value: openIncidents, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
    { label: "Pending Training", value: pendingTraining, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { label: "Compliance Rate", value: `${complianceRate}%`, icon: ClipboardCheck, color: "bg-sky-500/10 text-sky-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2">
              <ModuleBIButton module="hse" />
              <ModuleReportsButton module="hse" />
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
                    {isLoading ? (
                      <Skeleton className="h-9 w-16 mt-1" />
                    ) : (
                      <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                    )}
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
          {hseModules.map((module, index) => {
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
import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useHSE } from "@/hooks/useHSE";
import { differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Shield,
  AlertTriangle,
  FileText,
  ClipboardCheck,
  HardHat,
  ChevronRight,
  CheckCircle,
  Clock,
  Briefcase,
  HardHatIcon,
  Siren,
  FlaskConical,
  FileWarning,
  KeyRound,
  Lock,
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
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const { incidents, trainingRecords, complianceRequirements, incidentsLoading, recordsLoading, complianceLoading } = useHSE(selectedCompanyId || undefined);

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

  const hseModules = [
    {
      title: t("hseModule.modules.incidents.title"),
      description: t("hseModule.modules.incidents.description"),
      href: "/hse/incidents",
      icon: AlertTriangle,
      color: "bg-destructive/10 text-destructive",
    },
    {
      title: t("hseModule.modules.safetyTraining.title"),
      description: t("hseModule.modules.safetyTraining.description"),
      href: "/hse/safety-training",
      icon: HardHat,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      title: t("hseModule.modules.compliance.title"),
      description: t("hseModule.modules.compliance.description"),
      href: "/hse/compliance",
      icon: ClipboardCheck,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: t("hseModule.modules.policies.title"),
      description: t("hseModule.modules.policies.description"),
      href: "/hse/safety-policies",
      icon: FileText,
      color: "bg-sky-500/10 text-sky-600",
    },
    {
      title: t("hseModule.modules.riskAssessment.title"),
      description: t("hseModule.modules.riskAssessment.description"),
      href: "/hse/risk-assessment",
      icon: Shield,
      color: "bg-primary/10 text-primary",
    },
    {
      title: t("hseModule.modules.workersComp.title"),
      description: t("hseModule.modules.workersComp.description"),
      href: "/hse/workers-comp",
      icon: Briefcase,
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      title: t("hseModule.modules.ppe.title"),
      description: t("hseModule.modules.ppe.description"),
      href: "/hse/ppe",
      icon: HardHatIcon,
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      title: t("hseModule.modules.inspections.title"),
      description: t("hseModule.modules.inspections.description"),
      href: "/hse/inspections",
      icon: ClipboardCheck,
      color: "bg-teal-500/10 text-teal-600",
    },
    {
      title: t("hseModule.modules.emergencyResponse.title"),
      description: t("hseModule.modules.emergencyResponse.description"),
      href: "/hse/emergency-response",
      icon: Siren,
      color: "bg-rose-500/10 text-rose-600",
    },
    {
      title: t("hseModule.modules.chemicals.title"),
      description: t("hseModule.modules.chemicals.description"),
      href: "/hse/chemicals",
      icon: FlaskConical,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: t("hseModule.modules.oshaReporting.title"),
      description: t("hseModule.modules.oshaReporting.description"),
      href: "/hse/osha-reporting",
      icon: FileWarning,
      color: "bg-indigo-500/10 text-indigo-600",
    },
    {
      title: t("hseModule.modules.permitToWork.title"),
      description: t("hseModule.modules.permitToWork.description"),
      href: "/hse/permit-to-work",
      icon: KeyRound,
      color: "bg-cyan-500/10 text-cyan-600",
    },
    {
      title: t("hseModule.modules.loto.title"),
      description: t("hseModule.modules.loto.description"),
      href: "/hse/loto",
      icon: Lock,
      color: "bg-slate-500/10 text-slate-600",
    },
  ];

  const statCards = [
    { label: t("hseModule.stats.daysWithoutIncident"), value: daysWithoutIncident, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
    { label: t("hseModule.stats.openIncidents"), value: openIncidents, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
    { label: t("hseModule.stats.pendingTraining"), value: pendingTraining, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { label: t("hseModule.stats.complianceRate"), value: `${complianceRate}%`, icon: ClipboardCheck, color: "bg-sky-500/10 text-sky-600" },
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
                  {t("hseModule.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("hseModule.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter 
                selectedCompanyId={selectedCompanyId} 
                onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} 
              />
              <DepartmentFilter
                companyId={selectedCompanyId}
                selectedDepartmentId={selectedDepartmentId}
                onDepartmentChange={setSelectedDepartmentId}
              />
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
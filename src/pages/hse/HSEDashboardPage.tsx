import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useHSE } from "@/hooks/useHSE";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
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
  CheckCircle,
  Clock,
  Briefcase,
  HardHatIcon,
  Siren,
  FlaskConical,
  FileWarning,
  KeyRound,
  Lock,
  Eye,
  MessageSquare,
  HeartPulse,
  Monitor,
  TriangleAlert,
  BarChart3,
} from "lucide-react";
import { DraggableModuleCards, ModuleCardItem } from "@/components/ui/DraggableModuleCards";

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
  const { hasTabAccess } = useGranularPermissions();
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
      tabCode: "incidents",
    },
    {
      title: t("hseModule.modules.safetyTraining.title"),
      description: t("hseModule.modules.safetyTraining.description"),
      href: "/hse/safety-training",
      icon: HardHat,
      color: "bg-amber-500/10 text-amber-600",
      tabCode: "safety-training",
    },
    {
      title: t("hseModule.modules.compliance.title"),
      description: t("hseModule.modules.compliance.description"),
      href: "/hse/compliance",
      icon: ClipboardCheck,
      color: "bg-emerald-500/10 text-emerald-600",
      tabCode: "compliance",
    },
    {
      title: t("hseModule.modules.policies.title"),
      description: t("hseModule.modules.policies.description"),
      href: "/hse/safety-policies",
      icon: FileText,
      color: "bg-sky-500/10 text-sky-600",
      tabCode: "safety-policies",
    },
    {
      title: t("hseModule.modules.riskAssessment.title"),
      description: t("hseModule.modules.riskAssessment.description"),
      href: "/hse/risk-assessment",
      icon: Shield,
      color: "bg-primary/10 text-primary",
      tabCode: "risk-assessment",
    },
    {
      title: t("hseModule.modules.workersComp.title"),
      description: t("hseModule.modules.workersComp.description"),
      href: "/hse/workers-comp",
      icon: Briefcase,
      color: "bg-violet-500/10 text-violet-600",
      tabCode: "workers-comp",
    },
    {
      title: t("hseModule.modules.ppe.title"),
      description: t("hseModule.modules.ppe.description"),
      href: "/hse/ppe",
      icon: HardHatIcon,
      color: "bg-orange-500/10 text-orange-600",
      tabCode: "ppe",
    },
    {
      title: t("hseModule.modules.inspections.title"),
      description: t("hseModule.modules.inspections.description"),
      href: "/hse/inspections",
      icon: ClipboardCheck,
      color: "bg-teal-500/10 text-teal-600",
      tabCode: "inspections",
    },
    {
      title: t("hseModule.modules.emergencyResponse.title"),
      description: t("hseModule.modules.emergencyResponse.description"),
      href: "/hse/emergency-response",
      icon: Siren,
      color: "bg-rose-500/10 text-rose-600",
      tabCode: "emergency-response",
    },
    {
      title: t("hseModule.modules.chemicals.title"),
      description: t("hseModule.modules.chemicals.description"),
      href: "/hse/chemicals",
      icon: FlaskConical,
      color: "bg-purple-500/10 text-purple-600",
      tabCode: "chemicals",
    },
    {
      title: t("hseModule.modules.oshaReporting.title"),
      description: t("hseModule.modules.oshaReporting.description"),
      href: "/hse/osha-reporting",
      icon: FileWarning,
      color: "bg-indigo-500/10 text-indigo-600",
      tabCode: "osha-reporting",
    },
    {
      title: t("hseModule.modules.permitToWork.title"),
      description: t("hseModule.modules.permitToWork.description"),
      href: "/hse/permit-to-work",
      icon: KeyRound,
      color: "bg-cyan-500/10 text-cyan-600",
      tabCode: "permit-to-work",
    },
    {
      title: t("hseModule.modules.loto.title"),
      description: t("hseModule.modules.loto.description"),
      href: "/hse/loto",
      icon: Lock,
      color: "bg-slate-500/10 text-slate-600",
      tabCode: "loto",
    },
    {
      title: t("hseModule.modules.nearMiss.title"),
      description: t("hseModule.modules.nearMiss.description"),
      href: "/hse/near-miss",
      icon: TriangleAlert,
      color: "bg-yellow-500/10 text-yellow-600",
      tabCode: "near-miss",
    },
    {
      title: t("hseModule.modules.safetyObservations.title"),
      description: t("hseModule.modules.safetyObservations.description"),
      href: "/hse/safety-observations",
      icon: Eye,
      color: "bg-blue-500/10 text-blue-600",
      tabCode: "safety-observations",
    },
    {
      title: t("hseModule.modules.toolboxTalks.title"),
      description: t("hseModule.modules.toolboxTalks.description"),
      href: "/hse/toolbox-talks",
      icon: MessageSquare,
      color: "bg-green-500/10 text-green-600",
      tabCode: "toolbox-talks",
    },
    {
      title: t("hseModule.modules.firstAid.title"),
      description: t("hseModule.modules.firstAid.description"),
      href: "/hse/first-aid",
      icon: HeartPulse,
      color: "bg-red-500/10 text-red-600",
      tabCode: "first-aid",
    },
    {
      title: t("hseModule.modules.ergonomics.title"),
      description: t("hseModule.modules.ergonomics.description"),
      href: "/hse/ergonomics",
      icon: Monitor,
      color: "bg-pink-500/10 text-pink-600",
      tabCode: "ergonomics",
    },
    {
      title: t("hseModule.modules.analytics.title"),
      description: t("hseModule.modules.analytics.description"),
      href: "/hse/analytics",
      icon: BarChart3,
      color: "bg-fuchsia-500/10 text-fuchsia-600",
      tabCode: "analytics",
    },
  ].filter(module => hasTabAccess("hse", module.tabCode));

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

        <DraggableModuleCards 
          modules={hseModules} 
          preferenceKey="hse_dashboard_order" 
        />
      </div>
    </AppLayout>
  );
}
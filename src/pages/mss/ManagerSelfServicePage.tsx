import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { DraggableModuleCards, ModuleCardItem } from "@/components/ui/DraggableModuleCards";
import {
  Users,
  Calendar,
  ClipboardCheck,
  BarChart3,
  UserPlus,
  Clock,
  Target,
  FileCheck,
  TrendingUp,
  TicketPlus,
  CheckSquare,
  UserCheck,
  Rocket,
  UserMinus,
  Package,
  Heart,
  Shield,
  HardHat,
  MessageCircle,
  Award,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

export default function ManagerSelfServicePage() {
  const { t } = useLanguage();

  const mssModules: ModuleCardItem[] = [
    {
      title: t("mss.dashboard.myTeam"),
      description: t("mss.dashboard.myTeamDesc"),
      href: "/mss/team",
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
      tabCode: "mss-team",
    },
    {
      title: t("mss.dashboard.teamApprovals"),
      description: t("mss.dashboard.teamApprovalsDesc"),
      href: "/workflow/approvals",
      icon: CheckSquare,
      color: "bg-violet-500/10 text-violet-600",
      tabCode: "mss-approvals",
    },
    {
      title: t("mss.modules.delegates.title"),
      description: t("mss.modules.delegates.description"),
      href: "/workflow/delegates",
      icon: UserCheck,
      color: "bg-fuchsia-500/10 text-fuchsia-600",
      tabCode: "mss-delegates",
    },
    {
      title: t("mss.dashboard.teamOnboarding"),
      description: t("mss.dashboard.teamOnboardingDesc"),
      href: "/mss/onboarding",
      icon: Rocket,
      color: "bg-teal-500/10 text-teal-600",
      tabCode: "mss-onboarding",
    },
    {
      title: t("mss.dashboard.teamDepartures"),
      description: t("mss.dashboard.teamDeparturesDesc"),
      href: "/mss/offboarding",
      icon: UserMinus,
      color: "bg-red-500/10 text-red-600",
      tabCode: "mss-offboarding",
    },
    {
      title: t("mss.modules.property.title"),
      description: t("mss.modules.property.description"),
      href: "/mss/property",
      icon: Package,
      color: "bg-slate-500/10 text-slate-600",
      tabCode: "mss-property",
    },
    {
      title: t("mss.modules.relations.title"),
      description: t("mss.modules.relations.description"),
      href: "/mss/relations",
      icon: Heart,
      color: "bg-rose-500/10 text-rose-600",
      tabCode: "mss-relations",
    },
    {
      title: t("mss.modules.benefits.title"),
      description: t("mss.modules.benefits.description"),
      href: "/mss/benefits",
      icon: Shield,
      color: "bg-emerald-500/10 text-emerald-600",
      tabCode: "mss-benefits",
    },
    {
      title: t("mss.dashboard.teamLeaveCalendar"),
      description: t("mss.dashboard.teamLeaveCalendarDesc"),
      href: "/mss/leave-approvals",
      icon: Calendar,
      color: "bg-green-500/10 text-green-600",
      tabCode: "mss-leave",
    },
    {
      title: t("mss.modules.timeAttendance.title"),
      description: t("mss.modules.timeAttendance.description"),
      href: "/mss/time-attendance",
      icon: Clock,
      color: "bg-orange-500/10 text-orange-600",
      tabCode: "mss-time-attendance",
    },
    {
      title: t("mss.modules.appraisals.title"),
      description: t("mss.modules.appraisals.description"),
      href: "/mss/appraisals",
      icon: ClipboardCheck,
      color: "bg-purple-500/10 text-purple-600",
      tabCode: "mss-appraisals",
    },
    {
      title: t("mss.modules.goals.title"),
      description: t("mss.modules.goals.description"),
      href: "/mss/goals",
      icon: Target,
      color: "bg-pink-500/10 text-pink-600",
      tabCode: "mss-goals",
    },
    {
      title: t("mss.modules.360.title"),
      description: t("mss.modules.360.description"),
      href: "/mss/360",
      icon: Users,
      color: "bg-rose-500/10 text-rose-600",
      tabCode: "mss-360",
    },
    {
      title: t("mss.modules.analytics.title"),
      description: t("mss.modules.analytics.description"),
      href: "/mss/analytics",
      icon: BarChart3,
      color: "bg-indigo-500/10 text-indigo-600",
      tabCode: "mss-analytics",
    },
    {
      title: t("mss.modules.recruitment.title"),
      description: t("mss.modules.recruitment.description"),
      href: "/mss/recruitment",
      icon: UserPlus,
      color: "bg-emerald-500/10 text-emerald-600",
      tabCode: "mss-recruitment",
    },
    {
      title: t("mss.modules.training.title"),
      description: t("mss.modules.training.description"),
      href: "/mss/training",
      icon: FileCheck,
      color: "bg-amber-500/10 text-amber-600",
      tabCode: "mss-training",
    },
    {
      title: t("mss.modules.succession.title"),
      description: t("mss.modules.succession.description"),
      href: "/mss/succession",
      icon: TrendingUp,
      color: "bg-cyan-500/10 text-cyan-600",
      tabCode: "mss-succession",
    },
    {
      title: t("mss.modules.hse.title"),
      description: t("mss.modules.hse.description"),
      href: "/mss/hse",
      icon: HardHat,
      color: "bg-yellow-500/10 text-yellow-600",
      tabCode: "mss-hse",
    },
    {
      title: t("mss.modules.feedback.title"),
      description: t("mss.modules.feedback.description"),
      href: "/mss/feedback",
      icon: MessageCircle,
      color: "bg-violet-500/10 text-violet-600",
      tabCode: "mss-feedback",
    },
    {
      title: t("mss.modules.recognition.title"),
      description: t("mss.modules.recognition.description"),
      href: "/mss/recognition",
      icon: Award,
      color: "bg-amber-500/10 text-amber-600",
      tabCode: "mss-recognition",
    },
    {
      title: t("mss.modules.reminders.title"),
      description: t("mss.modules.reminders.description"),
      href: "/mss/reminders",
      icon: Clock,
      color: "bg-rose-500/10 text-rose-600",
      tabCode: "mss-reminders",
    },
    {
      title: t("mss.modules.pips.title"),
      description: t("mss.modules.pips.description"),
      href: "/mss/pips",
      icon: AlertTriangle,
      color: "bg-orange-500/10 text-orange-600",
      tabCode: "mss-pips",
    },
    {
      title: t("mss.modules.compensation.title"),
      description: t("mss.modules.compensation.description"),
      href: "/mss/compensation",
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-600",
      tabCode: "mss-compensation",
    },
    {
      title: t("mss.dashboard.submitTicket"),
      description: t("mss.dashboard.submitTicketDesc"),
      href: "/help/tickets/new",
      icon: TicketPlus,
      color: "bg-red-500/10 text-red-600",
      tabCode: "mss-tickets",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("mss.title") },
          ]}
        />
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("mss.title")}</h1>
          <p className="text-muted-foreground">
            {t("mss.subtitle")}
          </p>
        </div>

        <DraggableModuleCards 
          modules={mssModules} 
          preferenceKey="mss-dashboard-order" 
        />
      </div>
    </AppLayout>
  );
}

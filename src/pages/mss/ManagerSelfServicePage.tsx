import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/hooks/useLanguage";
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

const mssModules = [
  {
    titleKey: "mss.dashboard.myTeam",
    descriptionKey: "mss.dashboard.myTeamDesc",
    href: "/mss/team",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    titleKey: "mss.dashboard.teamApprovals",
    descriptionKey: "mss.dashboard.teamApprovalsDesc",
    href: "/workflow/approvals",
    icon: CheckSquare,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    titleKey: "mss.modules.delegates.title",
    descriptionKey: "mss.modules.delegates.description",
    href: "/workflow/delegates",
    icon: UserCheck,
    color: "bg-fuchsia-500/10 text-fuchsia-600",
  },
  {
    titleKey: "mss.dashboard.teamOnboarding",
    descriptionKey: "mss.dashboard.teamOnboardingDesc",
    href: "/mss/onboarding",
    icon: Rocket,
    color: "bg-teal-500/10 text-teal-600",
  },
  {
    titleKey: "mss.dashboard.teamDepartures",
    descriptionKey: "mss.dashboard.teamDeparturesDesc",
    href: "/mss/offboarding",
    icon: UserMinus,
    color: "bg-red-500/10 text-red-600",
  },
  {
    titleKey: "mss.modules.property.title",
    descriptionKey: "mss.modules.property.description",
    href: "/mss/property",
    icon: Package,
    color: "bg-slate-500/10 text-slate-600",
  },
  {
    titleKey: "mss.modules.relations.title",
    descriptionKey: "mss.modules.relations.description",
    href: "/mss/relations",
    icon: Heart,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    titleKey: "mss.modules.benefits.title",
    descriptionKey: "mss.modules.benefits.description",
    href: "/mss/benefits",
    icon: Shield,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    titleKey: "mss.dashboard.teamLeaveCalendar",
    descriptionKey: "mss.dashboard.teamLeaveCalendarDesc",
    href: "/mss/leave-approvals",
    icon: Calendar,
    color: "bg-green-500/10 text-green-600",
  },
  {
    titleKey: "mss.modules.timeAttendance.title",
    descriptionKey: "mss.modules.timeAttendance.description",
    href: "/mss/time-attendance",
    icon: Clock,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    titleKey: "mss.modules.appraisals.title",
    descriptionKey: "mss.modules.appraisals.description",
    href: "/mss/appraisals",
    icon: ClipboardCheck,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    titleKey: "mss.modules.goals.title",
    descriptionKey: "mss.modules.goals.description",
    href: "/mss/goals",
    icon: Target,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    titleKey: "mss.modules.360.title",
    descriptionKey: "mss.modules.360.description",
    href: "/mss/360",
    icon: Users,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    titleKey: "mss.modules.analytics.title",
    descriptionKey: "mss.modules.analytics.description",
    href: "/mss/analytics",
    icon: BarChart3,
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    titleKey: "mss.modules.recruitment.title",
    descriptionKey: "mss.modules.recruitment.description",
    href: "/mss/recruitment",
    icon: UserPlus,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    titleKey: "mss.modules.training.title",
    descriptionKey: "mss.modules.training.description",
    href: "/mss/training",
    icon: FileCheck,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    titleKey: "mss.modules.succession.title",
    descriptionKey: "mss.modules.succession.description",
    href: "/mss/succession",
    icon: TrendingUp,
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    titleKey: "mss.modules.hse.title",
    descriptionKey: "mss.modules.hse.description",
    href: "/mss/hse",
    icon: HardHat,
    color: "bg-yellow-500/10 text-yellow-600",
  },
  {
    titleKey: "mss.modules.feedback.title",
    descriptionKey: "mss.modules.feedback.description",
    href: "/mss/feedback",
    icon: MessageCircle,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    titleKey: "mss.modules.recognition.title",
    descriptionKey: "mss.modules.recognition.description",
    href: "/mss/recognition",
    icon: Award,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    titleKey: "mss.modules.reminders.title",
    descriptionKey: "mss.modules.reminders.description",
    href: "/mss/reminders",
    icon: Clock,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    titleKey: "mss.modules.pips.title",
    descriptionKey: "mss.modules.pips.description",
    href: "/mss/pips",
    icon: AlertTriangle,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    titleKey: "mss.modules.compensation.title",
    descriptionKey: "mss.modules.compensation.description",
    href: "/mss/compensation",
    icon: DollarSign,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    titleKey: "mss.dashboard.submitTicket",
    descriptionKey: "mss.dashboard.submitTicketDesc",
    href: "/help/tickets/new",
    icon: TicketPlus,
    color: "bg-red-500/10 text-red-600",
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mssModules.map((module) => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.href}
                to={module.href}
                className="group rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex rounded-lg p-3 ${module.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold group-hover:text-primary">{t(module.titleKey)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(module.descriptionKey)}</p>
              </NavLink>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

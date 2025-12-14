import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { NavLink } from "@/components/NavLink";
import {
  User,
  Calendar,
  FileText,
  Clock,
  CreditCard,
  GraduationCap,
  Target,
  Bell,
  TicketPlus,
  FileSignature,
  CheckSquare,
  UserCheck,
  Rocket,
  UserMinus,
  Package,
  Heart,
  Shield,
  HardHat,
  Briefcase,
  MessageCircle,
  Award,
  DollarSign,
} from "lucide-react";

export default function EmployeeSelfServicePage() {
  const { t } = useTranslation();

  const essModules = [
    {
      title: t("ess.modules.profile.title"),
      description: t("ess.modules.profile.description"),
      href: "/profile",
      icon: User,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: t("ess.modules.approvals.title"),
      description: t("ess.modules.approvals.description"),
      href: "/workflow/approvals",
      icon: CheckSquare,
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      title: t("ess.modules.delegates.title"),
      description: t("ess.modules.delegates.description"),
      href: "/workflow/delegates",
      icon: UserCheck,
      color: "bg-fuchsia-500/10 text-fuchsia-600",
    },
    {
      title: t("ess.modules.leave.title"),
      description: t("ess.modules.leave.description"),
      href: "/ess/leave",
      icon: Calendar,
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: t("ess.modules.documents.title"),
      description: t("ess.modules.documents.description"),
      href: "/ess/documents",
      icon: FileText,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: t("ess.modules.timeAttendance.title"),
      description: t("ess.modules.timeAttendance.description"),
      href: "/ess/time-attendance",
      icon: Clock,
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      title: t("ess.modules.payslips.title"),
      description: t("ess.modules.payslips.description"),
      href: "/ess/payslips",
      icon: CreditCard,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: t("ess.modules.training.title"),
      description: t("ess.modules.training.description"),
      href: "/ess/training",
      icon: GraduationCap,
      color: "bg-indigo-500/10 text-indigo-600",
    },
    {
      title: t("ess.modules.goals.title"),
      description: t("ess.modules.goals.description"),
      href: "/ess/goals",
      icon: Target,
      color: "bg-pink-500/10 text-pink-600",
    },
    {
      title: t("ess.modules.tickets.title"),
      description: t("ess.modules.tickets.description"),
      href: "/help/tickets/new",
      icon: TicketPlus,
      color: "bg-red-500/10 text-red-600",
    },
    {
      title: t("ess.modules.letters.title"),
      description: t("ess.modules.letters.description"),
      href: "/ess/letters",
      icon: FileSignature,
      color: "bg-cyan-500/10 text-cyan-600",
    },
    {
      title: t("ess.modules.onboarding.title"),
      description: t("ess.modules.onboarding.description"),
      href: "/ess/onboarding",
      icon: Rocket,
      color: "bg-teal-500/10 text-teal-600",
    },
    {
      title: t("ess.modules.offboarding.title"),
      description: t("ess.modules.offboarding.description"),
      href: "/ess/offboarding",
      icon: UserMinus,
      color: "bg-red-500/10 text-red-600",
    },
    {
      title: t("ess.modules.property.title"),
      description: t("ess.modules.property.description"),
      href: "/ess/property",
      icon: Package,
      color: "bg-slate-500/10 text-slate-600",
    },
    {
      title: t("ess.modules.relations.title"),
      description: t("ess.modules.relations.description"),
      href: "/ess/relations",
      icon: Heart,
      color: "bg-rose-500/10 text-rose-600",
    },
    {
      title: t("ess.modules.benefits.title"),
      description: t("ess.modules.benefits.description"),
      href: "/ess/benefits",
      icon: Shield,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: t("ess.modules.hse.title"),
      description: t("ess.modules.hse.description"),
      href: "/ess/hse",
      icon: HardHat,
      color: "bg-yellow-500/10 text-yellow-600",
    },
    {
      title: t("ess.modules.jobs.title"),
      description: t("ess.modules.jobs.description"),
      href: "/ess/jobs",
      icon: Briefcase,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: t("ess.modules.compensation.title"),
      description: t("ess.modules.compensation.description"),
      href: "/ess/compensation",
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: t("ess.modules.feedback.title"),
      description: t("ess.modules.feedback.description"),
      href: "/ess/feedback",
      icon: MessageCircle,
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      title: t("ess.modules.recognition.title"),
      description: t("ess.modules.recognition.description"),
      href: "/ess/recognition",
      icon: Award,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      title: t("ess.modules.reminders.title"),
      description: t("ess.modules.reminders.description"),
      href: "/ess/reminders",
      icon: Bell,
      color: "bg-rose-500/10 text-rose-600",
    },
    {
      title: t("ess.modules.notifications.title"),
      description: t("ess.modules.notifications.description"),
      href: "/profile/notifications",
      icon: Bell,
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title") },
          ]}
        />
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("ess.title")}</h1>
          <p className="text-muted-foreground">
            {t("ess.subtitle")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {essModules.map((module) => {
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
                <h3 className="font-semibold group-hover:text-primary">{module.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
              </NavLink>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

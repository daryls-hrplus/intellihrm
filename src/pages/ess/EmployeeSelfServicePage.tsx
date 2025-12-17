import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { GroupedModuleCards, ModuleSection, GroupedModuleItem } from "@/components/ui/GroupedModuleCards";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
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
  Receipt,
} from "lucide-react";

export default function EmployeeSelfServicePage() {
  const { t } = useTranslation();
  const { hasTabAccess } = useGranularPermissions();

  const allModules = {
    profile: { title: t("ess.modules.profile.title"), description: t("ess.modules.profile.description"), href: "/profile", icon: User, color: "bg-blue-500/10 text-blue-600", tabCode: "ess-profile" },
    approvals: { title: t("ess.modules.approvals.title"), description: t("ess.modules.approvals.description"), href: "/workflow/approvals", icon: CheckSquare, color: "bg-violet-500/10 text-violet-600", tabCode: "ess-approvals" },
    delegates: { title: t("ess.modules.delegates.title"), description: t("ess.modules.delegates.description"), href: "/workflow/delegates", icon: UserCheck, color: "bg-fuchsia-500/10 text-fuchsia-600", tabCode: "ess-delegates" },
    leave: { title: t("ess.modules.leave.title"), description: t("ess.modules.leave.description"), href: "/ess/leave", icon: Calendar, color: "bg-green-500/10 text-green-600", tabCode: "ess-leave" },
    documents: { title: t("ess.modules.documents.title"), description: t("ess.modules.documents.description"), href: "/ess/documents", icon: FileText, color: "bg-purple-500/10 text-purple-600", tabCode: "ess-documents" },
    timeAttendance: { title: t("ess.modules.timeAttendance.title"), description: t("ess.modules.timeAttendance.description"), href: "/ess/time-attendance", icon: Clock, color: "bg-orange-500/10 text-orange-600", tabCode: "ess-time-attendance" },
    payslips: { title: t("ess.modules.payslips.title"), description: t("ess.modules.payslips.description"), href: "/ess/payslips", icon: CreditCard, color: "bg-emerald-500/10 text-emerald-600", tabCode: "ess-payslips" },
    expenses: { title: t("ess.modules.expenses.title", "Expense Claims"), description: t("ess.modules.expenses.description", "Submit and track expense reimbursements"), href: "/ess/expenses", icon: Receipt, color: "bg-orange-500/10 text-orange-600", tabCode: "ess-expenses" },
    training: { title: t("ess.modules.training.title"), description: t("ess.modules.training.description"), href: "/ess/training", icon: GraduationCap, color: "bg-indigo-500/10 text-indigo-600", tabCode: "ess-training" },
    goals: { title: t("ess.modules.goals.title"), description: t("ess.modules.goals.description"), href: "/ess/goals", icon: Target, color: "bg-pink-500/10 text-pink-600", tabCode: "ess-goals" },
    tickets: { title: t("ess.modules.tickets.title"), description: t("ess.modules.tickets.description"), href: "/help/tickets/new", icon: TicketPlus, color: "bg-red-500/10 text-red-600", tabCode: "ess-tickets" },
    letters: { title: t("ess.modules.letters.title"), description: t("ess.modules.letters.description"), href: "/ess/letters", icon: FileSignature, color: "bg-cyan-500/10 text-cyan-600", tabCode: "ess-letters" },
    onboarding: { title: t("ess.modules.onboarding.title"), description: t("ess.modules.onboarding.description"), href: "/ess/onboarding", icon: Rocket, color: "bg-teal-500/10 text-teal-600", tabCode: "ess-onboarding" },
    offboarding: { title: t("ess.modules.offboarding.title"), description: t("ess.modules.offboarding.description"), href: "/ess/offboarding", icon: UserMinus, color: "bg-red-500/10 text-red-600", tabCode: "ess-offboarding" },
    property: { title: t("ess.modules.property.title"), description: t("ess.modules.property.description"), href: "/ess/property", icon: Package, color: "bg-slate-500/10 text-slate-600", tabCode: "ess-property" },
    relations: { title: t("ess.modules.relations.title"), description: t("ess.modules.relations.description"), href: "/ess/relations", icon: Heart, color: "bg-rose-500/10 text-rose-600", tabCode: "ess-relations" },
    benefits: { title: t("ess.modules.benefits.title"), description: t("ess.modules.benefits.description"), href: "/ess/benefits", icon: Shield, color: "bg-emerald-500/10 text-emerald-600", tabCode: "ess-benefits" },
    hse: { title: t("ess.modules.hse.title"), description: t("ess.modules.hse.description"), href: "/ess/hse", icon: HardHat, color: "bg-yellow-500/10 text-yellow-600", tabCode: "ess-hse" },
    jobs: { title: t("ess.modules.jobs.title"), description: t("ess.modules.jobs.description"), href: "/ess/jobs", icon: Briefcase, color: "bg-blue-500/10 text-blue-600", tabCode: "ess-jobs" },
    compensation: { title: t("ess.modules.compensation.title"), description: t("ess.modules.compensation.description"), href: "/ess/compensation", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-600", tabCode: "ess-compensation" },
    feedback: { title: t("ess.modules.feedback.title"), description: t("ess.modules.feedback.description"), href: "/ess/feedback", icon: MessageCircle, color: "bg-violet-500/10 text-violet-600", tabCode: "ess-feedback" },
    recognition: { title: t("ess.modules.recognition.title"), description: t("ess.modules.recognition.description"), href: "/ess/recognition", icon: Award, color: "bg-amber-500/10 text-amber-600", tabCode: "ess-recognition" },
    reminders: { title: t("ess.modules.reminders.title"), description: t("ess.modules.reminders.description"), href: "/ess/reminders", icon: Bell, color: "bg-rose-500/10 text-rose-600", tabCode: "ess-reminders" },
    notifications: { title: t("ess.modules.notifications.title"), description: t("ess.modules.notifications.description"), href: "/profile/notifications", icon: Bell, color: "bg-amber-500/10 text-amber-600", tabCode: "ess-notifications" },
  };

  const filterByAccess = (modules: GroupedModuleItem[]) =>
    modules.filter(m => !m.tabCode || hasTabAccess("ess", m.tabCode));

  const sections: ModuleSection[] = [
    {
      titleKey: "ess.groups.personal",
      items: filterByAccess([allModules.profile, allModules.documents, allModules.letters, allModules.jobs]),
    },
    {
      titleKey: "ess.groups.timeLeave",
      items: filterByAccess([allModules.leave, allModules.timeAttendance]),
    },
    {
      titleKey: "ess.groups.payBenefits",
      items: filterByAccess([allModules.payslips, allModules.compensation, allModules.benefits, allModules.expenses]),
    },
    {
      titleKey: "ess.groups.careerDevelopment",
      items: filterByAccess([allModules.training, allModules.goals, allModules.feedback, allModules.recognition, allModules.onboarding, allModules.offboarding]),
    },
    {
      titleKey: "ess.groups.workplaceResources",
      items: filterByAccess([allModules.property, allModules.relations, allModules.hse]),
    },
    {
      titleKey: "ess.groups.support",
      items: filterByAccess([allModules.approvals, allModules.delegates, allModules.tickets, allModules.reminders, allModules.notifications]),
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

        <GroupedModuleCards sections={sections} />
      </div>
    </AppLayout>
  );
}

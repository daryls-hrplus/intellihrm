import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePageAudit } from "@/hooks/usePageAudit";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { GroupedModuleCards, ModuleSection, GroupedModuleItem } from "@/components/ui/GroupedModuleCards";
import { EmployeeRODWidget } from "@/components/ess/EmployeeRODWidget";
import { EssPendingAppraisalActions } from "@/components/ess/EssPendingAppraisalActions";
import { ESSAIDashboard } from "@/components/ess/ESSAIDashboard";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useEssPendingActions } from "@/hooks/useEssPendingActions";
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
  Building2,
  ArrowRightLeft,
  MapPin,
  Users,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  IdCard,
  Plane,
  Stethoscope,
  FolderOpen,
  Compass,
  Route,
  Lightbulb,
} from "lucide-react";

export default function EmployeeSelfServicePage() {
  usePageAudit('ess_dashboard', 'ESS');
  const { t } = useTranslation();
  const { hasTabAccess } = useGranularPermissions();
  const { data: sectionBadges = {} } = useEssPendingActions();

  const allModules = {
    profile: { title: t("ess.modules.profile.title"), description: t("ess.modules.profile.description"), href: "/profile", icon: User, color: "bg-blue-500/10 text-blue-600", tabCode: "ess-profile" },
    personalInfo: { title: t("ess.modules.personalInfo.title", "Personal Information"), description: t("ess.modules.personalInfo.description", "Update addresses and emergency contacts"), href: "/ess/personal-info", icon: MapPin, color: "bg-teal-500/10 text-teal-600", tabCode: "ess-personal-info" },
    dependents: { title: t("ess.modules.dependents.title", "Dependents"), description: t("ess.modules.dependents.description", "Manage your dependents and beneficiaries"), href: "/ess/dependents", icon: Users, color: "bg-pink-500/10 text-pink-600", tabCode: "ess-dependents" },
    approvals: { title: t("ess.modules.approvals.title"), description: t("ess.modules.approvals.description"), href: "/workflow/approvals", icon: CheckSquare, color: "bg-violet-500/10 text-violet-600", tabCode: "ess-approvals" },
    delegates: { title: t("ess.modules.delegates.title"), description: t("ess.modules.delegates.description"), href: "/workflow/delegates", icon: UserCheck, color: "bg-fuchsia-500/10 text-fuchsia-600", tabCode: "ess-delegates" },
    leave: { title: t("ess.modules.leave.title"), description: t("ess.modules.leave.description"), href: "/ess/leave", icon: Calendar, color: "bg-green-500/10 text-green-600", tabCode: "ess-leave" },
    myCalendar: { title: t("ess.modules.myCalendar.title", "My Calendar"), description: t("ess.modules.myCalendar.description", "View your leave and key dates"), href: "/ess/my-calendar", icon: Calendar, color: "bg-sky-500/10 text-sky-600", tabCode: "ess-my-calendar" },
    documents: { title: t("ess.modules.documents.title"), description: t("ess.modules.documents.description"), href: "/ess/documents", icon: FileText, color: "bg-purple-500/10 text-purple-600", tabCode: "ess-documents" },
    timeAttendance: { title: t("ess.modules.timeAttendance.title"), description: t("ess.modules.timeAttendance.description"), href: "/ess/time-attendance", icon: Clock, color: "bg-orange-500/10 text-orange-600", tabCode: "ess-time-attendance" },
    payslips: { title: t("ess.modules.payslips.title"), description: t("ess.modules.payslips.description"), href: "/ess/payslips", icon: CreditCard, color: "bg-emerald-500/10 text-emerald-600", tabCode: "ess-payslips" },
    expenses: { title: t("ess.modules.expenses.title", "Expense Claims"), description: t("ess.modules.expenses.description", "Submit and track expense reimbursements"), href: "/ess/expenses", icon: Receipt, color: "bg-orange-500/10 text-orange-600", tabCode: "ess-expenses" },
    training: { title: t("ess.modules.training.title"), description: t("ess.modules.training.description"), href: "/ess/training", icon: GraduationCap, color: "bg-indigo-500/10 text-indigo-600", tabCode: "ess-training" },
    goals: { title: t("ess.modules.goals.title"), description: t("ess.modules.goals.description"), href: "/ess/goals", icon: Target, color: "bg-pink-500/10 text-pink-600", tabCode: "ess-goals" },
    tickets: { title: t("ess.modules.tickets.title"), description: t("ess.modules.tickets.description"), href: "/help/tickets/new?from=ess", icon: TicketPlus, color: "bg-red-500/10 text-red-600", tabCode: "ess-tickets" },
    letters: { title: t("ess.modules.letters.title"), description: t("ess.modules.letters.description"), href: "/ess/letters", icon: FileSignature, color: "bg-cyan-500/10 text-cyan-600", tabCode: "ess-letters" },
    onboarding: { title: t("ess.modules.onboarding.title"), description: t("ess.modules.onboarding.description"), href: "/ess/onboarding", icon: Rocket, color: "bg-teal-500/10 text-teal-600", tabCode: "ess-onboarding" },
    offboarding: { title: t("ess.modules.offboarding.title"), description: t("ess.modules.offboarding.description"), href: "/ess/offboarding", icon: UserMinus, color: "bg-red-500/10 text-red-600", tabCode: "ess-offboarding" },
    property: { title: t("ess.modules.property.title"), description: t("ess.modules.property.description"), href: "/ess/property", icon: Package, color: "bg-slate-500/10 text-slate-600", tabCode: "ess-property" },
    relations: { title: t("ess.modules.relations.title"), description: t("ess.modules.relations.description"), href: "/ess/relations", icon: Heart, color: "bg-rose-500/10 text-rose-600", tabCode: "ess-relations" },
    benefits: { title: t("ess.modules.benefits.title"), description: t("ess.modules.benefits.description"), href: "/ess/benefits", icon: Shield, color: "bg-emerald-500/10 text-emerald-600", tabCode: "ess-benefits" },
    hse: { title: t("ess.modules.hse.title"), description: t("ess.modules.hse.description"), href: "/ess/hse", icon: HardHat, color: "bg-yellow-500/10 text-yellow-600", tabCode: "ess-hse" },
    jobs: { title: t("ess.modules.jobs.title"), description: t("ess.modules.jobs.description"), href: "/ess/jobs", icon: Briefcase, color: "bg-blue-500/10 text-blue-600", tabCode: "ess-jobs" },
    compensation: { title: t("ess.modules.compensation.title"), description: t("ess.modules.compensation.description"), href: "/ess/compensation", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-600", tabCode: "ess-compensation" },
    banking: { title: t("ess.modules.banking.title", "Banking"), description: t("ess.modules.banking.description", "Manage your bank accounts"), href: "/ess/banking", icon: Building2, color: "bg-sky-500/10 text-sky-600", tabCode: "ess-banking" },
    transactions: { title: t("ess.modules.transactions.title", "My Transactions"), description: t("ess.modules.transactions.description", "View your employment transaction history"), href: "/ess/transactions", icon: ArrowRightLeft, color: "bg-indigo-500/10 text-indigo-600", tabCode: "ess-transactions" },
    feedback: { title: t("ess.modules.feedback.title"), description: t("ess.modules.feedback.description", "Give and receive continuous and 360 feedback"), href: "/ess/feedback", icon: MessageCircle, color: "bg-violet-500/10 text-violet-600", tabCode: "ess-feedback" },
    recognition: { title: t("ess.modules.recognition.title"), description: t("ess.modules.recognition.description"), href: "/ess/recognition", icon: Award, color: "bg-amber-500/10 text-amber-600", tabCode: "ess-recognition" },
    reminders: { title: t("ess.modules.reminders.title"), description: t("ess.modules.reminders.description"), href: "/ess/reminders", icon: Bell, color: "bg-rose-500/10 text-rose-600", tabCode: "ess-reminders" },
    notifications: { title: t("ess.modules.notifications.title"), description: t("ess.modules.notifications.description"), href: "/profile/notifications", icon: Bell, color: "bg-amber-500/10 text-amber-600", tabCode: "ess-notifications" },
    myAppraisals: { title: t("ess.modules.myAppraisals.title", "My Appraisals"), description: t("ess.modules.myAppraisals.description", "View and manage your performance appraisals"), href: "/ess/my-appraisals", icon: ClipboardCheck, color: "bg-violet-500/10 text-violet-600", tabCode: "ess-my-appraisals" },
    development: { title: t("ess.modules.development.title", "My Development Plan"), description: t("ess.modules.development.description", "View and manage your development goals"), href: "/ess/development", icon: TrendingUp, color: "bg-purple-500/10 text-purple-600", tabCode: "ess-development" },
    developmentThemes: { title: t("ess.modules.developmentThemes.title", "My Development Themes"), description: t("ess.modules.developmentThemes.description", "View AI-generated development themes from 360° feedback"), href: "/ess/my-development-themes", icon: Lightbulb, color: "bg-amber-500/10 text-amber-600", tabCode: "ess-development-themes" },
    appraisalInterviews: { title: t("ess.modules.appraisalInterviews.title", "Appraisal Interviews"), description: t("ess.modules.appraisalInterviews.description", "View and prepare for scheduled appraisal meetings"), href: "/ess/appraisal-interviews", icon: Calendar, color: "bg-indigo-500/10 text-indigo-600", tabCode: "ess-appraisal-interviews" },
    goalInterviews: { title: t("ess.modules.goalInterviews.title", "Goal Interviews"), description: t("ess.modules.goalInterviews.description", "View and prepare for goal-setting meetings"), href: "/ess/goal-interviews", icon: Target, color: "bg-pink-500/10 text-pink-600", tabCode: "ess-goal-interviews" },
    timesheets: { title: t("ess.modules.timesheets.title", "My Timesheets"), description: t("ess.modules.timesheets.description", "Submit and view your timesheets"), href: "/ess/timesheets", icon: Clock, color: "bg-blue-500/10 text-blue-600", tabCode: "ess-timesheets" },
    teamCalendar: { title: t("ess.modules.teamCalendar.title", "Team Calendar"), description: t("ess.modules.teamCalendar.description", "View team availability and schedules"), href: "/ess/calendar", icon: Users, color: "bg-cyan-500/10 text-cyan-600", tabCode: "ess-team-calendar" },
    milestones: { title: t("ess.modules.milestones.title", "Milestones"), description: t("ess.modules.milestones.description", "View your career milestones and achievements"), href: "/ess/milestones", icon: Award, color: "bg-amber-500/10 text-amber-600", tabCode: "ess-milestones" },
    announcements: { title: t("ess.modules.announcements.title", "Announcements"), description: t("ess.modules.announcements.description", "View company announcements and news"), href: "/ess/announcements", icon: Bell, color: "bg-blue-500/10 text-blue-600", tabCode: "ess-announcements" },
    qualifications: { title: t("ess.modules.qualifications.title", "My Qualifications"), description: t("ess.modules.qualifications.description", "Add and manage your qualifications and certifications"), href: "/ess/qualifications", icon: GraduationCap, color: "bg-indigo-500/10 text-indigo-600", tabCode: "ess-qualifications" },
    // NEW ESS MODULES
    competencies: { title: t("ess.modules.competencies.title", "My Competencies"), description: t("ess.modules.competencies.description", "View your competency assessments and levels"), href: "/ess/competencies", icon: Award, color: "bg-purple-500/10 text-purple-600", tabCode: "ess-competencies" },
    skillGaps: { title: t("ess.modules.skillGaps.title", "My Skill Gaps"), description: t("ess.modules.skillGaps.description", "View development areas and recommendations"), href: "/ess/skill-gaps", icon: TrendingDown, color: "bg-orange-500/10 text-orange-600", tabCode: "ess-skill-gaps" },
    evidencePortfolio: { title: t("ess.modules.evidencePortfolio.title", "Evidence Portfolio"), description: t("ess.modules.evidencePortfolio.description", "Attach and manage evidence for your goals and appraisals"), href: "/ess/evidence-portfolio", icon: FolderOpen, color: "bg-teal-500/10 text-teal-600", tabCode: "ess-evidence-portfolio" },
    interests: { title: t("ess.modules.interests.title", "My Interests"), description: t("ess.modules.interests.description", "Manage your interests and hobbies"), href: "/ess/interests", icon: Sparkles, color: "bg-pink-500/10 text-pink-600", tabCode: "ess-interests" },
    governmentIds: { title: t("ess.modules.governmentIds.title", "My Government IDs"), description: t("ess.modules.governmentIds.description", "View and manage your identification documents"), href: "/ess/government-ids", icon: IdCard, color: "bg-slate-500/10 text-slate-600", tabCode: "ess-government-ids" },
    medicalInfo: { title: t("ess.modules.medicalInfo.title", "Medical Information"), description: t("ess.modules.medicalInfo.description", "Manage your emergency medical details"), href: "/ess/medical-info", icon: Stethoscope, color: "bg-red-500/10 text-red-600", tabCode: "ess-medical-info" },
    immigration: { title: t("ess.modules.immigration.title", "Immigration & Permits"), description: t("ess.modules.immigration.description", "View work permits and travel documents"), href: "/ess/immigration", icon: Plane, color: "bg-sky-500/10 text-sky-600", tabCode: "ess-immigration" },
    professionalInfo: { title: t("ess.modules.professionalInfo.title", "Professional Info"), description: t("ess.modules.professionalInfo.description", "View credentials, agreements, and work history"), href: "/ess/professional-info", icon: Briefcase, color: "bg-indigo-500/10 text-indigo-600", tabCode: "ess-professional-info" },
    // Career section modules
    careerPlan: { title: t("ess.modules.careerPlan.title", "My Career Plan"), description: t("ess.modules.careerPlan.description", "Plan and track your career growth"), href: "/ess/career-plan", icon: Compass, color: "bg-violet-500/10 text-violet-600", tabCode: "ess-career-plan" },
    careerPaths: { title: t("ess.modules.careerPaths.title", "My Career Paths"), description: t("ess.modules.careerPaths.description", "Explore career progression opportunities"), href: "/ess/career-paths", icon: Route, color: "bg-cyan-500/10 text-cyan-600", tabCode: "ess-career-paths" },
    mentorship: { title: t("ess.modules.mentorship.title", "My Mentorship"), description: t("ess.modules.mentorship.description", "Connect with mentors and support mentees"), href: "/ess/mentorship", icon: Users, color: "bg-rose-500/10 text-rose-600", tabCode: "ess-mentorship" },
  };

  const filterByAccess = (modules: GroupedModuleItem[]) =>
    modules.filter(m => !m.tabCode || hasTabAccess("ess", m.tabCode));

  const sections: ModuleSection[] = [
    {
      titleKey: "My Profile",
      items: filterByAccess([allModules.profile, allModules.personalInfo, allModules.dependents, allModules.documents, allModules.letters, allModules.medicalInfo]),
    },
    {
      titleKey: "Pay & Benefits",
      items: filterByAccess([allModules.payslips, allModules.compensation, allModules.benefits, allModules.expenses, allModules.banking, allModules.governmentIds]),
    },
    {
      titleKey: "Time & Absence",
      items: filterByAccess([allModules.leave, allModules.myCalendar, allModules.teamCalendar, allModules.timeAttendance, allModules.timesheets]),
    },
    {
      titleKey: "Skills and Competencies",
      items: filterByAccess([allModules.competencies, allModules.qualifications, allModules.skillGaps, allModules.interests]),
    },
    {
      titleKey: "Performance",
      items: filterByAccess([allModules.myAppraisals, allModules.goals, allModules.evidencePortfolio, allModules.feedback, allModules.goalInterviews, allModules.appraisalInterviews, allModules.recognition]),
    },
    {
      titleKey: "Career",
      items: filterByAccess([allModules.professionalInfo, allModules.careerPlan, allModules.careerPaths, allModules.mentorship, allModules.jobs, allModules.milestones, allModules.transactions]),
    },
    {
      titleKey: "Learning & Development",
      items: filterByAccess([allModules.development, allModules.developmentThemes, allModules.training]),
    },
    {
      titleKey: "Employee Lifecycle",
      items: filterByAccess([allModules.onboarding, allModules.offboarding]),
    },
    {
      titleKey: "Workplace",
      items: filterByAccess([allModules.property, allModules.relations, allModules.hse, allModules.immigration]),
    },
    {
      titleKey: "Tasks & Approvals",
      items: filterByAccess([allModules.approvals, allModules.delegates, allModules.reminders]),
    },
    {
      titleKey: "Help & Settings",
      items: filterByAccess([allModules.tickets, allModules.notifications, allModules.announcements]),
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

        {/* AI-Powered Dashboard */}
        <ESSAIDashboard />

        {/* Pending Resumption of Duty */}
        <EmployeeRODWidget />

        {/* Pending Appraisal Actions */}
        <EssPendingAppraisalActions />

        <GroupedModuleCards sections={sections} sectionBadges={sectionBadges} defaultOpen={false} showToggleButton />
      </div>
    </AppLayout>
  );
}

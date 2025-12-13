import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { NavLink } from "@/components/NavLink";
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

const mssModules = [
  {
    title: "My Team",
    description: "View and manage your direct reports",
    href: "/mss/team",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Team Approvals",
    description: "Approve leave, expense, training, and other workflow requests",
    href: "/workflow/approvals",
    icon: CheckSquare,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "My Delegates",
    description: "Manage your approval delegates",
    href: "/workflow/delegates",
    icon: UserCheck,
    color: "bg-fuchsia-500/10 text-fuchsia-600",
  },
  {
    title: "Team Onboarding",
    description: "Track onboarding progress of your direct reports",
    href: "/mss/onboarding",
    icon: Rocket,
    color: "bg-teal-500/10 text-teal-600",
  },
  {
    title: "Team Departures",
    description: "Track offboarding progress of departing team members",
    href: "/mss/offboarding",
    icon: UserMinus,
    color: "bg-red-500/10 text-red-600",
  },
  {
    title: "Team Property",
    description: "Manage property assignments for your team",
    href: "/mss/property",
    icon: Package,
    color: "bg-slate-500/10 text-slate-600",
  },
  {
    title: "Team Relations",
    description: "Recognize team members and view cases",
    href: "/mss/relations",
    icon: Heart,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    title: "Team Benefits",
    description: "View team benefit enrollments",
    href: "/mss/benefits",
    icon: Shield,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Team Leave Calendar",
    description: "View team leave schedules and availability",
    href: "/mss/leave-approvals",
    icon: Calendar,
    color: "bg-green-500/10 text-green-600",
  },
  {
    title: "Timesheet Approvals",
    description: "Review and approve team timesheets",
    href: "/mss/timesheet-approvals",
    icon: Clock,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "Performance Appraisals",
    description: "Conduct and manage team performance appraisals",
    href: "/mss/appraisals",
    icon: ClipboardCheck,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Goal Management",
    description: "Set and track team goals and objectives",
    href: "/mss/goals",
    icon: Target,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    title: "360° Feedback",
    description: "Manage 360-degree feedback reviews for your team",
    href: "/mss/360",
    icon: Users,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    title: "Team Analytics",
    description: "View team performance metrics and reports",
    href: "/mss/analytics",
    icon: BarChart3,
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    title: "Recruitment Requests",
    description: "Submit and track headcount requests",
    href: "/mss/recruitment",
    icon: UserPlus,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Team Training",
    description: "Monitor team training progress",
    href: "/mss/training",
    icon: FileCheck,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Succession Planning",
    description: "Plan and develop team succession",
    href: "/mss/succession",
    icon: TrendingUp,
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Team Health & Safety",
    description: "Monitor team incidents and training compliance",
    href: "/mss/hse",
    icon: HardHat,
    color: "bg-yellow-500/10 text-yellow-600",
  },
  {
    title: "Team Feedback",
    description: "View and manage continuous feedback for your team",
    href: "/mss/feedback",
    icon: MessageCircle,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Team Recognition",
    description: "Recognize and view recognitions for your team",
    href: "/mss/recognition",
    icon: Award,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Performance Improvement",
    description: "Manage PIPs for your direct reports",
    href: "/mss/pips",
    icon: AlertTriangle,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "Team Compensation",
    description: "View team compensation and compa-ratios",
    href: "/mss/compensation",
    icon: DollarSign,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Submit a Ticket",
    description: "Request help or report an issue to IT/HR support",
    href: "/help/tickets/new",
    icon: TicketPlus,
    color: "bg-red-500/10 text-red-600",
  },
];

export default function ManagerSelfServicePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Manager Self Service" },
          ]}
        />
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Self Service</h1>
          <p className="text-muted-foreground">
            Manage your team, approvals, and supervisory tasks
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

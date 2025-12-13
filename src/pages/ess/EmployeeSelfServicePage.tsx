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
} from "lucide-react";

const essModules = [
  {
    title: "My Profile",
    description: "View and update your personal information",
    href: "/profile",
    icon: User,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "My Approvals",
    description: "View and action pending approval requests",
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
    title: "Leave Requests",
    description: "Apply for leave and view your leave balance",
    href: "/ess/leave",
    icon: Calendar,
    color: "bg-green-500/10 text-green-600",
  },
  {
    title: "My Documents",
    description: "Access your employment documents and certificates",
    href: "/ess/documents",
    icon: FileText,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Time & Attendance",
    description: "View your attendance records and timesheets",
    href: "/ess/attendance",
    icon: Clock,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    title: "Payslips",
    description: "View and download your payslips",
    href: "/ess/payslips",
    icon: CreditCard,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "My Training",
    description: "View enrolled courses and training history",
    href: "/ess/training",
    icon: GraduationCap,
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    title: "My Goals",
    description: "View and track your performance goals",
    href: "/ess/goals",
    icon: Target,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    title: "Submit a Ticket",
    description: "Request help or report an issue to IT/HR support",
    href: "/help/tickets/new",
    icon: TicketPlus,
    color: "bg-red-500/10 text-red-600",
  },
  {
    title: "My Letters",
    description: "Request and view employment letters",
    href: "/ess/letters",
    icon: FileSignature,
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "My Onboarding",
    description: "Complete your onboarding tasks and checklist",
    href: "/ess/onboarding",
    icon: Rocket,
    color: "bg-teal-500/10 text-teal-600",
  },
  {
    title: "My Offboarding",
    description: "Complete your exit tasks before leaving",
    href: "/ess/offboarding",
    icon: UserMinus,
    color: "bg-red-500/10 text-red-600",
  },
  {
    title: "My Property",
    description: "View assigned equipment and submit requests",
    href: "/ess/property",
    icon: Package,
    color: "bg-slate-500/10 text-slate-600",
  },
  {
    title: "Notifications",
    description: "Manage your notification preferences",
    href: "/profile/notifications",
    icon: Bell,
    color: "bg-amber-500/10 text-amber-600",
  },
];

export default function EmployeeSelfServicePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Employee Self Service" },
          ]}
        />
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Self Service</h1>
          <p className="text-muted-foreground">
            Access your personal information, requests, and employment details
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

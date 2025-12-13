import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CalendarPlus,
  CalendarCheck,
  ChevronRight,
  Clock,
  CheckCircle,
  Settings,
  TrendingUp,
  RotateCcw,
  PartyPopper,
  Building2,
  Calculator,
  Timer,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  code: string;
}

const leaveModules = [
  {
    title: "My Leave",
    description: "View balances and request history",
    href: "/leave/my-leave",
    icon: Calendar,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Apply for Leave",
    description: "Submit new leave applications",
    href: "/leave/apply",
    icon: CalendarPlus,
    color: "bg-success/10 text-success",
  },
  {
    title: "Leave Approvals",
    description: "Review and approve team requests",
    href: "/leave/approvals",
    icon: CalendarCheck,
    color: "bg-warning/10 text-warning",
    adminOnly: true,
  },
  {
    title: "Leave Types",
    description: "Configure leave categories",
    href: "/leave/types",
    icon: Settings,
    color: "bg-info/10 text-info",
    adminOnly: true,
  },
  {
    title: "Accrual Rules",
    description: "Set up leave accrual policies",
    href: "/leave/accrual-rules",
    icon: TrendingUp,
    color: "bg-primary/10 text-primary",
    adminOnly: true,
  },
  {
    title: "Rollover Rules",
    description: "Configure year-end balance handling",
    href: "/leave/rollover-rules",
    icon: RotateCcw,
    color: "bg-secondary/10 text-secondary-foreground",
    adminOnly: true,
  },
  {
    title: "Holidays Calendar",
    description: "Manage country and company holidays",
    href: "/leave/holidays",
    icon: PartyPopper,
    color: "bg-destructive/10 text-destructive",
    adminOnly: true,
  },
  {
    title: "Balance Recalculation",
    description: "Recalculate employee leave balances",
    href: "/leave/balance-recalculation",
    icon: Calculator,
    color: "bg-accent text-accent-foreground",
    adminOnly: true,
  },
  {
    title: "Compensatory Time",
    description: "Track earned and used comp time",
    href: "/leave/compensatory-time",
    icon: Timer,
    color: "bg-info/10 text-info",
  },
  {
    title: "Comp Time Policies",
    description: "Configure compensatory time rules",
    href: "/leave/comp-time-policies",
    icon: Settings,
    color: "bg-muted text-muted-foreground",
    adminOnly: true,
  },
];

export default function LeaveDashboardPage() {
  const { company, isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  
  // Company filter state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(company?.id || "");
  
  // Fetch companies for filter
  useEffect(() => {
    if (isAdminOrHR) {
      supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => {
          if (data) setCompanies(data);
        });
    }
  }, [isAdminOrHR]);

  // Set default company when loaded
  useEffect(() => {
    if (company?.id && !selectedCompanyId) {
      setSelectedCompanyId(company.id);
    }
  }, [company?.id, selectedCompanyId]);

  const { leaveBalances, allLeaveRequests, loadingBalances, loadingAllRequests } = useLeaveManagement(selectedCompanyId || company?.id);
  
  const pendingCount = allLeaveRequests.filter(r => r.status === "pending").length;
  const approvedThisYear = allLeaveRequests.filter(r => r.status === "approved").length;
  const totalBalance = leaveBalances.reduce((sum, b) => sum + (b.current_balance || 0), 0);

  const statCards = [
    { label: "Available Days", value: totalBalance.toFixed(1), icon: Calendar, color: "bg-primary/10 text-primary" },
    { label: "Pending Requests", value: pendingCount, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Approved This Year", value: approvedThisYear, icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: "Leave Types", value: leaveBalances.length, icon: CalendarCheck, color: "bg-info/10 text-info" },
  ];

  const filteredModules = leaveModules.filter(m => !m.adminOnly || isAdminOrHR);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Leave Management
                </h1>
                <p className="text-muted-foreground">
                  Manage time off and leave requests
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdminOrHR && companies.length > 1 && (
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="w-[200px]">
                    <Building2 className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <ModuleBIButton module="leave" />
              <ModuleReportsButton module="leave" />
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
                    <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
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
          {filteredModules.map((module, index) => {
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

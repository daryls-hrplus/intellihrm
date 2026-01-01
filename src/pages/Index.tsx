import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { EmployeeDistribution } from "@/components/dashboard/EmployeeDistribution";
import { HeadcountTrend } from "@/components/dashboard/HeadcountTrend";
import { PendingAccessRequests } from "@/components/dashboard/PendingAccessRequests";
import { SlaRiskWidget } from "@/components/dashboard/SlaRiskWidget";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/useDashboardData";
import {
  Users,
  UserPlus,
  Calendar,
  TrendingUp,
} from "lucide-react";

const Index = () => {
  const { t } = useTranslation();
  const { profile, isAdmin, isHRManager, user, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const canViewCharts = isAdmin || isHRManager;

  // Redirect unauthenticated users to landing page
  if (!authLoading && !user) {
    return <Navigate to="/landing" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("dashboard.welcomeBack", { name: firstName })}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("dashboard.overview")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t("dashboard.totalEmployees")}
            value={isLoading ? "..." : stats?.totalEmployees.toLocaleString() || "0"}
            change={stats?.employeeChange ? `${stats.employeeChange > 0 ? "+" : ""}${stats.employeeChange}% ${t("dashboard.fromLastMonth")}` : undefined}
            changeType={stats?.employeeChange ? (stats.employeeChange > 0 ? "positive" : stats.employeeChange < 0 ? "negative" : "neutral") : "neutral"}
            icon={Users}
            delay={0}
          />
          <StatCard
            title={t("dashboard.newHires")}
            value={isLoading ? "..." : stats?.newHires || "0"}
            change={stats?.newHiresChange !== undefined ? `${stats.newHiresChange >= 0 ? "+" : ""}${stats.newHiresChange} ${t("dashboard.fromLastMonth")}` : undefined}
            changeType={stats?.newHiresChange ? (stats.newHiresChange > 0 ? "positive" : stats.newHiresChange < 0 ? "negative" : "neutral") : "neutral"}
            icon={UserPlus}
            delay={50}
          />
          <StatCard
            title={t("dashboard.leaveRequests")}
            value={isLoading ? "..." : stats?.pendingLeaveRequests || "0"}
            change={t("dashboard.pendingApproval")}
            changeType="neutral"
            icon={Calendar}
            delay={100}
          />
          <StatCard
            title={t("dashboard.openPositions")}
            value={isLoading ? "..." : stats?.openPositions || "0"}
            changeType="neutral"
            icon={TrendingUp}
            delay={150}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Charts Row - Only for Admin/HR */}
        {canViewCharts && (
          <div className="grid gap-6 lg:grid-cols-2">
            <HeadcountTrend />
            <EmployeeDistribution />
          </div>
        )}

        {/* Activity, Events & Admin Widgets */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RecentActivity />
          <UpcomingEvents />
          <SlaRiskWidget />
        </div>

        {/* Admin Widget */}
        {isAdmin && (
          <div className="grid gap-6 lg:grid-cols-3">
            <PendingAccessRequests />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;

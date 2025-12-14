import { useTranslation } from "react-i18next";
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
import {
  Users,
  UserPlus,
  Calendar,
  TrendingUp,
} from "lucide-react";

const Index = () => {
  const { t } = useTranslation();
  const { profile, isAdmin } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "there";

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
            value="1,284"
            change={`+12% ${t("dashboard.fromLastMonth")}`}
            changeType="positive"
            icon={Users}
            delay={0}
          />
          <StatCard
            title={t("dashboard.newHires")}
            value="28"
            change={`+5 ${t("dashboard.fromLastMonth")}`}
            changeType="positive"
            icon={UserPlus}
            delay={50}
          />
          <StatCard
            title={t("dashboard.leaveRequests")}
            value="47"
            change={`12 ${t("dashboard.pendingApproval")}`}
            changeType="neutral"
            icon={Calendar}
            delay={100}
          />
          <StatCard
            title={t("dashboard.openPositions")}
            value="23"
            change={`8 ${t("dashboard.inFinalStage")}`}
            changeType="neutral"
            icon={TrendingUp}
            delay={150}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <HeadcountTrend />
          <EmployeeDistribution />
        </div>

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

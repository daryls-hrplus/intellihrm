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
  const { profile, isAdmin } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening across your organization today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value="1,284"
            change="+12% from last month"
            changeType="positive"
            icon={Users}
            delay={0}
          />
          <StatCard
            title="New Hires (This Month)"
            value="28"
            change="+5 from last month"
            changeType="positive"
            icon={UserPlus}
            delay={50}
          />
          <StatCard
            title="Leave Requests"
            value="47"
            change="12 pending approval"
            changeType="neutral"
            icon={Calendar}
            delay={100}
          />
          <StatCard
            title="Open Positions"
            value="23"
            change="8 in final stage"
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

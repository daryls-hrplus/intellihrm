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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  UserPlus,
  Calendar,
  TrendingUp,
} from "lucide-react";

const Index = () => {
  const { profile, isAdmin, company } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  
  const hasGroupLogo = company?.company_group?.logo_url;
  const hasCompanyLogo = company?.logo_url;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here's what's happening across your organization today.
            </p>
          </div>
          
          {/* Company Logos */}
          {(hasGroupLogo || hasCompanyLogo) && (
            <div className="flex items-center gap-3">
              {hasGroupLogo && (
                <Avatar className="h-12 w-12 rounded-lg border bg-background shadow-sm">
                  <AvatarImage 
                    src={company.company_group!.logo_url!} 
                    alt={company.company_group!.name}
                    className="object-contain p-1"
                  />
                  <AvatarFallback className="rounded-lg text-xs font-medium">
                    {company.company_group!.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              {hasCompanyLogo && (
                <Avatar className="h-12 w-12 rounded-lg border bg-background shadow-sm">
                  <AvatarImage 
                    src={company.logo_url!} 
                    alt={company.name}
                    className="object-contain p-1"
                  />
                  <AvatarFallback className="rounded-lg text-xs font-medium">
                    {company.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
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

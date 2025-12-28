import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, TrendingUp, Calendar, Clock, Target } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function MssAnalyticsPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();

  // Fetch team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-analytics-members", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, hire_date")
        .eq("manager_id", profile.id);
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Fetch team leave stats
  const { data: leaveStats = [] } = useQuery({
    queryKey: ["team-leave-stats", profile?.id],
    queryFn: async () => {
      if (!profile?.id || teamMembers.length === 0) return [];
      const employeeIds = teamMembers.map((m: any) => m.id);
      const { data } = await supabase
        .from("leave_requests")
        .select("status, leave_type:leave_types(name)")
        .in("employee_id", employeeIds);
      return data || [];
    },
    enabled: !!profile?.id && teamMembers.length > 0,
  });

  // Calculate leave by status
  const leaveByStatus = leaveStats.reduce((acc: any, req: any) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});

  const leaveStatusData = Object.entries(leaveByStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count as number,
  }));

  // Team size stat
  const teamSize = teamMembers.length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("mss.title"), href: "/mss" },
            { label: t("mss.modules.analytics.title", "Team Analytics") },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("mss.modules.analytics.title", "Team Analytics")}
            </h1>
            <p className="text-muted-foreground">
              {t("mss.modules.analytics.description", "View team metrics and insights")}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamSize}</div>
              <p className="text-xs text-muted-foreground">Direct reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaveStats.length}</div>
              <p className="text-xs text-muted-foreground">Total requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaveByStatus["pending"] || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaveByStatus["approved"] || 0}</div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {leaveStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leaveStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leaveStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No leave data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {teamMembers.slice(0, 10).map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <span className="font-medium">{member.full_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {member.hire_date ? `Since ${new Date(member.hire_date).getFullYear()}` : "N/A"}
                      </span>
                    </div>
                  ))}
                  {teamMembers.length > 10 && (
                    <p className="text-sm text-muted-foreground">
                      +{teamMembers.length - 10} more team members
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No direct reports found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

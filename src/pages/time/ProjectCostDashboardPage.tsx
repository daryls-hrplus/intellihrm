import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, TrendingUp, AlertTriangle, Clock, RefreshCw, BarChart3 } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

interface ProjectCostSummary {
  id: string;
  project_id: string;
  project_name: string;
  total_hours: number;
  total_cost: number;
  total_billable: number;
  budget_amount: number | null;
  budget_utilization_percent: number | null;
  employee_count: number;
}

export default function ProjectCostDashboardPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [projectCosts, setProjectCosts] = useState<ProjectCostSummary[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [periodType, setPeriodType] = useState<string>("monthly");
  const [totals, setTotals] = useState({ cost: 0, billable: 0, hours: 0, margin: 0 });

  const fetchData = async () => {
    if (!profile?.company_id) return;
    setIsLoading(true);

    try {
      const periodStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const periodEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      // Fetch project cost summaries
      const { data: summaries } = await supabase
        .from('project_labor_cost_summaries')
        .select(`
          *,
          projects:project_id (name, status)
        `)
        .eq('company_id', profile.company_id)
        .eq('period_type', periodType)
        .gte('period_start', periodStart)
        .lte('period_end', periodEnd)
        .order('total_cost', { ascending: false });

      const formattedSummaries = (summaries || []).map((s: any) => ({
        id: s.id,
        project_id: s.project_id,
        project_name: s.projects?.name || 'Unknown Project',
        total_hours: Number(s.total_hours) || 0,
        total_cost: Number(s.total_cost) || 0,
        total_billable: Number(s.total_billable) || 0,
        budget_amount: s.budget_amount ? Number(s.budget_amount) : null,
        budget_utilization_percent: s.budget_utilization_percent ? Number(s.budget_utilization_percent) : null,
        employee_count: s.employee_count || 0,
      }));

      setProjectCosts(formattedSummaries);

      // Calculate totals
      const totalCost = formattedSummaries.reduce((sum, p) => sum + p.total_cost, 0);
      const totalBillable = formattedSummaries.reduce((sum, p) => sum + p.total_billable, 0);
      const totalHours = formattedSummaries.reduce((sum, p) => sum + p.total_hours, 0);
      const margin = totalBillable > 0 ? ((totalBillable - totalCost) / totalBillable) * 100 : 0;

      setTotals({ cost: totalCost, billable: totalBillable, hours: totalHours, margin });

      // Fetch unacknowledged alerts
      const { data: alertsData } = await supabase
        .from('project_cost_alerts')
        .select(`
          *,
          projects:project_id (name)
        `)
        .eq('company_id', profile.company_id)
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error fetching project costs:', error);
      toast.error('Failed to load project cost data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile?.company_id, periodType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getBudgetBadge = (utilization: number | null) => {
    if (utilization === null) return <Badge variant="outline">No Budget</Badge>;
    if (utilization >= 100) return <Badge variant="destructive">Over Budget</Badge>;
    if (utilization >= 80) return <Badge className="bg-warning text-warning-foreground">At Risk</Badge>;
    return <Badge variant="secondary">On Track</Badge>;
  };

  const statCards = [
    { label: "Total Labor Cost", value: formatCurrency(totals.cost), icon: DollarSign, color: "text-destructive" },
    { label: "Billable Revenue", value: formatCurrency(totals.billable), icon: TrendingUp, color: "text-success" },
    { label: "Total Hours", value: totals.hours.toFixed(1), icon: Clock, color: "text-primary" },
    { label: "Profit Margin", value: `${totals.margin.toFixed(1)}%`, icon: BarChart3, color: "text-secondary" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("timeAttendance.title"), href: "/time-attendance" },
            { label: "Project Costs" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Project Labor Costs</h1>
              <p className="text-muted-foreground">Track costs, budgets, and profitability by project</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={periodType} onValueChange={setPeriodType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-semibold">{isLoading ? "..." : stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="border-warning">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Budget Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{alert.projects?.name}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Cost Table */}
        <Card>
          <CardHeader>
            <CardTitle>Project Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Labor Cost</TableHead>
                  <TableHead className="text-right">Billable</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : projectCosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No project cost data for this period
                    </TableCell>
                  </TableRow>
                ) : (
                  projectCosts.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.project_name}</TableCell>
                      <TableCell className="text-right">{project.total_hours.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(project.total_cost)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(project.total_billable)}</TableCell>
                      <TableCell className="text-right">
                        {project.budget_amount ? formatCurrency(project.budget_amount) : '-'}
                      </TableCell>
                      <TableCell>
                        {project.budget_utilization_percent !== null ? (
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={Math.min(project.budget_utilization_percent, 100)} 
                              className="w-16 h-2"
                            />
                            <span className="text-sm">{project.budget_utilization_percent.toFixed(0)}%</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getBudgetBadge(project.budget_utilization_percent)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

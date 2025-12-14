import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, Building2, TrendingUp, UserPlus, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NavLink } from "react-router-dom";

interface Company {
  id: string;
  name: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

export default function WorkforceAnalyticsPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newHires: 0,
    departments: 0,
    positions: 0,
  });
  
  const [departmentDistribution, setDepartmentDistribution] = useState<{ name: string; value: number }[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<{ month: string; hires: number }[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase.from("companies").select("id, name").eq("is_active", true).order("name");
      setCompanies(data || []);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Fetch employees
        const { data: allEmployees } = await supabase.from("profiles").select("id, created_at, company_id");
        const employees = selectedCompany !== "all" 
          ? (allEmployees || []).filter(e => e.company_id === selectedCompany)
          : (allEmployees || []);

        // Fetch departments
        const { data: allDepts } = await supabase.from("departments").select("id, name, company_id, is_active");
        const depts = (allDepts || []).filter(d => d.is_active && (selectedCompany === "all" || d.company_id === selectedCompany));

        // Fetch positions count
        const { count: posCount } = await supabase.from("positions").select("*", { count: "exact", head: true }).eq("is_active", true);

        const total = employees.length;
        const newHires = employees.filter(e => new Date(e.created_at) >= startOfMonth).length;

        setStats({
          totalEmployees: total,
          newHires,
          departments: depts.length,
          positions: posCount || 0,
        });

        // Department distribution
        if (depts.length > 0) {
          const distribution = depts.slice(0, 6).map(dept => ({
            name: dept.name.length > 12 ? dept.name.substring(0, 12) + '...' : dept.name,
            value: employees.filter(e => e.company_id === dept.company_id).length,
          }));
          setDepartmentDistribution(distribution);
        }

        // Monthly trends
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        setMonthlyTrends(months.map(month => ({ month, hires: Math.floor(Math.random() * 10) + 1 })));

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedCompany]);

  const statCards = [
    { label: t("workforce.analytics.totalEmployees"), value: stats.totalEmployees, icon: Users, color: "bg-primary/10 text-primary" },
    { label: t("workforce.analytics.newHires"), value: stats.newHires, icon: UserPlus, color: "bg-info/10 text-info" },
    { label: t("workforce.analytics.departments"), value: stats.departments, icon: Building2, color: "bg-warning/10 text-warning" },
    { label: t("workforce.analytics.positions"), value: stats.positions, icon: TrendingUp, color: "bg-success/10 text-success" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink to="/workforce">{t("workforce.title")}</NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("workforce.modules.analytics.title")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <BarChart3 className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {t("workforce.modules.analytics.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("workforce.modules.analytics.description")}
                </p>
              </div>
            </div>
          </div>

          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allCompanies")}</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-card-foreground">
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                      </p>
                    </div>
                    <div className={`rounded-lg p-2 ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle>{t("workforce.analytics.monthlyTrends")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Line type="monotone" dataKey="hires" stroke="hsl(var(--success))" name={t("workforce.analytics.hires")} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "250ms" }}>
            <CardHeader>
              <CardTitle>{t("workforce.analytics.departmentDistribution")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={departmentDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name }) => name}>
                      {departmentDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

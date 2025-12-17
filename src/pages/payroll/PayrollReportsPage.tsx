import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayroll } from "@/hooks/usePayroll";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { FileSpreadsheet, TrendingUp, DollarSign, Users, Calendar, Download, Sparkles, LayoutGrid } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useTranslation } from "react-i18next";
import { AIReportBuilder } from "@/components/payroll/AIReportBuilder";

export default function PayrollReportsPage() {
  const { t } = useTranslation();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const { fetchPayrollAnalytics, isLoading } = usePayroll();
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [analytics, setAnalytics] = useState<{
    totalPayrollRuns: number;
    totalGrossPay: number;
    totalNetPay: number;
    totalDeductions: number;
    totalTaxes: number;
    avgEmployeesPerRun: number;
    monthlyData: { month: string; gross: number; net: number; taxes: number }[];
  } | null>(null);

  useEffect(() => {
    if (selectedCompanyId) {
      loadAnalytics();
    }
  }, [selectedCompanyId, selectedYear]);

  const loadAnalytics = async () => {
    if (!selectedCompanyId) return;
    const data = await fetchPayrollAnalytics(selectedCompanyId, selectedYear);
    setAnalytics(data);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyShort = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  const costBreakdown = analytics ? [
    { name: 'Net Pay', value: analytics.totalNetPay },
    { name: 'Taxes', value: analytics.totalTaxes },
    { name: 'Deductions', value: analytics.totalDeductions - analytics.totalTaxes },
  ] : [];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (!selectedCompanyId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("payroll.reports.selectCompanyPrompt")}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("payroll.title"), href: "/payroll" },
            { label: t("payroll.reports.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <FileSpreadsheet className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("payroll.reports.title")}</h1>
              <p className="text-muted-foreground">{t("payroll.reports.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t("common.export")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.reports.totalGrossPay")}</p>
                <p className="text-xl font-semibold">{formatCurrencyShort(analytics?.totalGrossPay || 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.reports.totalNetPay")}</p>
                <p className="text-xl font-semibold">{formatCurrencyShort(analytics?.totalNetPay || 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.reports.payrollRuns")}</p>
                <p className="text-xl font-semibold">{analytics?.totalPayrollRuns || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.reports.avgEmployees")}</p>
                <p className="text-xl font-semibold">{analytics?.avgEmployeesPerRun || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="trends">{t("payroll.reports.payrollTrendsTab")}</TabsTrigger>
            <TabsTrigger value="breakdown">{t("payroll.reports.costBreakdownTab")}</TabsTrigger>
            <TabsTrigger value="comparison">{t("payroll.reports.monthlyComparisonTab")}</TabsTrigger>
            <TabsTrigger value="ai-banded" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI Banded Reports
            </TabsTrigger>
            <TabsTrigger value="ai-bi" className="gap-1">
              <LayoutGrid className="h-3 w-3" />
              AI BI Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("payroll.reports.payrollTrends")}</CardTitle>
                <CardDescription>{t("payroll.reports.monthlyGrossVsNet")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.monthlyData || []}>
                      <defs>
                        <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis tickFormatter={formatCurrencyShort} className="text-xs" />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="gross"
                        name={t("payroll.reports.grossPay")}
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorGross)"
                      />
                      <Area
                        type="monotone"
                        dataKey="net"
                        name={t("payroll.reports.netPay")}
                        stroke="hsl(var(--success))"
                        fillOpacity={1}
                        fill="url(#colorNet)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("payroll.reports.costBreakdown")}</CardTitle>
                  <CardDescription>{t("payroll.reports.costBreakdownSubtitle")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {costBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("payroll.reports.costSummary")}</CardTitle>
                  <CardDescription>{t("payroll.reports.costSummarySubtitle", { year: selectedYear })}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">{t("payroll.reports.totalGrossPay")}</span>
                    <span className="font-semibold">{formatCurrency(analytics?.totalGrossPay || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">{t("payroll.reports.totalTaxes")}</span>
                    <span className="font-semibold text-warning">{formatCurrency(analytics?.totalTaxes || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">{t("payroll.processing.deductions")}</span>
                    <span className="font-semibold">{formatCurrency(analytics?.totalDeductions || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                    <span className="text-success font-medium">{t("payroll.reports.totalNetPay")}</span>
                    <span className="font-bold text-success">{formatCurrency(analytics?.totalNetPay || 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("payroll.reports.monthlyComparison")}</CardTitle>
                <CardDescription>{t("payroll.reports.monthlyComparisonSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.monthlyData || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis tickFormatter={formatCurrencyShort} className="text-xs" />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="gross" name={t("payroll.reports.grossPay")} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="net" name={t("payroll.reports.netPay")} fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="taxes" name={t("payroll.reports.taxes")} fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-banded" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Banded Reports
                </CardTitle>
                <CardDescription>
                  Create custom banded reports with AI assistance. Upload a layout, iterate with AI, and generate reports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIReportBuilder reportType="banded" companyId={selectedCompanyId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-bi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  AI BI Reports
                </CardTitle>
                <CardDescription>
                  Create business intelligence reports with charts and KPIs using AI assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIReportBuilder reportType="bi" companyId={selectedCompanyId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

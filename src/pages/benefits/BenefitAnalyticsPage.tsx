import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users, DollarSign, FileText, Building2 } from "lucide-react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function BenefitAnalyticsPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [enrollmentStats, setEnrollmentStats] = useState<any>({});
  const [costData, setCostData] = useState<any[]>([]);
  const [claimsData, setClaimsData] = useState<any>({});
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, selectedCompany]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
    setCompanies(data || []);
  };

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch enrollments
      let enrollmentQuery = supabase.from("benefit_enrollments").select(`
        *,
        plan:benefit_plans(*, category:benefit_categories(*))
      `);

      // Fetch claims
      let claimsQuery = supabase.from("benefit_claims").select(`
        *,
        enrollment:benefit_enrollments(*, plan:benefit_plans(*))
      `);

      const [enrollmentRes, claimsRes] = await Promise.all([
        enrollmentQuery,
        claimsQuery
      ]);

      const enrollments = enrollmentRes.data || [];
      const claims = claimsRes.data || [];

      // Filter by company if selected
      const filteredEnrollments = selectedCompany === "all" 
        ? enrollments 
        : enrollments.filter((e: any) => e.plan?.company_id === selectedCompany);

      const filteredClaims = selectedCompany === "all"
        ? claims
        : claims.filter((c: any) => c.enrollment?.plan?.company_id === selectedCompany);

      // Calculate enrollment stats
      const totalEnrollments = filteredEnrollments.length;
      const activeEnrollments = filteredEnrollments.filter((e: any) => e.status === "active").length;
      const pendingEnrollments = filteredEnrollments.filter((e: any) => e.status === "pending").length;

      setEnrollmentStats({
        total: totalEnrollments,
        active: activeEnrollments,
        pending: pendingEnrollments,
        terminatedRate: totalEnrollments > 0 
          ? ((filteredEnrollments.filter((e: any) => e.status === "terminated").length / totalEnrollments) * 100).toFixed(1)
          : 0
      });

      // Calculate cost data by plan type
      const costByType: Record<string, { employer: number; employee: number }> = {};
      filteredEnrollments.forEach((e: any) => {
        const type = e.plan?.category?.category_type || "Other";
        if (!costByType[type]) {
          costByType[type] = { employer: 0, employee: 0 };
        }
        costByType[type].employer += e.employer_contribution || 0;
        costByType[type].employee += e.employee_contribution || 0;
      });
      setCostData(Object.entries(costByType).map(([name, values]) => ({
        name,
        employer: values.employer,
        employee: values.employee
      })));

      // Calculate plan distribution
      const planCounts: Record<string, number> = {};
      filteredEnrollments.forEach((e: any) => {
        const planName = e.plan?.name || "Unknown";
        planCounts[planName] = (planCounts[planName] || 0) + 1;
      });
      setPlanDistribution(Object.entries(planCounts).map(([name, value]) => ({ name, value })));

      // Calculate enrollment trends (by month)
      const trendData: Record<string, number> = {};
      filteredEnrollments.forEach((e: any) => {
        const month = new Date(e.enrollment_date).toLocaleString('default', { month: 'short', year: '2-digit' });
        trendData[month] = (trendData[month] || 0) + 1;
      });
      setEnrollmentTrends(Object.entries(trendData).slice(-12).map(([month, count]) => ({ month, enrollments: count })));

      // Calculate claims stats
      const totalClaims = filteredClaims.length;
      const approvedClaims = filteredClaims.filter((c: any) => c.status === "approved").length;
      const totalClaimAmount = filteredClaims.reduce((sum: number, c: any) => sum + (c.amount_claimed || 0), 0);
      const approvedAmount = filteredClaims.reduce((sum: number, c: any) => sum + (c.amount_approved || 0), 0);
      const avgProcessingTime = filteredClaims.filter((c: any) => c.processed_at).length > 0
        ? filteredClaims.filter((c: any) => c.processed_at).reduce((sum: number, c: any) => {
            const days = Math.ceil((new Date(c.processed_at).getTime() - new Date(c.claim_date).getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / filteredClaims.filter((c: any) => c.processed_at).length
        : 0;

      setClaimsData({
        total: totalClaims,
        approved: approvedClaims,
        approvalRate: totalClaims > 0 ? ((approvedClaims / totalClaims) * 100).toFixed(1) : 0,
        totalAmount: totalClaimAmount,
        approvedAmount: approvedAmount,
        avgProcessingDays: avgProcessingTime.toFixed(1)
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    employer: { label: "Employer", color: "hsl(var(--primary))" },
    employee: { label: "Employee", color: "hsl(var(--secondary))" },
    enrollments: { label: "Enrollments", color: "hsl(var(--primary))" },
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Benefits", href: "/benefits" },
          { label: "Analytics" }
        ]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Benefits Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights into benefit programs</p>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollmentStats.total || 0}</div>
              <p className="text-xs text-muted-foreground">{enrollmentStats.active || 0} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Enrollments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollmentStats.pending || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claimsData.total || 0}</div>
              <p className="text-xs text-muted-foreground">{claimsData.approvalRate}% approval rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claimsData.avgProcessingDays || 0} days</div>
              <p className="text-xs text-muted-foreground">For claims</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="enrollments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="enrollments">Enrollment Trends</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="distribution">Plan Distribution</TabsTrigger>
            <TabsTrigger value="claims">Claims Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <LineChart data={enrollmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="enrollments" stroke="var(--color-enrollments)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs">
            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution by Benefit Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="employer" fill="var(--color-employer)" name="Employer Contribution" />
                    <Bar dataKey="employee" fill="var(--color-employee)" name="Employee Contribution" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {planDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Claims Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Claims Submitted</span>
                    <span className="font-bold">{claimsData.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Approved Claims</span>
                    <span className="font-bold text-green-600">{claimsData.approved || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Approval Rate</span>
                    <span className="font-bold">{claimsData.approvalRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Avg Processing Time</span>
                    <span className="font-bold">{claimsData.avgProcessingDays || 0} days</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Claims Amounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Claimed</span>
                    <span className="font-bold">${(claimsData.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Approved</span>
                    <span className="font-bold text-green-600">${(claimsData.approvedAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Claim</span>
                    <span className="font-bold">
                      ${claimsData.total > 0 ? ((claimsData.totalAmount || 0) / claimsData.total).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

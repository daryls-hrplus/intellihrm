import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { Building2, Calculator, TrendingUp, DollarSign } from "lucide-react";

export default function BenefitCostProjectionsPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [projectionMonths, setProjectionMonths] = useState(12);
  const [growthRate, setGrowthRate] = useState(5);
  const [inflationRate, setInflationRate] = useState(3);
  const [currentCosts, setCurrentCosts] = useState<any>({});
  const [projections, setProjections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCurrentCosts();
    }
  }, [user, selectedCompany]);

  useEffect(() => {
    calculateProjections();
  }, [currentCosts, projectionMonths, growthRate, inflationRate]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
    setCompanies(data || []);
  };

  const fetchCurrentCosts = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("benefit_enrollments").select(`
        *,
        plan:benefit_plans(*, category:benefit_categories(*))
      `).eq("status", "active");

      const { data: enrollments } = await query;

      // Filter by company if selected
      const filteredEnrollments = selectedCompany === "all" 
        ? enrollments || []
        : (enrollments || []).filter((e: any) => e.plan?.company_id === selectedCompany);

      // Calculate current monthly costs
      const monthlyEmployer = filteredEnrollments.reduce((sum: number, e: any) => sum + (e.employer_contribution || 0), 0);
      const monthlyEmployee = filteredEnrollments.reduce((sum: number, e: any) => sum + (e.employee_contribution || 0), 0);
      const enrollmentCount = filteredEnrollments.length;

      // Group by category
      const costsByCategory: Record<string, { employer: number; employee: number }> = {};
      filteredEnrollments.forEach((e: any) => {
        const category = e.plan?.category?.name || "Other";
        if (!costsByCategory[category]) {
          costsByCategory[category] = { employer: 0, employee: 0 };
        }
        costsByCategory[category].employer += e.employer_contribution || 0;
        costsByCategory[category].employee += e.employee_contribution || 0;
      });

      setCurrentCosts({
        monthlyEmployer,
        monthlyEmployee,
        monthlyTotal: monthlyEmployer + monthlyEmployee,
        enrollmentCount,
        costsByCategory
      });
    } catch (error) {
      console.error("Error fetching costs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProjections = () => {
    if (!currentCosts.monthlyTotal) return;

    const projectionData = [];
    let employerCost = currentCosts.monthlyEmployer;
    let employeeCost = currentCosts.monthlyEmployee;
    const monthlyGrowth = growthRate / 100 / 12;
    const monthlyInflation = inflationRate / 100 / 12;

    for (let i = 0; i <= projectionMonths; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      
      projectionData.push({
        month: month.toLocaleString('default', { month: 'short', year: '2-digit' }),
        employer: Math.round(employerCost),
        employee: Math.round(employeeCost),
        total: Math.round(employerCost + employeeCost)
      });

      // Apply growth and inflation
      employerCost *= (1 + monthlyGrowth + monthlyInflation);
      employeeCost *= (1 + monthlyGrowth + monthlyInflation);
    }

    setProjections(projectionData);
  };

  const chartConfig = {
    employer: { label: "Employer", color: "hsl(var(--primary))" },
    employee: { label: "Employee", color: "hsl(var(--secondary))" },
    total: { label: "Total", color: "hsl(var(--accent))" },
  };

  const totalProjectedCost = projections.reduce((sum, p) => sum + p.total, 0);
  const totalProjectedEmployer = projections.reduce((sum, p) => sum + p.employer, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Benefits", href: "/benefits" },
          { label: "Cost Projections" }
        ]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cost Projections</h1>
            <p className="text-muted-foreground">Forecast benefit costs over time</p>
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

        {/* Current Costs Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Employer Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(currentCosts.monthlyEmployer || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Employee Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(currentCosts.monthlyEmployee || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentCosts.enrollmentCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projected Total ({projectionMonths}mo)</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalProjectedCost.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Projection Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Projection Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="months">Projection Period (months)</Label>
                <Input
                  id="months"
                  type="number"
                  min={1}
                  max={60}
                  value={projectionMonths}
                  onChange={(e) => setProjectionMonths(parseInt(e.target.value) || 12)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="growth">Enrollment Growth Rate (%/year)</Label>
                <Input
                  id="growth"
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={growthRate}
                  onChange={(e) => setGrowthRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inflation">Cost Inflation Rate (%/year)</Label>
                <Input
                  id="inflation"
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={inflationRate}
                  onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projection Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Projection Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <LineChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="employer" stroke="var(--color-employer)" strokeWidth={2} name="Employer" />
                <Line type="monotone" dataKey="employee" stroke="var(--color-employee)" strokeWidth={2} name="Employee" />
                <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} strokeDasharray="5 5" name="Total" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Cost by Category */}
        {currentCosts.costsByCategory && Object.keys(currentCosts.costsByCategory).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Monthly Costs by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={Object.entries(currentCosts.costsByCategory).map(([name, values]: [string, any]) => ({
                  name,
                  employer: values.employer,
                  employee: values.employee
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="employer" fill="var(--color-employer)" name="Employer" />
                  <Bar dataKey="employee" fill="var(--color-employee)" name="Employee" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

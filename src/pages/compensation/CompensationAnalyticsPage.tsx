import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, DollarSign, TrendingUp, Users, Award, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function CompensationAnalyticsPage() {
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["comp-analytics-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compensation_history")
        .select("*")
        .order("effective_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: bonusAwards = [], isLoading: bonusLoading } = useQuery({
    queryKey: ["comp-analytics-bonus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bonus_awards")
        .select("*")
        .eq("status", "paid");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: compaRatios = [], isLoading: compaLoading } = useQuery({
    queryKey: ["comp-analytics-compa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compa_ratio_snapshots")
        .select("*")
        .order("snapshot_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Process data for charts
  const changeTypeData = history.reduce((acc: any[], h: any) => {
    const existing = acc.find(a => a.name === h.change_type);
    if (existing) {
      existing.count += 1;
      existing.total += h.change_amount || 0;
    } else {
      acc.push({ name: h.change_type, count: 1, total: h.change_amount || 0 });
    }
    return acc;
  }, []);

  const bonusTypeData = bonusAwards.reduce((acc: any[], b: any) => {
    const existing = acc.find(a => a.name === b.bonus_type);
    if (existing) {
      existing.value += b.final_amount || 0;
    } else {
      acc.push({ name: b.bonus_type, value: b.final_amount || 0 });
    }
    return acc;
  }, []);

  const compaDistribution = [
    { name: "Below 0.8", value: compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio < 0.8).length },
    { name: "0.8-0.95", value: compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio >= 0.8 && c.compa_ratio < 0.95).length },
    { name: "0.95-1.05", value: compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio >= 0.95 && c.compa_ratio <= 1.05).length },
    { name: "1.05-1.2", value: compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio > 1.05 && c.compa_ratio <= 1.2).length },
    { name: "Above 1.2", value: compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio > 1.2).length },
  ];

  const totalSalaryChanges = history.reduce((sum: number, h: any) => sum + (h.change_amount || 0), 0);
  const totalBonusPaid = bonusAwards.reduce((sum: number, b: any) => sum + (b.final_amount || 0), 0);
  const avgCompaRatio = compaRatios.length > 0 
    ? compaRatios.reduce((sum: number, c: any) => sum + (c.compa_ratio || 0), 0) / compaRatios.length 
    : 0;

  const isLoading = historyLoading || bonusLoading || compaLoading;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Compensation Analytics</h1>
              <p className="text-muted-foreground">Insights and trends across compensation</p>
            </div>
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Salary Changes</p>
                  {isLoading ? <Skeleton className="h-8 w-24" /> : (
                    <p className="text-2xl font-bold">${totalSalaryChanges.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bonuses Paid</p>
                  {isLoading ? <Skeleton className="h-8 w-24" /> : (
                    <p className="text-2xl font-bold">${totalBonusPaid.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-sky-500/10 p-3">
                  <Target className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Compa-Ratio</p>
                  {isLoading ? <Skeleton className="h-8 w-24" /> : (
                    <p className="text-2xl font-bold">{avgCompaRatio.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salary Changes</p>
                  {isLoading ? <Skeleton className="h-8 w-24" /> : (
                    <p className="text-2xl font-bold">{history.length}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Salary Changes by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={changeTypeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bonus Distribution by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bonusTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bonusTypeData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Compa-Ratio Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={compaDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

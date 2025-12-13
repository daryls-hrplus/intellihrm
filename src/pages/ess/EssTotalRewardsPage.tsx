import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Receipt, ChevronRight, DollarSign, Gift, Shield, Gem } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function EssTotalRewardsPage() {
  const { user } = useAuth();

  const { data: statement, isLoading } = useQuery({
    queryKey: ["my-total-rewards-statement", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("total_rewards_statements")
        .select("*")
        .eq("employee_id", user.id)
        .eq("is_published", true)
        .order("statement_year", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const chartData = statement ? [
    { name: "Base Salary", value: statement.base_salary || 0 },
    { name: "Bonus", value: statement.bonus_earned || 0 },
    { name: "Benefits", value: statement.benefits_value || 0 },
    { name: "Equity", value: statement.equity_value || 0 },
    { name: "Other", value: statement.other_compensation || 0 },
  ].filter(item => item.value > 0) : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/ess" className="hover:text-foreground transition-colors">Employee Self Service</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/ess/compensation" className="hover:text-foreground transition-colors">My Compensation</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Total Rewards</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Total Rewards Statement</h1>
            <p className="text-muted-foreground">
              {statement ? `Statement for ${statement.statement_year}` : "Your total compensation summary"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        ) : !statement ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No total rewards statement available
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Base Salary</p>
                      <p className="text-2xl font-bold">${statement.base_salary?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-emerald-500/10 p-3">
                      <Gift className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bonus Earned</p>
                      <p className="text-2xl font-bold">${statement.bonus_earned?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-sky-500/10 p-3">
                      <Shield className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Benefits Value</p>
                      <p className="text-2xl font-bold">${statement.benefits_value?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-violet-500/10 p-3">
                      <Gem className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Equity Value</p>
                      <p className="text-2xl font-bold">${statement.equity_value?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Compensation Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      No data to display
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Total Compensation Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Total Compensation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-primary/5 p-6 text-center">
                    <p className="text-sm text-muted-foreground">Total Annual Compensation</p>
                    <p className="text-4xl font-bold text-primary">
                      ${statement.total_compensation?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Salary</span>
                      <span>${statement.base_salary?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bonus Earned</span>
                      <span>${statement.bonus_earned?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Benefits Value</span>
                      <span>${statement.benefits_value?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Equity Value</span>
                      <span>${statement.equity_value?.toLocaleString() || 0}</span>
                    </div>
                    {statement.other_compensation > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Other</span>
                        <span>${statement.other_compensation?.toLocaleString() || 0}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

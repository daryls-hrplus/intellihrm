import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Target, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "@/hooks/useLanguage";

export default function MssCompaRatioPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const { data: directReports = [], isLoading } = useQuery({
    queryKey: ["mss-team-for-compa", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.rpc("get_manager_direct_reports", {
        p_manager_id: user.id,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: compaRatios = [], isLoading: compaLoading } = useQuery({
    queryKey: ["mss-team-compa-details", directReports],
    queryFn: async () => {
      if (directReports.length === 0) return [];
      const employeeIds = directReports.map((r: any) => r.employee_id);
      const { data, error } = await supabase
        .from("compa_ratio_snapshots")
        .select("*")
        .in("employee_id", employeeIds)
        .order("snapshot_date", { ascending: false });
      if (error) throw error;
      
      const latestByEmployee = new Map();
      (data || []).forEach((snap: any) => {
        if (!latestByEmployee.has(snap.employee_id)) {
          latestByEmployee.set(snap.employee_id, snap);
        }
      });
      return Array.from(latestByEmployee.values());
    },
    enabled: directReports.length > 0,
  });

  const getReportName = (employeeId: string) => {
    const report = directReports.find((r: any) => r.employee_id === employeeId);
    return report?.employee_name || "Unknown";
  };

  const chartData = compaRatios.map((c: any) => ({
    name: getReportName(c.employee_id).split(" ")[0],
    ratio: c.compa_ratio || 0,
  })).sort((a, b) => a.ratio - b.ratio);

  const distribution = [
    { name: "Below 0.8", value: compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio < 0.8).length },
    { name: "0.8-0.95", value: compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio >= 0.8 && c.compa_ratio < 0.95).length },
    { name: "0.95-1.05", value: compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio >= 0.95 && c.compa_ratio <= 1.05).length },
    { name: "1.05-1.2", value: compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio > 1.05 && c.compa_ratio <= 1.2).length },
    { name: "Above 1.2", value: compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio > 1.2).length },
  ];

  const getCompaRatioBadge = (ratio: number | null) => {
    if (!ratio) return <Badge className="bg-muted text-muted-foreground">{t("mss.teamCompensation.na")}</Badge>;
    if (ratio < 0.8) return <Badge className="bg-red-500/10 text-red-600">{t("mss.teamCompaRatio.belowRange")}</Badge>;
    if (ratio < 0.95) return <Badge className="bg-amber-500/10 text-amber-600">{t("mss.teamCompaRatio.belowMidpoint")}</Badge>;
    if (ratio <= 1.05) return <Badge className="bg-emerald-500/10 text-emerald-600">{t("mss.teamCompaRatio.atMidpoint")}</Badge>;
    if (ratio <= 1.2) return <Badge className="bg-sky-500/10 text-sky-600">{t("mss.teamCompaRatio.aboveMidpoint")}</Badge>;
    return <Badge className="bg-violet-500/10 text-violet-600">{t("mss.teamCompaRatio.aboveRange")}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/mss" className="hover:text-foreground transition-colors">{t("mss.title")}</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/mss/compensation" className="hover:text-foreground transition-colors">{t("mss.teamCompensation.title")}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{t("mss.teamCompaRatio.breadcrumb")}</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("mss.teamCompaRatio.title")}</h1>
            <p className="text-muted-foreground">{t("mss.teamCompaRatio.subtitle")}</p>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("mss.teamCompaRatio.teamDistribution")}</CardTitle>
            </CardHeader>
            <CardContent>
              {compaLoading ? (
                <Skeleton className="h-[250px]" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("mss.teamCompaRatio.individualCompaRatios")}</CardTitle>
            </CardHeader>
            <CardContent>
              {compaLoading ? (
                <Skeleton className="h-[250px]" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 1.5]} className="text-xs" />
                    <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                    <Tooltip />
                    <Bar dataKey="ratio" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("mss.teamCompaRatio.teamDetails")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || compaLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : compaRatios.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {t("mss.teamCompaRatio.noDataAvailable")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("mss.teamCompensation.employee")}</TableHead>
                    <TableHead className="text-right">{t("mss.teamCompaRatio.currentSalary")}</TableHead>
                    <TableHead className="text-right">{t("mss.teamCompaRatio.gradeMidpoint")}</TableHead>
                    <TableHead className="text-right">{t("mss.teamCompensation.compaRatio")}</TableHead>
                    <TableHead>{t("mss.teamCompaRatio.rangePosition")}</TableHead>
                    <TableHead>{t("mss.teamCompensation.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compaRatios.map((compa: any) => (
                    <TableRow key={compa.id}>
                      <TableCell className="font-medium">{getReportName(compa.employee_id)}</TableCell>
                      <TableCell className="text-right">${compa.current_salary?.toLocaleString() || "N/A"}</TableCell>
                      <TableCell className="text-right">${compa.grade_midpoint?.toLocaleString() || "N/A"}</TableCell>
                      <TableCell className="text-right font-semibold">{compa.compa_ratio?.toFixed(2) || "N/A"}</TableCell>
                      <TableCell>
                        {compa.range_penetration ? (
                          <div className="flex items-center gap-2">
                            <Progress value={Math.min(compa.range_penetration, 100)} className="w-16 h-2" />
                            <span className="text-sm text-muted-foreground">{compa.range_penetration}%</span>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{getCompaRatioBadge(compa.compa_ratio)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

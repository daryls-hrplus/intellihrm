import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Users, Target, TrendingUp, ChevronRight, Gem, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/hooks/useLanguage";

export default function MssCompensationPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const { data: directReports = [], isLoading } = useQuery({
    queryKey: ["mss-team-compensation", user?.id],
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
    queryKey: ["mss-team-compa-ratios", directReports],
    queryFn: async () => {
      if (directReports.length === 0) return [];
      const employeeIds = directReports.map((r: any) => r.employee_id);
      const { data, error } = await supabase
        .from("compa_ratio_snapshots")
        .select("*")
        .in("employee_id", employeeIds)
        .order("snapshot_date", { ascending: false });
      if (error) throw error;
      
      // Get latest snapshot per employee
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

  const avgCompaRatio = compaRatios.length > 0
    ? compaRatios.reduce((sum: number, c: any) => sum + (c.compa_ratio || 0), 0) / compaRatios.length
    : 0;

  const belowMidpoint = compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio < 0.95).length;
  const aboveMidpoint = compaRatios.filter((c: any) => c.compa_ratio && c.compa_ratio > 1.05).length;

  const getReportWithCompa = (employeeId: string) => {
    return compaRatios.find((c: any) => c.employee_id === employeeId);
  };

  const compensationLinks = [
    {
      title: t("mss.teamCompensation.teamCompaRatio"),
      description: t("mss.teamCompensation.analyzeTeamPay"),
      href: "/mss/compensation/compa-ratio",
      icon: Target,
      color: "bg-pink-500/10 text-pink-600",
    },
    {
      title: t("mss.teamCompensation.teamEquity"),
      description: t("mss.teamCompensation.viewTeamEquity"),
      href: "/mss/compensation/equity",
      icon: Gem,
      color: "bg-violet-500/10 text-violet-600",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/mss" className="hover:text-foreground transition-colors">{t("mss.title")}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{t("mss.teamCompensation.breadcrumb")}</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("mss.teamCompensation.title")}</h1>
            <p className="text-muted-foreground">{t("mss.teamCompensation.subtitle")}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("mss.teamCompensation.directReports")}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{directReports.length}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("mss.teamCompensation.avgCompaRatio")}</p>
                  {compaLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
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
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("mss.teamCompensation.belowMidpoint")}</p>
                  {compaLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{belowMidpoint}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-sky-500/10 p-3">
                  <TrendingUp className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("mss.teamCompensation.aboveMidpoint")}</p>
                  {compaLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{aboveMidpoint}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {compensationLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.href}
                to={link.href}
                className="group rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex rounded-lg p-3 ${link.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold group-hover:text-primary">{link.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
              </NavLink>
            );
          })}
        </div>

        {/* Team Overview Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("mss.teamCompensation.teamOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : directReports.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {t("mss.teamCompensation.noDirectReports")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("mss.teamCompensation.employee")}</TableHead>
                    <TableHead>{t("mss.teamCompensation.position")}</TableHead>
                    <TableHead className="text-right">{t("mss.teamCompensation.salary")}</TableHead>
                    <TableHead className="text-right">{t("mss.teamCompensation.compaRatio")}</TableHead>
                    <TableHead>{t("mss.teamCompensation.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {directReports.map((report: any) => {
                    const compaData = getReportWithCompa(report.employee_id);
                    return (
                      <TableRow key={report.employee_id}>
                        <TableCell className="font-medium">{report.employee_name}</TableCell>
                        <TableCell>{report.position_title || "-"}</TableCell>
                        <TableCell className="text-right">
                          ${compaData?.current_salary?.toLocaleString() || t("mss.teamCompensation.na")}
                        </TableCell>
                        <TableCell className="text-right">
                          {compaData?.compa_ratio?.toFixed(2) || t("mss.teamCompensation.na")}
                        </TableCell>
                        <TableCell>
                          {compaData?.compa_ratio ? (
                            <Badge className={
                              compaData.compa_ratio < 0.95
                                ? "bg-amber-500/10 text-amber-600"
                                : compaData.compa_ratio <= 1.05
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-sky-500/10 text-sky-600"
                            }>
                              {compaData.compa_ratio < 0.95
                                ? t("mss.teamCompensation.below")
                                : compaData.compa_ratio <= 1.05
                                ? t("mss.teamCompensation.atTarget")
                                : t("mss.teamCompensation.above")}
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground">{t("mss.teamCompensation.na")}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

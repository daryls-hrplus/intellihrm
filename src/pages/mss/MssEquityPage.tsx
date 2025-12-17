import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Gem, ChevronRight, TrendingUp, Users, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";

export default function MssEquityPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { data: directReports = [], isLoading } = useQuery({
    queryKey: ["mss-team-for-equity", user?.id],
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

  const { data: equityGrants = [], isLoading: equityLoading } = useQuery({
    queryKey: ["mss-team-equity", directReports],
    queryFn: async () => {
      if (directReports.length === 0) return [];
      const employeeIds = directReports.map((r: any) => r.employee_id);
      const { data, error } = await supabase
        .from("equity_grants")
        .select("*, plan:equity_plans(name, plan_type, current_price)")
        .in("employee_id", employeeIds)
        .order("grant_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: directReports.length > 0,
  });

  const getReportName = (employeeId: string) => {
    const report = directReports.find((r: any) => r.employee_id === employeeId);
    return report?.employee_name || "Unknown";
  };

  const totalGranted = equityGrants.reduce((sum: number, g: any) => sum + (g.shares_granted || 0), 0);
  const totalVested = equityGrants.reduce((sum: number, g: any) => sum + (g.shares_vested || 0), 0);
  const activeGrants = equityGrants.filter((g: any) => g.status === "active").length;
  const uniqueHolders = new Set(equityGrants.map((g: any) => g.employee_id)).size;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-500/10 text-emerald-600",
      fully_vested: "bg-sky-500/10 text-sky-600",
      exercised: "bg-violet-500/10 text-violet-600",
      forfeited: "bg-red-500/10 text-red-600",
      expired: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[status] || "bg-muted"}>{status.replace("_", " ")}</Badge>;
  };

  const getVestingProgress = (vested: number, granted: number) => {
    if (!granted || granted === 0) return 0;
    return Math.min((vested / granted) * 100, 100);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/mss" className="hover:text-foreground transition-colors">{t('mss.title')}</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/mss/compensation" className="hover:text-foreground transition-colors">{t('mss.modules.compensation')}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{t('mss.teamEquity.title')}</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Gem className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('mss.teamEquity.title')}</h1>
            <p className="text-muted-foreground">{t('mss.teamEquity.subtitle')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('mss.teamEquity.equityHolders')}</p>
                  {equityLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{uniqueHolders}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <Gem className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mss.teamEquity.totalGranted')}</p>
                  {equityLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold">{totalGranted.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">{t('mss.teamEquity.totalVested')}</p>
                  {equityLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold">{totalVested.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-violet-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mss.teamEquity.activeGrants')}</p>
                  {equityLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{activeGrants}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grants Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('mss.teamEquity.teamEquityGrants')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || equityLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : equityGrants.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {t('mss.teamEquity.noEquityGrants')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('mss.teamEquity.employee')}</TableHead>
                    <TableHead>{t('mss.teamEquity.plan')}</TableHead>
                    <TableHead>{t('mss.teamEquity.grantDate')}</TableHead>
                    <TableHead className="text-right">{t('mss.teamEquity.granted')}</TableHead>
                    <TableHead className="text-right">{t('mss.teamEquity.vested')}</TableHead>
                    <TableHead>{t('mss.teamEquity.progress')}</TableHead>
                    <TableHead>{t('mss.teamEquity.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equityGrants.map((grant: any) => (
                    <TableRow key={grant.id}>
                      <TableCell className="font-medium">{getReportName(grant.employee_id)}</TableCell>
                      <TableCell>{grant.plan?.name || "-"}</TableCell>
                      <TableCell>{formatDateForDisplay(grant.grant_date, "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">{grant.shares_granted?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{(grant.shares_vested || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={getVestingProgress(grant.shares_vested, grant.shares_granted)} 
                            className="w-16 h-2"
                          />
                          <span className="text-sm text-muted-foreground">
                            {Math.round(getVestingProgress(grant.shares_vested, grant.shares_granted))}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(grant.status)}</TableCell>
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

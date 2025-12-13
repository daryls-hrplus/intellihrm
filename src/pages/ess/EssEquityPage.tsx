import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Gem, ChevronRight, TrendingUp, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EssEquityPage() {
  const { user } = useAuth();

  const { data: grants = [], isLoading } = useQuery({
    queryKey: ["my-equity-grants-full", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("equity_grants")
        .select("*, plan:equity_plans(name, plan_type, current_price)")
        .eq("employee_id", user.id)
        .order("grant_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const totalGranted = grants.reduce((sum: number, g: any) => sum + (g.shares_granted || 0), 0);
  const totalVested = grants.reduce((sum: number, g: any) => sum + (g.shares_vested || 0), 0);
  const totalValue = grants.reduce((sum: number, g: any) => {
    const price = g.plan?.current_price || 0;
    return sum + (g.shares_vested || 0) * price;
  }, 0);

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
          <Link to="/ess" className="hover:text-foreground transition-colors">Employee Self Service</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/ess/compensation" className="hover:text-foreground transition-colors">My Compensation</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">My Equity</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Gem className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Equity</h1>
            <p className="text-muted-foreground">View your equity grants and vesting schedule</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Gem className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Granted</p>
                  {isLoading ? (
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
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Vested</p>
                  {isLoading ? (
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
                <div className="rounded-lg bg-sky-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Value</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Equity Grants</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : grants.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No equity grants found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Grant Date</TableHead>
                    <TableHead className="text-right">Granted</TableHead>
                    <TableHead className="text-right">Vested</TableHead>
                    <TableHead>Vesting Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.map((grant: any) => (
                    <TableRow key={grant.id}>
                      <TableCell className="font-medium">{grant.plan?.name || "-"}</TableCell>
                      <TableCell>{format(new Date(grant.grant_date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">{grant.shares_granted?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{(grant.shares_vested || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={getVestingProgress(grant.shares_vested, grant.shares_granted)} 
                            className="w-20 h-2"
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

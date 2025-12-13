import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Target, ChevronRight, TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EssCompaRatioPage() {
  const { user } = useAuth();

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ["my-compa-ratio-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("compa_ratio_snapshots")
        .select("*")
        .eq("employee_id", user.id)
        .order("snapshot_date", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const latestSnapshot = snapshots[0];

  const getCompaRatioBadge = (ratio: number | null) => {
    if (!ratio) return <Badge className="bg-muted text-muted-foreground">N/A</Badge>;
    if (ratio < 0.8) return <Badge className="bg-red-500/10 text-red-600">Below Range</Badge>;
    if (ratio < 0.95) return <Badge className="bg-amber-500/10 text-amber-600">Below Midpoint</Badge>;
    if (ratio <= 1.05) return <Badge className="bg-emerald-500/10 text-emerald-600">At Midpoint</Badge>;
    if (ratio <= 1.2) return <Badge className="bg-sky-500/10 text-sky-600">Above Midpoint</Badge>;
    return <Badge className="bg-violet-500/10 text-violet-600">Above Range</Badge>;
  };

  const getCompaRatioIcon = (ratio: number | null) => {
    if (!ratio) return <Minus className="h-5 w-5 text-muted-foreground" />;
    if (ratio < 1) return <TrendingDown className="h-5 w-5 text-amber-500" />;
    if (ratio > 1) return <TrendingUp className="h-5 w-5 text-emerald-500" />;
    return <Minus className="h-5 w-5 text-sky-500" />;
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
          <span className="text-foreground font-medium">Compa-Ratio</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Compa-Ratio</h1>
            <p className="text-muted-foreground">Your position relative to the salary grade midpoint</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        ) : !latestSnapshot ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No compa-ratio data available
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Current Position Card */}
            <Card>
              <CardHeader>
                <CardTitle>Current Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Compa-Ratio Visual */}
                  <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 p-8">
                    <div className="flex items-center gap-2 mb-4">
                      {getCompaRatioIcon(latestSnapshot.compa_ratio)}
                      <span className="text-5xl font-bold">
                        {latestSnapshot.compa_ratio?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                    {getCompaRatioBadge(latestSnapshot.compa_ratio)}
                    <p className="mt-4 text-sm text-muted-foreground text-center">
                      {latestSnapshot.compa_ratio && latestSnapshot.compa_ratio < 1
                        ? "Your salary is below the midpoint for your grade"
                        : latestSnapshot.compa_ratio && latestSnapshot.compa_ratio > 1
                        ? "Your salary is above the midpoint for your grade"
                        : "Your salary is at the midpoint for your grade"}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">Current Salary</span>
                      </div>
                      <span className="font-semibold">${latestSnapshot.current_salary?.toLocaleString() || "N/A"}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-500/10 p-2">
                          <Target className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-sm text-muted-foreground">Grade Midpoint</span>
                      </div>
                      <span className="font-semibold">${latestSnapshot.grade_midpoint?.toLocaleString() || "N/A"}</span>
                    </div>

                    {latestSnapshot.range_penetration && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Range Penetration</span>
                          <span className="text-sm font-medium">{latestSnapshot.range_penetration}%</span>
                        </div>
                        <Progress value={Math.min(latestSnapshot.range_penetration, 100)} className="h-2" />
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>Min</span>
                          <span>Mid</span>
                          <span>Max</span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Last updated: {format(new Date(latestSnapshot.snapshot_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Understanding Compa-Ratio */}
            <Card>
              <CardHeader>
                <CardTitle>Understanding Compa-Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 rounded-lg border">
                    <Badge className="bg-red-500/10 text-red-600 mb-2">Below 0.80</Badge>
                    <p className="text-sm text-muted-foreground">
                      Significantly below range. May indicate new to role or performance concerns.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <Badge className="bg-amber-500/10 text-amber-600 mb-2">0.80 - 0.95</Badge>
                    <p className="text-sm text-muted-foreground">
                      Below midpoint. Typical for employees still developing in their role.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <Badge className="bg-emerald-500/10 text-emerald-600 mb-2">0.95 - 1.05</Badge>
                    <p className="text-sm text-muted-foreground">
                      At midpoint. Indicates full competence in the role.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <Badge className="bg-sky-500/10 text-sky-600 mb-2">Above 1.05</Badge>
                    <p className="text-sm text-muted-foreground">
                      Above midpoint. Reflects high performance or extensive experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}

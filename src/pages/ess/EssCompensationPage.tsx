import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, TrendingUp, Target, Gem, ChevronRight, History, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NavLink } from "@/components/NavLink";

export default function EssCompensationPage() {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile-compensation", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*, company:companies(name)")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: latestCompaRatio, isLoading: compaLoading } = useQuery({
    queryKey: ["my-compa-ratio", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("compa_ratio_snapshots")
        .select("*")
        .eq("employee_id", user.id)
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: equityGrants = [], isLoading: equityLoading } = useQuery({
    queryKey: ["my-equity-grants", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("equity_grants")
        .select("*, plan:equity_plans(name)")
        .eq("employee_id", user.id)
        .eq("status", "active");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: totalRewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ["my-total-rewards", user?.id],
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

  const totalVestedShares = equityGrants.reduce((sum: number, g: any) => sum + (g.shares_vested || 0), 0);
  const isLoading = profileLoading || compaLoading || equityLoading || rewardsLoading;

  const compensationLinks = [
    {
      title: "Compensation History",
      description: "View your salary changes over time",
      href: "/ess/compensation/history",
      icon: History,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Total Rewards Statement",
      description: "View your total compensation summary",
      href: "/ess/compensation/total-rewards",
      icon: Receipt,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "My Equity",
      description: "View your equity grants and vesting",
      href: "/ess/compensation/equity",
      icon: Gem,
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      title: "Compa-Ratio",
      description: "View your position relative to grade",
      href: "/ess/compensation/compa-ratio",
      icon: Target,
      color: "bg-pink-500/10 text-pink-600",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/ess" className="hover:text-foreground transition-colors">Employee Self Service</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">My Compensation</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Compensation</h1>
          <p className="text-muted-foreground">View your compensation details and history</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Salary</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold">
                      ${latestCompaRatio?.current_salary?.toLocaleString() || "N/A"}
                    </p>
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
                  <p className="text-sm text-muted-foreground">Compa-Ratio</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {latestCompaRatio?.compa_ratio?.toFixed(2) || "N/A"}
                      </p>
                      {latestCompaRatio?.compa_ratio && (
                        <Badge className={
                          latestCompaRatio.compa_ratio < 0.95 
                            ? "bg-amber-500/10 text-amber-600"
                            : latestCompaRatio.compa_ratio <= 1.05
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-sky-500/10 text-sky-600"
                        }>
                          {latestCompaRatio.compa_ratio < 0.95 
                            ? "Below"
                            : latestCompaRatio.compa_ratio <= 1.05
                            ? "At Target"
                            : "Above"}
                        </Badge>
                      )}
                    </div>
                  )}
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
                  <p className="text-sm text-muted-foreground">Vested Shares</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold">{totalVestedShares.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">Total Compensation</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold">
                      ${totalRewards?.total_compensation?.toLocaleString() || "N/A"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </AppLayout>
  );
}

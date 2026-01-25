import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Gem, Plus, TrendingUp, Users, FileText, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTabState } from "@/hooks/useTabState";

export default function EquityManagementPage() {
  const { t } = useTranslation();
  const { company, isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");

  // Use tab state for persistent filters
  const [tabState, setTabState] = useTabState({
    defaultState: {
      companyFilter: isAdminOrHR ? "all" : (company?.id || ""),
      activeTab: "plans",
    },
    syncToUrl: ["companyFilter"],
  });

  const { companyFilter, activeTab } = tabState;

  // Initialize with user's company if needed
  useEffect(() => {
    if (company?.id && !isAdminOrHR && !companyFilter) {
      setTabState({ companyFilter: company.id });
    }
  }, [company?.id, isAdminOrHR, companyFilter]);

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["equity-plans", companyFilter],
    queryFn: async () => {
      let query = supabase
        .from("equity_plans")
        .select("*")
        .order("created_at", { ascending: false });
      if (companyFilter !== "all") {
        query = query.eq("company_id", companyFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: grants = [], isLoading: grantsLoading } = useQuery({
    queryKey: ["equity-grants", companyFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equity_grants")
        .select(`
          *,
          employee:profiles!equity_grants_employee_id_fkey(full_name),
          plan:equity_plans(name)
        `)
        .order("grant_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const getPlanTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      stock_option: "bg-primary/10 text-primary",
      rsu: "bg-violet-500/10 text-violet-600",
      espp: "bg-emerald-500/10 text-emerald-600",
      phantom_stock: "bg-amber-500/10 text-amber-600",
      sar: "bg-sky-500/10 text-sky-600",
    };
    return <Badge className={colors[type] || "bg-muted"}>{type.replace("_", " ").toUpperCase()}</Badge>;
  };

  const getGrantStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-500/10 text-emerald-600",
      fully_vested: "bg-sky-500/10 text-sky-600",
      exercised: "bg-violet-500/10 text-violet-600",
      forfeited: "bg-red-500/10 text-red-600",
      expired: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[status] || "bg-muted"}>{status.replace("_", " ")}</Badge>;
  };

  const totalSharesGranted = grants.reduce((sum: number, g: any) => sum + (g.shares_granted || 0), 0);
  const totalSharesVested = grants.reduce((sum: number, g: any) => sum + (g.shares_vested || 0), 0);

  const breadcrumbItems = [
    { label: t("compensation.title"), href: "/compensation" },
    { label: t("compensation.equity.title") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Gem className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("compensation.equity.title")}</h1>
              <p className="text-muted-foreground">{t("compensation.equity.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={companyFilter} onValueChange={(v) => setTabState({ companyFilter: v })}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {companies.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {activeTab === "plans" ? t("compensation.equity.newPlan") : t("compensation.equity.newGrant")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.equity.activePlans")}</p>
                  <p className="text-2xl font-bold">{plans.filter((p: any) => p.is_active).length}</p>
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
                  <p className="text-sm text-muted-foreground">{t("compensation.equity.sharesGranted")}</p>
                  <p className="text-2xl font-bold">{totalSharesGranted.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-sky-500/10 p-3">
                  <Gem className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.equity.sharesVested")}</p>
                  <p className="text-2xl font-bold">{totalSharesVested.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">{t("compensation.equity.grantRecipients")}</p>
                  <p className="text-2xl font-bold">{new Set(grants.map((g: any) => g.employee_id)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setTabState({ activeTab: v })}>
          <TabsList>
            <TabsTrigger value="plans">{t("compensation.equity.equityPlans")}</TabsTrigger>
            <TabsTrigger value="grants">{t("compensation.equity.grants")}</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <Card>
              <CardContent className="pt-6">
                {plansLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("compensation.equity.planName")}</TableHead>
                        <TableHead>{t("compensation.equity.type")}</TableHead>
                        <TableHead className="text-right">{t("compensation.equity.authorized")}</TableHead>
                        <TableHead className="text-right">{t("compensation.equity.available")}</TableHead>
                        <TableHead className="text-right">{t("compensation.equity.currentPrice")}</TableHead>
                        <TableHead>{t("compensation.equity.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            {t("compensation.equity.noPlans")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        plans.map((plan: any) => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>{getPlanTypeBadge(plan.plan_type)}</TableCell>
                            <TableCell className="text-right">{plan.total_shares_authorized?.toLocaleString() || "-"}</TableCell>
                            <TableCell className="text-right">{plan.shares_available?.toLocaleString() || "-"}</TableCell>
                            <TableCell className="text-right">${plan.current_price || "-"}</TableCell>
                            <TableCell>
                              <Badge className={plan.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted"}>
                                {plan.is_active ? t("compensation.statuses.active") : t("compensation.statuses.inactive")}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grants">
            <Card>
              <CardContent className="pt-6">
                {grantsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("compensation.equity.employee")}</TableHead>
                        <TableHead>{t("compensation.equity.plan")}</TableHead>
                        <TableHead>{t("compensation.equity.grantDate")}</TableHead>
                        <TableHead className="text-right">{t("compensation.equity.granted")}</TableHead>
                        <TableHead className="text-right">{t("compensation.equity.vested")}</TableHead>
                        <TableHead>{t("compensation.equity.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            {t("compensation.equity.noGrants")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        grants.map((grant: any) => (
                          <TableRow key={grant.id}>
                            <TableCell className="font-medium">{grant.employee?.full_name}</TableCell>
                            <TableCell>{grant.plan?.name}</TableCell>
                            <TableCell>{formatDateForDisplay(grant.grant_date)}</TableCell>
                            <TableCell className="text-right">{grant.shares_granted?.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{grant.shares_vested?.toLocaleString() || 0}</TableCell>
                            <TableCell>{getGrantStatusBadge(grant.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

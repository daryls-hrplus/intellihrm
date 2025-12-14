import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PiggyBank, Plus, DollarSign, TrendingUp, Wallet, ChevronRight, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompensationBudgetsPage() {
  const { t } = useTranslation();
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());
  const [companyFilter, setCompanyFilter] = useState<string>("all");

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

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["compensation-budgets", yearFilter, companyFilter],
    queryFn: async () => {
      let query = supabase
        .from("compensation_budgets")
        .select(`
          *,
          department:departments(name)
        `)
        .order("fiscal_year", { ascending: false });

      if (yearFilter !== "all") {
        query = query.eq("fiscal_year", parseInt(yearFilter));
      }
      if (companyFilter !== "all") {
        query = query.eq("company_id", companyFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      approved: "bg-sky-500/10 text-sky-600",
      active: "bg-emerald-500/10 text-emerald-600",
      closed: "bg-slate-500/10 text-slate-600",
    };
    return <Badge className={colors[status] || "bg-muted"}>{status}</Badge>;
  };

  const getBudgetTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      salary: "bg-primary/10 text-primary",
      merit: "bg-violet-500/10 text-violet-600",
      bonus: "bg-amber-500/10 text-amber-600",
      equity: "bg-emerald-500/10 text-emerald-600",
      total: "bg-indigo-500/10 text-indigo-600",
    };
    return <Badge className={colors[type] || "bg-muted"}>{type}</Badge>;
  };

  const getSpentPercentage = (spent: number | null, planned: number | null) => {
    if (!planned || planned === 0) return 0;
    return Math.min(((spent || 0) / planned) * 100, 100);
  };

  const totalPlanned = budgets.reduce((sum: number, b: any) => sum + (b.planned_amount || 0), 0);
  const totalSpent = budgets.reduce((sum: number, b: any) => sum + (b.spent_amount || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/compensation" className="hover:text-foreground transition-colors">{t("compensation.title")}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{t("compensation.budgets.title")}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <PiggyBank className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("compensation.budgets.title")}</h1>
              <p className="text-muted-foreground">{t("compensation.budgets.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {companies.map((company: any) => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("compensation.budgets.newBudget")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.budgets.totalPlanned")}</p>
                  <p className="text-2xl font-bold">${totalPlanned.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <Wallet className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.budgets.totalSpent")}</p>
                  <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">{t("compensation.budgets.remaining")}</p>
                  <p className="text-2xl font-bold">${(totalPlanned - totalSpent).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <PiggyBank className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.budgets.utilization")}</p>
                  <p className="text-2xl font-bold">
                    {totalPlanned > 0 ? Math.round((totalSpent / totalPlanned) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("compensation.budgets.title")}</CardTitle>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t("compensation.budgets.year")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("compensation.budgets.allYears")}</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("compensation.budgets.department")}</TableHead>
                    <TableHead>{t("compensation.budgets.type")}</TableHead>
                    <TableHead>{t("compensation.budgets.year")}</TableHead>
                    <TableHead className="text-right">{t("compensation.budgets.planned")}</TableHead>
                    <TableHead className="text-right">{t("compensation.budgets.spent")}</TableHead>
                    <TableHead>{t("compensation.budgets.utilization")}</TableHead>
                    <TableHead>{t("compensation.budgets.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {t("compensation.budgets.noBudgets")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    budgets.map((budget: any) => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.department?.name || t("compensation.budgets.companyWide")}</TableCell>
                        <TableCell>{getBudgetTypeBadge(budget.budget_type)}</TableCell>
                        <TableCell>{budget.fiscal_year}</TableCell>
                        <TableCell className="text-right">${budget.planned_amount?.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${(budget.spent_amount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={getSpentPercentage(budget.spent_amount, budget.planned_amount)} 
                              className="w-16 h-2"
                            />
                            <span className="text-sm text-muted-foreground">
                              {Math.round(getSpentPercentage(budget.spent_amount, budget.planned_amount))}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(budget.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

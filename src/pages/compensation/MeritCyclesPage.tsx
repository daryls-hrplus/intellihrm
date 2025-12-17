import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Award, Plus, Calendar, DollarSign, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface Company {
  id: string;
  name: string;
}

export default function MeritCyclesPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase.from("companies").select("id, name").eq("is_active", true).order("name");
      if (data && data.length > 0) {
        setCompanies(data);
        setSelectedCompanyId(data[0].id);
      }
    };
    fetchCompanies();
  }, []);

  const { data: cycles = [], isLoading } = useQuery({
    queryKey: ["merit-cycles", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("merit_cycles")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("fiscal_year", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      planning: "bg-sky-500/10 text-sky-600",
      in_progress: "bg-amber-500/10 text-amber-600",
      completed: "bg-emerald-500/10 text-emerald-600",
      cancelled: "bg-red-500/10 text-red-600",
    };
    return <Badge className={colors[status] || "bg-muted"}>{status.replace("_", " ")}</Badge>;
  };

  const getBudgetProgress = (allocated: number | null, total: number | null) => {
    if (!total || total === 0) return 0;
    return Math.min(((allocated || 0) / total) * 100, 100);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("compensation.title"), href: "/compensation" },
            { label: t("compensation.meritCycles.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("compensation.meritCycles.title")}</h1>
              <p className="text-muted-foreground">{t("compensation.meritCycles.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("common.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("compensation.meritCycles.newCycle")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.meritCycles.activeCycles")}</p>
                  <p className="text-2xl font-bold">
                    {cycles.filter((c: any) => c.status === "in_progress").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.meritCycles.totalBudget")}</p>
                  <p className="text-2xl font-bold">
                    ${cycles.reduce((sum: number, c: any) => sum + (c.total_budget || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-sky-500/10 p-3">
                  <Users className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.meritCycles.completed")}</p>
                  <p className="text-2xl font-bold">
                    {cycles.filter((c: any) => c.status === "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("compensation.meritCycles.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("compensation.meritCycles.cycleName")}</TableHead>
                    <TableHead>{t("compensation.meritCycles.year")}</TableHead>
                    <TableHead>{t("compensation.meritCycles.period")}</TableHead>
                    <TableHead>{t("compensation.meritCycles.budget")}</TableHead>
                    <TableHead>{t("compensation.meritCycles.allocation")}</TableHead>
                    <TableHead>{t("compensation.meritCycles.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {t("compensation.meritCycles.noCycles")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    cycles.map((cycle: any) => (
                      <TableRow key={cycle.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{cycle.name}</TableCell>
                        <TableCell>{cycle.fiscal_year}</TableCell>
                        <TableCell>
                          {formatDateForDisplay(cycle.start_date, "MMM d")} - {formatDateForDisplay(cycle.end_date, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>${(cycle.total_budget || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={getBudgetProgress(cycle.allocated_budget, cycle.total_budget)} 
                              className="w-20 h-2"
                            />
                            <span className="text-sm text-muted-foreground">
                              {Math.round(getBudgetProgress(cycle.allocated_budget, cycle.total_budget))}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(cycle.status)}</TableCell>
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

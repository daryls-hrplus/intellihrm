import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Scale, Plus, AlertTriangle, CheckCircle, Info, ChevronRight, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PayEquityPage() {
  const { t } = useTranslation();
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

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["pay-equity-analyses", companyFilter],
    queryFn: async () => {
      let query = supabase
        .from("pay_equity_analyses")
        .select("*")
        .order("analysis_date", { ascending: false });
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
      in_progress: "bg-amber-500/10 text-amber-600",
      completed: "bg-emerald-500/10 text-emerald-600",
      archived: "bg-slate-500/10 text-slate-600",
    };
    return <Badge className={colors[status] || "bg-muted"}>{status.replace("_", " ")}</Badge>;
  };

  const getAnalysisTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      gender: "bg-pink-500/10 text-pink-600",
      ethnicity: "bg-violet-500/10 text-violet-600",
      age: "bg-amber-500/10 text-amber-600",
      disability: "bg-sky-500/10 text-sky-600",
      comprehensive: "bg-indigo-500/10 text-indigo-600",
    };
    return <Badge className={colors[type] || "bg-muted"}>{type}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/compensation" className="hover:text-foreground transition-colors">{t("compensation.title")}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{t("compensation.payEquity.title")}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("compensation.payEquity.title")}</h1>
              <p className="text-muted-foreground">{t("compensation.payEquity.subtitle")}</p>
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
              {t("compensation.payEquity.newAnalysis")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.payEquity.totalAnalyses")}</p>
                  <p className="text-2xl font-bold">{analyses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.payEquity.completed")}</p>
                  <p className="text-2xl font-bold">{analyses.filter((a: any) => a.status === "completed").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.payEquity.inProgress")}</p>
                  <p className="text-2xl font-bold">{analyses.filter((a: any) => a.status === "in_progress").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("compensation.payEquity.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("compensation.payEquity.analysisName")}</TableHead>
                    <TableHead>{t("compensation.payEquity.type")}</TableHead>
                    <TableHead>{t("compensation.payEquity.date")}</TableHead>
                    <TableHead>{t("compensation.payEquity.methodology")}</TableHead>
                    <TableHead>{t("compensation.payEquity.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {t("compensation.payEquity.noAnalyses")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    analyses.map((analysis: any) => (
                      <TableRow key={analysis.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{analysis.name}</TableCell>
                        <TableCell>{getAnalysisTypeBadge(analysis.analysis_type)}</TableCell>
                        <TableCell>{formatDateForDisplay(analysis.analysis_date, "MMM d, yyyy")}</TableCell>
                        <TableCell>{analysis.methodology || "-"}</TableCell>
                        <TableCell>{getStatusBadge(analysis.status)}</TableCell>
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

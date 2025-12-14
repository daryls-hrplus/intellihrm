import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BarChart3, Plus, Database, TrendingUp, Globe, ChevronRight, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketBenchmarkingPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("sources");
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

  const { data: sources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ["market-data-sources", companyFilter],
    queryFn: async () => {
      let query = supabase
        .from("market_data_sources")
        .select("*")
        .order("survey_year", { ascending: false });
      if (companyFilter !== "all") {
        query = query.eq("company_id", companyFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: rates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ["market-data-rates", companyFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_data_rates")
        .select(`
          *,
          source:market_data_sources(name, survey_year)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/compensation" className="hover:text-foreground transition-colors">{t("compensation.title")}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{t("compensation.marketBenchmarking.title")}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("compensation.marketBenchmarking.title")}</h1>
              <p className="text-muted-foreground">{t("compensation.marketBenchmarking.subtitle")}</p>
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
              {activeTab === "sources" ? t("compensation.marketBenchmarking.addSource") : t("compensation.marketBenchmarking.addMarketData")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.marketBenchmarking.dataSources")}</p>
                  <p className="text-2xl font-bold">{sources.length}</p>
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
                  <p className="text-sm text-muted-foreground">{t("compensation.marketBenchmarking.marketRates")}</p>
                  <p className="text-2xl font-bold">{rates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-sky-500/10 p-3">
                  <Globe className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.marketBenchmarking.activeSources")}</p>
                  <p className="text-2xl font-bold">{sources.filter((s: any) => s.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sources">{t("compensation.marketBenchmarking.dataSources")}</TabsTrigger>
            <TabsTrigger value="rates">{t("compensation.marketBenchmarking.marketRates")}</TabsTrigger>
          </TabsList>

          <TabsContent value="sources">
            <Card>
              <CardContent className="pt-6">
                {sourcesLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("compensation.marketBenchmarking.sourceName")}</TableHead>
                        <TableHead>{t("compensation.marketBenchmarking.provider")}</TableHead>
                        <TableHead>{t("compensation.marketBenchmarking.surveyYear")}</TableHead>
                        <TableHead>{t("compensation.marketBenchmarking.effectiveDate")}</TableHead>
                        <TableHead>{t("compensation.marketBenchmarking.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sources.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            {t("compensation.marketBenchmarking.noSources")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        sources.map((source: any) => (
                          <TableRow key={source.id}>
                            <TableCell className="font-medium">{source.name}</TableCell>
                            <TableCell>{source.provider || "-"}</TableCell>
                            <TableCell>{source.survey_year}</TableCell>
                            <TableCell>{format(new Date(source.effective_date), "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              <Badge className={source.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted"}>
                                {source.is_active ? t("compensation.statuses.active") : t("compensation.statuses.inactive")}
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

          <TabsContent value="rates">
            <Card>
              <CardContent className="pt-6">
                {ratesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("compensation.marketBenchmarking.jobTitle")}</TableHead>
                        <TableHead>{t("compensation.marketBenchmarking.location")}</TableHead>
                        <TableHead className="text-right">{t("compensation.marketBenchmarking.p25")}</TableHead>
                        <TableHead className="text-right">{t("compensation.marketBenchmarking.p50")}</TableHead>
                        <TableHead className="text-right">{t("compensation.marketBenchmarking.p75")}</TableHead>
                        <TableHead>{t("compensation.marketBenchmarking.source")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            {t("compensation.marketBenchmarking.noRates")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        rates.map((rate: any) => (
                          <TableRow key={rate.id}>
                            <TableCell className="font-medium">{rate.job_title || "-"}</TableCell>
                            <TableCell>{rate.location || t("common.all")}</TableCell>
                            <TableCell className="text-right">
                              {rate.percentile_25 ? `$${rate.percentile_25.toLocaleString()}` : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {rate.percentile_50 ? `$${rate.percentile_50.toLocaleString()}` : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {rate.percentile_75 ? `$${rate.percentile_75.toLocaleString()}` : "-"}
                            </TableCell>
                            <TableCell>{rate.source?.name} ({rate.source?.survey_year})</TableCell>
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

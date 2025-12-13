import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BarChart3, Plus, Database, TrendingUp, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketBenchmarkingPage() {
  const [activeTab, setActiveTab] = useState("sources");

  const { data: sources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ["market-data-sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_data_sources")
        .select("*")
        .order("survey_year", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: rates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ["market-data-rates"],
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Market Benchmarking</h1>
              <p className="text-muted-foreground">Compare compensation to market data</p>
            </div>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "sources" ? "Add Source" : "Add Market Data"}
          </Button>
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
                  <p className="text-sm text-muted-foreground">Data Sources</p>
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
                  <p className="text-sm text-muted-foreground">Market Rates</p>
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
                  <p className="text-sm text-muted-foreground">Active Sources</p>
                  <p className="text-2xl font-bold">{sources.filter((s: any) => s.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="rates">Market Rates</TabsTrigger>
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
                        <TableHead>Source Name</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Survey Year</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sources.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No data sources found
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
                                {source.is_active ? "Active" : "Inactive"}
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
                        <TableHead>Job Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">P25</TableHead>
                        <TableHead className="text-right">P50</TableHead>
                        <TableHead className="text-right">P75</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No market rates found
                          </TableCell>
                        </TableRow>
                      ) : (
                        rates.map((rate: any) => (
                          <TableRow key={rate.id}>
                            <TableCell className="font-medium">{rate.job_title || "-"}</TableCell>
                            <TableCell>{rate.location || "All Locations"}</TableCell>
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

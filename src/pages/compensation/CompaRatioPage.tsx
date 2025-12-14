import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Target, RefreshCw, Search, TrendingUp, TrendingDown, Minus, ChevronRight, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function CompaRatioPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-filter"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id, name").order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ["compa-ratio-snapshots", companyFilter],
    queryFn: async () => {
      let query = supabase
        .from("compa_ratio_snapshots")
        .select(`*, employee:profiles!compa_ratio_snapshots_employee_id_fkey(full_name)`)
        .order("snapshot_date", { ascending: false });
      if (companyFilter !== "all") {
        query = query.eq("company_id", companyFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const filteredSnapshots = snapshots.filter((s: any) =>
    s.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompaRatioBadge = (ratio: number | null) => {
    if (!ratio) return <Badge className="bg-muted text-muted-foreground">N/A</Badge>;
    if (ratio < 0.8) return <Badge className="bg-red-500/10 text-red-600">{t("compensation.compaRatio.statuses.belowRange")}</Badge>;
    if (ratio < 0.95) return <Badge className="bg-amber-500/10 text-amber-600">{t("compensation.compaRatio.statuses.belowMidpoint")}</Badge>;
    if (ratio <= 1.05) return <Badge className="bg-emerald-500/10 text-emerald-600">{t("compensation.compaRatio.statuses.atMidpoint")}</Badge>;
    if (ratio <= 1.2) return <Badge className="bg-sky-500/10 text-sky-600">{t("compensation.compaRatio.statuses.aboveMidpoint")}</Badge>;
    return <Badge className="bg-violet-500/10 text-violet-600">{t("compensation.compaRatio.statuses.aboveRange")}</Badge>;
  };

  const getCompaRatioIcon = (ratio: number | null) => {
    if (!ratio) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (ratio < 1) return <TrendingDown className="h-4 w-4 text-amber-500" />;
    if (ratio > 1) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    return <Minus className="h-4 w-4 text-sky-500" />;
  };

  const avgCompaRatio = snapshots.length > 0 
    ? snapshots.reduce((sum: number, s: any) => sum + (s.compa_ratio || 0), 0) / snapshots.length 
    : 0;

  const belowMidpoint = snapshots.filter((s: any) => s.compa_ratio && s.compa_ratio < 1).length;
  const atMidpoint = snapshots.filter((s: any) => s.compa_ratio && s.compa_ratio >= 0.95 && s.compa_ratio <= 1.05).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/compensation" className="hover:text-foreground transition-colors">{t("compensation.title")}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{t("compensation.compaRatio.title")}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("compensation.compaRatio.title")}</h1>
              <p className="text-muted-foreground">{t("compensation.compaRatio.subtitle")}</p>
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
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("compensation.compaRatio.recalculateAll")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3"><Target className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.compaRatio.avgCompaRatio")}</p>
                  <p className="text-2xl font-bold">{avgCompaRatio.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-3"><TrendingDown className="h-5 w-5 text-amber-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.compaRatio.belowMidpoint")}</p>
                  <p className="text-2xl font-bold">{belowMidpoint}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3"><Minus className="h-5 w-5 text-emerald-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.compaRatio.atMidpoint")}</p>
                  <p className="text-2xl font-bold">{atMidpoint}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-sky-500/10 p-3"><TrendingUp className="h-5 w-5 text-sky-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("compensation.compaRatio.aboveMidpoint")}</p>
                  <p className="text-2xl font-bold">{snapshots.filter((s: any) => s.compa_ratio && s.compa_ratio > 1.05).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder={t("compensation.compaRatio.searchEmployee")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("compensation.compaRatio.employee")}</TableHead>
                    <TableHead>{t("compensation.compaRatio.snapshotDate")}</TableHead>
                    <TableHead className="text-right">{t("compensation.compaRatio.currentSalary")}</TableHead>
                    <TableHead className="text-right">{t("compensation.compaRatio.gradeMidpoint")}</TableHead>
                    <TableHead className="text-right">{t("compensation.compaRatio.compaRatio")}</TableHead>
                    <TableHead>{t("compensation.compaRatio.rangePosition")}</TableHead>
                    <TableHead>{t("compensation.compaRatio.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSnapshots.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{t("compensation.compaRatio.noData")}</TableCell></TableRow>
                  ) : (
                    filteredSnapshots.map((snapshot: any) => (
                      <TableRow key={snapshot.id}>
                        <TableCell className="font-medium">{snapshot.employee?.full_name}</TableCell>
                        <TableCell>{format(new Date(snapshot.snapshot_date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">${snapshot.current_salary?.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${snapshot.grade_midpoint?.toLocaleString() || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">{getCompaRatioIcon(snapshot.compa_ratio)}{snapshot.compa_ratio?.toFixed(2) || "-"}</div>
                        </TableCell>
                        <TableCell>
                          {snapshot.range_penetration ? (
                            <div className="flex items-center gap-2"><Progress value={Math.min(snapshot.range_penetration, 100)} className="w-16 h-2" /><span className="text-sm text-muted-foreground">{snapshot.range_penetration}%</span></div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>{getCompaRatioBadge(snapshot.compa_ratio)}</TableCell>
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

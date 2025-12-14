import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, AlertTriangle, Eye, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function HSENearMissPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: nearMisses, isLoading } = useQuery({
    queryKey: ["hse-near-misses", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_near_misses").select("*").order("report_date", { ascending: false });
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const filteredNearMisses = nearMisses?.filter(nm =>
    nm.report_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nm.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      reported: "bg-amber-500/10 text-amber-600",
      investigating: "bg-sky-500/10 text-sky-600",
      resolved: "bg-emerald-500/10 text-emerald-600",
      closed: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[status || "reported"] || "bg-muted text-muted-foreground"}>{status || "Reported"}</Badge>;
  };

  const stats = [
    { label: t("hseModule.nearMiss.stats.totalReports"), value: nearMisses?.length || 0, icon: AlertTriangle, color: "bg-primary/10 text-primary" },
    { label: t("hseModule.nearMiss.stats.investigating"), value: nearMisses?.filter(nm => nm.status === "investigating").length || 0, icon: Eye, color: "bg-sky-500/10 text-sky-600" },
    { label: t("hseModule.nearMiss.stats.resolved"), value: nearMisses?.filter(nm => nm.status === "resolved").length || 0, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
    { label: t("hseModule.nearMiss.stats.pending"), value: nearMisses?.filter(nm => nm.status === "reported").length || 0, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("hseModule.nearMiss.title")}</h1>
            <p className="text-muted-foreground">{t("hseModule.nearMiss.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter selectedCompanyId={selectedCompanyId} onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} />
            <DepartmentFilter companyId={selectedCompanyId} selectedDepartmentId={selectedDepartmentId} onDepartmentChange={setSelectedDepartmentId} />
            <Button><Plus className="h-4 w-4 mr-2" />{t("hseModule.nearMiss.reportNearMiss")}</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold">{stat.value}</p>}
                    </div>
                    <div className={`rounded-lg p-3 ${stat.color}`}><Icon className="h-5 w-5" /></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("hseModule.nearMiss.reportsList")}</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("hseModule.nearMiss.searchReports")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hseModule.nearMiss.reportNumber")}</TableHead>
                  <TableHead>{t("hseModule.nearMiss.reportDate")}</TableHead>
                  <TableHead>{t("hseModule.nearMiss.category")}</TableHead>
                  <TableHead>{t("common.description")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ) : !filteredNearMisses?.length ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("hseModule.nearMiss.noReports")}</TableCell></TableRow>
                ) : (
                  filteredNearMisses?.map((nm) => (
                    <TableRow key={nm.id}>
                      <TableCell className="font-medium">{nm.report_number}</TableCell>
                      <TableCell>{nm.report_date ? format(new Date(nm.report_date), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{nm.hazard_type || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{nm.description || "-"}</TableCell>
                      <TableCell>{getStatusBadge(nm.status)}</TableCell>
                      <TableCell><Button variant="ghost" size="sm">{t("common.view")}</Button></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

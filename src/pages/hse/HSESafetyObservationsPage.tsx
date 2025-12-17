import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
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
import { Plus, Search, Eye, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { formatDateForDisplay } from "@/utils/dateUtils";

export default function HSESafetyObservationsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: observations, isLoading } = useQuery({
    queryKey: ["hse-safety-observations", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_safety_observations").select("*").order("observation_date", { ascending: false });
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const filteredObservations = observations?.filter(obs =>
    obs.observation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obs.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type: string | null) => {
    const colors: Record<string, string> = {
      safe: "bg-emerald-500/10 text-emerald-600",
      unsafe: "bg-destructive/10 text-destructive",
      positive: "bg-sky-500/10 text-sky-600",
    };
    return <Badge className={colors[type || "safe"] || "bg-muted text-muted-foreground"}>{type || "Safe"}</Badge>;
  };

  const stats = [
    { label: t("hseModule.safetyObservations.stats.totalObservations"), value: observations?.length || 0, icon: Eye, color: "bg-primary/10 text-primary" },
    { label: t("hseModule.safetyObservations.stats.safeObservations"), value: observations?.filter(o => o.observation_type === "safe").length || 0, icon: ThumbsUp, color: "bg-emerald-500/10 text-emerald-600" },
    { label: t("hseModule.safetyObservations.stats.unsafeObservations"), value: observations?.filter(o => o.observation_type === "unsafe").length || 0, icon: ThumbsDown, color: "bg-destructive/10 text-destructive" },
    { label: t("hseModule.safetyObservations.stats.actionRequired"), value: observations?.filter(o => o.corrective_action).length || 0, icon: AlertTriangle, color: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.safetyObservations.title") },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("hseModule.safetyObservations.title")}</h1>
            <p className="text-muted-foreground">{t("hseModule.safetyObservations.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter selectedCompanyId={selectedCompanyId} onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} />
            <DepartmentFilter companyId={selectedCompanyId} selectedDepartmentId={selectedDepartmentId} onDepartmentChange={setSelectedDepartmentId} />
            <Button><Plus className="h-4 w-4 mr-2" />{t("hseModule.safetyObservations.addObservation")}</Button>
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
              <CardTitle>{t("hseModule.safetyObservations.observationsList")}</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("hseModule.safetyObservations.searchObservations")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hseModule.safetyObservations.observationNumber")}</TableHead>
                  <TableHead>{t("hseModule.safetyObservations.observationDate")}</TableHead>
                  <TableHead>{t("hseModule.safetyObservations.observationType")}</TableHead>
                  <TableHead>{t("hseModule.safetyObservations.category")}</TableHead>
                  <TableHead>{t("common.description")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ) : !filteredObservations?.length ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("hseModule.safetyObservations.noObservations")}</TableCell></TableRow>
                ) : (
                  filteredObservations?.map((obs) => (
                    <TableRow key={obs.id}>
                      <TableCell className="font-medium">{obs.observation_number}</TableCell>
                      <TableCell>{obs.observation_date ? formatDateForDisplay(obs.observation_date, "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{getTypeBadge(obs.observation_type)}</TableCell>
                      <TableCell>{obs.category || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{obs.description || "-"}</TableCell>
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

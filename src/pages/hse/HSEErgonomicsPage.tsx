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
import { Plus, Search, Monitor, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function HSEErgonomicsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["hse-ergonomic-assessments", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_ergonomic_assessments").select("*").order("assessment_date", { ascending: false });
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const filteredAssessments = assessments?.filter(a =>
    a.assessment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.workstation_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskBadge = (level: string | null) => {
    const colors: Record<string, string> = {
      low: "bg-emerald-500/10 text-emerald-600",
      medium: "bg-amber-500/10 text-amber-600",
      high: "bg-orange-500/10 text-orange-600",
      critical: "bg-destructive/10 text-destructive",
    };
    return <Badge className={colors[level || "low"] || "bg-muted text-muted-foreground"}>{level || "Low"}</Badge>;
  };

  const getStatusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      scheduled: "bg-amber-500/10 text-amber-600",
      in_progress: "bg-sky-500/10 text-sky-600",
      completed: "bg-emerald-500/10 text-emerald-600",
      follow_up: "bg-purple-500/10 text-purple-600",
    };
    return <Badge className={colors[status || "scheduled"] || "bg-muted text-muted-foreground"}>{status || "Scheduled"}</Badge>;
  };

  const stats = [
    { label: t("hseModule.ergonomics.stats.totalAssessments"), value: assessments?.length || 0, icon: Monitor, color: "bg-primary/10 text-primary" },
    { label: t("hseModule.ergonomics.stats.highRisk"), value: assessments?.filter(a => a.overall_risk_level === "high" || a.overall_risk_level === "critical").length || 0, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
    { label: t("hseModule.ergonomics.stats.completed"), value: assessments?.filter(a => a.status === "completed").length || 0, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
    { label: t("hseModule.ergonomics.stats.pendingFollowUp"), value: assessments?.filter(a => a.status === "follow_up").length || 0, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.ergonomics.title") },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("hseModule.ergonomics.title")}</h1>
            <p className="text-muted-foreground">{t("hseModule.ergonomics.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter selectedCompanyId={selectedCompanyId} onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} />
            <DepartmentFilter companyId={selectedCompanyId} selectedDepartmentId={selectedDepartmentId} onDepartmentChange={setSelectedDepartmentId} />
            <Button><Plus className="h-4 w-4 mr-2" />{t("hseModule.ergonomics.newAssessment")}</Button>
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
              <CardTitle>{t("hseModule.ergonomics.assessmentsList")}</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("hseModule.ergonomics.searchAssessments")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hseModule.ergonomics.assessmentNumber")}</TableHead>
                  <TableHead>{t("hseModule.ergonomics.assessmentDate")}</TableHead>
                  <TableHead>{t("hseModule.ergonomics.workstationType")}</TableHead>
                  <TableHead>{t("hseModule.ergonomics.riskLevel")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ) : !filteredAssessments?.length ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("hseModule.ergonomics.noAssessments")}</TableCell></TableRow>
                ) : (
                  filteredAssessments?.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.assessment_number}</TableCell>
                      <TableCell>{assessment.assessment_date ? format(new Date(assessment.assessment_date), "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{assessment.workstation_type || "-"}</TableCell>
                      <TableCell>{getRiskBadge(assessment.overall_risk_level)}</TableCell>
                      <TableCell>{getStatusBadge(assessment.status)}</TableCell>
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

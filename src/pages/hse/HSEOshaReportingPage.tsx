import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  FileText,
  CheckCircle,
  Clock,
  Send
} from "lucide-react";
import { useState } from "react";

export default function HSEOshaReportingPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const { data: logs, isLoading } = useQuery({
    queryKey: ["hse-osha-logs", selectedCompanyId, yearFilter],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_osha_logs")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const filteredLogs = logs?.filter((log) => {
    const matchesSearch = log.establishment_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">-</Badge>;
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      pending_review: "default",
      submitted: "outline",
      accepted: "outline",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const stats = [
    { 
      label: t("hseModule.oshaReporting.stats.totalLogs"), 
      value: logs?.length || 0, 
      icon: FileText, 
      color: "bg-primary/10 text-primary" 
    },
    { 
      label: t("hseModule.oshaReporting.stats.pendingSubmission"), 
      value: logs?.filter(l => l.status === "draft").length || 0, 
      icon: Clock, 
      color: "bg-amber-500/10 text-amber-600" 
    },
    { 
      label: t("hseModule.oshaReporting.stats.submitted"), 
      value: logs?.filter(l => l.status === "submitted").length || 0, 
      icon: Send, 
      color: "bg-emerald-500/10 text-emerald-600" 
    },
    { 
      label: t("hseModule.oshaReporting.stats.recordableIncidents"), 
      value: logs?.reduce((sum, l) => sum + (l.total_deaths || 0), 0) || 0, 
      icon: FileSpreadsheet, 
      color: "bg-sky-500/10 text-sky-600" 
    },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.oshaReporting.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("hseModule.oshaReporting.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("hseModule.oshaReporting.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} 
            />
            <DepartmentFilter
              companyId={selectedCompanyId}
              selectedDepartmentId={selectedDepartmentId}
              onDepartmentChange={setSelectedDepartmentId}
            />
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("hseModule.oshaReporting.createLog")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      {isLoading ? (
                        <Skeleton className="h-9 w-16 mt-1" />
                      ) : (
                        <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("hseModule.oshaReporting.searchLogs")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t("hseModule.oshaReporting.year")} />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("common.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("hseModule.common.allStatus")}</SelectItem>
              <SelectItem value="draft">{t("hseModule.oshaReporting.statusOptions.draft")}</SelectItem>
              <SelectItem value="pending_review">{t("hseModule.oshaReporting.statusOptions.pending_review")}</SelectItem>
              <SelectItem value="submitted">{t("hseModule.oshaReporting.statusOptions.submitted")}</SelectItem>
              <SelectItem value="accepted">{t("hseModule.oshaReporting.statusOptions.accepted")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("hseModule.oshaReporting.logsList")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hseModule.oshaReporting.reportNumber")}</TableHead>
                  <TableHead>{t("hseModule.oshaReporting.year")}</TableHead>
                  <TableHead>{t("hseModule.oshaReporting.formType")}</TableHead>
                  <TableHead>{t("hseModule.oshaReporting.recordableCases")}</TableHead>
                  <TableHead>{t("hseModule.oshaReporting.daysAway")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredLogs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("hseModule.oshaReporting.noLogs")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.establishment_name}</TableCell>
                      <TableCell>{log.reporting_year}</TableCell>
                      <TableCell>{log.form_300a_completed ? "300A" : "-"}</TableCell>
                      <TableCell>{log.total_injuries || 0}</TableCell>
                      <TableCell>{log.total_days_away || 0}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">{t("common.view")}</Button>
                      </TableCell>
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

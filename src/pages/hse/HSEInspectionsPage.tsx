import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";

export default function HSEInspectionsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("inspections");

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["hse-inspection-templates", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_inspection_templates")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const { data: findings, isLoading: findingsLoading } = useQuery({
    queryKey: ["hse-inspection-findings", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_inspection_findings")
        .select("*, hse_inspection_templates!inner(company_id)")
        .eq("hse_inspection_templates.company_id", selectedCompanyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const filteredFindings = findings?.filter((finding) => {
    const matchesSearch = finding.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finding.finding_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || finding.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "destructive",
      in_progress: "default",
      resolved: "secondary",
      verified: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{t(`hseModule.inspections.statusOptions.${status}`)}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-emerald-500/10 text-emerald-600",
      medium: "bg-amber-500/10 text-amber-600",
      high: "bg-orange-500/10 text-orange-600",
      critical: "bg-destructive/10 text-destructive",
    };
    return <Badge className={colors[severity] || "bg-muted text-muted-foreground"}>{t(`hseModule.inspections.severityLevels.${severity}`)}</Badge>;
  };

  const stats = [
    { 
      label: t("hseModule.inspections.stats.totalInspections"), 
      value: findings?.length || 0, 
      icon: ClipboardCheck, 
      color: "bg-primary/10 text-primary" 
    },
    { 
      label: t("hseModule.inspections.stats.openFindings"), 
      value: findings?.filter(f => f.status === "open").length || 0, 
      icon: AlertTriangle, 
      color: "bg-destructive/10 text-destructive" 
    },
    { 
      label: t("hseModule.inspections.stats.inProgress"), 
      value: findings?.filter(f => f.status === "in_progress").length || 0, 
      icon: Clock, 
      color: "bg-amber-500/10 text-amber-600" 
    },
    { 
      label: t("hseModule.inspections.stats.resolved"), 
      value: findings?.filter(f => f.status === "resolved" || f.status === "verified").length || 0, 
      icon: CheckCircle, 
      color: "bg-emerald-500/10 text-emerald-600" 
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.inspections.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <ClipboardCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("hseModule.inspections.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("hseModule.inspections.subtitle")}
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
                      <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="inspections">{t("hseModule.inspections.tabs.findings")}</TabsTrigger>
              <TabsTrigger value="templates">{t("hseModule.inspections.tabs.templates")}</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "inspections" ? t("hseModule.inspections.newInspection") : t("hseModule.inspections.addTemplate")}
            </Button>
          </div>

          <TabsContent value="inspections" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("hseModule.inspections.searchFindings")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("common.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("hseModule.common.allStatus")}</SelectItem>
                  <SelectItem value="open">{t("hseModule.inspections.statusOptions.open")}</SelectItem>
                  <SelectItem value="in_progress">{t("hseModule.inspections.statusOptions.in_progress")}</SelectItem>
                  <SelectItem value="resolved">{t("hseModule.inspections.statusOptions.resolved")}</SelectItem>
                  <SelectItem value="verified">{t("hseModule.inspections.statusOptions.verified")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.inspections.findingsList")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hseModule.inspections.inspectionNumber")}</TableHead>
                      <TableHead>{t("hseModule.inspections.inspectionDate")}</TableHead>
                      <TableHead>{t("common.location")}</TableHead>
                      <TableHead>{t("hseModule.inspections.findingDescription")}</TableHead>
                      <TableHead>{t("hseModule.inspections.severity")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {findingsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredFindings?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.inspections.noFindings")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFindings?.map((finding) => (
                        <TableRow key={finding.id}>
                          <TableCell className="font-medium">{finding.finding_type}</TableCell>
                          <TableCell>{finding.due_date ? formatDateForDisplay(finding.due_date) : "-"}</TableCell>
                          <TableCell>{finding.location || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate">{finding.description || "-"}</TableCell>
                          <TableCell>{getSeverityBadge(finding.severity)}</TableCell>
                          <TableCell>{getStatusBadge(finding.status)}</TableCell>
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
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.inspections.inspectionTemplates")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("common.category")}</TableHead>
                      <TableHead>{t("hseModule.inspections.frequency")}</TableHead>
                      <TableHead>{t("common.description")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templatesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : templates?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.inspections.noTemplates")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      templates?.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.category || "-"}</TableCell>
                          <TableCell>{template.frequency || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate">{template.description || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={template.is_active ? "default" : "secondary"}>
                              {template.is_active ? t("common.active") : t("common.inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">{t("common.edit")}</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

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
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { 
  Lock, 
  Plus, 
  Search, 
  FileText,
  CheckCircle,
  Clock,
  Unlock
} from "lucide-react";
import { useState } from "react";

export default function HSELotoPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("applications");

  const { data: procedures, isLoading: proceduresLoading } = useQuery({
    queryKey: ["hse-loto-procedures", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_loto_procedures")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("equipment_name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["hse-loto-applications", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_loto_applications")
        .select("*, hse_loto_procedures(equipment_name)")
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const filteredApplications = applications?.filter((app) => {
    const matchesSearch = app.application_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">-</Badge>;
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      requested: "secondary",
      locked_out: "default",
      work_in_progress: "default",
      verification_pending: "default",
      released: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{t(`hseModule.loto.statusOptions.${status}`)}</Badge>;
  };

  const stats = [
    { 
      label: t("hseModule.loto.stats.totalProcedures"), 
      value: procedures?.length || 0, 
      icon: FileText, 
      color: "bg-primary/10 text-primary" 
    },
    { 
      label: t("hseModule.loto.stats.activeLocouts"), 
      value: applications?.filter(a => a.status === "locked_out" || a.status === "work_in_progress").length || 0, 
      icon: Lock, 
      color: "bg-destructive/10 text-destructive" 
    },
    { 
      label: t("hseModule.loto.stats.pendingVerification"), 
      value: applications?.filter(a => a.status === "verification_pending").length || 0, 
      icon: Clock, 
      color: "bg-amber-500/10 text-amber-600" 
    },
    { 
      label: t("hseModule.loto.stats.completedToday"), 
      value: applications?.filter(a => 
        a.status === "released" && 
        a.released_at && 
        new Date(a.released_at).toDateString() === new Date().toDateString()
      ).length || 0, 
      icon: Unlock, 
      color: "bg-emerald-500/10 text-emerald-600" 
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.loto.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <Lock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("hseModule.loto.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("hseModule.loto.subtitle")}
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
              <TabsTrigger value="applications">{t("hseModule.loto.tabs.applications")}</TabsTrigger>
              <TabsTrigger value="procedures">{t("hseModule.loto.tabs.procedures")}</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "applications" ? t("hseModule.loto.newApplication") : t("hseModule.loto.addProcedure")}
            </Button>
          </div>

          <TabsContent value="applications" className="mt-4 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("hseModule.loto.searchApplications")}
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
                  <SelectItem value="requested">{t("hseModule.loto.statusOptions.requested")}</SelectItem>
                  <SelectItem value="locked_out">{t("hseModule.loto.statusOptions.locked_out")}</SelectItem>
                  <SelectItem value="work_in_progress">{t("hseModule.loto.statusOptions.work_in_progress")}</SelectItem>
                  <SelectItem value="verification_pending">{t("hseModule.loto.statusOptions.verification_pending")}</SelectItem>
                  <SelectItem value="released">{t("hseModule.loto.statusOptions.released")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.loto.applicationsList")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hseModule.loto.applicationNumber")}</TableHead>
                      <TableHead>{t("hseModule.loto.equipment")}</TableHead>
                      <TableHead>{t("hseModule.loto.workDescription")}</TableHead>
                      <TableHead>{t("hseModule.loto.lockedAt")}</TableHead>
                      <TableHead>{t("hseModule.loto.releasedAt")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applicationsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredApplications?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.loto.noApplications")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications?.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.application_number}</TableCell>
                          <TableCell>{(app.hse_loto_procedures as any)?.equipment_name || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate">{app.work_description || "-"}</TableCell>
                          <TableCell>{app.applied_at ? format(new Date(app.applied_at), "MMM d, HH:mm") : "-"}</TableCell>
                          <TableCell>{app.released_by ? format(new Date(app.updated_at), "MMM d, HH:mm") : "-"}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
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

          <TabsContent value="procedures" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.loto.proceduresList")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hseModule.loto.equipmentName")}</TableHead>
                      <TableHead>{t("hseModule.loto.equipmentId")}</TableHead>
                      <TableHead>{t("common.location")}</TableHead>
                      <TableHead>{t("hseModule.loto.energySources")}</TableHead>
                      <TableHead>{t("hseModule.loto.lockoutPoints")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proceduresLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : procedures?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.loto.noProcedures")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      procedures?.map((proc) => (
                        <TableRow key={proc.id}>
                          <TableCell className="font-medium">{proc.equipment_name}</TableCell>
                          <TableCell>{proc.equipment_id || "-"}</TableCell>
                          <TableCell>{proc.location || "-"}</TableCell>
                          <TableCell>{(proc.energy_sources as any[])?.length || 0}</TableCell>
                          <TableCell>{(proc.verification_steps as any[])?.length || 0}</TableCell>
                          <TableCell>
                            <Badge variant={proc.is_active ? "default" : "secondary"}>
                              {proc.is_active ? t("common.active") : t("common.inactive")}
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

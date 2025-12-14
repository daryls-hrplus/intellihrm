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
import { 
  ClipboardSignature, 
  Plus, 
  Search, 
  FileCheck,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState } from "react";

export default function HSEPermitToWorkPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("permits");

  const { data: permitTypes, isLoading: typesLoading } = useQuery({
    queryKey: ["hse-permit-types", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_permit_types")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const { data: permits, isLoading: permitsLoading } = useQuery({
    queryKey: ["hse-work-permits", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_work_permits")
        .select("*, hse_permit_types(name)")
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const filteredPermits = permits?.filter((permit) => {
    const matchesSearch = permit.permit_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permit.work_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || permit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">-</Badge>;
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      pending_approval: "default",
      approved: "outline",
      active: "default",
      completed: "outline",
      cancelled: "destructive",
      expired: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{t(`hseModule.permitToWork.statusOptions.${status}`)}</Badge>;
  };

  const stats = [
    { 
      label: t("hseModule.permitToWork.stats.totalPermits"), 
      value: permits?.length || 0, 
      icon: FileCheck, 
      color: "bg-primary/10 text-primary" 
    },
    { 
      label: t("hseModule.permitToWork.stats.activePermits"), 
      value: permits?.filter(p => p.status === "active" || p.status === "approved").length || 0, 
      icon: CheckCircle, 
      color: "bg-emerald-500/10 text-emerald-600" 
    },
    { 
      label: t("hseModule.permitToWork.stats.pendingApproval"), 
      value: permits?.filter(p => p.status === "pending_approval").length || 0, 
      icon: Clock, 
      color: "bg-amber-500/10 text-amber-600" 
    },
    { 
      label: t("hseModule.permitToWork.stats.permitTypes"), 
      value: permitTypes?.length || 0, 
      icon: ClipboardSignature, 
      color: "bg-sky-500/10 text-sky-600" 
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.permitToWork.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <ClipboardSignature className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("hseModule.permitToWork.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("hseModule.permitToWork.subtitle")}
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
              <TabsTrigger value="permits">{t("hseModule.permitToWork.tabs.permits")}</TabsTrigger>
              <TabsTrigger value="types">{t("hseModule.permitToWork.tabs.types")}</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "permits" ? t("hseModule.permitToWork.newPermit") : t("hseModule.permitToWork.addType")}
            </Button>
          </div>

          <TabsContent value="permits" className="mt-4 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("hseModule.permitToWork.searchPermits")}
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
                  <SelectItem value="pending_approval">{t("hseModule.permitToWork.statusOptions.pending_approval")}</SelectItem>
                  <SelectItem value="approved">{t("hseModule.permitToWork.statusOptions.approved")}</SelectItem>
                  <SelectItem value="active">{t("hseModule.permitToWork.statusOptions.active")}</SelectItem>
                  <SelectItem value="completed">{t("hseModule.permitToWork.statusOptions.completed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.permitToWork.permitsList")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hseModule.permitToWork.permitNumber")}</TableHead>
                      <TableHead>{t("hseModule.permitToWork.permitType")}</TableHead>
                      <TableHead>{t("hseModule.permitToWork.workDescription")}</TableHead>
                      <TableHead>{t("common.location")}</TableHead>
                      <TableHead>{t("hseModule.permitToWork.validFrom")}</TableHead>
                      <TableHead>{t("hseModule.permitToWork.validTo")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permitsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredPermits?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.permitToWork.noPermits")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPermits?.map((permit) => (
                        <TableRow key={permit.id}>
                          <TableCell className="font-medium">{permit.permit_number}</TableCell>
                          <TableCell>{(permit.hse_permit_types as any)?.name || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate">{permit.work_description || "-"}</TableCell>
                          <TableCell>{permit.location || "-"}</TableCell>
                          <TableCell>{permit.start_datetime ? format(new Date(permit.start_datetime), "MMM d, yyyy") : "-"}</TableCell>
                          <TableCell>{permit.end_datetime ? format(new Date(permit.end_datetime), "MMM d, yyyy") : "-"}</TableCell>
                          <TableCell>{getStatusBadge(permit.status)}</TableCell>
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

          <TabsContent value="types" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.permitToWork.permitTypes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("common.code")}</TableHead>
                      <TableHead>{t("hseModule.permitToWork.riskLevel")}</TableHead>
                      <TableHead>{t("hseModule.permitToWork.maxDuration")}</TableHead>
                      <TableHead>{t("hseModule.permitToWork.requiresGasTest")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : permitTypes?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.permitToWork.noTypes")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      permitTypes?.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell className="font-medium">{type.name}</TableCell>
                          <TableCell>{type.code}</TableCell>
                          <TableCell>{type.category || "-"}</TableCell>
                          <TableCell>{type.max_duration_hours ? `${type.max_duration_hours}h` : "-"}</TableCell>
                          <TableCell>
                            {type.requires_isolation ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={type.is_active ? "default" : "secondary"}>
                              {type.is_active ? t("common.active") : t("common.inactive")}
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

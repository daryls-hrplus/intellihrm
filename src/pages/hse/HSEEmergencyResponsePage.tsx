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
  Siren, 
  Plus, 
  Search, 
  FileText,
  Calendar,
  CheckCircle,
  Users
} from "lucide-react";
import { useState } from "react";

export default function HSEEmergencyResponsePage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("plans");

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["hse-emergency-plans", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_emergency_plans")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const { data: drills, isLoading: drillsLoading } = useQuery({
    queryKey: ["hse-emergency-drills", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from("hse_emergency_drills")
        .select("*, hse_emergency_plans(name)")
        .eq("company_id", selectedCompanyId)
        .order("drill_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  const filteredPlans = plans?.filter((plan) => 
    plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.emergency_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      active: "default",
      under_review: "outline",
      archived: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{t(`hseModule.emergencyResponse.statusOptions.${status}`)}</Badge>;
  };

  const getDrillResultBadge = (result: string) => {
    const colors: Record<string, string> = {
      passed: "bg-emerald-500/10 text-emerald-600",
      needs_improvement: "bg-amber-500/10 text-amber-600",
      failed: "bg-destructive/10 text-destructive",
    };
    return <Badge className={colors[result] || "bg-muted text-muted-foreground"}>{t(`hseModule.emergencyResponse.drillResults.${result}`)}</Badge>;
  };

  const stats = [
    { 
      label: t("hseModule.emergencyResponse.stats.totalPlans"), 
      value: plans?.length || 0, 
      icon: FileText, 
      color: "bg-primary/10 text-primary" 
    },
    { 
      label: t("hseModule.emergencyResponse.stats.activePlans"), 
      value: plans?.filter(p => p.status === "active").length || 0, 
      icon: CheckCircle, 
      color: "bg-emerald-500/10 text-emerald-600" 
    },
    { 
      label: t("hseModule.emergencyResponse.stats.totalDrills"), 
      value: drills?.length || 0, 
      icon: Calendar, 
      color: "bg-sky-500/10 text-sky-600" 
    },
    { 
      label: t("hseModule.emergencyResponse.stats.passedDrills"), 
      value: drills?.filter(d => d.status === "completed").length || 0, 
      icon: Users, 
      color: "bg-amber-500/10 text-amber-600" 
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.emergencyResponse.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Siren className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("hseModule.emergencyResponse.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("hseModule.emergencyResponse.subtitle")}
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
              <TabsTrigger value="plans">{t("hseModule.emergencyResponse.tabs.plans")}</TabsTrigger>
              <TabsTrigger value="drills">{t("hseModule.emergencyResponse.tabs.drills")}</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "plans" ? t("hseModule.emergencyResponse.addPlan") : t("hseModule.emergencyResponse.scheduleDrill")}
            </Button>
          </div>

          <TabsContent value="plans" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("hseModule.emergencyResponse.searchPlans")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 max-w-md"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.emergencyResponse.plansList")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("hseModule.emergencyResponse.emergencyType")}</TableHead>
                      <TableHead>{t("common.location")}</TableHead>
                      <TableHead>{t("hseModule.emergencyResponse.lastReviewDate")}</TableHead>
                      <TableHead>{t("hseModule.emergencyResponse.nextReviewDate")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plansLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredPlans?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.emergencyResponse.noPlans")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPlans?.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.name}</TableCell>
                          <TableCell>{plan.emergency_type || "-"}</TableCell>
                          <TableCell>{plan.assembly_points || "-"}</TableCell>
                          <TableCell>{plan.effective_date ? format(new Date(plan.effective_date), "MMM d, yyyy") : "-"}</TableCell>
                          <TableCell>{plan.review_date ? format(new Date(plan.review_date), "MMM d, yyyy") : "-"}</TableCell>
                          <TableCell>{getStatusBadge(plan.status)}</TableCell>
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

          <TabsContent value="drills" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("hseModule.emergencyResponse.drillHistory")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hseModule.emergencyResponse.drillType")}</TableHead>
                      <TableHead>{t("hseModule.emergencyResponse.associatedPlan")}</TableHead>
                      <TableHead>{t("hseModule.emergencyResponse.drillDate")}</TableHead>
                      <TableHead>{t("hseModule.emergencyResponse.participants")}</TableHead>
                      <TableHead>{t("hseModule.emergencyResponse.evacuationTime")}</TableHead>
                      <TableHead>{t("hseModule.emergencyResponse.result")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drillsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : drills?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t("hseModule.emergencyResponse.noDrills")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      drills?.map((drill) => (
                        <TableRow key={drill.id}>
                          <TableCell className="font-medium">{drill.drill_type || "-"}</TableCell>
                          <TableCell>{(drill as any).hse_emergency_plans?.name || "-"}</TableCell>
                          <TableCell>{drill.scheduled_date ? format(new Date(drill.scheduled_date), "MMM d, yyyy") : "-"}</TableCell>
                          <TableCell>{drill.actual_date ? format(new Date(drill.actual_date), "MMM d, yyyy") : "-"}</TableCell>
                          <TableCell>{drill.evacuation_time_seconds ? `${Math.round(drill.evacuation_time_seconds / 60)} min` : "-"}</TableCell>
                          <TableCell>{drill.status ? getDrillResultBadge(drill.status) : "-"}</TableCell>
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
        </Tabs>
      </div>
    </AppLayout>
  );
}

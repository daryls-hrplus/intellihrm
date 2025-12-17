import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area 
} from "recharts";
import { 
  AlertTriangle, Shield, TrendingUp, Users, CheckCircle, Clock, 
  BarChart3, Activity, HeartPulse, HardHat 
} from "lucide-react";
import { AIModuleReportBuilder } from "@/components/shared/AIModuleReportBuilder";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6", "#ec4899"];

export default function HSEAnalyticsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ["hse-analytics-incidents", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_incidents").select("*");
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const { data: nearMisses, isLoading: nearMissLoading } = useQuery({
    queryKey: ["hse-analytics-near-miss", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_near_misses").select("*");
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const { data: trainings, isLoading: trainingsLoading } = useQuery({
    queryKey: ["hse-analytics-training", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_training_records").select("*");
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const { data: inspections, isLoading: inspectionsLoading } = useQuery({
    queryKey: ["hse-analytics-inspections", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_inspections").select("*");
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const { data: observations, isLoading: observationsLoading } = useQuery({
    queryKey: ["hse-analytics-observations", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_safety_observations").select("*");
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const isLoading = incidentsLoading || nearMissLoading || trainingsLoading || inspectionsLoading || observationsLoading;

  // Incident stats
  const totalIncidents = incidents?.length || 0;
  const openIncidents = incidents?.filter(i => i.status === "open" || i.status === "investigating").length || 0;
  const incidentsBySeverity = incidents?.reduce((acc, i) => {
    acc[i.severity || "low"] = (acc[i.severity || "low"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const incidentsByType = incidents?.reduce((acc, i) => {
    acc[i.incident_type || "other"] = (acc[i.incident_type || "other"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Monthly incident trends
  const incidentsByMonth = incidents?.reduce((acc, i) => {
    const month = new Date(i.incident_date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Training stats
  const totalTrainings = trainings?.length || 0;
  const completedTrainings = trainings?.filter(t => t.status === "passed").length || 0;
  const trainingCompletionRate = totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 0;

  // Observations stats
  const safeObservations = observations?.filter(o => o.observation_type === "safe").length || 0;
  const atRiskObservations = observations?.filter(o => o.observation_type === "at_risk").length || 0;

  const severityData = Object.entries(incidentsBySeverity).map(([name, value]) => ({ name, value }));
  const typeData = Object.entries(incidentsByType).map(([name, value]) => ({ name, value }));
  const trendData = Object.entries(incidentsByMonth).map(([name, incidents]) => ({ name, incidents }));

  const observationData = [
    { name: "Safe", value: safeObservations },
    { name: "At Risk", value: atRiskObservations },
  ];

  const kpiCards = [
    { label: t("hseModule.analytics.totalIncidents"), value: totalIncidents, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
    { label: t("hseModule.analytics.openIncidents"), value: openIncidents, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { label: t("hseModule.analytics.nearMissReports"), value: nearMisses?.length || 0, icon: Shield, color: "bg-purple-500/10 text-purple-600" },
    { label: t("hseModule.analytics.trainingCompletion"), value: `${trainingCompletionRate}%`, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
    { label: t("hseModule.analytics.inspections"), value: inspections?.length || 0, icon: Activity, color: "bg-sky-500/10 text-sky-600" },
    { label: t("hseModule.analytics.safetyObservations"), value: observations?.length || 0, icon: Users, color: "bg-indigo-500/10 text-indigo-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.analytics.title") },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("hseModule.analytics.title")}</h1>
            <p className="text-muted-foreground">{t("hseModule.analytics.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter selectedCompanyId={selectedCompanyId} onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} />
            <DepartmentFilter companyId={selectedCompanyId} selectedDepartmentId={selectedDepartmentId} onDepartmentChange={setSelectedDepartmentId} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                      {isLoading ? <Skeleton className="h-8 w-12 mt-1" /> : <p className="text-2xl font-bold">{card.value}</p>}
                    </div>
                    <div className={`rounded-lg p-2 ${card.color}`}><Icon className="h-4 w-4" /></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t("hseModule.analytics.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="incidents">{t("hseModule.analytics.tabs.incidents")}</TabsTrigger>
            <TabsTrigger value="training">{t("hseModule.analytics.tabs.training")}</TabsTrigger>
            <TabsTrigger value="observations">{t("hseModule.analytics.tabs.observations")}</TabsTrigger>
            <TabsTrigger value="ai-banded">{t("reports.aiBandedReports")}</TabsTrigger>
            <TabsTrigger value="ai-bi">{t("reports.aiBIReports")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("hseModule.analytics.incidentTrend")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="incidents" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("hseModule.analytics.incidentsBySeverity")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={severityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          {severityData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("hseModule.analytics.incidentsByType")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={typeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("hseModule.analytics.safetyObservationTypes")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={observationData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("hseModule.analytics.incidentStatus")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Open", value: incidents?.filter(i => i.status === "open").length || 0 },
                            { name: "Investigating", value: incidents?.filter(i => i.status === "investigating").length || 0 },
                            { name: "Resolved", value: incidents?.filter(i => i.status === "resolved").length || 0 },
                            { name: "Closed", value: incidents?.filter(i => i.status === "closed").length || 0 },
                          ]}
                          cx="50%" cy="50%" outerRadius={80} dataKey="value" label
                        >
                          {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("hseModule.analytics.nearMissVsIncidents")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[
                        { name: "Incidents", count: totalIncidents },
                        { name: "Near Misses", count: nearMisses?.length || 0 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("hseModule.analytics.trainingStatus")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Passed", value: trainings?.filter(t => t.status === "passed").length || 0 },
                            { name: "Failed", value: trainings?.filter(t => t.status === "failed").length || 0 },
                            { name: "In Progress", value: trainings?.filter(t => t.status === "in_progress").length || 0 },
                            { name: "Scheduled", value: trainings?.filter(t => t.status === "scheduled").length || 0 },
                          ]}
                          cx="50%" cy="50%" outerRadius={80} dataKey="value" label
                        >
                          {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("hseModule.analytics.trainingCompletion")}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[250px]">
                  {isLoading ? <Skeleton className="h-32 w-32 rounded-full" /> : (
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary">{trainingCompletionRate}%</div>
                      <p className="text-muted-foreground mt-2">{t("hseModule.analytics.completionRate")}</p>
                      <p className="text-sm text-muted-foreground">{completedTrainings} / {totalTrainings} {t("hseModule.analytics.trainingsCompleted")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="observations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("hseModule.analytics.observationTypes")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={observationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label>
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("hseModule.analytics.safetyRatio")}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[250px]">
                  {isLoading ? <Skeleton className="h-32 w-32 rounded-full" /> : (
                    <div className="text-center">
                      <div className="text-6xl font-bold text-emerald-600">
                        {observations?.length ? Math.round((safeObservations / observations.length) * 100) : 0}%
                      </div>
                      <p className="text-muted-foreground mt-2">{t("hseModule.analytics.safeBehaviors")}</p>
                      <p className="text-sm text-muted-foreground">{safeObservations} / {observations?.length || 0} {t("hseModule.analytics.observations")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-banded">
            <AIModuleReportBuilder moduleName="hse" reportType="banded" companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} />
          </TabsContent>

          <TabsContent value="ai-bi">
            <AIModuleReportBuilder moduleName="hse" reportType="bi" companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

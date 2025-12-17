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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Users, Calendar, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { formatDateForDisplay } from "@/utils/dateUtils";

export default function HSEToolboxTalksPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: meetings, isLoading: meetingsLoading } = useQuery({
    queryKey: ["hse-safety-meetings", selectedCompanyId],
    queryFn: async () => {
      let query = supabase.from("hse_safety_meetings").select("*").order("meeting_date", { ascending: false });
      if (selectedCompanyId && selectedCompanyId !== "all") {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  const filteredMeetings = meetings?.filter(mtg =>
    mtg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mtg.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      scheduled: "bg-amber-500/10 text-amber-600",
      in_progress: "bg-sky-500/10 text-sky-600",
      completed: "bg-emerald-500/10 text-emerald-600",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return <Badge className={colors[status || "scheduled"] || "bg-muted text-muted-foreground"}>{status || "Scheduled"}</Badge>;
  };

  const stats = [
    { label: t("hseModule.toolboxTalks.stats.totalMeetings"), value: meetings?.length || 0, icon: Users, color: "bg-primary/10 text-primary" },
    { label: t("hseModule.toolboxTalks.stats.scheduledMeetings"), value: meetings?.filter(m => m.status === "scheduled").length || 0, icon: Calendar, color: "bg-amber-500/10 text-amber-600" },
    { label: t("hseModule.toolboxTalks.stats.completedMeetings"), value: meetings?.filter(m => m.status === "completed").length || 0, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
    { label: t("hseModule.toolboxTalks.stats.thisMonth"), value: meetings?.filter(m => m.scheduled_date && new Date(m.scheduled_date).getMonth() === new Date().getMonth()).length || 0, icon: Clock, color: "bg-sky-500/10 text-sky-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("hseModule.title"), href: "/hse" },
            { label: t("hseModule.toolboxTalks.title") },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("hseModule.toolboxTalks.title")}</h1>
            <p className="text-muted-foreground">{t("hseModule.toolboxTalks.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter selectedCompanyId={selectedCompanyId} onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} />
            <DepartmentFilter companyId={selectedCompanyId} selectedDepartmentId={selectedDepartmentId} onDepartmentChange={setSelectedDepartmentId} />
            <Button><Plus className="h-4 w-4 mr-2" />{t("hseModule.toolboxTalks.scheduleMeeting")}</Button>
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
                      {meetingsLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold">{stat.value}</p>}
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
              <CardTitle>{t("hseModule.toolboxTalks.meetingsList")}</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("hseModule.toolboxTalks.searchMeetings")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("hseModule.toolboxTalks.meetingTitle")}</TableHead>
                  <TableHead>{t("hseModule.toolboxTalks.topic")}</TableHead>
                  <TableHead>{t("hseModule.toolboxTalks.meetingDate")}</TableHead>
                  <TableHead>{t("hseModule.toolboxTalks.duration")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetingsLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ) : !filteredMeetings?.length ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("hseModule.toolboxTalks.noMeetings")}</TableCell></TableRow>
                ) : (
                  filteredMeetings?.map((mtg) => (
                    <TableRow key={mtg.id}>
                      <TableCell className="font-medium">{mtg.title}</TableCell>
                      <TableCell>{mtg.topic || "-"}</TableCell>
                      <TableCell>{mtg.scheduled_date ? formatDateForDisplay(mtg.scheduled_date, "MMM dd, yyyy") : "-"}</TableCell>
                      <TableCell>{mtg.duration_minutes ? `${mtg.duration_minutes} min` : "-"}</TableCell>
                      <TableCell>{getStatusBadge(mtg.status)}</TableCell>
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

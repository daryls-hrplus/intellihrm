import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, GraduationCap, Users, Shield, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHSE } from "@/hooks/useHSE";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from '@/utils/dateUtils';
import { useLanguage } from "@/hooks/useLanguage";

export default function MssHSEPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { incidents, trainingRecords } = useHSE();

  // Get direct reports
  const { data: directReports } = useQuery({
    queryKey: ["direct-reports", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.rpc("get_manager_direct_reports", {
        p_manager_id: user.id,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const directReportIds = directReports?.map((r: any) => r.employee_id) || [];

  // Filter incidents involving direct reports
  const teamIncidents = incidents?.filter(
    (inc) =>
      directReportIds.includes(inc.reported_by) ||
      directReportIds.includes(inc.injured_employee_id)
  ) || [];

  // Filter training records for direct reports
  const teamTrainingRecords = trainingRecords?.filter((rec) =>
    directReportIds.includes(rec.employee_id)
  ) || [];

  // Calculate stats
  const openIncidents = teamIncidents.filter(
    (i) => i.status === "reported" || i.status === "investigating"
  ).length;
  const completedTraining = teamTrainingRecords.filter((r) => r.status === "completed" || r.status === "passed").length;
  const pendingTraining = teamTrainingRecords.filter((r) => r.status !== "completed" && r.status !== "passed").length;
  const expiringTraining = teamTrainingRecords.filter((r) => {
    if (!r.expiry_date) return false;
    const expiryDate = new Date(r.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
  }).length;

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    };
    return <Badge variant={variants[severity] || "secondary"}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      reported: "outline",
      investigating: "default",
      resolved: "secondary",
      closed: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('mss.title'), href: "/mss" },
            { label: t('mss.teamHSE.title') },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('mss.teamHSE.title')}</h1>
          <p className="text-muted-foreground">
            {t('mss.teamHSE.subtitle')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('mss.teamHSE.teamMembers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{directReportIds.length}</div>
              <p className="text-xs text-muted-foreground">{t('mss.teamHSE.directReportsLabel')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('mss.teamHSE.openIncidents')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openIncidents}</div>
              <p className="text-xs text-muted-foreground">{t('mss.teamHSE.requiringAttention')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('mss.teamHSE.trainingCompleted')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTraining}</div>
              <p className="text-xs text-muted-foreground">{t('mss.teamHSE.certificationsEarned')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('mss.teamHSE.expiringSoon')}</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringTraining}</div>
              <p className="text-xs text-muted-foreground">{t('mss.teamHSE.within30Days')}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="incidents">
              <AlertTriangle className="mr-2 h-4 w-4" />
              {t('mss.teamHSE.teamIncidents')}
            </TabsTrigger>
            <TabsTrigger value="training">
              <GraduationCap className="mr-2 h-4 w-4" />
              {t('mss.teamHSE.trainingCompliance')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-4">
            {teamIncidents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">{t('mss.teamHSE.noTeamIncidents')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('mss.teamHSE.noIncidentsDesc')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('mss.teamHSE.teamIncidents')}</CardTitle>
                  <CardDescription>
                    {t('mss.teamHSE.teamIncidentsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('mss.teamHSE.incidentNumber')}</TableHead>
                        <TableHead>{t('mss.teamHSE.title')}</TableHead>
                        <TableHead>{t('mss.teamHSE.date')}</TableHead>
                        <TableHead>{t('mss.teamHSE.reporter')}</TableHead>
                        <TableHead>{t('mss.teamHSE.severity')}</TableHead>
                        <TableHead>{t('mss.teamHSE.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamIncidents.map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell className="font-medium">
                            {incident.incident_number}
                          </TableCell>
                          <TableCell>{incident.title}</TableCell>
                          <TableCell>
                            {formatDateForDisplay(incident.incident_date, "PP")}
                          </TableCell>
                          <TableCell>
                            {(incident.reporter as any)?.full_name || "Unknown"}
                          </TableCell>
                          <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                          <TableCell>{getStatusBadge(incident.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            {teamTrainingRecords.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">{t('mss.teamHSE.noTrainingRecords')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('mss.teamHSE.noTrainingDesc')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('mss.teamHSE.trainingCompliance')}</CardTitle>
                  <CardDescription>
                    {t('mss.teamHSE.trainingComplianceDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('mss.teamHSE.employee')}</TableHead>
                        <TableHead>{t('mss.teamHSE.training')}</TableHead>
                        <TableHead>{t('mss.teamHSE.completed')}</TableHead>
                        <TableHead>{t('mss.teamHSE.score')}</TableHead>
                        <TableHead>{t('mss.teamHSE.expiry')}</TableHead>
                        <TableHead>{t('mss.teamHSE.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamTrainingRecords.map((record) => {
                        const isPassed = record.status === "completed" || record.status === "passed";
                        const isExpired = record.expiry_date && new Date(record.expiry_date) < new Date();
                        const isExpiringSoon = record.expiry_date && !isExpired && (() => {
                          const expiryDate = new Date(record.expiry_date);
                          const thirtyDaysFromNow = new Date();
                          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                          return expiryDate <= thirtyDaysFromNow;
                        })();

                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {(record.employee as any)?.full_name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {(record.training as any)?.title || "Training"}
                            </TableCell>
                            <TableCell>
                              {formatDateForDisplay(record.training_date, "PP")}
                            </TableCell>
                            <TableCell>
                              {record.score ? `${record.score}%` : "-"}
                            </TableCell>
                            <TableCell>
                              {record.expiry_date
                                ? formatDateForDisplay(record.expiry_date, "PP")
                                : t('mss.teamHSE.noExpiry')}
                            </TableCell>
                            <TableCell>
                              {isExpired ? (
                                <Badge variant="destructive" className="gap-1">
                                  <XCircle className="h-3 w-3" />
                                  {t('mss.teamHSE.expired')}
                                </Badge>
                              ) : isExpiringSoon ? (
                                <Badge variant="outline" className="border-amber-500 text-amber-600 gap-1">
                                  <Clock className="h-3 w-3" />
                                  {t('mss.teamHSE.expiringSoon')}
                                </Badge>
                              ) : isPassed ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {t('mss.teamHSE.valid')}
                                </Badge>
                              ) : (
                                <Badge variant="outline">{t('mss.teamHSE.incomplete')}</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

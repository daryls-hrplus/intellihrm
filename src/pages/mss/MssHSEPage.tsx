import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle, GraduationCap, Users, Shield, CheckCircle, Clock, XCircle, Eye, HardHat, ClipboardCheck, Activity, ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHSE } from "@/hooks/useHSE";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from '@/utils/dateUtils';
import { useLanguage } from "@/hooks/useLanguage";
import { User } from "lucide-react";

export default function MssHSEPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { navigateToRecord } = useWorkspaceNavigation();

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

  const {
    incidents, trainingRecords,
    teamNearMisses, teamObservations, teamPPE, teamWorkPermits,
  } = useHSE(undefined, directReportIds);

  // Filter incidents involving direct reports
  const teamIncidents = incidents?.filter(
    (inc) => directReportIds.includes(inc.reported_by) || directReportIds.includes(inc.injured_employee_id)
  ) || [];

  // Filter training records for direct reports
  const teamTrainingRecords = trainingRecords?.filter((rec) => directReportIds.includes(rec.employee_id)) || [];

  // Stats
  const openIncidents = teamIncidents.filter((i) => i.status === "reported" || i.status === "investigating").length;
  const completedTraining = teamTrainingRecords.filter((r) => r.status === "completed" || r.status === "passed").length;
  const expiringTraining = teamTrainingRecords.filter((r) => {
    if (!r.expiry_date) return false;
    const expiryDate = new Date(r.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
  }).length;
  const nearMissCount = teamNearMisses?.length || 0;
  const ppeOverdue = teamPPE?.filter((p: any) => p.expiry_date && new Date(p.expiry_date) < new Date() && !p.return_date).length || 0;
  const pendingPermits = teamWorkPermits?.filter((p: any) => p.status === "pending" || p.status === "requested").length || 0;

  const handleNavigateToEmployee = (employeeId: string | null, employeeName: string) => {
    if (!employeeId) return;
    navigateToRecord({
      route: `/workforce/employees/${employeeId}`,
      title: employeeName,
      subtitle: "Employee",
      moduleCode: "workforce",
      contextType: "employee",
      contextId: employeeId,
      icon: User,
    });
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "secondary", medium: "default", high: "destructive", critical: "destructive",
    };
    return <Badge variant={variants[severity] || "secondary"}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      reported: "outline", investigating: "default", resolved: "secondary", closed: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t('mss.title'), href: "/mss" }, { label: t('mss.teamHSE.title') }]} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('mss.teamHSE.title')}</h1>
          <p className="text-muted-foreground">{t('mss.teamHSE.subtitle')}</p>
        </div>

        {/* Enhanced Stats */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{directReportIds.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{openIncidents}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Near-Misses</CardTitle>
              <Eye className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{nearMissCount}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PPE Overdue</CardTitle>
              <HardHat className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{ppeOverdue}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Done</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{completedTraining}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Permits</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{pendingPermits}</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="incidents"><AlertTriangle className="mr-2 h-4 w-4" />Team Incidents</TabsTrigger>
            <TabsTrigger value="training"><GraduationCap className="mr-2 h-4 w-4" />Training Compliance</TabsTrigger>
            <TabsTrigger value="safety"><Eye className="mr-2 h-4 w-4" />Team Safety</TabsTrigger>
            <TabsTrigger value="permits"><ClipboardCheck className="mr-2 h-4 w-4" />Inspections & Permits</TabsTrigger>
            <TabsTrigger value="risk"><Activity className="mr-2 h-4 w-4" />Risk Overview</TabsTrigger>
          </TabsList>

          {/* ===== Team Incidents Tab (enhanced with near-misses) ===== */}
          <TabsContent value="incidents" className="space-y-4">
            {teamIncidents.length === 0 && nearMissCount === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No team incidents or near-misses</h3>
              </CardContent></Card>
            ) : (
              <>
                {teamIncidents.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>Team Incidents</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Incident #</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Reporter</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamIncidents.map((incident) => (
                            <TableRow key={incident.id}>
                              <TableCell className="font-medium">{incident.incident_number}</TableCell>
                              <TableCell>{incident.title}</TableCell>
                              <TableCell>{formatDateForDisplay(incident.incident_date, "PP")}</TableCell>
                              <TableCell>
                                <Button variant="link" className="p-0 h-auto" onClick={() => handleNavigateToEmployee(incident.reported_by, (incident.reporter as any)?.full_name || "Employee")}>
                                  {(incident.reporter as any)?.full_name || "Unknown"}
                                </Button>
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
                {nearMissCount > 0 && (
                  <Card>
                    <CardHeader><CardTitle>Team Near-Misses</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Report #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Hazard Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamNearMisses?.map((nm: any) => (
                            <TableRow key={nm.id}>
                              <TableCell className="font-medium">{nm.report_number || "-"}</TableCell>
                              <TableCell>{nm.report_date ? formatDateForDisplay(nm.report_date, "PP") : "-"}</TableCell>
                              <TableCell>{nm.hazard_type || "-"}</TableCell>
                              <TableCell className="max-w-xs truncate">{nm.description || "-"}</TableCell>
                              <TableCell>{getSeverityBadge(nm.potential_severity || "low")}</TableCell>
                              <TableCell>{getStatusBadge(nm.status || "reported")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* ===== Training Compliance Tab ===== */}
          <TabsContent value="training" className="space-y-4">
            {teamTrainingRecords.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No training records</h3>
              </CardContent></Card>
            ) : (
              <Card>
                <CardHeader><CardTitle>Training Compliance</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Training</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamTrainingRecords.map((record) => {
                        const isPassed = record.status === "completed" || record.status === "passed";
                        const isExpired = record.expiry_date && new Date(record.expiry_date) < new Date();
                        const isExpiringSoon = record.expiry_date && !isExpired && (() => {
                          const expiryDate = new Date(record.expiry_date!);
                          const thirtyDaysFromNow = new Date();
                          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                          return expiryDate <= thirtyDaysFromNow;
                        })();
                        return (
                          <TableRow key={record.id}>
                            <TableCell>
                              <Button variant="link" className="p-0 h-auto" onClick={() => handleNavigateToEmployee(record.employee_id, (record.employee as any)?.full_name || "Employee")}>
                                {(record.employee as any)?.full_name || "Unknown"}
                              </Button>
                            </TableCell>
                            <TableCell>{(record.training as any)?.title || "Training"}</TableCell>
                            <TableCell>{formatDateForDisplay(record.training_date, "PP")}</TableCell>
                            <TableCell>{record.score ? `${record.score}%` : "-"}</TableCell>
                            <TableCell>{record.expiry_date ? formatDateForDisplay(record.expiry_date, "PP") : "No Expiry"}</TableCell>
                            <TableCell>
                              {isExpired ? (
                                <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Expired</Badge>
                              ) : isExpiringSoon ? (
                                <Badge variant="outline" className="border-amber-500 text-amber-600 gap-1"><Clock className="h-3 w-3" />Expiring Soon</Badge>
                              ) : isPassed ? (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 gap-1"><CheckCircle className="h-3 w-3" />Valid</Badge>
                              ) : (
                                <Badge variant="outline">Incomplete</Badge>
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

          {/* ===== Team Safety Tab (observations + PPE) ===== */}
          <TabsContent value="safety" className="space-y-4">
            {/* Observations */}
            <Card>
              <CardHeader><CardTitle>Team Safety Observations</CardTitle></CardHeader>
              <CardContent>
                {(teamObservations?.length || 0) === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No safety observations from team members</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Observation #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamObservations?.map((obs: any) => (
                        <TableRow key={obs.id}>
                          <TableCell className="font-medium">{obs.observation_number || "-"}</TableCell>
                          <TableCell>{obs.observation_date ? formatDateForDisplay(obs.observation_date, "PP") : "-"}</TableCell>
                          <TableCell>
                            <Badge className={obs.observation_type === "unsafe" ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"}>
                              {obs.observation_type === "unsafe" ? <ThumbsDown className="mr-1 h-3 w-3" /> : <ThumbsUp className="mr-1 h-3 w-3" />}
                              {obs.observation_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{obs.category || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate">{obs.description || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* PPE Compliance */}
            <Card>
              <CardHeader><CardTitle>Team PPE Compliance</CardTitle></CardHeader>
              <CardContent>
                {(teamPPE?.length || 0) === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No PPE issuances for team members</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>PPE Type</TableHead>
                        <TableHead>Issued</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamPPE?.map((item: any) => {
                        const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date() && !item.return_date;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Button variant="link" className="p-0 h-auto" onClick={() => handleNavigateToEmployee(item.employee_id, (item.employee as any)?.full_name || "Employee")}>
                                {(item.employee as any)?.full_name || "Unknown"}
                              </Button>
                            </TableCell>
                            <TableCell>{(item.ppe_type as any)?.name || "-"}</TableCell>
                            <TableCell>{item.issued_date ? formatDateForDisplay(item.issued_date, "PP") : "-"}</TableCell>
                            <TableCell>{item.expiry_date ? formatDateForDisplay(item.expiry_date, "PP") : "-"}</TableCell>
                            <TableCell>
                              {item.return_date ? (
                                <Badge variant="secondary">Returned</Badge>
                              ) : isExpired ? (
                                <Badge variant="destructive">Overdue</Badge>
                              ) : (
                                <Badge variant="default" className="bg-emerald-500/10 text-emerald-600">Active</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Inspections & Permits Tab ===== */}
          <TabsContent value="permits" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Team Work Permits</CardTitle></CardHeader>
              <CardContent>
                {(teamWorkPermits?.length || 0) === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No work permits for your team</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permit #</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamWorkPermits?.map((permit: any) => (
                        <TableRow key={permit.id}>
                          <TableCell className="font-medium">{permit.permit_number || "-"}</TableCell>
                          <TableCell>{permit.permit_type || "-"}</TableCell>
                          <TableCell>{permit.work_location || "-"}</TableCell>
                          <TableCell>{permit.start_date ? formatDateForDisplay(permit.start_date, "PP") : "-"}</TableCell>
                          <TableCell>{permit.end_date ? formatDateForDisplay(permit.end_date, "PP") : "-"}</TableCell>
                          <TableCell>
                            <Badge variant={permit.status === "approved" ? "default" : permit.status === "pending" ? "outline" : "secondary"}>
                              {permit.status || "pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Risk Overview Tab ===== */}
          <TabsContent value="risk" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Open Incidents</p>
                    <p className="text-3xl font-bold text-destructive">{openIncidents}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Near-Misses (Total)</p>
                    <p className="text-3xl font-bold text-amber-600">{nearMissCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Expiring Training</p>
                    <p className="text-3xl font-bold text-amber-600">{expiringTraining}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Team Risk Summary</CardTitle>
                <CardDescription>Overview of safety metrics for your direct reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Total team members</span>
                    <span className="font-medium">{directReportIds.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Incidents (open)</span>
                    <span className="font-medium">{openIncidents}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Near-misses reported</span>
                    <span className="font-medium">{nearMissCount}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Safety observations</span>
                    <span className="font-medium">{teamObservations?.length || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">PPE overdue</span>
                    <span className="font-medium text-destructive">{ppeOverdue}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Training completed</span>
                    <span className="font-medium text-emerald-600">{completedTraining}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Training expiring (30 days)</span>
                    <span className="font-medium text-amber-600">{expiringTraining}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

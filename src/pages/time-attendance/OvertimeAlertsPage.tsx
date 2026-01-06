import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Bell,
  TrendingUp,
  Search,
  Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface OvertimeAlert {
  id: string;
  employee_id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  current_hours: number;
  limit_hours: number;
  percentage_used: number;
  period_start: string;
  period_end: string;
  is_acknowledged: boolean;
  acknowledged_at: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  approaching_daily_limit: "Approaching Daily Limit",
  approaching_weekly_limit: "Approaching Weekly Limit",
  approaching_monthly_limit: "Approaching Monthly Limit",
  exceeded_daily_limit: "Exceeded Daily Limit",
  exceeded_weekly_limit: "Exceeded Weekly Limit",
  exceeded_monthly_limit: "Exceeded Monthly Limit",
  consecutive_days: "Consecutive Work Days",
  rest_violation: "Rest Period Violation",
  burnout_risk: "Burnout Risk Alert",
};

const SEVERITY_CONFIG: Record<string, { color: string; bgColor: string }> = {
  low: { color: "text-blue-600", bgColor: "bg-blue-500/10" },
  medium: { color: "text-yellow-600", bgColor: "bg-yellow-500/10" },
  high: { color: "text-orange-600", bgColor: "bg-orange-500/10" },
  critical: { color: "text-red-600", bgColor: "bg-red-500/10" },
};

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "Overtime Alerts" },
];

export default function OvertimeAlertsPage() {
  const { user, company } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterResolved, setFilterResolved] = useState("unresolved");
  const [selectedAlert, setSelectedAlert] = useState<OvertimeAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["overtime-alerts", company?.id, filterResolved],
    queryFn: async () => {
      let query = supabase
        .from("overtime_risk_alerts")
        .select(`*, profiles!overtime_risk_alerts_employee_id_fkey(full_name, email)`)
        .eq("company_id", company?.id)
        .order("created_at", { ascending: false });

      if (filterResolved === "unresolved") {
        query = query.eq("is_resolved", false);
      } else if (filterResolved === "resolved") {
        query = query.eq("is_resolved", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OvertimeAlert[];
    },
    enabled: !!company?.id,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("overtime_risk_alerts")
        .update({
          is_acknowledged: true,
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Alert acknowledged");
      queryClient.invalidateQueries({ queryKey: ["overtime-alerts"] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ alertId, notes }: { alertId: string; notes: string }) => {
      const { error } = await supabase
        .from("overtime_risk_alerts")
        .update({
          is_resolved: true,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Alert resolved");
      queryClient.invalidateQueries({ queryKey: ["overtime-alerts"] });
      setSelectedAlert(null);
      setResolutionNotes("");
    },
  });

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === "critical" && !a.is_resolved).length,
    high: alerts.filter(a => a.severity === "high" && !a.is_resolved).length,
    unacknowledged: alerts.filter(a => !a.is_acknowledged && !a.is_resolved).length,
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Overtime Risk Alerts</h1>
            <p className="text-muted-foreground">
              Proactive notifications for overtime limits and compliance violations
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{stats.unacknowledged}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>Monitor and respond to overtime threshold violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterResolved} onValueChange={setFilterResolved}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : filteredAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        No alerts found. All employees are within limits!
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAlerts.map((alert) => {
                      const severityConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;
                      return (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{alert.profiles?.full_name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{alert.profiles?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {ALERT_TYPE_LABELS[alert.alert_type] || alert.alert_type}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${severityConfig.bgColor} ${severityConfig.color}`}>
                              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {alert.limit_hours ? (
                              <div className="flex items-center gap-2">
                                <Progress value={alert.percentage_used || 0} className="w-16 h-2" />
                                <span className="text-sm">
                                  {alert.current_hours?.toFixed(1)}/{alert.limit_hours}h
                                </span>
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {alert.is_resolved ? (
                              <Badge variant="outline" className="text-green-600">Resolved</Badge>
                            ) : alert.is_acknowledged ? (
                              <Badge variant="outline">Acknowledged</Badge>
                            ) : (
                              <Badge variant="secondary">New</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(alert.created_at), "PP")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAlert(alert)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!alert.is_acknowledged && !alert.is_resolved && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => acknowledgeMutation.mutate(alert.id)}
                                >
                                  Ack
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Alert Detail Dialog */}
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alert Details</DialogTitle>
            </DialogHeader>
            {selectedAlert && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Employee</Label>
                    <p className="font-medium">{selectedAlert.profiles?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Alert Type</Label>
                    <p>{ALERT_TYPE_LABELS[selectedAlert.alert_type]}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Message</Label>
                  <p className="text-sm bg-muted p-3 rounded">{selectedAlert.message}</p>
                </div>
                {selectedAlert.current_hours && selectedAlert.limit_hours && (
                  <div>
                    <Label className="text-muted-foreground">Hours Usage</Label>
                    <div className="mt-2">
                      <Progress value={selectedAlert.percentage_used} className="h-3" />
                      <p className="text-sm mt-1">
                        {selectedAlert.current_hours.toFixed(1)} of {selectedAlert.limit_hours} hours ({selectedAlert.percentage_used?.toFixed(0)}%)
                      </p>
                    </div>
                  </div>
                )}

                {!selectedAlert.is_resolved && (
                  <div>
                    <Label>Resolution Notes</Label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe the action taken..."
                      rows={3}
                    />
                  </div>
                )}

                {selectedAlert.resolution_notes && (
                  <div>
                    <Label className="text-muted-foreground">Resolution Notes</Label>
                    <p className="text-sm bg-muted p-3 rounded">{selectedAlert.resolution_notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                Close
              </Button>
              {selectedAlert && !selectedAlert.is_resolved && (
                <Button
                  onClick={() => resolveMutation.mutate({ alertId: selectedAlert.id, notes: resolutionNotes })}
                  disabled={resolveMutation.isPending}
                >
                  Mark as Resolved
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
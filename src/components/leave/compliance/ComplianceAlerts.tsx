import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  Calculator,
  Eye,
  X,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ComplianceAlertsProps {
  companyId: string;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  employee_id: string | null;
  threshold_value: number | null;
  actual_value: number | null;
  is_read: boolean;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  profiles?: { full_name: string };
}

const ALERT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  overdue_acknowledgment: { 
    icon: <FileCheck className="h-4 w-4" />, 
    label: "Overdue Acknowledgment",
    color: "bg-yellow-500/10 text-yellow-600"
  },
  bradford_threshold: { 
    icon: <Calculator className="h-4 w-4" />, 
    label: "Bradford Threshold",
    color: "bg-red-500/10 text-red-600"
  },
  medical_cert_pending: { 
    icon: <Clock className="h-4 w-4" />, 
    label: "Medical Cert Pending",
    color: "bg-orange-500/10 text-orange-600"
  },
  policy_update: { 
    icon: <Bell className="h-4 w-4" />, 
    label: "Policy Update",
    color: "bg-blue-500/10 text-blue-600"
  },
};

const SEVERITY_CONFIG: Record<string, { color: string; bgColor: string }> = {
  low: { color: "text-green-600", bgColor: "bg-green-500/10" },
  medium: { color: "text-yellow-600", bgColor: "bg-yellow-500/10" },
  high: { color: "text-orange-600", bgColor: "bg-orange-500/10" },
  critical: { color: "text-red-600", bgColor: "bg-red-500/10" },
};

export function ComplianceAlerts({ companyId }: ComplianceAlertsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  // Fetch alerts
  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ["compliance-alerts", companyId, showResolved],
    queryFn: async () => {
      let query = supabase
        .from("leave_compliance_alerts")
        .select(`*, profiles!leave_compliance_alerts_employee_id_fkey(full_name)`)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      
      if (!showResolved) {
        query = query.eq("is_resolved", false);
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as Alert[];
    },
    enabled: !!companyId,
  });

  // Mark as read
  const markReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("leave_compliance_alerts")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-alerts"] });
    },
  });

  // Resolve alert
  const resolveMutation = useMutation({
    mutationFn: async ({ alertId, notes }: { alertId: string; notes: string }) => {
      const { error } = await supabase
        .from("leave_compliance_alerts")
        .update({
          is_resolved: true,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Alert resolved");
      queryClient.invalidateQueries({ queryKey: ["compliance-alerts"] });
      setSelectedAlert(null);
      setResolutionNotes("");
    },
    onError: (error) => toast.error(`Failed to resolve: ${error.message}`),
  });

  // Create overdue acknowledgment alerts
  const checkOverdueMutation = useMutation({
    mutationFn: async (): Promise<number> => {
      type EmployeeRow = { id: string; full_name: string; company_id: string };
      type AckRow = { employee_id: string; policy_id: string };
      type PolicyRow = { id: string; name: string };
      
      // Fetch employees - use separate filter to avoid deep type instantiation
      const employeesResult = await supabase
        .from("profiles")
        .select("id, full_name, company_id")
        .match({ company_id: companyId, status: "active" });
      
      // Fetch acknowledgments
      const ackResult = await supabase
        .from("leave_policy_acknowledgments")
        .select("employee_id, policy_id")
        .eq("company_id", companyId);
      
      // Fetch policies
      const policiesResult = await supabase
        .from("leave_types")
        .select("id, name")
        .match({ company_id: companyId, is_active: true });
      
      const employees = (employeesResult.data || []) as unknown as EmployeeRow[];
      const acknowledgments = (ackResult.data || []) as unknown as AckRow[];
      const policies = (policiesResult.data || []) as unknown as PolicyRow[];

      if (employees.length === 0 || policies.length === 0) return 0;

      const ackMap = new Set(acknowledgments.map(a => `${a.employee_id}-${a.policy_id}`));
      const newAlerts: Array<{
        company_id: string;
        alert_type: string;
        severity: string;
        title: string;
        message: string;
        employee_id: string;
      }> = [];

      for (const emp of employees) {
        const unackedPolicies = policies.filter(p => !ackMap.has(`${emp.id}-${p.id}`));
        if (unackedPolicies.length > 0) {
          newAlerts.push({
            company_id: companyId,
            alert_type: "overdue_acknowledgment",
            severity: unackedPolicies.length > 3 ? "high" : "medium",
            title: `Policy Acknowledgment Overdue: ${emp.full_name}`,
            message: `Employee has ${unackedPolicies.length} unacknowledged leave policies: ${unackedPolicies.map(p => p.name).join(", ")}`,
            employee_id: emp.id,
          });
        }
      }

      if (newAlerts.length > 0) {
        const insertQuery = supabase
          .from("leave_compliance_alerts")
          .insert(newAlerts);
        const { error } = await insertQuery;
        if (error) throw error;
      }

      return newAlerts.length;
    },
    onSuccess: (count) => {
      if (count && count > 0) {
        toast.success(`Created ${count} new alerts`);
      } else {
        toast.info("No overdue acknowledgments found");
      }
      queryClient.invalidateQueries({ queryKey: ["compliance-alerts"] });
    },
    onError: (error) => toast.error(`Failed to check: ${error.message}`),
  });

  const handleResolve = () => {
    if (!selectedAlert) return;
    resolveMutation.mutate({ alertId: selectedAlert.id, notes: resolutionNotes });
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;
  const criticalCount = alerts.filter(a => a.severity === "critical" && !a.is_resolved).length;
  const highCount = alerts.filter(a => a.severity === "high" && !a.is_resolved).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{highCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compliance Alerts</CardTitle>
              <CardDescription>
                Notifications for overdue acknowledgments, Bradford Factor thresholds, and more
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResolved(!showResolved)}
              >
                {showResolved ? "Hide Resolved" : "Show Resolved"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => checkOverdueMutation.mutate()}
                disabled={checkOverdueMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${checkOverdueMutation.isPending ? "animate-spin" : ""}`} />
                Check Overdue
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">All Clear!</h3>
              <p className="text-muted-foreground">No compliance alerts at this time.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const typeConfig = ALERT_TYPE_CONFIG[alert.alert_type] || ALERT_TYPE_CONFIG.policy_update;
                  const severityConfig = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;
                  
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        !alert.is_read ? "bg-muted/50 border-primary/30" : "bg-card"
                      } ${alert.is_resolved ? "opacity-60" : ""}`}
                      onClick={() => {
                        if (!alert.is_read) {
                          markReadMutation.mutate(alert.id);
                        }
                        setSelectedAlert(alert);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                            {typeConfig.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{alert.title}</h4>
                              {!alert.is_read && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                              {alert.is_resolved && (
                                <Badge variant="outline" className="text-xs text-green-600">Resolved</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {alert.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <Badge className={`${severityConfig.bgColor} ${severityConfig.color}`}>
                                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                              </Badge>
                              <span>{format(new Date(alert.created_at), "PPp")}</span>
                              {alert.profiles?.full_name && (
                                <span>• {alert.profiles.full_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {!alert.is_resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlert(alert);
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAlert?.is_resolved ? "Alert Details" : "Resolve Alert"}
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Alert Type</Label>
                <p className="font-medium">
                  {ALERT_TYPE_CONFIG[selectedAlert.alert_type]?.label || selectedAlert.alert_type}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedAlert.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Message</Label>
                <p className="text-sm">{selectedAlert.message}</p>
              </div>
              {selectedAlert.threshold_value && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Threshold</Label>
                    <p className="font-medium">{selectedAlert.threshold_value}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Actual Value</Label>
                    <p className="font-medium text-red-600">{selectedAlert.actual_value}</p>
                  </div>
                </div>
              )}
              
              {selectedAlert.is_resolved ? (
                <div>
                  <Label className="text-muted-foreground">Resolution Notes</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedAlert.resolution_notes || "No notes"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Resolved on {format(new Date(selectedAlert.resolved_at!), "PPp")}
                  </p>
                </div>
              ) : (
                <div>
                  <Label>Resolution Notes</Label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe the action taken to resolve this alert..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAlert(null)}>
              Close
            </Button>
            {selectedAlert && !selectedAlert.is_resolved && (
              <Button onClick={handleResolve} disabled={resolveMutation.isPending}>
                {resolveMutation.isPending ? "Resolving..." : "Mark as Resolved"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
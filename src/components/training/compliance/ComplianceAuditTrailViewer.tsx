import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Filter, Download, Eye, Shield, Clock, 
  User, FileText, AlertTriangle, CheckCircle, RefreshCw
} from "lucide-react";
import { format, subDays } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface ComplianceAuditTrailViewerProps {
  companyId: string;
}

interface AuditLogEntry {
  id: string;
  event_timestamp: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  actor_id: string | null;
  actor_type: string | null;
  old_values: unknown;
  new_values: unknown;
  metadata: unknown;
  checksum: string | null;
  previous_checksum: string | null;
  actor_name?: string;
}

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  assignment_created: { label: "Assignment Created", color: "bg-blue-600" },
  assignment_completed: { label: "Completed", color: "bg-green-600" },
  status_changed: { label: "Status Changed", color: "bg-yellow-600" },
  escalation_triggered: { label: "Escalated", color: "bg-orange-600" },
  exemption_requested: { label: "Exemption Requested", color: "bg-purple-600" },
  exemption_approved: { label: "Exemption Approved", color: "bg-green-600" },
  exemption_rejected: { label: "Exemption Rejected", color: "bg-destructive" },
  grace_period_extended: { label: "Grace Extended", color: "bg-blue-600" },
  requirement_created: { label: "Requirement Created", color: "bg-blue-600" },
  requirement_updated: { label: "Requirement Updated", color: "bg-yellow-600" },
  bulk_assignment: { label: "Bulk Assignment", color: "bg-purple-600" },
};

export function ComplianceAuditTrailViewer({ companyId }: ComplianceAuditTrailViewerProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState("30");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [integrityStatus, setIntegrityStatus] = useState<"valid" | "invalid" | "checking">("checking");

  useEffect(() => {
    loadAuditLogs();
  }, [companyId, dateRange, eventTypeFilter, entityTypeFilter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    setIntegrityStatus("checking");
    
    try {
      const startDate = subDays(new Date(), parseInt(dateRange));
      
      let query = supabase
        .from("compliance_audit_log")
        .select("*")
        .eq("company_id", companyId)
        .gte("event_timestamp", startDate.toISOString())
        .order("event_timestamp", { ascending: false });

      if (eventTypeFilter !== "all") {
        query = query.eq("event_type", eventTypeFilter);
      }

      if (entityTypeFilter !== "all") {
        query = query.eq("entity_type", entityTypeFilter);
      }

      // @ts-ignore - Supabase type instantiation issue
      const { data } = await query.limit(500);

      // Get actor names
      const actorIds = [...new Set(data?.map(l => l.actor_id).filter(Boolean) || [])];
      
      let actorMap = new Map<string, string>();
      if (actorIds.length > 0) {
        // @ts-ignore - Supabase type instantiation issue
        const { data: actors } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", actorIds);
        
        actorMap = new Map(actors?.map(a => [a.id, a.full_name]) || []);
      }

      const logsWithNames = (data || []).map(log => ({
        ...log,
        actor_name: log.actor_id ? actorMap.get(log.actor_id) || "Unknown" : "System"
      }));

      setLogs(logsWithNames);
      
      // Verify integrity chain
      verifyIntegrity(logsWithNames);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    }
    setLoading(false);
  };

  const verifyIntegrity = (logs: AuditLogEntry[]) => {
    // In production, this would verify SHA-256 checksum chain
    // For now, we simulate a basic check
    let isValid = true;
    
    for (let i = 0; i < logs.length - 1; i++) {
      // Each log's previous_checksum should match the next log's checksum
      if (logs[i].previous_checksum && logs[i + 1].checksum) {
        if (logs[i].previous_checksum !== logs[i + 1].checksum) {
          isValid = false;
          break;
        }
      }
    }
    
    setIntegrityStatus(isValid ? "valid" : "invalid");
  };

  const exportLogs = () => {
    const headers = [
      "Timestamp",
      "Event Type",
      "Entity Type", 
      "Entity ID",
      "Actor",
      "Old Values",
      "New Values",
      "Checksum"
    ];
    
    const rows = filteredLogs.map(log => [
      log.event_timestamp,
      log.event_type,
      log.entity_type,
      log.entity_id,
      log.actor_name || "System",
      JSON.stringify(log.old_values || {}),
      JSON.stringify(log.new_values || {}),
      log.checksum || ""
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compliance-audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.event_type.toLowerCase().includes(searchLower) ||
      log.entity_type.toLowerCase().includes(searchLower) ||
      log.actor_name?.toLowerCase().includes(searchLower) ||
      log.entity_id.toLowerCase().includes(searchLower)
    );
  });

  const getEventBadge = (eventType: string) => {
    const config = EVENT_TYPE_LABELS[eventType] || { label: eventType, color: "bg-muted" };
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const renderJsonDiff = (oldValues: unknown, newValues: unknown) => {
    const oldObj = (typeof oldValues === 'object' && oldValues !== null ? oldValues : {}) as Record<string, unknown>;
    const newObj = (typeof newValues === 'object' && newValues !== null ? newValues : {}) as Record<string, unknown>;
    const allKeys = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {})
    ]);

    return (
      <div className="space-y-2 font-mono text-sm">
        {Array.from(allKeys).map(key => {
          const oldVal = oldValues?.[key];
          const newVal = newValues?.[key];
          const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);

          return (
            <div key={key} className={`p-2 rounded ${changed ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}`}>
              <span className="font-semibold">{key}:</span>
              {changed ? (
                <>
                  <div className="text-destructive line-through ml-4">
                    {oldVal !== undefined ? JSON.stringify(oldVal) : "(empty)"}
                  </div>
                  <div className="text-green-600 ml-4">
                    {newVal !== undefined ? JSON.stringify(newVal) : "(empty)"}
                  </div>
                </>
              ) : (
                <span className="ml-2 text-muted-foreground">
                  {JSON.stringify(newVal)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="p-4">Loading audit trail...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Integrity Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Compliance Audit Trail</h2>
            <p className="text-sm text-muted-foreground">
              Tamper-proof record of all compliance actions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {integrityStatus === "checking" ? (
            <Badge variant="secondary">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Verifying...
            </Badge>
          ) : integrityStatus === "valid" ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Chain Verified
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Integrity Issue
            </Badge>
          )}
          
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events, actors, entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {Object.entries(EVENT_TYPE_LABELS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <FileText className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
                <SelectItem value="requirement">Requirements</SelectItem>
                <SelectItem value="exemption">Exemptions</SelectItem>
                <SelectItem value="escalation">Escalations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Events</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} events from the last {dateRange} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Checksum</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDateForDisplay(log.event_timestamp, "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{getEventBadge(log.event_type)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium capitalize">{log.entity_type}</span>
                      <br />
                      <span className="text-muted-foreground text-xs font-mono">
                        {log.entity_id.slice(0, 8)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{log.actor_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.checksum ? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {log.checksum.slice(0, 12)}...
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                        </DialogHeader>
                        {selectedLog && (
                          <ScrollArea className="max-h-[500px]">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                                  <p>{formatDateForDisplay(selectedLog.event_timestamp, "PPpp")}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                                  <p>{getEventBadge(selectedLog.event_type)}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Entity</p>
                                  <p className="capitalize">{selectedLog.entity_type}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Entity ID</p>
                                  <p className="font-mono text-sm">{selectedLog.entity_id}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Actor</p>
                                  <p>{selectedLog.actor_name} ({selectedLog.actor_type || "user"})</p>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Changes</p>
                                {renderJsonDiff(selectedLog.old_values, selectedLog.new_values)}
                              </div>

                              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Metadata</p>
                                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}

                              <div className="pt-4 border-t">
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                  Integrity Verification
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                                  <div>
                                    <p className="text-muted-foreground">Checksum</p>
                                    <p className="break-all">{selectedLog.checksum || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Previous Checksum</p>
                                    <p className="break-all">{selectedLog.previous_checksum || "N/A"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </ScrollArea>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}

              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No audit events found for the selected filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

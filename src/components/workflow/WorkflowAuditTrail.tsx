import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Download, Filter, CheckCircle, XCircle, AlertTriangle, RotateCcw, MessageSquare, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface AuditEvent {
  id: string;
  eventType: string;
  instanceId: string;
  templateName: string;
  stepName: string | null;
  actorName: string;
  actorRole: string | null;
  previousStatus: string | null;
  newStatus: string | null;
  comment: string | null;
  createdAt: string;
}

const EVENT_TYPES = [
  { value: "all", label: "All Events" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "returned", label: "Returned" },
  { value: "escalated", label: "Escalated" },
  { value: "delegated", label: "Delegated" },
  { value: "comment_added", label: "Comment Added" },
  { value: "sla_warning", label: "SLA Warning" },
  { value: "sla_breach", label: "SLA Breach" },
];

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "returned":
      return <RotateCcw className="h-4 w-4 text-yellow-500" />;
    case "escalated":
    case "sla_warning":
    case "sla_breach":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "comment_added":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getEventBadgeVariant = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (eventType) {
    case "approved":
      return "default";
    case "rejected":
    case "sla_breach":
      return "destructive";
    case "escalated":
    case "sla_warning":
      return "outline";
    default:
      return "secondary";
  }
};

export function WorkflowAuditTrail() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    fetchAuditEvents();
  }, [profile?.company_id, eventTypeFilter, dateRange, page]);

  const fetchAuditEvents = async () => {
    if (!profile?.company_id) return;
    setIsLoading(true);

    try {
      // Since we're building audit from workflow_instance_approvals for now
      let query = (supabase as any)
        .from("workflow_instance_approvals")
        .select(`
          id,
          action,
          comment,
          acted_at,
          created_at,
          status,
          workflow_instances!inner(
            id,
            category,
            workflow_templates(name)
          ),
          workflow_steps(name),
          approver:profiles!workflow_instance_approvals_approver_id_fkey(full_name)
        `)
        .eq("workflow_instances.company_id", profile.company_id)
        .not("action", "is", null)
        .order("acted_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (eventTypeFilter !== "all") {
        query = query.eq("action", eventTypeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedEvents: AuditEvent[] = (data || []).map((item: any) => ({
        id: item.id,
        eventType: item.action || "unknown",
        instanceId: (item.workflow_instances as any)?.id || "",
        templateName: (item.workflow_instances as any)?.workflow_templates?.name || "Unknown",
        stepName: (item.workflow_steps as any)?.name || null,
        actorName: (item.approver as any)?.full_name || "System",
        actorRole: null,
        previousStatus: null,
        newStatus: item.status,
        comment: item.comment,
        createdAt: item.acted_at || item.created_at,
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Failed to fetch audit events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.templateName.toLowerCase().includes(query) ||
      event.actorName.toLowerCase().includes(query) ||
      event.comment?.toLowerCase().includes(query)
    );
  });

  const handleExport = () => {
    const csv = [
      ["Date", "Event", "Workflow", "Step", "Actor", "Comment"].join(","),
      ...filteredEvents.map(e => [
        format(new Date(e.createdAt), "yyyy-MM-dd HH:mm:ss"),
        e.eventType,
        `"${e.templateName}"`,
        e.stepName || "",
        `"${e.actorName}"`,
        `"${e.comment || ""}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-audit-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows, actors, comments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Complete history of workflow actions and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit events found matching your criteria</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Date & Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Step</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map(event => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(event.createdAt), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.eventType)}
                          <Badge variant={getEventBadgeVariant(event.eventType)}>
                            {event.eventType.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{event.templateName}</TableCell>
                      <TableCell>{event.stepName || "-"}</TableCell>
                      <TableCell>{event.actorName}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {event.comment || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, filteredEvents.length)} events
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={events.length < pageSize}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

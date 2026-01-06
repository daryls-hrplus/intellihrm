import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { 
  Search, 
  History, 
  CalendarIcon, 
  User, 
  Clock,
  Edit,
  Trash,
  Plus,
  Eye,
  Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor_id: string;
  actor_role: string | null;
  changes_json: Record<string, unknown> | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

const ACTION_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  create: { color: "bg-green-500/10 text-green-600", icon: <Plus className="h-3 w-3" /> },
  update: { color: "bg-blue-500/10 text-blue-600", icon: <Edit className="h-3 w-3" /> },
  delete: { color: "bg-red-500/10 text-red-600", icon: <Trash className="h-3 w-3" /> },
  view: { color: "bg-gray-500/10 text-gray-600", icon: <Eye className="h-3 w-3" /> },
  approve: { color: "bg-emerald-500/10 text-emerald-600", icon: <Clock className="h-3 w-3" /> },
  reject: { color: "bg-orange-500/10 text-orange-600", icon: <Clock className="h-3 w-3" /> },
};

const breadcrumbItems = [
  { label: "Time & Attendance", href: "/time-attendance" },
  { label: "Audit Trail" },
];

export default function TimeAuditTrailPage() {
  const { company } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["time-audit-logs", company?.id, actionFilter, entityFilter, dateRange],
    queryFn: async () => {
      const result: { data: unknown[] | null; error: unknown } = await supabase
        .from("time_attendance_audit_log")
        .select(`*, profiles!time_attendance_audit_log_actor_id_fkey(full_name, email)`)
        .eq("company_id", company?.id)
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())
        .order("created_at", { ascending: false })
        .limit(500);

      if (result.error) throw result.error;
      
      let data = (result.data || []) as AuditLogEntry[];
      
      if (actionFilter !== "all") {
        data = data.filter(d => d.action === actionFilter);
      }
      if (entityFilter !== "all") {
        data = data.filter(d => d.entity_type === entityFilter);
      }

      return data;
    },
    enabled: !!company?.id,
  });

  const filteredLogs = logs.filter(log =>
    log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: logs.length,
    creates: logs.filter(l => l.action === "create").length,
    updates: logs.filter(l => l.action === "update").length,
    deletes: logs.filter(l => l.action === "delete").length,
  };

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "User", "Action", "Entity Type", "Entity ID", "Reason", "IP Address"].join(","),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
        log.profiles?.full_name || "Unknown",
        log.action,
        log.entity_type,
        log.entity_id,
        `"${log.reason || ""}"`,
        log.ip_address || "",
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time-audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Time & Attendance Audit Trail</h1>
            <p className="text-muted-foreground">
              Complete history of all time and attendance changes
            </p>
          </div>
          <Button onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Plus className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Creates</p>
                  <p className="text-2xl font-bold text-green-600">{stats.creates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Edit className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updates</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.updates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Trash className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deletes</p>
                  <p className="text-2xl font-bold text-red-600">{stats.deletes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>All changes to time entries, schedules, and configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="time_entry">Time Entry</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="shift">Shift</SelectItem>
                  <SelectItem value="overtime">Overtime</SelectItem>
                  <SelectItem value="regularization">Regularization</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, "PP")} - {format(dateRange.to, "PP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No audit logs found for the selected criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => {
                      const actionConfig = ACTION_CONFIG[log.action] || ACTION_CONFIG.view;
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            <div>
                              <p>{format(new Date(log.created_at), "PP")}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), "p")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{log.profiles?.full_name || "System"}</p>
                                <p className="text-xs text-muted-foreground">{log.profiles?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={actionConfig.color}>
                              <span className="flex items-center gap-1">
                                {actionConfig.icon}
                                {log.action}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="outline">{log.entity_type}</Badge>
                              <p className="text-xs text-muted-foreground mt-1 font-mono">
                                {log.entity_id.slice(0, 8)}...
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <p className="text-sm truncate">{log.reason || "—"}</p>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {log.ip_address || "—"}
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
      </div>
    </AppLayout>
  );
}

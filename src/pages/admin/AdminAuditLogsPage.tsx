import { useState, useEffect, useRef } from "react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { Json } from "@/integrations/supabase/types";
import {
  Search,
  Filter,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Download,
  LogIn,
  LogOut,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'LOGIN' | 'LOGOUT';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  old_values: Json | null;
  new_values: Json | null;
  metadata: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string | null;
}

const actionConfig: Record<AuditAction, { label: string; icon: React.ElementType; color: string }> = {
  CREATE: { label: 'Created', icon: Plus, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  UPDATE: { label: 'Updated', icon: Pencil, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  DELETE: { label: 'Deleted', icon: Trash2, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  VIEW: { label: 'Viewed', icon: Eye, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  EXPORT: { label: 'Exported', icon: Download, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
  LOGIN: { label: 'Logged In', icon: LogIn, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
  LOGOUT: { label: 'Logged Out', icon: LogOut, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
};

const PAGE_SIZE = 20;

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { logView, logExport } = useAuditLog();
  const hasLoggedView = useRef(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Build query
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }

      if (searchQuery) {
        query = query.or(`entity_name.ilike.%${searchQuery}%,entity_type.ilike.%${searchQuery}%,entity_id.ilike.%${searchQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch user profiles for the logs
      const userIds = [...new Set((data || []).map(log => log.user_id).filter(Boolean))] as string[];
      
      let profiles: Record<string, { email: string; full_name: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (profileData) {
          profiles = profileData.reduce((acc, p) => {
            acc[p.id] = { email: p.email, full_name: p.full_name };
            return acc;
          }, {} as Record<string, { email: string; full_name: string | null }>);
        }
      }

      const logsWithUsers: AuditLog[] = (data || []).map(log => ({
        ...log,
        action: log.action as AuditAction,
        user_email: log.user_id ? profiles[log.user_id]?.email : undefined,
        user_name: log.user_id ? profiles[log.user_id]?.full_name : undefined,
      }));

      setLogs(logsWithUsers);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEntityTypes = async () => {
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('entity_type')
        .limit(1000);

      if (data) {
        const types = [...new Set(data.map(d => d.entity_type))].sort();
        setEntityTypes(types);
      }
    } catch (error) {
      console.error('Error fetching entity types:', error);
    }
  };

  useEffect(() => {
    fetchEntityTypes();
    // Log view on mount
    if (!hasLoggedView.current) {
      hasLoggedView.current = true;
      logView('audit_logs', undefined, 'Audit Logs');
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter, searchQuery]);

  const formatEntityType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      // Fetch all logs with current filters (up to 10000 records)
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }

      if (searchQuery) {
        query = query.or(`entity_name.ilike.%${searchQuery}%,entity_type.ilike.%${searchQuery}%,entity_id.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no audit logs matching your current filters.",
          variant: "destructive",
        });
        return;
      }

      // Get user profiles for the export
      const userIds = [...new Set(data.map(log => log.user_id).filter(Boolean))] as string[];
      let profiles: Record<string, { email: string; full_name: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (profileData) {
          profiles = profileData.reduce((acc, p) => {
            acc[p.id] = { email: p.email, full_name: p.full_name };
            return acc;
          }, {} as Record<string, { email: string; full_name: string | null }>);
        }
      }

      // Build CSV content
      const headers = [
        'Timestamp',
        'User Name',
        'User Email',
        'Action',
        'Entity Type',
        'Entity ID',
        'Entity Name',
        'Old Values',
        'New Values',
        'Metadata'
      ];

      const rows = data.map(log => {
        const userName = log.user_id ? profiles[log.user_id]?.full_name || '' : '';
        const userEmail = log.user_id ? profiles[log.user_id]?.email || '' : '';
        
        return [
          format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
          `"${userName.replace(/"/g, '""')}"`,
          `"${userEmail.replace(/"/g, '""')}"`,
          log.action,
          log.entity_type,
          log.entity_id || '',
          `"${(log.entity_name || '').replace(/"/g, '""')}"`,
          `"${JSON.stringify(log.old_values || {}).replace(/"/g, '""')}"`,
          `"${JSON.stringify(log.new_values || {}).replace(/"/g, '""')}"`,
          `"${JSON.stringify(log.metadata || {}).replace(/"/g, '""')}"`
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit_logs_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log the export action
      await logExport('audit_logs', {
        record_count: data.length,
        filters: {
          action: actionFilter,
          entity: entityFilter,
          search: searchQuery,
        },
      });

      toast({
        title: "Export complete",
        description: `Successfully exported ${data.length} audit log records.`,
      });
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast({
        title: "Export failed",
        description: "Failed to export audit logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin & Security", href: "/admin" },
            { label: "Audit Logs" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground">
              Track all user actions across the system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={exportToCSV} 
              disabled={isExporting || loading}
            >
              <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button variant="outline" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {logs.filter(l => l.action === 'CREATE').length}
              </div>
              <p className="text-xs text-muted-foreground">Creates (this page)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {logs.filter(l => l.action === 'UPDATE').length}
              </div>
              <p className="text-xs text-muted-foreground">Updates (this page)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {logs.filter(l => l.action === 'DELETE').length}
              </div>
              <p className="text-xs text-muted-foreground">Deletes (this page)</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by entity name, type, or ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="pl-9"
                />
              </div>
              <Select
                value={actionFilter}
                onValueChange={(value) => {
                  setActionFilter(value as AuditAction | "all");
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Created</SelectItem>
                  <SelectItem value="UPDATE">Updated</SelectItem>
                  <SelectItem value="DELETE">Deleted</SelectItem>
                  <SelectItem value="VIEW">Viewed</SelectItem>
                  <SelectItem value="EXPORT">Exported</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={entityFilter}
                onValueChange={(value) => {
                  setEntityFilter(value);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {formatEntityType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity Name</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const config = actionConfig[log.action];
                    const Icon = config.icon;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDateForDisplay(log.created_at, 'MMM d, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {log.user_name || 'Unknown'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {log.user_email || log.user_id?.slice(0, 8) || 'System'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={config.color} variant="secondary">
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatEntityType(log.entity_type)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.entity_name || log.entity_id || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount} entries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                      <p>{formatDateForDisplay(selectedLog.created_at, 'PPpp')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User</label>
                      <p>{selectedLog.user_name || selectedLog.user_email || selectedLog.user_id || 'System'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Action</label>
                      <p>
                        <Badge className={actionConfig[selectedLog.action].color} variant="secondary">
                          {actionConfig[selectedLog.action].label}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Entity Type</label>
                      <p>{formatEntityType(selectedLog.entity_type)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Entity ID</label>
                      <p className="font-mono text-sm">{selectedLog.entity_id || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Entity Name</label>
                      <p>{selectedLog.entity_name || '-'}</p>
                    </div>
                  </div>

                  {selectedLog.old_values && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Previous Values</label>
                      <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-auto">
                        {JSON.stringify(selectedLog.old_values, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.new_values && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">New Values</label>
                      <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-auto">
                        {JSON.stringify(selectedLog.new_values, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.metadata && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Metadata</label>
                      <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-auto">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.user_agent && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                      <p className="text-sm text-muted-foreground break-all">{selectedLog.user_agent}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

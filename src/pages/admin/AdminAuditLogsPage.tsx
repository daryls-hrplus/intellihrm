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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Json } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
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
  CalendarIcon,
  X,
  ExternalLink,
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AuditLogDiffView } from "@/components/admin/audit/AuditLogDiffView";
import { AuditLogTrendChart } from "@/components/admin/audit/AuditLogTrendChart";
import { getRiskLevel, getRiskBadgeStyles, getEntityLink, formatEntityType } from "@/utils/auditLogUtils";
import { getModuleFromEntityType, getEntityTypesForModule, availableModules } from "@/utils/auditModuleMapping";
import { Link } from "react-router-dom";

type SortField = 'created_at' | 'user_name' | 'action' | 'risk' | 'module' | 'entity_type' | 'entity_name';
type SortDirection = 'asc' | 'desc';

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

interface SummaryStats {
  total: number;
  creates: number;
  updates: number;
  deletes: number;
  views: number;
  exports: number;
  logins: number;
  uniqueUsers: number;
  highRiskEvents: number;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
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
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    total: 0,
    creates: 0,
    updates: 0,
    deletes: 0,
    views: 0,
    exports: 0,
    logins: 0,
    uniqueUsers: 0,
    highRiskEvents: 0,
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { logView, logExport } = useAuditLog();
  const hasLoggedView = useRef(false);

  const buildBaseQuery = () => {
    let query = supabase.from('audit_logs').select('*', { count: 'exact' });

    if (actionFilter !== 'all') {
      query = query.eq('action', actionFilter);
    }
    if (entityFilter !== 'all') {
      query = query.eq('entity_type', entityFilter);
    }
    // Module filter - filter by entity types that belong to the selected module
    if (moduleFilter !== 'all') {
      const moduleEntityTypes = getEntityTypesForModule(moduleFilter);
      if (moduleEntityTypes.length > 0) {
        query = query.in('entity_type', moduleEntityTypes);
      }
    }
    if (userFilter !== 'all') {
      query = query.eq('user_id', userFilter);
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom.toISOString());
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endOfDay.toISOString());
    }
    if (searchQuery) {
      query = query.or(`entity_name.ilike.%${searchQuery}%,entity_type.ilike.%${searchQuery}%,entity_id.ilike.%${searchQuery}%`);
    }

    return query;
  };

  // Risk level priority for sorting
  const riskPriority: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Determine DB sort field (risk/module are computed client-side)
      const dbSortField = sortField === 'risk' || sortField === 'user_name' || sortField === 'module' ? 'created_at' : sortField;
      
      const query = buildBaseQuery()
        .order(dbSortField, { ascending: sortDirection === 'asc' })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

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

      let logsWithUsers: AuditLog[] = (data || []).map(log => ({
        ...log,
        action: log.action as AuditAction,
        user_email: log.user_id ? profiles[log.user_id]?.email : undefined,
        user_name: log.user_id ? profiles[log.user_id]?.full_name : undefined,
      }));

      // Client-side sorting for computed fields
      if (sortField === 'risk') {
        logsWithUsers.sort((a, b) => {
          const riskA = riskPriority[getRiskLevel(a.action, a.entity_type)] ?? 4;
          const riskB = riskPriority[getRiskLevel(b.action, b.entity_type)] ?? 4;
          return sortDirection === 'asc' ? riskA - riskB : riskB - riskA;
        });
      } else if (sortField === 'user_name') {
        logsWithUsers.sort((a, b) => {
          const nameA = (a.user_name || '').toLowerCase();
          const nameB = (b.user_name || '').toLowerCase();
          return sortDirection === 'asc' 
            ? nameA.localeCompare(nameB) 
            : nameB.localeCompare(nameA);
        });
      } else if (sortField === 'module') {
        logsWithUsers.sort((a, b) => {
          const moduleA = getModuleFromEntityType(a.entity_type).toLowerCase();
          const moduleB = getModuleFromEntityType(b.entity_type).toLowerCase();
          return sortDirection === 'asc' 
            ? moduleA.localeCompare(moduleB) 
            : moduleB.localeCompare(moduleA);
        });
      }

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

  const fetchSummaryStats = async () => {
    try {
      // Get counts by action
      const actions: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN'];
      const counts: Record<string, number> = {};

      for (const action of actions) {
        let query = supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('action', action);

        if (entityFilter !== 'all') query = query.eq('entity_type', entityFilter);
        if (userFilter !== 'all') query = query.eq('user_id', userFilter);
        if (dateFrom) query = query.gte('created_at', dateFrom.toISOString());
        if (dateTo) {
          const endOfDay = new Date(dateTo);
          endOfDay.setHours(23, 59, 59, 999);
          query = query.lte('created_at', endOfDay.toISOString());
        }
        if (searchQuery) {
          query = query.or(`entity_name.ilike.%${searchQuery}%,entity_type.ilike.%${searchQuery}%,entity_id.ilike.%${searchQuery}%`);
        }

        const { count } = await query;
        counts[action] = count || 0;
      }

      // Get unique users count
      let userQuery = supabase
        .from('audit_logs')
        .select('user_id');

      if (entityFilter !== 'all') userQuery = userQuery.eq('entity_type', entityFilter);
      if (userFilter !== 'all') userQuery = userQuery.eq('user_id', userFilter);
      if (dateFrom) userQuery = userQuery.gte('created_at', dateFrom.toISOString());
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        userQuery = userQuery.lte('created_at', endOfDay.toISOString());
      }

      const { data: userData } = await userQuery;
      const uniqueUsers = new Set((userData || []).map(u => u.user_id).filter(Boolean)).size;

      // Count high/critical risk events based on action + entity type hints
      // High risk:
      // - EXPORT of PII-like entities
      // - UPDATE of payroll/compensation/bank-like entities
      // Critical:
      // - DELETE of sensitive entities
      const sensitiveHints = ['payroll', 'compensation', 'salary', 'bank', 'employee', 'profile', 'user', 'role', 'permission', 'company', 'auth', 'credential', 'secret'];
      const piiHints = ['employee', 'profile', 'candidate', 'application', 'payroll', 'compensation', 'bank', 'users'];
      const updateSensitiveHints = ['payroll', 'compensation', 'salary', 'bank'];

      let highRiskQuery = supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });

      if (actionFilter !== 'all') highRiskQuery = highRiskQuery.eq('action', actionFilter);
      if (entityFilter !== 'all') highRiskQuery = highRiskQuery.eq('entity_type', entityFilter);
      if (userFilter !== 'all') highRiskQuery = highRiskQuery.eq('user_id', userFilter);
      if (dateFrom) highRiskQuery = highRiskQuery.gte('created_at', dateFrom.toISOString());
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        highRiskQuery = highRiskQuery.lte('created_at', endOfDay.toISOString());
      }

      // NOTE: we intentionally avoid applying searchQuery here because PostgREST only supports a single OR filter per request.
      // Risk is still fully visible per-row in the table via the Risk badge.

      const highRiskOrParts: string[] = [];
      for (const hint of piiHints) {
        highRiskOrParts.push(`and(action.eq.EXPORT,entity_type.ilike.%${hint}%)`);
      }
      for (const hint of updateSensitiveHints) {
        highRiskOrParts.push(`and(action.eq.UPDATE,entity_type.ilike.%${hint}%)`);
      }
      for (const hint of sensitiveHints) {
        highRiskOrParts.push(`and(action.eq.DELETE,entity_type.ilike.%${hint}%)`);
      }

      if (highRiskOrParts.length > 0) {
        highRiskQuery = highRiskQuery.or(highRiskOrParts.join(','));
      }

      const { count: highRiskCount } = await highRiskQuery;

      const total = Object.values(counts).reduce((a, b) => a + b, 0);

      setSummaryStats({
        total,
        creates: counts.CREATE || 0,
        updates: counts.UPDATE || 0,
        deletes: counts.DELETE || 0,
        views: counts.VIEW || 0,
        exports: counts.EXPORT || 0,
        logins: counts.LOGIN || 0,
        uniqueUsers,
        highRiskEvents: highRiskCount || 0,
      });
    } catch (error) {
      console.error('Error fetching summary stats:', error);
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

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('user_id')
        .limit(1000);

      if (data) {
        const userIds = [...new Set(data.map(d => d.user_id).filter(Boolean))] as string[];
        
        if (userIds.length > 0) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', userIds);

          if (profileData) {
            setUsers(profileData.map(p => ({
              id: p.id,
              name: p.full_name || 'Unknown',
              email: p.email,
            })));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchEntityTypes();
    fetchUsers();
    if (!hasLoggedView.current) {
      hasLoggedView.current = true;
      logView('audit_logs', undefined, 'Audit Logs');
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchSummaryStats();
  }, [page, actionFilter, entityFilter, moduleFilter, userFilter, dateFrom, dateTo, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(0);
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    return (
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 select-none transition-colors"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          {children}
          {isActive ? (
            sortDirection === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )
          ) : (
            <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />
          )}
        </div>
      </TableHead>
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActionFilter("all");
    setEntityFilter("all");
    setModuleFilter("all");
    setUserFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(0);
  };

  const hasActiveFilters = searchQuery || actionFilter !== 'all' || entityFilter !== 'all' || 
    moduleFilter !== 'all' || userFilter !== 'all' || dateFrom || dateTo;

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      let query = buildBaseQuery()
        .order('created_at', { ascending: false })
        .limit(10000);

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
        'Risk Level',
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
        const riskLevel = getRiskLevel(log.action, log.entity_type);
        
        return [
          format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
          `"${userName.replace(/"/g, '""')}"`,
          `"${userEmail.replace(/"/g, '""')}"`,
          log.action,
          riskLevel.toUpperCase(),
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
          user: userFilter,
          dateFrom: dateFrom?.toISOString(),
          dateTo: dateTo?.toISOString(),
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
              Enterprise-grade activity tracking and compliance monitoring
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

        {/* Activity Trend Chart */}
        <AuditLogTrendChart 
          dateFrom={dateFrom} 
          dateTo={dateTo}
          actionFilter={actionFilter}
          entityFilter={entityFilter}
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total Events</span>
              </div>
              <div className="text-2xl font-bold mt-1">{summaryStats.total.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Creates</span>
              </div>
              <div className="text-2xl font-bold mt-1">{summaryStats.creates.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Updates</span>
              </div>
              <div className="text-2xl font-bold mt-1">{summaryStats.updates.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Unique Users</span>
              </div>
              <div className="text-2xl font-bold mt-1">{summaryStats.uniqueUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-xs text-muted-foreground">High Risk Events</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">What counts as high risk?</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[360px]" align="start">
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">How “High Risk” is determined</p>
                      <p className="text-muted-foreground">
                        Risk is inferred from the <span className="font-medium">action</span> and the
                        <span className="font-medium"> entity type</span>.
                      </p>
                      <div className="space-y-1">
                        <p className="font-medium">High</p>
                        <ul className="list-disc pl-5 text-muted-foreground">
                          <li>Exporting PII-like entities (employees, candidates, payroll, etc.)</li>
                          <li>Updating payroll/compensation/bank-like entities</li>
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Critical</p>
                        <ul className="list-disc pl-5 text-muted-foreground">
                          <li>Deleting sensitive entities (payroll, compensation, access control, company data)</li>
                        </ul>
                      </div>
                      <p className="text-muted-foreground">
                        You can always see the calculated risk per event in the <span className="font-medium">Risk</span> column.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.highRiskEvents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4">
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
                
                {/* Date From */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full md:w-[160px] justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={(date) => {
                        setDateFrom(date);
                        setPage(0);
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>

                {/* Date To */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full md:w-[160px] justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "MMM d, yyyy") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={(date) => {
                        setDateTo(date);
                        setPage(0);
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {/* User Filter */}
                <Select
                  value={userFilter}
                  onValueChange={(value) => {
                    setUserFilter(value);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Action Filter */}
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

                {/* Module Filter */}
                <Select
                  value={moduleFilter}
                  onValueChange={(value) => {
                    setModuleFilter(value);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    {availableModules.map(module => (
                      <SelectItem key={module} value={module}>
                        {module}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Entity Filter */}
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

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="md:ml-auto">
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
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
                  <SortableHeader field="created_at">Timestamp</SortableHeader>
                  <SortableHeader field="user_name">User</SortableHeader>
                  <SortableHeader field="action">Action</SortableHeader>
                  <SortableHeader field="risk">Risk</SortableHeader>
                  <SortableHeader field="module">Module</SortableHeader>
                  <SortableHeader field="entity_type">Entity Type</SortableHeader>
                  <SortableHeader field="entity_name">Entity Name</SortableHeader>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const config = actionConfig[log.action];
                    const Icon = config.icon;
                    const riskLevel = getRiskLevel(log.action, log.entity_type);
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
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getRiskBadgeStyles(riskLevel))}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {getModuleFromEntityType(log.entity_type)}
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
          <DialogContent className="max-w-5xl w-[95vw] h-[90vh] overflow-hidden !flex !flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                Audit Log Details
                {selectedLog && (
                  <Badge 
                    variant="outline" 
                    className={cn("ml-2", getRiskBadgeStyles(getRiskLevel(selectedLog.action, selectedLog.entity_type)))}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {getRiskLevel(selectedLog.action, selectedLog.entity_type)} risk
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-6 pb-6">
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timestamp</label>
                      <p className="mt-1">{formatDateForDisplay(selectedLog.created_at, 'PPpp')}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User</label>
                      <p className="mt-1">{selectedLog.user_name || selectedLog.user_email || selectedLog.user_id || 'System'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</label>
                      <p className="mt-1">
                        <Badge className={actionConfig[selectedLog.action].color} variant="secondary">
                          {actionConfig[selectedLog.action].label}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity Type</label>
                      <p className="mt-1">{formatEntityType(selectedLog.entity_type)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity ID</label>
                      <p className="mt-1 font-mono text-sm">{selectedLog.entity_id || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity Name</label>
                      <div className="mt-1 flex items-center gap-2">
                        <span>{selectedLog.entity_name || '-'}</span>
                        {getEntityLink(selectedLog.entity_type, selectedLog.entity_id) && (
                          <Link 
                            to={getEntityLink(selectedLog.entity_type, selectedLog.entity_id)!}
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Data Changes - Visual Diff */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-3">Data Changes</label>
                    <AuditLogDiffView 
                      oldValues={selectedLog.old_values}
                      newValues={selectedLog.new_values}
                      action={selectedLog.action}
                    />
                  </div>

                  {/* Metadata */}
                  {selectedLog.metadata && Object.keys(selectedLog.metadata as object).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">Additional Metadata</label>
                      <pre className="p-3 bg-muted rounded-md text-sm overflow-auto">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* User Agent */}
                  {selectedLog.user_agent && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">User Agent</label>
                      <p className="text-sm text-muted-foreground break-all bg-muted p-3 rounded-md">
                        {selectedLog.user_agent}
                      </p>
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

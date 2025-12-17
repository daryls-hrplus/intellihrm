import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { getTodayString } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Eye,
  EyeOff,
  Shield,
  User,
  Calendar,
  Clock,
  FileText,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Filter,
  Users,
  Building2,
} from "lucide-react";

interface PiiAccessLog {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string;
  entity_type: string;
  entity_name: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  has_pii_permission: boolean;
}

interface UserWithPiiAccess {
  id: string;
  email: string;
  full_name: string | null;
  can_view_pii: boolean;
  role_name: string;
}

const PII_ENTITY_TYPES = [
  "employees_list",
  "users_list",
  "profile",
  "profiles",
  "employee_detail",
];

const breadcrumbItems = [
  { label: "Admin", href: "/admin" },
  { label: "PII Access Report" },
];

export default function AdminPiiAccessPage() {
  const [accessLogs, setAccessLogs] = useState<PiiAccessLog[]>([]);
  const [usersWithPii, setUsersWithPii] = useState<UserWithPiiAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [timeFilter, setTimeFilter] = useState("7d");
  const [userFilter, setUserFilter] = useState("all");
  const { toast } = useToast();
  const { logView, logExport } = useAuditLog();
  const hasLoggedView = useRef(false);

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  useEffect(() => {
    if (accessLogs.length > 0 && !hasLoggedView.current) {
      hasLoggedView.current = true;
      logView("pii_access_report", undefined, "PII Access Report", {
        log_count: accessLogs.length,
      });
    }
  }, [accessLogs]);

  const getDateFilter = () => {
    const now = new Date();
    switch (timeFilter) {
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case "90d":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch users with their PII permissions
      const { data: userRolesData, error: userRolesError } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role_id,
          roles:role_id (
            name,
            can_view_pii
          )
        `);

      if (userRolesError) throw userRolesError;

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (profilesError) throw profilesError;

      // Build user PII access map
      const userPiiMap = new Map<string, { can_view_pii: boolean; role_name: string }>();
      (userRolesData || []).forEach((ur: any) => {
        const current = userPiiMap.get(ur.user_id);
        const canView = ur.roles?.can_view_pii || false;
        const roleName = ur.roles?.name || "Unknown";
        
        if (!current || canView) {
          userPiiMap.set(ur.user_id, { 
            can_view_pii: current?.can_view_pii || canView,
            role_name: roleName 
          });
        }
      });

      // Build users with PII access list
      const usersWithPiiAccess: UserWithPiiAccess[] = (profilesData || []).map((p) => {
        const piiInfo = userPiiMap.get(p.id) || { can_view_pii: false, role_name: "Employee" };
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          can_view_pii: piiInfo.can_view_pii,
          role_name: piiInfo.role_name,
        };
      });

      setUsersWithPii(usersWithPiiAccess);

      // Fetch audit logs for PII-related views
      const dateFilter = getDateFilter();
      const { data: logsData, error: logsError } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("action", "VIEW")
        .in("entity_type", PII_ENTITY_TYPES)
        .gte("created_at", dateFilter)
        .order("created_at", { ascending: false })
        .limit(500);

      if (logsError) throw logsError;

      // Map logs with user info and PII permission status
      const mappedLogs: PiiAccessLog[] = (logsData || []).map((log) => {
        const userProfile = profilesData?.find((p) => p.id === log.user_id);
        const piiInfo = userPiiMap.get(log.user_id || "");

        return {
          id: log.id,
          user_id: log.user_id || "",
          user_name: userProfile?.full_name || null,
          user_email: userProfile?.email || "Unknown",
          entity_type: log.entity_type,
          entity_name: log.entity_name,
          created_at: log.created_at,
          metadata: log.metadata as Record<string, unknown> | null,
          has_pii_permission: piiInfo?.can_view_pii || false,
        };
      });

      setAccessLogs(mappedLogs);
    } catch (error) {
      console.error("Error fetching PII access data:", error);
      toast({
        title: "Error",
        description: "Failed to load PII access data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const headers = [
        "Timestamp",
        "User Name",
        "User Email",
        "Has PII Permission",
        "Entity Type",
        "Entity Name",
        "Access Status",
      ];

      const rows = filteredLogs.map((log) => [
        new Date(log.created_at).toISOString(),
        log.user_name || "Unknown",
        log.user_email,
        log.has_pii_permission ? "Yes" : "No",
        log.entity_type,
        log.entity_name || "-",
        log.has_pii_permission ? "Authorized" : "Restricted View",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pii-access-report-${getTodayString()}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      await logExport("pii_access_report", {
        record_count: filteredLogs.length,
        filters: { timeFilter, userFilter },
      });

      toast({ title: "Export complete" });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export report.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const filteredLogs = accessLogs.filter((log) => {
    if (userFilter === "all") return true;
    if (userFilter === "authorized") return log.has_pii_permission;
    if (userFilter === "restricted") return !log.has_pii_permission;
    return true;
  });

  const stats = {
    totalAccess: filteredLogs.length,
    authorizedAccess: filteredLogs.filter((l) => l.has_pii_permission).length,
    restrictedAccess: filteredLogs.filter((l) => !l.has_pii_permission).length,
    uniqueUsers: new Set(filteredLogs.map((l) => l.user_id)).size,
    usersWithPiiPermission: usersWithPii.filter((u) => u.can_view_pii).length,
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEntityLabel = (type: string) => {
    switch (type) {
      case "employees_list":
        return "Employee Directory";
      case "users_list":
        return "User Management";
      case "profile":
      case "profiles":
        return "User Profile";
      case "employee_detail":
        return "Employee Detail";
      default:
        return type;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PII Access Report</h1>
            <p className="text-muted-foreground mt-1">
              Monitor access to personal identifiable information for GDPR compliance
            </p>
          </div>
          <Button onClick={handleExport} disabled={isExporting || isLoading}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Access</p>
                <p className="mt-1 text-3xl font-bold">{stats.totalAccess}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Eye className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Authorized</p>
                <p className="mt-1 text-3xl font-bold text-success">{stats.authorizedAccess}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3 text-success">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Restricted</p>
                <p className="mt-1 text-3xl font-bold text-amber-600">{stats.restrictedAccess}</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3 text-amber-600">
                <EyeOff className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                <p className="mt-1 text-3xl font-bold">{stats.uniqueUsers}</p>
              </div>
              <div className="rounded-lg bg-info/10 p-3 text-info">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">PII Enabled</p>
                <p className="mt-1 text-3xl font-bold">{stats.usersWithPiiPermission}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="authorized">Authorized Only</SelectItem>
                <SelectItem value="restricted">Restricted Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users with PII Access */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            Users with PII Access Permission
          </h3>
          <div className="flex flex-wrap gap-2">
            {usersWithPii
              .filter((u) => u.can_view_pii)
              .map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                    {user.full_name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <span className="font-medium">{user.full_name || user.email}</span>
                  <span className="text-xs text-muted-foreground">({user.role_name})</span>
                </div>
              ))}
            {usersWithPii.filter((u) => u.can_view_pii).length === 0 && (
              <p className="text-sm text-muted-foreground">No users have PII access permission</p>
            )}
          </div>
        </div>

        {/* Access Log Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <FileText className="h-5 w-5" />
              Access Log ({filteredLogs.length} records)
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No PII access records found for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Data Accessed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-muted/30">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDateTime(log.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {log.user_name?.[0] || log.user_email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{log.user_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{log.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {getEntityLabel(log.entity_type)}
                            </p>
                            {log.entity_name && (
                              <p className="text-xs text-muted-foreground">{log.entity_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.has_pii_permission ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Full Access
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
                            <EyeOff className="h-3.5 w-3.5" />
                            Masked View
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

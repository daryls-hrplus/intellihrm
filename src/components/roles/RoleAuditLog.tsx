import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, RefreshCw, Search, Filter, User, Settings, Eye, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface AuditEntry {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

interface RoleAuditLogProps {
  roleId: string;
}

export function RoleAuditLog({ roleId }: RoleAuditLogProps) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    fetchAuditLogs();
  }, [roleId]);

  const fetchAuditLogs = async () => {
    try {
      // Fetch audit logs related to this role
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .or(`entity_id.eq.${roleId},metadata->role_id.eq.${roleId}`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setEntries((data || []) as AuditEntry[]);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Settings className="h-4 w-4 text-green-500" />;
      case "update":
        return <Settings className="h-4 w-4 text-blue-500" />;
      case "delete":
        return <Settings className="h-4 w-4 text-red-500" />;
      case "view":
        return <Eye className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Created</Badge>;
      case "update":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Updated</Badge>;
      case "delete":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Deleted</Badge>;
      case "view":
        return <Badge variant="outline">Viewed</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = searchTerm === "" || 
      JSON.stringify(entry).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || entry.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Role Audit Trail
            </CardTitle>
            <CardDescription>
              Complete history of changes to this role
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAuditLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Created</SelectItem>
              <SelectItem value="update">Updated</SelectItem>
              <SelectItem value="delete">Deleted</SelectItem>
              <SelectItem value="view">Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No audit entries found</p>
            <p className="text-sm">Changes to this role will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="mt-1">{getActionIcon(entry.action)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActionBadge(entry.action)}
                    <span className="text-sm text-muted-foreground">
                      {entry.entity_type}
                    </span>
                  </div>
                  
                  {entry.new_values && Object.keys(entry.new_values).length > 0 && (
                    <div className="text-sm mt-2">
                      <span className="text-muted-foreground">Changes: </span>
                      {Object.entries(entry.new_values).slice(0, 3).map(([key, value], i) => (
                        <span key={key}>
                          {i > 0 && ", "}
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {key}: {String(value).substring(0, 30)}
                          </code>
                        </span>
                      ))}
                      {Object.keys(entry.new_values).length > 3 && (
                        <span className="text-muted-foreground"> +{Object.keys(entry.new_values).length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">
                      {entry.user_id?.substring(0, 8) || "System"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDateForDisplay(entry.created_at)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(entry.created_at), "h:mm a")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

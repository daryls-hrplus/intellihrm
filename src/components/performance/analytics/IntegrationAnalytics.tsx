import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useIntegrationDashboard, IntegrationLog } from "@/hooks/useIntegrationDashboard";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { 
  GitBranch, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Check,
  X,
  RefreshCw,
  Grid3X3,
  Users,
  Target,
  DollarSign,
  Bell,
  Calendar,
  BarChart3,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";

interface IntegrationAnalyticsProps {
  companyId?: string;
  cycleId?: string;
}

const PERFORMANCE_MODULES = ['nine_box', 'succession', 'idp', 'pip', 'compensation', 'notifications', 'reminders', 'workforce_analytics'];

const MODULE_ICONS: Record<string, React.ElementType> = {
  nine_box: Grid3X3,
  succession: Users,
  idp: Target,
  pip: AlertTriangle,
  compensation: DollarSign,
  notifications: Bell,
  reminders: Calendar,
  workforce_analytics: BarChart3
};

const MODULE_LABELS: Record<string, string> = {
  nine_box: "9-Box Placement",
  succession: "Succession Planning",
  idp: "Individual Development Plan",
  pip: "Performance Improvement Plan",
  compensation: "Compensation Review",
  notifications: "Notifications",
  reminders: "Reminders",
  workforce_analytics: "Workforce Analytics"
};

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-500/20 text-green-700 dark:text-green-400",
  pending_approval: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  failed: "bg-destructive/20 text-destructive"
};

export function IntegrationAnalytics({ companyId, cycleId }: IntegrationAnalyticsProps) {
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [detailLog, setDetailLog] = useState<IntegrationLog | null>(null);
  
  const { logs, stats, loading, error, bulkApprove, bulkReject, retryIntegration, fetchLogs } = 
    useIntegrationDashboard({
      companyId: companyId || '',
      cycleId,
      targetModules: moduleFilter !== 'all' ? [moduleFilter] : PERFORMANCE_MODULES,
      status: statusFilter !== 'all' ? [statusFilter] : undefined,
    });

  const pendingLogs = logs.filter(l => l.action_result === 'pending_approval');
  const failedLogs = logs.filter(l => l.action_result === 'failed');

  const handleSelectAll = (checked: boolean) => {
    setSelectedLogs(checked ? logs.map(l => l.id) : []);
  };

  const handleSelectLog = (logId: string, checked: boolean) => {
    setSelectedLogs(prev => checked ? [...prev, logId] : prev.filter(id => id !== logId));
  };

  const handleBulkApprove = async () => {
    await bulkApprove(selectedLogs);
    setSelectedLogs([]);
  };

  const handleBulkReject = async () => {
    await bulkReject(selectedLogs, 'Rejected via bulk action');
    setSelectedLogs([]);
  };

  if (!companyId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Select a company to view integration analytics
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </div>
              <GitBranch className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">{stats.successRate}%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stats.success} successful
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.pending > 0 ? "border-amber-500/50" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-amber-600 mt-1">Awaiting review</p>
              </div>
              <Clock className="h-10 w-10 text-amber-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.failed > 0 ? "border-destructive/50" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-3xl font-bold text-destructive">{stats.failed}</p>
                <p className="text-xs text-destructive mt-1">Can be retried</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-destructive/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5">
              <GitBranch className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1.5">
              <Clock className="h-4 w-4" />
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="failed" className="gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Failed ({stats.failed})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {PERFORMANCE_MODULES.map(m => (
                  <SelectItem key={m} value={m}>{MODULE_LABELS[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Module Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integration Activity by Module</CardTitle>
              <CardDescription>Distribution of appraisal-triggered actions across modules</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.byModule).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No integration activity yet</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.byModule).map(([module, counts]) => {
                    const ModuleIcon = MODULE_ICONS[module] || GitBranch;
                    const total = counts.success + counts.pending + counts.failed;
                    const successPct = total > 0 ? Math.round((counts.success / total) * 100) : 0;
                    return (
                      <Card key={module} className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <ModuleIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{MODULE_LABELS[module]}</p>
                              <p className="text-2xl font-bold">{total}</p>
                              <div className="flex gap-2 mt-1 text-xs">
                                <span className="text-green-600">{counts.success} ✓</span>
                                {counts.pending > 0 && <span className="text-amber-600">{counts.pending} ⏳</span>}
                                {counts.failed > 0 && <span className="text-destructive">{counts.failed} ✗</span>}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Latest 5 integration executions</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No activity in the last 30 days</p>
              ) : (
                <div className="space-y-2">
                  {logs.slice(0, 5).map((log) => {
                    const ModuleIcon = MODULE_ICONS[log.target_module] || GitBranch;
                    return (
                      <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <ModuleIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{log.employee_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {MODULE_LABELS[log.target_module]} • {log.action_type} • {formatDateForDisplay(log.created_at, "MMM d, HH:mm")}
                            </p>
                          </div>
                        </div>
                        <Badge className={STATUS_COLORS[log.action_result] || "bg-muted"}>
                          {log.action_result === 'pending_approval' ? 'Pending' : log.action_result}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Integration Activity Log</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending_approval">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <IntegrationLogTable 
                logs={logs} 
                onViewDetails={setDetailLog}
                onRetry={retryIntegration}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    Pending Approvals
                  </CardTitle>
                  <CardDescription>{pendingLogs.length} integration(s) awaiting your review</CardDescription>
                </div>
                {selectedLogs.length > 0 && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleBulkApprove}>
                      <Check className="h-4 w-4 mr-1 text-green-600" />
                      Approve ({selectedLogs.length})
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleBulkReject}>
                      <X className="h-4 w-4 mr-1 text-destructive" />
                      Reject ({selectedLogs.length})
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pendingLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No pending approvals</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedLogs.length === pendingLogs.length && pendingLogs.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Target Module</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Triggered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLogs.map((log) => {
                      const ModuleIcon = MODULE_ICONS[log.target_module] || GitBranch;
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedLogs.includes(log.id)}
                              onCheckedChange={(checked) => handleSelectLog(log.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{log.employee_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ModuleIcon className="h-4 w-4 text-muted-foreground" />
                              {MODULE_LABELS[log.target_module]}
                            </div>
                          </TableCell>
                          <TableCell>{log.action_type}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateForDisplay(log.created_at, "MMM d, HH:mm")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => bulkApprove([log.id])}>
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => bulkReject([log.id], 'Rejected')}>
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setDetailLog(log)}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </div>
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

        {/* Failed Tab */}
        <TabsContent value="failed">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Failed Integrations
              </CardTitle>
              <CardDescription>{failedLogs.length} integration(s) failed and can be retried</CardDescription>
            </CardHeader>
            <CardContent>
              {failedLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No failed integrations</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Target Module</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Failed At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedLogs.map((log) => {
                      const ModuleIcon = MODULE_ICONS[log.target_module] || GitBranch;
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.employee_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ModuleIcon className="h-4 w-4 text-muted-foreground" />
                              {MODULE_LABELS[log.target_module]}
                            </div>
                          </TableCell>
                          <TableCell>{log.action_type}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-destructive text-sm">
                            {log.error_message || 'Unknown error'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateForDisplay(log.created_at, "MMM d, HH:mm")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="outline" onClick={() => retryIntegration(log.id)}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Retry
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setDetailLog(log)}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </div>
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
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailLog} onOpenChange={() => setDetailLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Integration Details</DialogTitle>
            <DialogDescription>
              {detailLog?.employee_name} • {detailLog && MODULE_LABELS[detailLog.target_module]}
            </DialogDescription>
          </DialogHeader>
          {detailLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[detailLog.action_result] || "bg-muted"}>
                    {detailLog.action_result}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Action Type</p>
                  <p className="font-medium">{detailLog.action_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trigger Event</p>
                  <p className="font-medium">{detailLog.trigger_event}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">{formatDateForDisplay(detailLog.created_at, "PPpp")}</p>
                </div>
              </div>
              
              {detailLog.rule_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Rule</p>
                  <p className="font-medium">{detailLog.rule_name}</p>
                </div>
              )}

              {detailLog.error_message && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-muted-foreground mb-1">Error Message</p>
                  <p className="text-sm text-destructive">{detailLog.error_message}</p>
                </div>
              )}

              {detailLog.trigger_data && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Trigger Data</p>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48">
                    {JSON.stringify(detailLog.trigger_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for activity log table
function IntegrationLogTable({ 
  logs, 
  onViewDetails,
  onRetry
}: { 
  logs: IntegrationLog[]; 
  onViewDetails: (log: IntegrationLog) => void;
  onRetry: (logId: string) => void;
}) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No integration activity found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Target Module</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const ModuleIcon = MODULE_ICONS[log.target_module] || GitBranch;
          return (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{log.employee_name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ModuleIcon className="h-4 w-4 text-muted-foreground" />
                  {MODULE_LABELS[log.target_module]}
                </div>
              </TableCell>
              <TableCell>{log.action_type}</TableCell>
              <TableCell>
                <Badge className={STATUS_COLORS[log.action_result] || "bg-muted"}>
                  {log.action_result === 'pending_approval' ? 'Pending' : log.action_result}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateForDisplay(log.created_at, "MMM d, HH:mm")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {log.action_result === 'failed' && (
                    <Button size="sm" variant="ghost" onClick={() => onRetry(log.id)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => onViewDetails(log)}>
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

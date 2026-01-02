import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIntegrationDashboard, DashboardFilters, IntegrationLog } from "@/hooks/useIntegrationDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { 
  GitBranch, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Check, 
  X,
  ExternalLink,
  BarChart3,
  Target,
  Users,
  DollarSign,
  Bell,
  Calendar,
  Grid3X3,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Company {
  id: string;
  name: string;
}

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
  nine_box: "9-Box",
  succession: "Succession",
  idp: "IDP",
  pip: "PIP",
  compensation: "Compensation",
  notifications: "Notifications",
  reminders: "HR Reminders",
  workforce_analytics: "Analytics"
};

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-500/20 text-green-600",
  pending_approval: "bg-amber-500/20 text-amber-600",
  failed: "bg-red-500/20 text-red-600",
  rejected: "bg-gray-500/20 text-gray-600",
  retrying: "bg-blue-500/20 text-blue-600"
};

export default function IntegrationDashboardPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companiesLoading, setCompaniesLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [detailLog, setDetailLog] = useState<IntegrationLog | null>(null);
  
  const [filters, setFilters] = useState<DashboardFilters>({
    companyId: "",
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (data) {
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompany(data[0].id);
          setFilters(prev => ({ ...prev, companyId: data[0].id }));
        }
      }
      setCompaniesLoading(false);
    };
    fetchCompanies();
  }, []);

  // Update filters when company changes
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    setFilters(prev => ({ ...prev, companyId }));
  };

  const { logs, stats, loading, fetchLogs, bulkApprove, bulkReject, retryIntegration } = 
    useIntegrationDashboard({ ...filters, companyId: selectedCompany || "" });

  const pendingLogs = logs.filter(l => l.action_result === 'pending_approval');
  const failedLogs = logs.filter(l => l.action_result === 'failed');

  const handleSelectAll = (checked: boolean) => {
    const targetLogs = activeTab === 'pending' ? pendingLogs : activeTab === 'failed' ? failedLogs : logs;
    setSelectedLogs(checked ? targetLogs.map(l => l.id) : []);
  };

  const handleSelectLog = (logId: string, checked: boolean) => {
    setSelectedLogs(prev => 
      checked ? [...prev, logId] : prev.filter(id => id !== logId)
    );
  };

  const handleBulkApprove = async () => {
    await bulkApprove(selectedLogs);
    setSelectedLogs([]);
  };

  const handleBulkReject = async () => {
    await bulkReject(selectedLogs, rejectReason);
    setSelectedLogs([]);
    setRejectReason("");
    setRejectDialogOpen(false);
  };

  const handleRetry = async (logId: string) => {
    await retryIntegration(logId);
  };

  const navigateToTarget = (log: IntegrationLog) => {
    if (!log.target_record_id) return;
    
    const routes: Record<string, string> = {
      nine_box: '/succession/nine-box',
      succession: '/succession/plans',
      idp: '/ess/development',
      pip: '/performance/pips',
      compensation: '/compensation/history'
    };

    const route = routes[log.target_module];
    if (route) navigate(route);
  };

  const breadcrumbItems = [
    { label: t("hrHub.title"), href: "/hr-hub" },
    { label: t("hrHub.integrationHub") }
  ];

  const getStatusBadge = (status: string) => (
    <Badge className={STATUS_COLORS[status] || "bg-gray-500/20 text-gray-600"}>
      {status === 'pending_approval' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );

  const renderLogTable = (logList: IntegrationLog[], showCheckbox = true) => (
    <Table>
      <TableHeader>
        <TableRow>
          {showCheckbox && (
            <TableHead className="w-10">
              <Checkbox 
                checked={selectedLogs.length === logList.length && logList.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
          )}
          <TableHead>Employee</TableHead>
          <TableHead>Cycle</TableHead>
          <TableHead>Module</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showCheckbox ? 8 : 7} className="text-center text-muted-foreground py-8">
              No integration logs found
            </TableCell>
          </TableRow>
        ) : (
          logList.map((log) => {
            const ModuleIcon = MODULE_ICONS[log.target_module] || GitBranch;
            return (
              <TableRow key={log.id}>
                {showCheckbox && (
                  <TableCell>
                    <Checkbox 
                      checked={selectedLogs.includes(log.id)}
                      onCheckedChange={(checked) => handleSelectLog(log.id, !!checked)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{log.employee_name}</TableCell>
                <TableCell>{log.cycle_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ModuleIcon className="h-4 w-4 text-muted-foreground" />
                    {MODULE_LABELS[log.target_module] || log.target_module}
                  </div>
                </TableCell>
                <TableCell className="capitalize">{log.action_type}</TableCell>
                <TableCell>{getStatusBadge(log.action_result)}</TableCell>
                <TableCell>{formatDateForDisplay(log.created_at, "MMM d, HH:mm")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {log.action_result === 'pending_approval' && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => bulkApprove([log.id])}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          setSelectedLogs([log.id]);
                          setRejectDialogOpen(true);
                        }}>
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    {log.action_result === 'failed' && (
                      <Button size="sm" variant="ghost" onClick={() => handleRetry(log.id)}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    {log.target_record_id && (
                      <Button size="sm" variant="ghost" onClick={() => navigateToTarget(log)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setDetailLog(log)}>
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  if (companiesLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("hrHub.integrationHub")}</h1>
              <p className="text-muted-foreground">{t("hrHub.integrationHubDesc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCompany || ""} onValueChange={handleCompanyChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Executions</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                {loading ? <Skeleton className="h-8 w-16" /> : stats.total}
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Successful</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2 text-green-600">
                {loading ? <Skeleton className="h-8 w-16" /> : stats.success}
                <CheckCircle className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stats.successRate}% success rate</p>
            </CardContent>
          </Card>

          <Card className={stats.pending > 0 ? "border-amber-500/50" : ""}>
            <CardHeader className="pb-2">
              <CardDescription>Pending Approval</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2 text-amber-600">
                {loading ? <Skeleton className="h-8 w-16" /> : stats.pending}
                <Clock className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.pending > 0 ? "Requires action" : "All caught up"}
              </p>
            </CardContent>
          </Card>

          <Card className={stats.failed > 0 ? "border-red-500/50" : ""}>
            <CardHeader className="pb-2">
              <CardDescription>Failed</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2 text-red-600">
                {loading ? <Skeleton className="h-8 w-16" /> : stats.failed}
                <AlertTriangle className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.failed > 0 ? "Review & retry" : "No failures"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Integration Activity</CardTitle>
              {selectedLogs.length > 0 && activeTab === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleBulkApprove}>
                    <Check className="h-4 w-4 mr-1" />
                    Approve ({selectedLogs.length})
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setRejectDialogOpen(true)}>
                    <X className="h-4 w-4 mr-1" />
                    Reject ({selectedLogs.length})
                  </Button>
                </div>
              )}
              {selectedLogs.length > 0 && activeTab === 'failed' && (
                <Button size="sm" onClick={() => selectedLogs.forEach(handleRetry)}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry ({selectedLogs.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedLogs([]); }}>
              <TabsList>
                <TabsTrigger value="all">
                  All Activity
                  <Badge variant="secondary" className="ml-2">{logs.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending Approvals
                  {stats.pending > 0 && (
                    <Badge className="ml-2 bg-amber-500">{stats.pending}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="failed">
                  Failed
                  {stats.failed > 0 && (
                    <Badge className="ml-2 bg-red-500">{stats.failed}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="by-module">By Module</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  renderLogTable(logs)
                )}
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  renderLogTable(pendingLogs)
                )}
              </TabsContent>

              <TabsContent value="failed" className="mt-4">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  renderLogTable(failedLogs)
                )}
              </TabsContent>

              <TabsContent value="by-module" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.byModule).map(([module, counts]) => {
                    const ModuleIcon = MODULE_ICONS[module] || GitBranch;
                    return (
                      <Card key={module}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <ModuleIcon className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm">{MODULE_LABELS[module] || module}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">{counts.success} ✓</span>
                            <span className="text-amber-600">{counts.pending} ⏳</span>
                            <span className="text-red-600">{counts.failed} ✗</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {Object.keys(stats.byModule).length === 0 && (
                    <div className="col-span-4 text-center text-muted-foreground py-8">
                      No module data available
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Integration(s)</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting {selectedLogs.length} integration(s).
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleBulkReject} disabled={!rejectReason.trim()}>
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={!!detailLog} onOpenChange={() => setDetailLog(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Integration Details</DialogTitle>
            </DialogHeader>
            {detailLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Employee</p>
                    <p className="font-medium">{detailLog.employee_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cycle</p>
                    <p className="font-medium">{detailLog.cycle_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Module</p>
                    <p className="font-medium">{MODULE_LABELS[detailLog.target_module]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Action</p>
                    <p className="font-medium capitalize">{detailLog.action_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    {getStatusBadge(detailLog.action_result)}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Executed</p>
                    <p className="font-medium">
                      {detailLog.executed_at 
                        ? formatDateForDisplay(detailLog.executed_at, "MMM d, yyyy HH:mm") 
                        : "Not yet"}
                    </p>
                  </div>
                </div>
                
                {detailLog.error_message && (
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Error</p>
                    <p className="text-sm">{detailLog.error_message}</p>
                  </div>
                )}

                {detailLog.rejection_reason && (
                  <div className="p-3 bg-gray-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium">Rejection Reason</p>
                    <p className="text-sm">{detailLog.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailLog(null)}>Close</Button>
              {detailLog?.target_record_id && (
                <Button onClick={() => { navigateToTarget(detailLog); setDetailLog(null); }}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Target Record
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

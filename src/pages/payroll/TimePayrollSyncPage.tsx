import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeClockPayrollSync } from "@/hooks/useTimeClockPayrollSync";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Clock, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Users,
  Timer,
  FileText,
  Undo2,
  Loader2,
  ArrowRight
} from "lucide-react";

interface PayPeriod {
  id: string;
  period_number: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: string;
  schedule?: {
    name: string;
    frequency: string;
  };
}

interface SyncLog {
  id: string;
  sync_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  employees_processed: number;
  records_created: number;
  records_updated: number;
  total_regular_hours: number;
  total_overtime_hours: number;
  pay_period?: {
    period_number: string;
    period_start: string;
    period_end: string;
  };
  created_by_user?: {
    full_name: string;
  };
}

export default function TimePayrollSyncPage() {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<PayPeriod | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncLog[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({
    timeClock: 0,
    timesheets: 0,
    overtime: 0
  });

  const [syncOptions, setSyncOptions] = useState({
    includeTimeClock: true,
    includeTimesheets: true,
    includeOvertimeRequests: true,
    overtimeThresholdPerDay: 8,
    overtimeThresholdPerWeek: 40,
    roundingRule: 'nearest_15' as const
  });

  const {
    isLoading,
    isSyncing,
    previewSync,
    executeSync,
    fetchSyncHistory,
    reverseSync,
    fetchPendingTimeClockEntries,
    fetchApprovedTimesheets,
    fetchApprovedOvertimeRequests
  } = useTimeClockPayrollSync();

  // Fetch pay periods
  useEffect(() => {
    const loadPayPeriods = async () => {
      if (!companyId) return;

      const { data, error } = await supabase
        .from("pay_periods")
        .select(`
          *,
          schedule:pay_period_schedules(name, frequency)
        `)
        .eq("company_id", companyId)
        .in("status", ["open", "processing"])
        .order("period_start", { ascending: false })
        .limit(20);

      if (!error && data) {
        setPayPeriods(data);
        if (data.length > 0 && !selectedPeriodId) {
          setSelectedPeriodId(data[0].id);
        }
      }
    };

    loadPayPeriods();
  }, [companyId, selectedPeriodId]);

  // Update selected period when ID changes
  useEffect(() => {
    const period = payPeriods.find(p => p.id === selectedPeriodId);
    setSelectedPeriod(period || null);
  }, [selectedPeriodId, payPeriods]);

  // Fetch pending counts and sync history when period changes
  useEffect(() => {
    const loadData = async () => {
      if (!companyId || !selectedPeriod) return;

      // Fetch sync history
      const history = await fetchSyncHistory(companyId);
      setSyncHistory(history);

      // Fetch pending counts
      const [timeClockEntries, timesheets, overtimeRequests] = await Promise.all([
        fetchPendingTimeClockEntries(companyId, selectedPeriod.period_start, selectedPeriod.period_end),
        fetchApprovedTimesheets(companyId, selectedPeriod.period_start, selectedPeriod.period_end),
        fetchApprovedOvertimeRequests(companyId, selectedPeriod.period_start, selectedPeriod.period_end)
      ]);

      setPendingCounts({
        timeClock: timeClockEntries.length,
        timesheets: timesheets.length,
        overtime: overtimeRequests.length
      });
    };

    loadData();
  }, [companyId, selectedPeriod, fetchSyncHistory, fetchPendingTimeClockEntries, fetchApprovedTimesheets, fetchApprovedOvertimeRequests]);

  // Handle preview
  const handlePreview = async () => {
    if (!companyId || !selectedPeriod) return;

    setIsPreviewLoading(true);
    try {
      const preview = await previewSync(
        companyId,
        selectedPeriod.id,
        selectedPeriod.period_start,
        selectedPeriod.period_end,
        syncOptions
      );
      setPreviewData(preview);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Handle sync
  const handleSync = async () => {
    if (!companyId || !selectedPeriod) return;

    setShowConfirmDialog(false);
    
    const result = await executeSync(
      companyId,
      selectedPeriod.id,
      selectedPeriod.period_start,
      selectedPeriod.period_end,
      syncOptions
    );

    if (result?.success) {
      // Refresh data
      const history = await fetchSyncHistory(companyId);
      setSyncHistory(history);
      
      // Refresh pending counts
      const [timeClockEntries, timesheets, overtimeRequests] = await Promise.all([
        fetchPendingTimeClockEntries(companyId, selectedPeriod.period_start, selectedPeriod.period_end),
        fetchApprovedTimesheets(companyId, selectedPeriod.period_start, selectedPeriod.period_end),
        fetchApprovedOvertimeRequests(companyId, selectedPeriod.period_start, selectedPeriod.period_end)
      ]);

      setPendingCounts({
        timeClock: timeClockEntries.length,
        timesheets: timesheets.length,
        overtime: overtimeRequests.length
      });

      setPreviewData([]);
    }
  };

  // Handle reverse sync
  const handleReverseSync = async (syncLogId: string) => {
    const success = await reverseSync(syncLogId);
    if (success && companyId) {
      const history = await fetchSyncHistory(companyId);
      setSyncHistory(history);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'reversed':
        return <Badge variant="outline">Reversed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPending = pendingCounts.timeClock + pendingCounts.timesheets + pendingCounts.overtime;

  const breadcrumbs = [
    { label: "Payroll", href: "/payroll" },
    { label: "Time Import", href: "/payroll/time-sync" }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Time Import Dashboard</h1>
            <p className="text-muted-foreground">
              Import time clock, timesheet, and overtime data into payroll work records
            </p>
          </div>
          <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select pay period" />
            </SelectTrigger>
            <SelectContent>
              {payPeriods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.period_number} ({format(new Date(period.period_start), "MMM d")} - {format(new Date(period.period_end), "MMM d, yyyy")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Time Clock Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCounts.timeClock}</div>
              <p className="text-xs text-muted-foreground">Pending import</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                Timesheet Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCounts.timesheets}</div>
              <p className="text-xs text-muted-foreground">Approved, pending import</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-500" />
                Overtime Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCounts.overtime}</div>
              <p className="text-xs text-muted-foreground">Approved, pending import</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                Total Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPending}</div>
              <p className="text-xs text-muted-foreground">Records to import</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="import" className="w-full">
          <TabsList>
            <TabsTrigger value="import">Import Time Data</TabsTrigger>
            <TabsTrigger value="history">Sync History</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            {/* Import Options */}
            <Card>
              <CardHeader>
                <CardTitle>Import Options</CardTitle>
                <CardDescription>
                  Configure what data to import and how hours should be calculated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Sources */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Data Sources</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="timeClock"
                        checked={syncOptions.includeTimeClock}
                        onCheckedChange={(checked) => 
                          setSyncOptions(prev => ({ ...prev, includeTimeClock: !!checked }))
                        }
                      />
                      <Label htmlFor="timeClock" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time Clock Entries ({pendingCounts.timeClock})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="timesheets"
                        checked={syncOptions.includeTimesheets}
                        onCheckedChange={(checked) => 
                          setSyncOptions(prev => ({ ...prev, includeTimesheets: !!checked }))
                        }
                      />
                      <Label htmlFor="timesheets" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Timesheets ({pendingCounts.timesheets})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="overtime"
                        checked={syncOptions.includeOvertimeRequests}
                        onCheckedChange={(checked) => 
                          setSyncOptions(prev => ({ ...prev, includeOvertimeRequests: !!checked }))
                        }
                      />
                      <Label htmlFor="overtime" className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Overtime Requests ({pendingCounts.overtime})
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Overtime Thresholds */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailyThreshold">Daily Overtime Threshold (hours)</Label>
                    <Input
                      id="dailyThreshold"
                      type="number"
                      value={syncOptions.overtimeThresholdPerDay}
                      onChange={(e) => setSyncOptions(prev => ({ 
                        ...prev, 
                        overtimeThresholdPerDay: parseFloat(e.target.value) || 8 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Hours over this threshold per day are counted as overtime
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeklyThreshold">Weekly Overtime Threshold (hours)</Label>
                    <Input
                      id="weeklyThreshold"
                      type="number"
                      value={syncOptions.overtimeThresholdPerWeek}
                      onChange={(e) => setSyncOptions(prev => ({ 
                        ...prev, 
                        overtimeThresholdPerWeek: parseFloat(e.target.value) || 40 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Hours over this threshold per week are counted as overtime
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Rounding Rule */}
                <div className="space-y-2">
                  <Label>Time Rounding Rule</Label>
                  <Select 
                    value={syncOptions.roundingRule} 
                    onValueChange={(value: any) => setSyncOptions(prev => ({ ...prev, roundingRule: value }))}
                  >
                    <SelectTrigger className="w-[280px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Rounding</SelectItem>
                      <SelectItem value="nearest_15">Round to Nearest 15 Minutes</SelectItem>
                      <SelectItem value="nearest_30">Round to Nearest 30 Minutes</SelectItem>
                      <SelectItem value="up_15">Round Up to 15 Minutes</SelectItem>
                      <SelectItem value="up_30">Round Up to 30 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handlePreview} disabled={isPreviewLoading || totalPending === 0}>
                    {isPreviewLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading Preview...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Preview Import
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Results */}
            {previewData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Import Preview</span>
                    <Button onClick={() => setShowConfirmDialog(true)} disabled={isSyncing}>
                      {isSyncing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Import to Payroll
                        </>
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Review the data that will be imported to payroll work records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Regular Hours</TableHead>
                        <TableHead className="text-right">Overtime Hours</TableHead>
                        <TableHead className="text-right">Total Hours</TableHead>
                        <TableHead>Sources</TableHead>
                        <TableHead className="text-right">Records</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((item) => (
                        <TableRow key={item.employeeId}>
                          <TableCell className="font-medium">{item.employeeName}</TableCell>
                          <TableCell className="text-right">{item.regularHours.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.overtimeHours.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">{item.totalHours.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {item.sources.map((source: string) => (
                                <Badge key={source} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.sourceCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Employees:</span>
                        <span className="ml-2 font-medium">{previewData.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Regular:</span>
                        <span className="ml-2 font-medium">
                          {previewData.reduce((sum, item) => sum + item.regularHours, 0).toFixed(2)} hrs
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Overtime:</span>
                        <span className="ml-2 font-medium">
                          {previewData.reduce((sum, item) => sum + item.overtimeHours, 0).toFixed(2)} hrs
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Hours:</span>
                        <span className="ml-2 font-medium">
                          {previewData.reduce((sum, item) => sum + item.totalHours, 0).toFixed(2)} hrs
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {totalPending === 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  No pending time data to import for this pay period. All approved entries have been synced.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Sync History</CardTitle>
                <CardDescription>
                  View past import operations and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {syncHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No sync history found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Pay Period</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Employees</TableHead>
                        <TableHead className="text-right">Records</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead>By</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncHistory.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {format(new Date(log.started_at), "MMM d, yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            {log.pay_period?.period_number || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.sync_type}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell className="text-right">{log.employees_processed}</TableCell>
                          <TableCell className="text-right">{log.records_created + log.records_updated}</TableCell>
                          <TableCell className="text-right">
                            {(log.total_regular_hours + log.total_overtime_hours).toFixed(1)}
                          </TableCell>
                          <TableCell>{log.created_by_user?.full_name || '-'}</TableCell>
                          <TableCell>
                            {log.status === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReverseSync(log.id)}
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Import</DialogTitle>
              <DialogDescription>
                You are about to import time data to payroll work records. This action will:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Create {previewData.length} employee work records</li>
                <li>Import {previewData.reduce((sum, item) => sum + item.regularHours, 0).toFixed(2)} regular hours</li>
                <li>Import {previewData.reduce((sum, item) => sum + item.overtimeHours, 0).toFixed(2)} overtime hours</li>
              </ul>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Imported records will be linked to their source entries. You can reverse this operation from the Sync History tab if needed.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSync}>
                <Upload className="h-4 w-4 mr-2" />
                Confirm Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Play, 
  Settings, 
  History, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  RefreshCw,
  Bell,
  Building2
} from "lucide-react";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";

type ScheduleType = 'daily_accrual' | 'monthly_accrual' | 'year_end_rollover';

interface ScheduleConfig {
  id: string;
  company_id: string;
  schedule_type: ScheduleType;
  is_enabled: boolean;
  run_time: string;
  run_day_of_month: number | null;
  last_run_at: string | null;
  last_run_status: string | null;
  last_run_message: string | null;
  next_run_at: string | null;
  notify_on_completion: boolean;
  notify_on_failure: boolean;
  companies?: { name: string };
}

interface ScheduleRun {
  id: string;
  config_id: string;
  company_id: string;
  schedule_type: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  employees_processed: number;
  records_created: number;
  records_updated: number;
  error_message: string | null;
  details: any;
  companies?: { name: string };
}

const SCHEDULE_TYPES: { value: ScheduleType; label: string; description: string }[] = [
  { value: 'daily_accrual', label: 'Daily Accrual', description: 'Calculate leave accruals daily' },
  { value: 'monthly_accrual', label: 'Monthly Accrual', description: 'Calculate leave accruals monthly' },
  { value: 'year_end_rollover', label: 'Year-End Rollover', description: 'Process leave balance rollover at year end' },
];

export default function LeaveScheduleConfigPage() {
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ScheduleConfig | null>(null);
  const [formData, setFormData] = useState<{
    schedule_type: ScheduleType;
    is_enabled: boolean;
    run_time: string;
    run_day_of_month: number;
    notify_on_completion: boolean;
    notify_on_failure: boolean;
  }>({
    schedule_type: 'daily_accrual',
    is_enabled: true,
    run_time: '02:00',
    run_day_of_month: 1,
    notify_on_completion: true,
    notify_on_failure: true,
  });

  // Fetch schedule configs
  const { data: configs, isLoading: configsLoading } = useQuery({
    queryKey: ['leave-schedule-configs', selectedCompanyId],
    queryFn: async () => {
      let query = supabase
        .from('leave_schedule_config')
        .select('*, companies(name)')
        .order('schedule_type');
      
      if (selectedCompanyId) {
        query = query.eq('company_id', selectedCompanyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ScheduleConfig[];
    },
  });

  // Fetch run history
  const { data: runHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['leave-schedule-runs', selectedCompanyId],
    queryFn: async () => {
      let query = supabase
        .from('leave_schedule_runs')
        .select('*, companies(name)')
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (selectedCompanyId) {
        query = query.eq('company_id', selectedCompanyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ScheduleRun[];
    },
  });

  // Create/update config mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { company_id: string; id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('leave_schedule_config')
          .update({
            is_enabled: data.is_enabled,
            run_time: data.run_time,
            run_day_of_month: data.schedule_type === 'monthly_accrual' ? data.run_day_of_month : null,
            notify_on_completion: data.notify_on_completion,
            notify_on_failure: data.notify_on_failure,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('leave_schedule_config')
          .insert({
            company_id: data.company_id,
            schedule_type: data.schedule_type,
            is_enabled: data.is_enabled,
            run_time: data.run_time,
            run_day_of_month: data.schedule_type === 'monthly_accrual' ? data.run_day_of_month : null,
            notify_on_completion: data.notify_on_completion,
            notify_on_failure: data.notify_on_failure,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-schedule-configs'] });
      toast.success(editingConfig ? 'Schedule updated' : 'Schedule created');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save schedule');
    },
  });

  // Run schedule manually
  const runMutation = useMutation({
    mutationFn: async ({ schedule_type, company_id }: { schedule_type: string; company_id: string }) => {
      const { data, error } = await supabase.functions.invoke('process-leave-schedules', {
        body: { schedule_type, company_id, force_run: true },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-schedule-configs'] });
      queryClient.invalidateQueries({ queryKey: ['leave-schedule-runs'] });
      toast.success('Schedule processing started');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to run schedule');
    },
  });

  // Toggle enabled mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase
        .from('leave_schedule_config')
        .update({ is_enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-schedule-configs'] });
      toast.success('Schedule updated');
    },
  });

  const resetForm = () => {
    setFormData({
      schedule_type: 'daily_accrual',
      is_enabled: true,
      run_time: '02:00',
      run_day_of_month: 1,
      notify_on_completion: true,
      notify_on_failure: true,
    });
    setEditingConfig(null);
  };

  const handleEdit = (config: ScheduleConfig) => {
    setEditingConfig(config);
    setFormData({
      schedule_type: config.schedule_type,
      is_enabled: config.is_enabled,
      run_time: config.run_time?.slice(0, 5) || '02:00',
      run_day_of_month: config.run_day_of_month || 1,
      notify_on_completion: config.notify_on_completion,
      notify_on_failure: config.notify_on_failure,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedCompanyId && !editingConfig) {
      toast.error('Please select a company first');
      return;
    }
    saveMutation.mutate({
      ...formData,
      company_id: editingConfig?.company_id || selectedCompanyId,
      id: editingConfig?.id,
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'running':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
      default:
        return <Badge variant="outline">Never Run</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    return SCHEDULE_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Leave", href: "/leave" },
            { label: "Schedule Configuration" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leave Schedule Configuration</h1>
            <p className="text-muted-foreground">
              Configure automated overnight leave calculations and year-end rollover processing
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LeaveCompanyFilter
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} disabled={!selectedCompanyId}>
              <Settings className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
        </div>

        <Tabs defaultValue="schedules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedules">
              <Calendar className="h-4 w-4 mr-2" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Run History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedules">
            <Card>
              <CardHeader>
                <CardTitle>Configured Schedules</CardTitle>
                <CardDescription>
                  Manage automated leave processing schedules by company
                </CardDescription>
              </CardHeader>
              <CardContent>
                {configsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : !configs?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No schedules configured</p>
                    <p className="text-sm">Select a company and add a schedule to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Schedule Type</TableHead>
                        <TableHead>Run Time</TableHead>
                        <TableHead>Last Run</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notifications</TableHead>
                        <TableHead>Enabled</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configs.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {config.companies?.name || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>{getTypeLabel(config.schedule_type)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {config.run_time?.slice(0, 5)}
                              {config.run_day_of_month && (
                                <span className="text-muted-foreground ml-1">
                                  (Day {config.run_day_of_month})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {config.last_run_at ? (
                              <span className="text-sm">
                                {format(new Date(config.last_run_at), 'MMM d, yyyy HH:mm')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">Never</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(config.last_run_status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {config.notify_on_completion && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Bell className="h-4 w-4 text-green-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>Notify on completion</TooltipContent>
                                </Tooltip>
                              )}
                              {config.notify_on_failure && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Bell className="h-4 w-4 text-red-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>Notify on failure</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={config.is_enabled}
                              onCheckedChange={(checked) => 
                                toggleMutation.mutate({ id: config.id, is_enabled: checked })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(config)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => runMutation.mutate({
                                  schedule_type: config.schedule_type,
                                  company_id: config.company_id,
                                })}
                                disabled={runMutation.isPending}
                              >
                                {runMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Run History</CardTitle>
                    <CardDescription>
                      View past schedule execution results
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['leave-schedule-runs'] })}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : !runHistory?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No run history available</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Schedule Type</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Records</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {runHistory.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell>{run.companies?.name || 'Unknown'}</TableCell>
                          <TableCell>{getTypeLabel(run.schedule_type)}</TableCell>
                          <TableCell>
                            {format(new Date(run.started_at), 'MMM d, HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            {run.completed_at ? (
                              format(new Date(run.completed_at), 'HH:mm:ss')
                            ) : (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(run.status)}</TableCell>
                          <TableCell>{run.employees_processed}</TableCell>
                          <TableCell>
                            <span className="text-green-600">+{run.records_created}</span>
                            {' / '}
                            <span className="text-blue-600">~{run.records_updated}</span>
                          </TableCell>
                          <TableCell>
                            {run.error_message ? (
                              <span className="text-destructive text-sm truncate max-w-[200px] block">
                                {run.error_message}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Edit Schedule' : 'Add Schedule'}
              </DialogTitle>
              <DialogDescription>
                Configure automated leave processing schedule
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Schedule Type</Label>
                <Select
                  value={formData.schedule_type}
                  onValueChange={(value: ScheduleType) => setFormData({ ...formData, schedule_type: value })}
                  disabled={!!editingConfig}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div>{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Run Time</Label>
                <Input
                  type="time"
                  value={formData.run_time}
                  onChange={(e) => setFormData({ ...formData, run_time: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Time to run the schedule (in server timezone)
                </p>
              </div>

              {formData.schedule_type === 'monthly_accrual' && (
                <div className="space-y-2">
                  <Label>Day of Month</Label>
                  <Select
                    value={String(formData.run_day_of_month)}
                    onValueChange={(value) => setFormData({ ...formData, run_day_of_month: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={String(day)}>
                          Day {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enabled</Label>
                    <p className="text-xs text-muted-foreground">Schedule will run automatically</p>
                  </div>
                  <Switch
                    checked={formData.is_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notify on Completion</Label>
                    <p className="text-xs text-muted-foreground">Send notification to HR admins</p>
                  </div>
                  <Switch
                    checked={formData.notify_on_completion}
                    onCheckedChange={(checked) => setFormData({ ...formData, notify_on_completion: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notify on Failure</Label>
                    <p className="text-xs text-muted-foreground">Alert HR admins if processing fails</p>
                  </div>
                  <Switch
                    checked={formData.notify_on_failure}
                    onCheckedChange={(checked) => setFormData({ ...formData, notify_on_failure: checked })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingConfig ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

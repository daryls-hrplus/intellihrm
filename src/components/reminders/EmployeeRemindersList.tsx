import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReminders } from '@/hooks/useReminders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Pencil, X, Bell, Mail, BellRing, Loader2, Calendar, User, Clock, CheckCircle2, XCircle, Send, HelpCircle, UserCheck, ExternalLink, FileText, Award, Plane, GraduationCap, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import type { EmployeeReminder, ReminderEventType } from '@/types/reminders';
import { PRIORITY_OPTIONS, NOTIFICATION_METHODS, REMINDER_STATUS, REMINDER_CATEGORIES } from '@/types/reminders';
import { supabase } from '@/integrations/supabase/client';
import { formatDateForDisplay } from '@/utils/dateUtils';

interface EmployeeRemindersListProps {
  companyId: string;
  departmentId?: string;
  creatorRole: 'admin' | 'hr' | 'manager';
  directReportsOnly?: boolean;
  managerId?: string;
}

// Map source_table to employee tab and display info
const SOURCE_TABLE_CONFIG: Record<string, { label: string; tab: string; icon: React.ReactNode }> = {
  'employee_certificates': { label: 'Certificate', tab: 'certificates', icon: <Award className="h-3.5 w-3.5" /> },
  'employee_licenses': { label: 'License', tab: 'licenses', icon: <FileCheck className="h-3.5 w-3.5" /> },
  'employee_travel_documents': { label: 'Travel Doc', tab: 'immigration', icon: <Plane className="h-3.5 w-3.5" /> },
  'employee_work_permits': { label: 'Work Permit', tab: 'immigration', icon: <FileText className="h-3.5 w-3.5" /> },
  'employee_training': { label: 'Training', tab: 'training', icon: <GraduationCap className="h-3.5 w-3.5" /> },
  'profiles': { label: 'Employee', tab: 'overview', icon: <User className="h-3.5 w-3.5" /> },
};

export function EmployeeRemindersList({ 
  companyId, 
  departmentId,
  creatorRole,
  directReportsOnly = false,
  managerId
}: EmployeeRemindersListProps) {
  const navigate = useNavigate();
  const { fetchReminders, fetchEventTypes, createReminder, updateReminder, cancelReminder, isLoading } = useReminders();
  const [reminders, setReminders] = useState<EmployeeReminder[]>([]);
  const [eventTypes, setEventTypes] = useState<ReminderEventType[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<EmployeeReminder | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  const [newInterval, setNewInterval] = useState('');
  const [formData, setFormData] = useState<{
    employee_id: string;
    event_type_id: string;
    title: string;
    message: string;
    event_date: string;
    reminder_intervals: number[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    notification_method: 'in_app' | 'email' | 'both';
    can_employee_dismiss: boolean;
    is_recurring: boolean;
    recurrence_pattern: string;
    notes: string;
  }>({
    employee_id: '',
    event_type_id: '',
    title: '',
    message: '',
    event_date: '',
    reminder_intervals: [7],
    priority: 'medium',
    notification_method: 'both',
    can_employee_dismiss: true,
    is_recurring: false,
    recurrence_pattern: '',
    notes: '',
  });

  const addInterval = () => {
    const value = parseInt(newInterval);
    if (value >= 0 && value <= 365 && !formData.reminder_intervals.includes(value)) {
      const newIntervals = [...formData.reminder_intervals, value].sort((a, b) => b - a);
      setFormData({ ...formData, reminder_intervals: newIntervals });
      setNewInterval('');
    }
  };

  const removeInterval = (interval: number) => {
    const newIntervals = formData.reminder_intervals.filter(i => i !== interval);
    if (newIntervals.length > 0) {
      setFormData({ ...formData, reminder_intervals: newIntervals });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [remindersData, typesData] = await Promise.all([
        fetchReminders({ 
          companyId, 
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          eventTypeId: eventTypeFilter !== 'all' ? eventTypeFilter : undefined
        }),
        fetchEventTypes(),
      ]);
      
      // Filter for manager's direct reports if needed
      let filteredReminders = remindersData;
      if (directReportsOnly && managerId) {
        const { data: directReports } = await supabase.rpc('get_manager_direct_reports', { p_manager_id: managerId });
        const reportIds = directReports?.map((r: any) => r.employee_id) || [];
        filteredReminders = remindersData.filter(r => reportIds.includes(r.employee_id));
      }
      
      setReminders(filteredReminders);
      setEventTypes(typesData);

      // Fetch employees for the dropdown
      let employeeQuery = supabase.from('profiles').select('id, full_name, email');
      if (companyId && companyId !== 'all') {
        employeeQuery = employeeQuery.eq('company_id', companyId);
      }
      if (directReportsOnly && managerId) {
        const { data: directReports } = await supabase.rpc('get_manager_direct_reports', { p_manager_id: managerId });
        const reportIds = directReports?.map((r: any) => r.employee_id) || [];
        employeeQuery = employeeQuery.in('id', reportIds);
      }
      const { data: employeesData } = await employeeQuery;
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId, statusFilter, categoryFilter, eventTypeFilter]);

  // Get event types filtered by selected category
  const filteredEventTypes = categoryFilter === 'all' 
    ? eventTypes 
    : eventTypes.filter(et => et.category === categoryFilter);

  // Reset event type filter when category changes (if the selected event type is no longer in category)
  useEffect(() => {
    if (eventTypeFilter !== 'all') {
      const selectedEventType = eventTypes.find(et => et.id === eventTypeFilter);
      if (selectedEventType && categoryFilter !== 'all' && selectedEventType.category !== categoryFilter) {
        setEventTypeFilter('all');
      }
    }
  }, [categoryFilter, eventTypes, eventTypeFilter]);

  const handleOpenDialog = (reminder?: EmployeeReminder) => {
    if (reminder) {
      setEditingReminder(reminder);
      // Calculate days between event_date and reminder_date for editing
      const eventDate = new Date(reminder.event_date);
      const reminderDate = new Date(reminder.reminder_date);
      const daysDiff = Math.ceil((eventDate.getTime() - reminderDate.getTime()) / (1000 * 60 * 60 * 24));
      setFormData({
        employee_id: reminder.employee_id,
        event_type_id: reminder.event_type_id || '',
        title: reminder.title,
        message: reminder.message || '',
        event_date: reminder.event_date,
        reminder_intervals: [daysDiff >= 0 ? daysDiff : 0],
        priority: reminder.priority as 'low' | 'medium' | 'high' | 'critical',
        notification_method: reminder.notification_method as 'in_app' | 'email' | 'both',
        can_employee_dismiss: reminder.can_employee_dismiss,
        is_recurring: reminder.is_recurring,
        recurrence_pattern: reminder.recurrence_pattern || '',
        notes: reminder.notes || '',
      });
    } else {
      setEditingReminder(null);
      setFormData({
        employee_id: '',
        event_type_id: '',
        title: '',
        message: '',
        event_date: '',
        reminder_intervals: [7],
        priority: 'medium',
        notification_method: 'both',
        can_employee_dismiss: true,
        is_recurring: false,
        recurrence_pattern: '',
        notes: '',
      });
    }
    setNewInterval('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingReminder) {
        // For editing, calculate reminder_date from event_date and first interval
        const eventDate = new Date(formData.event_date);
        const reminderDate = new Date(eventDate);
        reminderDate.setDate(reminderDate.getDate() - formData.reminder_intervals[0]);
        
        await updateReminder(editingReminder.id, {
          ...formData,
          reminder_date: reminderDate.toISOString().split('T')[0],
        });
      } else {
        // For creating, create multiple reminders based on intervals
        const eventDate = new Date(formData.event_date);
        
        for (const interval of formData.reminder_intervals) {
          const reminderDate = new Date(eventDate);
          reminderDate.setDate(reminderDate.getDate() - interval);
          
          await createReminder({
            ...formData,
            company_id: companyId,
            reminder_date: reminderDate.toISOString().split('T')[0],
          }, creatorRole);
        }
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this reminder?')) {
      await cancelReminder(id);
      loadData();
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'in_app': return <Bell className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <BellRing className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-muted text-muted-foreground',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      critical: 'bg-destructive/10 text-destructive',
    };
    return <Badge className={colors[priority] || colors.medium}>{priority}</Badge>;
  };

  const getSourceConfig = (sourceTable: string | null) => {
    if (!sourceTable) return null;
    return SOURCE_TABLE_CONFIG[sourceTable] || { label: sourceTable.replace('employee_', '').replace(/_/g, ' '), tab: 'overview', icon: <FileText className="h-3.5 w-3.5" /> };
  };

  const handleNavigateToSource = (reminder: EmployeeReminder) => {
    if (!reminder.employee_id) return;
    const config = getSourceConfig(reminder.source_table);
    const tab = config?.tab || 'overview';
    navigate(`/workforce/employees/${reminder.employee_id}?tab=${tab}`);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      dismissed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return <Badge className={colors[status] || colors.pending}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-md z-50">
              <SelectItem value="all">All Statuses</SelectItem>
              {REMINDER_STATUS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-md z-50">
              <SelectItem value="all">All Categories</SelectItem>
              {REMINDER_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-[220px] bg-background">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-md z-50 max-h-[300px] min-w-[280px]">
              <SelectItem value="all">All Event Types</SelectItem>
              {filteredEventTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm p-4">
                <div className="space-y-2">
                  <p className="font-semibold flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-600" />
                    When to use Manual Reminders
                  </p>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    <li>Send a <strong>one-time reminder</strong> to a specific employee</li>
                    <li>Perfect for ad-hoc tasks, follow-ups, or custom deadlines</li>
                    <li>You choose exactly who receives the reminder and when</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    Example: "Remind John to submit his expense report by Friday" - a one-off notification just for John.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Send className="h-4 w-4 mr-2" />
                Create Reminder
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-t-4 border-t-blue-600">
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-600/10">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{editingReminder ? 'Edit Reminder' : 'Create Manual Reminder'}</DialogTitle>
                  <DialogDescription className="mt-1">
                    Send a one-time reminder to a specific employee for a particular event or task
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            {/* Quick Guide Banner */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400">Manual Reminder</p>
                <p className="text-muted-foreground">
                  This reminder is for <strong>one specific employee</strong> only. 
                  Use for ad-hoc notifications, personal follow-ups, or custom deadlines that don't apply to everyone.
                </p>
              </div>
            </div>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Employee *
                    <span className="text-xs text-muted-foreground">(Who receives this)</span>
                  </Label>
                  <Select
                    value={formData.employee_id}
                    onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Event Type <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                  <Select
                    value={formData.event_type_id}
                    onValueChange={(v) => setFormData({ ...formData, event_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Reminder title"
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Reminder message"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Event Date *</Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Reminder Intervals (days before event)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.reminder_intervals.map((interval) => (
                    <Badge key={interval} variant="secondary" className="px-3 py-1 text-sm">
                      {interval === 0 ? 'On event day' : `${interval} days before`}
                      <button
                        type="button"
                        onClick={() => removeInterval(interval)}
                        className="ml-2 hover:text-destructive"
                        disabled={formData.reminder_intervals.length === 1}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={365}
                    placeholder="Days before (e.g., 10)"
                    value={newInterval}
                    onChange={(e) => setNewInterval(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterval())}
                    className="w-40"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addInterval}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add multiple intervals to send reminders at different times (e.g., 30, 14, 7, 3 days before). Use 0 for the event day.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v: any) => setFormData({ ...formData, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notification Method</Label>
                  <Select
                    value={formData.notification_method}
                    onValueChange={(v: any) => setFormData({ ...formData, notification_method: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_METHODS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 pt-8">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.can_employee_dismiss}
                      onCheckedChange={(v) => setFormData({ ...formData, can_employee_dismiss: v })}
                    />
                    <Label>Can dismiss</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSave} 
                disabled={isLoading || !formData.employee_id || !formData.title || !formData.event_date || formData.reminder_intervals.length === 0}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingReminder ? 'Update' : `Create ${formData.reminder_intervals.length > 1 ? `(${formData.reminder_intervals.length} reminders)` : ''}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {reminders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reminders found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Reminder Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => {
                const sourceConfig = getSourceConfig(reminder.source_table);
                return (
                  <TableRow key={reminder.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <button 
                          onClick={() => navigate(`/workforce/employees/${reminder.employee_id}?tab=overview`)}
                          className="hover:underline hover:text-primary transition-colors text-left"
                        >
                          {reminder.employee?.full_name || '-'}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <button
                          onClick={() => handleNavigateToSource(reminder)}
                          className="font-medium hover:underline hover:text-primary transition-colors text-left"
                        >
                          {reminder.title}
                        </button>
                        {reminder.event_type && (
                          <span className="text-xs text-muted-foreground block">{reminder.event_type.name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sourceConfig ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleNavigateToSource(reminder)}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-xs font-medium transition-colors"
                              >
                                {sourceConfig.icon}
                                {sourceConfig.label}
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View {sourceConfig.label} in employee profile</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateForDisplay(reminder.event_date, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{formatDateForDisplay(reminder.reminder_date, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{getPriorityBadge(reminder.priority)}</TableCell>
                    <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                    <TableCell>
                      <span className="text-xs capitalize">{reminder.created_by_role || 'system'}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {reminder.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(reminder)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleCancel(reminder.id)}>
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

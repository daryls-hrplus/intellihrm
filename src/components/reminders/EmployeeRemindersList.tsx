import { useState, useEffect } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, X, Bell, Mail, BellRing, Loader2, Calendar, User, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { EmployeeReminder, ReminderEventType } from '@/types/reminders';
import { PRIORITY_OPTIONS, NOTIFICATION_METHODS, REMINDER_STATUS, REMINDER_CATEGORIES } from '@/types/reminders';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeRemindersListProps {
  companyId: string;
  departmentId?: string;
  creatorRole: 'admin' | 'hr' | 'manager';
  directReportsOnly?: boolean;
  managerId?: string;
}

export function EmployeeRemindersList({ 
  companyId, 
  departmentId,
  creatorRole,
  directReportsOnly = false,
  managerId
}: EmployeeRemindersListProps) {
  const { fetchReminders, fetchEventTypes, createReminder, updateReminder, cancelReminder, isLoading } = useReminders();
  const [reminders, setReminders] = useState<EmployeeReminder[]>([]);
  const [eventTypes, setEventTypes] = useState<ReminderEventType[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<EmployeeReminder | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState<{
    employee_id: string;
    event_type_id: string;
    title: string;
    message: string;
    event_date: string;
    reminder_date: string;
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
    reminder_date: '',
    priority: 'medium',
    notification_method: 'both',
    can_employee_dismiss: true,
    is_recurring: false,
    recurrence_pattern: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [remindersData, typesData] = await Promise.all([
        fetchReminders({ 
          companyId, 
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined
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
  }, [companyId, statusFilter, categoryFilter]);

  const handleOpenDialog = (reminder?: EmployeeReminder) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        employee_id: reminder.employee_id,
        event_type_id: reminder.event_type_id || '',
        title: reminder.title,
        message: reminder.message || '',
        event_date: reminder.event_date,
        reminder_date: reminder.reminder_date,
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
        reminder_date: '',
        priority: 'medium',
        notification_method: 'both',
        can_employee_dismiss: true,
        is_recurring: false,
        recurrence_pattern: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingReminder) {
        await updateReminder(editingReminder.id, formData);
      } else {
        await createReminder({
          ...formData,
          company_id: companyId,
        }, creatorRole);
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
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {REMINDER_STATUS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {REMINDER_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Create Reminder'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee *</Label>
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
                  <Label>Event Type</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Date *</Label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reminder Date *</Label>
                  <Input
                    type="date"
                    value={formData.reminder_date}
                    onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                  />
                </div>
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
                disabled={isLoading || !formData.employee_id || !formData.title || !formData.event_date || !formData.reminder_date}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingReminder ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                <TableHead>Event Date</TableHead>
                <TableHead>Reminder Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{reminder.employee?.full_name || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reminder.title}</div>
                      {reminder.event_type && (
                        <span className="text-xs text-muted-foreground">{reminder.event_type.name}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(reminder.event_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(reminder.reminder_date), 'MMM dd, yyyy')}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Bell, Mail, BellRing, Loader2, X } from 'lucide-react';
import type { ReminderRule, ReminderEventType } from '@/types/reminders';
import { PRIORITY_OPTIONS, NOTIFICATION_METHODS } from '@/types/reminders';

interface ReminderRulesManagerProps {
  companyId: string;
}

export function ReminderRulesManager({ companyId }: ReminderRulesManagerProps) {
  const { fetchRules, fetchEventTypes, createRule, updateRule, deleteRule, isLoading } = useReminders();
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [eventTypes, setEventTypes] = useState<ReminderEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null);
  const [newInterval, setNewInterval] = useState<string>('');
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    event_type_id: string;
    days_before: number;
    reminder_intervals: number[];
    send_to_employee: boolean;
    send_to_manager: boolean;
    send_to_hr: boolean;
    notification_method: 'in_app' | 'email' | 'both';
    message_template: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    is_active: boolean;
  }>({
    name: '',
    description: '',
    event_type_id: '',
    days_before: 7,
    reminder_intervals: [7],
    send_to_employee: true,
    send_to_manager: true,
    send_to_hr: false,
    notification_method: 'both',
    message_template: '',
    priority: 'medium',
    is_active: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesData, typesData] = await Promise.all([
        fetchRules(companyId),
        fetchEventTypes(),
      ]);
      setRules(rulesData);
      setEventTypes(typesData);
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const handleOpenDialog = (rule?: ReminderRule) => {
    if (rule) {
      setEditingRule(rule);
      const intervals = rule.reminder_intervals || [rule.days_before];
      setFormData({
        name: rule.name,
        description: rule.description || '',
        event_type_id: rule.event_type_id,
        days_before: rule.days_before,
        reminder_intervals: intervals,
        send_to_employee: rule.send_to_employee,
        send_to_manager: rule.send_to_manager,
        send_to_hr: rule.send_to_hr,
        notification_method: rule.notification_method as 'in_app' | 'email' | 'both',
        message_template: rule.message_template || '',
        priority: rule.priority as 'low' | 'medium' | 'high' | 'critical',
        is_active: rule.is_active,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        event_type_id: '',
        days_before: 7,
        reminder_intervals: [7],
        send_to_employee: true,
        send_to_manager: true,
        send_to_hr: false,
        notification_method: 'both',
        message_template: '',
        priority: 'medium',
        is_active: true,
      });
    }
    setNewInterval('');
    setDialogOpen(true);
  };

  const addInterval = () => {
    const value = parseInt(newInterval);
    if (value > 0 && value <= 365 && !formData.reminder_intervals.includes(value)) {
      const newIntervals = [...formData.reminder_intervals, value].sort((a, b) => b - a);
      setFormData({ ...formData, reminder_intervals: newIntervals, days_before: newIntervals[0] });
      setNewInterval('');
    }
  };

  const removeInterval = (interval: number) => {
    const newIntervals = formData.reminder_intervals.filter(i => i !== interval);
    if (newIntervals.length > 0) {
      setFormData({ ...formData, reminder_intervals: newIntervals, days_before: newIntervals[0] });
    }
  };

  const handleSave = async () => {
    try {
      if (editingRule) {
        await updateRule(editingRule.id, formData);
      } else {
        await createRule({
          ...formData,
          company_id: companyId,
        });
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(id);
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

  const getPriorityColor = (priority: string) => {
    const option = PRIORITY_OPTIONS.find(p => p.value === priority);
    return option?.color || 'text-muted-foreground';
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Automatic Reminder Rules</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Reminder Rule' : 'Create Reminder Rule'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., 30-day probation reminder"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select
                    value={formData.event_type_id}
                    onValueChange={(v) => setFormData({ ...formData, event_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="space-y-2">
                <Label>Reminder Intervals (days before event)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.reminder_intervals.map((interval) => (
                    <Badge key={interval} variant="secondary" className="px-3 py-1 text-sm">
                      {interval} days
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
                    min={1}
                    max={365}
                    placeholder="Add interval (e.g., 10)"
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
                  Add multiple intervals to send reminders at different times (e.g., 30, 14, 7, 3 days before)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
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
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Send To</Label>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.send_to_employee}
                      onCheckedChange={(v) => setFormData({ ...formData, send_to_employee: v })}
                    />
                    <span className="text-sm">Employee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.send_to_manager}
                      onCheckedChange={(v) => setFormData({ ...formData, send_to_manager: v })}
                    />
                    <span className="text-sm">Manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.send_to_hr}
                      onCheckedChange={(v) => setFormData({ ...formData, send_to_hr: v })}
                    />
                    <span className="text-sm">HR</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Message Template (Optional)</Label>
                <Textarea
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  placeholder="Custom message template. Use {employee_name}, {event_date}, {days_until} as placeholders."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !formData.name || !formData.event_type_id}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingRule ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reminder rules configured</p>
            <p className="text-sm text-muted-foreground">Create rules to automatically send reminders for important events</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Reminder Intervals</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => {
                const intervals = rule.reminder_intervals || [rule.days_before];
                return (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.event_type?.name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {intervals.sort((a, b) => b - a).map((interval) => (
                        <Badge key={interval} variant="outline" className="text-xs">
                          {interval}d
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {rule.send_to_employee && <Badge variant="outline" className="text-xs">Employee</Badge>}
                      {rule.send_to_manager && <Badge variant="outline" className="text-xs">Manager</Badge>}
                      {rule.send_to_hr && <Badge variant="outline" className="text-xs">HR</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{getMethodIcon(rule.notification_method)}</TableCell>
                  <TableCell>
                    <span className={getPriorityColor(rule.priority)}>{rule.priority}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(rule)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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

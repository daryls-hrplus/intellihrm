import { useState, useEffect } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Calendar, Clock, CheckCircle2, Loader2, AlertTriangle, Info } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import type { EmployeeReminder } from '@/types/reminders';
import { REMINDER_STATUS, REMINDER_CATEGORIES } from '@/types/reminders';

interface MyRemindersListProps {
  showCreateButton?: boolean;
}

export function MyRemindersList({ showCreateButton = false }: MyRemindersListProps) {
  const { fetchMyReminders, dismissReminder, isLoading } = useReminders();
  const [reminders, setReminders] = useState<EmployeeReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMyReminders(statusFilter !== 'all' ? statusFilter : undefined);
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleDismiss = async (reminder: EmployeeReminder) => {
    if (!reminder.can_employee_dismiss) {
      return;
    }
    await dismissReminder(reminder.id);
    loadData();
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <Bell className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `${Math.abs(differenceInDays(date, new Date()))} days ago`;
    const days = differenceInDays(date, new Date());
    return `In ${days} days`;
  };

  const getDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date)) return 'text-destructive';
    if (isToday(date) || isTomorrow(date)) return 'text-orange-500';
    return 'text-muted-foreground';
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {REMINDER_STATUS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reminders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="text-muted-foreground">No reminders</p>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className="overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                <div className="mt-1">
                  {getPriorityIcon(reminder.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{reminder.title}</h4>
                      {reminder.message && (
                        <p className="text-sm text-muted-foreground mt-1">{reminder.message}</p>
                      )}
                    </div>
                    <Badge variant={reminder.status === 'pending' ? 'default' : 'secondary'}>
                      {reminder.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Event: {format(new Date(reminder.event_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${getDateColor(reminder.reminder_date)}`}>
                      <Clock className="h-4 w-4" />
                      <span>{getDateLabel(reminder.reminder_date)}</span>
                    </div>
                  </div>
                  {reminder.event_type && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {reminder.event_type.name}
                    </Badge>
                  )}
                  {!reminder.can_employee_dismiss && reminder.created_by_role !== 'employee' && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Assigned by {reminder.created_by_role} - cannot dismiss
                    </p>
                  )}
                </div>
                {reminder.status === 'pending' && reminder.can_employee_dismiss && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(reminder)}
                    disabled={isLoading}
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

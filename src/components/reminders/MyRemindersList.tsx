import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReminders } from '@/hooks/useReminders';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Calendar, Clock, CheckCircle2, Loader2, AlertTriangle, Info, Award, FileCheck, Plane, FileText, GraduationCap, User, ExternalLink, Target, MessageSquare } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, differenceInDays, parseISO } from 'date-fns';
import { formatDateForDisplay } from "@/utils/dateUtils";
import type { EmployeeReminder } from '@/types/reminders';
import { REMINDER_STATUS } from '@/types/reminders';

// Map source_table to employee tab and display info
const SOURCE_TABLE_CONFIG: Record<string, { label: string; tab: string; icon: React.ReactNode }> = {
  'employee_certificates': { label: 'Certificate', tab: 'certificates', icon: <Award className="h-3.5 w-3.5" /> },
  'employee_licenses': { label: 'License', tab: 'licenses', icon: <FileCheck className="h-3.5 w-3.5" /> },
  'employee_travel_documents': { label: 'Travel Doc', tab: 'immigration', icon: <Plane className="h-3.5 w-3.5" /> },
  'employee_work_permits': { label: 'Work Permit', tab: 'immigration', icon: <FileText className="h-3.5 w-3.5" /> },
  'employee_training': { label: 'Training', tab: 'training', icon: <GraduationCap className="h-3.5 w-3.5" /> },
  'profiles': { label: 'Employee', tab: 'overview', icon: <User className="h-3.5 w-3.5" /> },
  'appraisal_participants': { label: 'Performance Review', tab: 'performance', icon: <Target className="h-3.5 w-3.5" /> },
  'employee_review_responses': { label: 'Review Response', tab: 'performance', icon: <MessageSquare className="h-3.5 w-3.5" /> },
};

interface MyRemindersListProps {
  showCreateButton?: boolean;
}

export function MyRemindersList({ showCreateButton = false }: MyRemindersListProps) {
  const navigate = useNavigate();
  const { fetchMyReminders, dismissReminder, isLoading } = useReminders();
  const [reminders, setReminders] = useState<EmployeeReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const getSourceConfig = (sourceTable: string | null) => {
    if (!sourceTable) return null;
    return SOURCE_TABLE_CONFIG[sourceTable] || { label: sourceTable.replace('employee_', '').replace(/_/g, ' '), tab: 'overview', icon: <FileText className="h-3.5 w-3.5" /> };
  };

  const handleNavigateToSource = (reminder: EmployeeReminder) => {
    const config = getSourceConfig(reminder.source_table);
    const tab = config?.tab || 'overview';
    // Navigate to ESS section based on source type
    switch (reminder.source_table) {
      case 'employee_certificates':
        navigate('/ess/my-documents');
        break;
      case 'employee_licenses':
        navigate('/ess/my-documents');
        break;
      case 'employee_travel_documents':
      case 'employee_work_permits':
        navigate('/ess/my-documents');
        break;
      case 'employee_training':
        navigate('/ess/my-training');
        break;
      case 'appraisal_participants':
      case 'employee_review_responses':
        navigate('/ess/my-appraisals');
        break;
      default:
        navigate('/ess');
    }
  };

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
          {reminders.map((reminder) => {
            const sourceConfig = getSourceConfig(reminder.source_table);
            return (
              <Card key={reminder.id} className="overflow-hidden">
                <div className="flex items-start gap-4 p-4">
                  <div className="mt-1">
                    {getPriorityIcon(reminder.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button
                          onClick={() => handleNavigateToSource(reminder)}
                          className="font-medium hover:underline hover:text-primary transition-colors text-left"
                        >
                          {reminder.title}
                        </button>
                        {reminder.message && (
                          <p className="text-sm text-muted-foreground mt-1">{reminder.message}</p>
                        )}
                      </div>
                      <Badge variant={reminder.status === 'pending' ? 'default' : 'secondary'}>
                        {reminder.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Event: {formatDateForDisplay(reminder.event_date, 'MMM dd, yyyy')}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${getDateColor(reminder.reminder_date)}`}>
                        <Clock className="h-4 w-4" />
                        <span>{getDateLabel(reminder.reminder_date)}</span>
                      </div>
                      {sourceConfig && (
                        <button
                          onClick={() => handleNavigateToSource(reminder)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/50 hover:bg-muted text-xs font-medium transition-colors"
                        >
                          {sourceConfig.icon}
                          {sourceConfig.label}
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </button>
                      )}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
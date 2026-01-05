import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, ArrowRight, Calendar, User, AlertCircle } from "lucide-react";
import { formatDistanceToNow, isPast, isToday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface UpcomingRemindersWidgetProps {
  companyId?: string;
  employeeId?: string;
  limit?: number;
  compact?: boolean;
  className?: string;
  categories?: string[];
}

interface ReminderData {
  id: string;
  title: string;
  message: string | null;
  reminder_date: string;
  event_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  employee: {
    id: string;
    full_name: string;
  } | null;
  event_type: {
    name: string;
    category: string;
  } | null;
}

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-destructive/10 text-destructive",
};

const getUrgencyStyle = (reminderDate: string) => {
  const date = parseISO(reminderDate);
  if (isPast(date)) {
    return "border-l-4 border-l-destructive bg-destructive/5";
  }
  if (isToday(date)) {
    return "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20";
  }
  return "border-l-4 border-l-transparent";
};

export function UpcomingRemindersWidget({
  companyId,
  employeeId,
  limit = 5,
  compact = false,
  className,
  categories = ["performance", "training"],
}: UpcomingRemindersWidgetProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: reminders, isLoading } = useQuery({
    queryKey: ["upcoming-performance-reminders", companyId, employeeId, limit, categories],
    queryFn: async () => {
      let query = supabase
        .from("employee_reminders")
        .select(`
          id, 
          title, 
          message, 
          reminder_date, 
          event_date,
          priority, 
          status,
          employee:profiles!employee_reminders_employee_id_fkey(id, full_name),
          event_type:reminder_event_types(name, category)
        `)
        .eq("status", "pending")
        .order("reminder_date", { ascending: true })
        .limit(limit);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by categories on the client side since we can't easily filter on joined table
      const filtered = (data || []).filter((r: any) => 
        !r.event_type?.category || categories.includes(r.event_type.category)
      );
      
      return filtered as ReminderData[];
    },
    enabled: !!user,
  });

  const handleViewAll = () => {
    navigate("/hr-hub/reminders?category=performance");
  };

  if (compact) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Upcoming Reminders</span>
                {reminders && reminders.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {reminders.length}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1 flex items-center gap-3 overflow-hidden">
              {isLoading ? (
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-40" />
                  ))}
                </div>
              ) : reminders && reminders.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto">
                  {reminders.slice(0, 4).map((reminder) => {
                    const reminderDate = parseISO(reminder.reminder_date);
                    const isOverdue = isPast(reminderDate);
                    const isDueToday = isToday(reminderDate);
                    
                    return (
                      <div
                        key={reminder.id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border shrink-0",
                          isOverdue && "bg-destructive/10 border-destructive/30 text-destructive",
                          isDueToday && !isOverdue && "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400",
                          !isOverdue && !isDueToday && "bg-muted border-border"
                        )}
                      >
                        <Badge
                          variant="secondary"
                          className={cn("text-[10px] px-1.5 py-0", priorityColors[reminder.priority])}
                        >
                          {reminder.priority.charAt(0).toUpperCase()}
                        </Badge>
                        <span className="font-medium truncate max-w-[150px]">{reminder.title}</span>
                        <span className="text-muted-foreground">
                          {isOverdue ? "Overdue" : isDueToday ? "Today" : formatDistanceToNow(reminderDate, { addSuffix: false })}
                        </span>
                      </div>
                    );
                  })}
                  {reminders.length > 4 && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      +{reminders.length - 4} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No upcoming reminders</p>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-xs"
              onClick={handleViewAll}
            >
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Upcoming Reminders</CardTitle>
              <p className="text-xs text-muted-foreground">
                Performance & training notifications
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleViewAll}>
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : reminders && reminders.length > 0 ? (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-2">
              {reminders.map((reminder) => {
                const reminderDate = parseISO(reminder.reminder_date);
                const isOverdue = isPast(reminderDate);
                const isDueToday = isToday(reminderDate);

                return (
                  <div
                    key={reminder.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors hover:bg-muted/50",
                      getUrgencyStyle(reminder.reminder_date)
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {reminder.title}
                          </p>
                          <Badge
                            variant="secondary"
                            className={cn("text-xs shrink-0", priorityColors[reminder.priority])}
                          >
                            {reminder.priority}
                          </Badge>
                        </div>
                        {reminder.employee && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <User className="h-3 w-3" />
                            <span>{reminder.employee.full_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span
                            className={cn(
                              isOverdue && "text-destructive font-medium",
                              isDueToday && "text-amber-600 font-medium"
                            )}
                          >
                            {isOverdue
                              ? `Overdue (${formatDistanceToNow(reminderDate, { addSuffix: false })} ago)`
                              : isDueToday
                              ? "Due today"
                              : formatDistanceToNow(reminderDate, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      {isOverdue && (
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming reminders</p>
            <p className="text-xs text-muted-foreground mt-1">
              All caught up! Great job.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

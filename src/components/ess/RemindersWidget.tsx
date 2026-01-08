import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronRight, AlertTriangle, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { differenceInDays, format, isPast, isToday } from "date-fns";

interface EmployeeReminder {
  id: string;
  title: string;
  message: string | null;
  event_date: string;
  reminder_date: string;
  priority: string;
  status: string;
  source_table: string | null;
  event_type?: {
    name: string;
    category: string;
  } | null;
}

export function RemindersWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["ess-reminders-widget", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const { data, error } = await supabase
        .from("employee_reminders")
        .select(`
          id, 
          title, 
          message, 
          event_date, 
          reminder_date, 
          priority, 
          status,
          source_table,
          event_type:reminder_event_types(name, category)
        `)
        .eq("employee_id", user.id)
        .eq("status", "pending")
        .lte("reminder_date", sevenDaysFromNow.toISOString().split("T")[0])
        .order("reminder_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      return (data || []) as EmployeeReminder[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });

  const getPriorityStyles = (priority: string, reminderDate: string) => {
    const isOverdue = isPast(new Date(reminderDate)) && !isToday(new Date(reminderDate));
    
    if (isOverdue || priority === "critical") {
      return "border-destructive/30 bg-destructive/5";
    }
    if (priority === "high") {
      return "border-orange-500/30 bg-orange-500/5";
    }
    return "border-border";
  };

  const getPriorityBadge = (priority: string, reminderDate: string) => {
    const isOverdue = isPast(new Date(reminderDate)) && !isToday(new Date(reminderDate));
    
    if (isOverdue) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
    }
    
    switch (priority) {
      case "critical":
        return <Badge variant="destructive" className="text-xs">Critical</Badge>;
      case "high":
        return <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">High</Badge>;
      default:
        return null;
    }
  };

  const getTimeIndicator = (reminderDate: string) => {
    const today = new Date();
    const date = new Date(reminderDate);
    const days = differenceInDays(date, today);

    if (isToday(date)) {
      return <span className="text-destructive font-medium">Today</span>;
    }
    if (days < 0) {
      return <span className="text-destructive font-medium">{Math.abs(days)} days overdue</span>;
    }
    if (days === 1) {
      return <span className="text-orange-600">Tomorrow</span>;
    }
    return <span className="text-muted-foreground">In {days} days</span>;
  };

  const overdueCount = reminders.filter(r => 
    isPast(new Date(r.reminder_date)) && !isToday(new Date(r.reminder_date))
  ).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reminders.length === 0) {
    return null; // Hide widget when no reminders
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Upcoming Reminders
          </CardTitle>
          {reminders.length > 0 && (
            <Badge variant={overdueCount > 0 ? "destructive" : "secondary"}>
              {overdueCount > 0 ? `${overdueCount} overdue` : `${reminders.length} upcoming`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {reminders.slice(0, 3).map((reminder) => (
          <div
            key={reminder.id}
            onClick={() => navigate("/ess/reminders")}
            className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${getPriorityStyles(reminder.priority, reminder.reminder_date)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{reminder.title}</span>
                  {getPriorityBadge(reminder.priority, reminder.reminder_date)}
                </div>
                {reminder.message && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {reminder.message}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3" />
                  {getTimeIndicator(reminder.reminder_date)}
                  {reminder.event_date !== reminder.reminder_date && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        Event: {format(new Date(reminder.event_date), "MMM d")}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </div>
          </div>
        ))}

        <Button
          variant="ghost"
          className="w-full text-sm"
          onClick={() => navigate("/ess/reminders")}
        >
          View All Reminders
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

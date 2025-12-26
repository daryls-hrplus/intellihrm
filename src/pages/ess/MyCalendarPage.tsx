import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Plane, Flag } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface CalendarEvent {
  id: string;
  title: string;
  type: "leave" | "holiday";
  start_date: string;
  end_date: string;
  status?: string;
}

export default function MyCalendarPage() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    if (user?.id) {
      loadEvents();
    }
  }, [currentDate, user?.id, profile?.company_id]);

  const loadEvents = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const calendarEvents: CalendarEvent[] = [];
    
    try {
      // Fetch leave requests
      const { data: leaveData } = await supabase
        .from("leave_requests")
        .select(`id, start_date, end_date, status, leave_types(name)`)
        .eq("employee_id", user.id)
        .lte("start_date", monthEnd.toISOString())
        .gte("end_date", monthStart.toISOString());

      if (leaveData) {
        leaveData.forEach((leave: any) => {
          calendarEvents.push({
            id: `leave-${leave.id}`,
            title: leave.leave_types?.name || "Leave",
            type: "leave",
            start_date: leave.start_date,
            end_date: leave.end_date,
            status: leave.status,
          });
        });
      }

      // Fetch public holidays
      if (profile?.company_id) {
        const { data: holidayData } = await supabase
          .from("public_holidays" as any)
          .select("id, name, holiday_date")
          .eq("company_id", profile.company_id)
          .gte("holiday_date", monthStart.toISOString().split("T")[0])
          .lte("holiday_date", monthEnd.toISOString().split("T")[0]);

        if (holidayData) {
          (holidayData as any[]).forEach((holiday) => {
            calendarEvents.push({
              id: `holiday-${holiday.id}`,
              title: holiday.name,
              type: "holiday",
              start_date: holiday.holiday_date,
              end_date: holiday.holiday_date,
            });
          });
        }
      }

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error loading calendar events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const start = parseISO(event.start_date);
      const end = parseISO(event.end_date);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
      return start <= dayEnd && end >= dayStart;
    });
  };

  const getEventTypeColor = (type: CalendarEvent["type"], status?: string) => {
    if (type === "leave") {
      switch (status) {
        case "approved": return "bg-green-500/20 text-green-700 dark:text-green-400";
        case "pending": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
        case "rejected": return "bg-red-500/20 text-red-700 dark:text-red-400";
        default: return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
      }
    }
    return "bg-red-500/20 text-red-700 dark:text-red-400";
  };

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events
      .filter((event) => parseISO(event.start_date) >= today)
      .sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime())
      .slice(0, 5);
  }, [events]);

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={[{ label: "Employee Self-Service", href: "/ess" }, { label: "My Calendar" }]} />

        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">My Calendar</h1>
            <p className="text-muted-foreground">View your leave and holidays</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Leave (Approved)</Badge>
          <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Leave (Pending)</Badge>
          <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">Holiday</Badge>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>
                  ))}
                  {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-24 bg-muted/30 rounded-md" />
                  ))}
                  {days.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    return (
                      <div key={day.toISOString()} className={`h-24 p-1 rounded-md border ${isToday(day) ? "border-primary bg-primary/5" : "border-border"}`}>
                        <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-primary" : ""}`}>{format(day, "d")}</div>
                        <div className="space-y-0.5 overflow-hidden">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div key={event.id} className={`text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 ${getEventTypeColor(event.type, event.status)}`} title={event.title}>
                              {event.type === "leave" ? <Plane className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
                              <span className="truncate">{event.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 3 && <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Upcoming Events</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className={`p-3 rounded-lg border ${getEventTypeColor(event.type, event.status)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {event.type === "leave" ? <Plane className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
                      <span className="font-medium text-sm">{event.title}</span>
                    </div>
                    <div className="text-xs opacity-75">{format(parseISO(event.start_date), "MMM d, yyyy")}</div>
                    {event.status && <Badge variant="outline" className="mt-1 text-xs capitalize">{event.status}</Badge>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

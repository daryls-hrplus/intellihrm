import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Users, Plane, GraduationCap, Home, Building } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  start_date: string;
  end_date: string;
  employee?: { full_name: string } | null;
  is_private: boolean;
}

interface Department {
  id: string;
  name: string;
}

export default function TeamCalendarPage() {
  const { profile } = useAuth();
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    loadData();
  }, [currentDate, selectedDepartment]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("team_calendar_events")
        .select(`
          *,
          employee:profiles!team_calendar_events_employee_id_fkey(full_name)
        `)
        .lte("start_date", monthEnd.toISOString())
        .gte("end_date", monthStart.toISOString());

      if (selectedDepartment !== "all") {
        query = query.eq("department_id", selectedDepartment);
      }

      const [eventsRes, deptRes] = await Promise.all([
        query.order("start_date"),
        supabase.from("departments").select("id, name").order("name"),
      ]);

      setEvents((eventsRes.data || []) as CalendarEvent[]);
      setDepartments((deptRes.data || []) as Department[]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);
      return day >= start && day <= end;
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "leave":
        return <Plane className="h-3 w-3" />;
      case "training":
        return <GraduationCap className="h-3 w-3" />;
      case "remote":
        return <Home className="h-3 w-3" />;
      case "out_of_office":
        return <Building className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "leave":
        return "bg-orange-500/20 text-orange-700 border-orange-300";
      case "holiday":
        return "bg-red-500/20 text-red-700 border-red-300";
      case "training":
        return "bg-purple-500/20 text-purple-700 border-purple-300";
      case "remote":
        return "bg-blue-500/20 text-blue-700 border-blue-300";
      case "out_of_office":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-300";
      default:
        return "bg-green-500/20 text-green-700 border-green-300";
    }
  };

  const breadcrumbItems = [
    { label: "Employee Self-Service", href: "/ess" },
    { label: "Team Calendar" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Team Calendar</h1>
              <p className="text-muted-foreground">View team availability and events</p>
            </div>
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-500/20 text-orange-700">Leave</Badge>
          <Badge className="bg-red-500/20 text-red-700">Holiday</Badge>
          <Badge className="bg-purple-500/20 text-purple-700">Training</Badge>
          <Badge className="bg-blue-500/20 text-blue-700">Remote</Badge>
          <Badge className="bg-yellow-500/20 text-yellow-700">Out of Office</Badge>
          <Badge className="bg-green-500/20 text-green-700">Other</Badge>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading calendar...</div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {/* Empty cells for days before month start */}
                {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 bg-muted/30 rounded-md" />
                ))}
                
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-24 p-1 rounded-md border ${
                        isToday(day) ? "border-primary bg-primary/5" : "border-border"
                      } ${!isSameMonth(day, currentDate) ? "opacity-50" : ""}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 ${getEventTypeColor(event.event_type)}`}
                            title={`${event.title}${event.employee ? ` - ${event.employee.full_name}` : ""}`}
                          >
                            {getEventTypeIcon(event.event_type)}
                            <span className="truncate">
                              {event.employee?.full_name?.split(" ")[0] || event.title}
                            </span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

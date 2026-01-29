import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
  CalendarDays, ChevronLeft, ChevronRight, AlertTriangle, 
  CheckCircle, Clock, Filter, List, Grid
} from "lucide-react";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, 
  isSameMonth, addMonths, subMonths, isToday, isBefore
} from "date-fns";

interface ComplianceCalendarViewProps {
  companyId: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "due" | "expiry" | "renewal";
  status: "pending" | "completed" | "overdue";
  employeeCount: number;
  trainingId: string;
}

interface TrainingDueDate {
  id: string;
  training_name: string;
  due_date: string;
  status: string;
  employee_count: number;
  compliance_training_id: string;
}

export function ComplianceCalendarView({ companyId }: ComplianceCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadCalendarEvents();
  }, [companyId, currentMonth]);

  const loadCalendarEvents = async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      // Get assignments due in this month
      // @ts-ignore - Supabase type instantiation issue
      const { data: assignments } = await supabase
        .from("compliance_training_assignments")
        .select(`
          id,
          due_date,
          status,
          compliance_training_id,
          compliance:compliance_training(name)
        `)
        .gte("due_date", monthStart.toISOString())
        .lte("due_date", monthEnd.toISOString());

      // Group by training and due date
      const grouped = new Map<string, TrainingDueDate>();
      
      assignments?.forEach(a => {
        const key = `${a.compliance_training_id}-${a.due_date}`;
        const existing = grouped.get(key);
        
        if (existing) {
          existing.employee_count++;
          if (a.status !== "completed") {
            existing.status = "pending";
          }
        } else {
          grouped.set(key, {
            id: a.id,
            training_name: a.compliance?.name || "Unknown",
            due_date: a.due_date,
            status: a.status,
            employee_count: 1,
            compliance_training_id: a.compliance_training_id
          });
        }
      });

      // Convert to calendar events
      const calendarEvents: CalendarEvent[] = Array.from(grouped.values()).map(item => {
        const dueDate = new Date(item.due_date);
        let status: "pending" | "completed" | "overdue" = "pending";
        
        if (item.status === "completed") {
          status = "completed";
        } else if (isBefore(dueDate, new Date())) {
          status = "overdue";
        }

        return {
          id: item.id,
          title: item.training_name,
          date: dueDate,
          type: "due",
          status,
          employeeCount: item.employee_count,
          trainingId: item.compliance_training_id
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Failed to load calendar events:", error);
    }
    setLoading(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => 
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const filteredEvents = events.filter(event => {
    if (filterType === "all") return true;
    return event.status === filterType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-600";
      case "overdue": return "bg-destructive";
      default: return "bg-blue-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "overdue": return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Calculate padding for start of month
  const startPadding = startOfMonth(currentMonth).getDay();
  const paddingDays = Array(startPadding).fill(null);

  const upcomingEvents = filteredEvents
    .filter(e => !isBefore(e.date, new Date()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 10);

  if (loading) {
    return <div className="p-4">Loading calendar...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold min-w-[200px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-lg">
            <Button 
              variant={viewMode === "calendar" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            {viewMode === "calendar" ? (
              <>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Padding days */}
                  {paddingDays.map((_, index) => (
                    <div key={`pad-${index}`} className="h-24 bg-muted/30 rounded" />
                  ))}

                  {/* Actual days */}
                  {daysInMonth.map(day => {
                    const dayEvents = getEventsForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`h-24 border rounded p-1 cursor-pointer transition-colors ${
                          isToday(day) ? "border-primary border-2" : ""
                        } ${isSelected ? "bg-primary/10" : "hover:bg-muted/50"}`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className={`text-sm ${isToday(day) ? "font-bold text-primary" : ""}`}>
                          {format(day, "d")}
                        </div>
                        <div className="mt-1 space-y-1 overflow-hidden">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs px-1 py-0.5 rounded truncate text-white ${getStatusColor(event.status)}`}
                              title={`${event.title} (${event.employeeCount} employees)`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* List View */
              <div className="space-y-3">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No compliance events this month
                  </div>
                ) : (
                  filteredEvents
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map(event => (
                      <div 
                        key={event.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getStatusColor(event.status)} text-white`}>
                            {getStatusIcon(event.status)}
                          </div>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.employeeCount} employee{event.employeeCount !== 1 ? "s" : ""} assigned
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{format(event.date, "MMM d, yyyy")}</p>
                          <Badge 
                            variant={event.status === "completed" ? "default" : event.status === "overdue" ? "destructive" : "secondary"}
                            className={event.status === "completed" ? "bg-green-600" : ""}
                          >
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Date Details */}
          {selectedDate && viewMode === "calendar" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {format(selectedDate, "MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events on this date</p>
                ) : (
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map(event => (
                      <div key={event.id} className="p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(event.status)}
                          <span className="font-medium text-sm">{event.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.employeeCount} employee{event.employeeCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`} />
                        <span className="truncate max-w-[120px]">{event.title}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {format(event.date, "MMM d")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-blue-600" />
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-green-600" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-destructive" />
                <span>Overdue</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

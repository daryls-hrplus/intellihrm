import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
} from "date-fns";

interface LeaveEvent {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  leave_color: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Department {
  id: string;
  name: string;
}

export default function LeaveCalendarPage() {
  const { company, isAdmin, hasRole } = useAuth();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [leaveEvents, setLeaveEvents] = useState<LeaveEvent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch departments
  useEffect(() => {
    if (!selectedCompanyId) return;
    
    supabase
      .from("departments")
      .select("id, name")
      .eq("company_id", selectedCompanyId)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data) setDepartments(data);
      });
  }, [selectedCompanyId]);

  // Fetch approved leave for the month
  useEffect(() => {
    const fetchLeave = async () => {
      if (!selectedCompanyId) return;
      
      setIsLoading(true);
      const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      let query = supabase
        .from("leave_requests")
        .select(`
          id,
          employee_id,
          start_date,
          end_date,
          status,
          profiles!leave_requests_employee_id_fkey(id, full_name, department_id),
          leave_types(name, color)
        `)
        .eq("status", "approved")
        .or(`start_date.lte.${monthEnd},end_date.gte.${monthStart}`);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching leave:", error);
        setLeaveEvents([]);
      } else if (data) {
        let events: LeaveEvent[] = data
          .filter((r: any) => r.profiles?.department_id)
          .map((r: any) => ({
            id: r.id,
            employee_id: r.employee_id,
            employee_name: r.profiles?.full_name || "Unknown",
            leave_type: r.leave_types?.name || "Leave",
            leave_color: r.leave_types?.color || "#3B82F6",
            start_date: r.start_date,
            end_date: r.end_date,
            status: r.status,
            department_id: r.profiles?.department_id,
          }));

        // Filter by department if selected
        if (selectedDepartment !== "all") {
          events = events.filter((e: any) => e.department_id === selectedDepartment);
        }

        setLeaveEvents(events);
      }
      setIsLoading(false);
    };

    fetchLeave();
  }, [selectedCompanyId, currentMonth, selectedDepartment]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get leave events for a specific day
  const getEventsForDay = (day: Date) => {
    return leaveEvents.filter((event) => {
      const start = parseISO(event.start_date);
      const end = parseISO(event.end_date);
      return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end);
    });
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Leave Management", href: "/leave" },
            { label: "Team Calendar" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Calendar</h1>
              <p className="text-muted-foreground">View team leave and availability at a glance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={setSelectedCompanyId} 
            />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Week header */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/50">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] border-b border-r border-border p-2 ${
                    !isCurrentMonth ? "bg-muted/30" : ""
                  } ${index % 7 === 6 ? "border-r-0" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday 
                      ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center" 
                      : isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-1.5 py-0.5 rounded truncate"
                        style={{ 
                          backgroundColor: `${event.leave_color}20`,
                          color: event.leave_color,
                          borderLeft: `2px solid ${event.leave_color}`
                        }}
                        title={`${event.employee_name} - ${event.leave_type}`}
                      >
                        {event.employee_name}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {Array.from(new Set(leaveEvents.map(e => JSON.stringify({ name: e.leave_type, color: e.leave_color }))))
            .map(s => JSON.parse(s))
            .map((type: { name: string; color: string }) => (
              <div key={type.name} className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-sm text-muted-foreground">{type.name}</span>
              </div>
            ))
          }
        </div>
      </div>
    </AppLayout>
  );
}

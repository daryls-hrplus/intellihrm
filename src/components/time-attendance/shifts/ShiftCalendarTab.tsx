import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Sun,
  Moon
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface ShiftCalendarTabProps {
  companyId: string | null;
}

interface ShiftAssignment {
  id: string;
  employee_id: string;
  shift_id: string;
  effective_date: string;
  end_date: string | null;
  profile: { full_name: string } | null;
  shift: { 
    name: string; 
    code: string; 
    color: string;
    start_time: string;
    end_time: string;
    is_overnight: boolean;
  } | null;
}

export function ShiftCalendarTab({ companyId }: ShiftCalendarTabProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['shift-calendar-employees', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('company_id', companyId)
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  // Fetch shift assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ['shift-calendar-assignments', companyId, format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      if (!companyId) return [];
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      const { data, error } = await supabase
        .from('employee_shift_assignments')
        .select(`
          id,
          employee_id,
          shift_id,
          effective_date,
          end_date,
          profile:profiles(full_name),
          shift:shifts(name, code, color, start_time, end_time, is_overnight)
        `)
        .eq('company_id', companyId)
        .lte('effective_date', format(monthEnd, 'yyyy-MM-dd'))
        .or(`end_date.is.null,end_date.gte.${format(monthStart, 'yyyy-MM-dd')}`);
      
      if (error) throw error;
      return (data as unknown as ShiftAssignment[]) || [];
    },
    enabled: !!companyId
  });

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Get assignments for a specific day and optionally employee
  const getAssignmentsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return assignments.filter(assignment => {
      const effectiveDate = assignment.effective_date;
      const endDate = assignment.end_date;
      
      // Check if assignment is active on this day
      if (dayStr < effectiveDate) return false;
      if (endDate && dayStr > endDate) return false;
      
      // Filter by employee if selected
      if (selectedEmployee !== "all" && assignment.employee_id !== selectedEmployee) {
        return false;
      }
      
      return true;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Summary stats
  const totalActiveAssignments = assignments.length;
  const uniqueEmployees = new Set(assignments.map(a => a.employee_id)).size;
  const uniqueShifts = new Set(assignments.map(a => a.shift_id)).size;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employees Scheduled</p>
              <p className="text-xl font-semibold">{uniqueEmployees}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
              <Clock className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Shifts</p>
              <p className="text-xl font-semibold">{uniqueShifts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
              <CalendarIcon className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Assignments</p>
              <p className="text-xl font-semibold">{totalActiveAssignments}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-hidden">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 bg-muted">
              {weekDays.map((day) => (
                <div key={day} className="p-3 text-center font-medium text-muted-foreground border-b">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dayAssignments = getAssignmentsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                
                return (
                  <div
                    key={idx}
                    className={`min-h-[120px] p-2 border-b border-r transition-colors ${
                      !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''
                    } ${isCurrentDay ? 'bg-primary/5 ring-1 ring-primary ring-inset' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentDay ? 'text-primary' : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      <TooltipProvider>
                        {dayAssignments.slice(0, 3).map((assignment) => (
                          <Tooltip key={assignment.id}>
                            <TooltipTrigger asChild>
                              <div
                                className="text-xs px-2 py-1 rounded truncate cursor-default flex items-center gap-1"
                                style={{ 
                                  backgroundColor: `${assignment.shift?.color}20`,
                                  borderLeft: `3px solid ${assignment.shift?.color}`
                                }}
                              >
                                {assignment.shift?.is_overnight ? (
                                  <Moon className="h-2.5 w-2.5 shrink-0" />
                                ) : (
                                  <Sun className="h-2.5 w-2.5 shrink-0" />
                                )}
                                <span className="truncate">
                                  {selectedEmployee === "all" 
                                    ? assignment.profile?.full_name?.split(' ')[0] 
                                    : assignment.shift?.code
                                  }
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[250px]">
                              <div className="space-y-1">
                                <p className="font-medium">{assignment.profile?.full_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {assignment.shift?.name} ({assignment.shift?.code})
                                </p>
                                <p className="text-xs">
                                  {assignment.shift?.start_time} - {assignment.shift?.end_time}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {dayAssignments.length > 3 && (
                          <div className="text-xs text-muted-foreground px-2">
                            +{dayAssignments.length - 3} more
                          </div>
                        )}
                      </TooltipProvider>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Shift Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Array.from(new Set(assignments.map(a => a.shift_id))).map(shiftId => {
              const shift = assignments.find(a => a.shift_id === shiftId)?.shift;
              if (!shift) return null;
              return (
                <div key={shiftId} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: shift.color }}
                  />
                  <span className="text-sm">{shift.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({shift.start_time} - {shift.end_time})
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, setYear, getYear, isWithinInterval, parseISO } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  duration: number;
  status: string;
  leave_type?: {
    name: string;
    color: string;
    accrual_unit: string;
  } | null;
}

interface LeaveCalendarProps {
  leaveRequests: LeaveRequest[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function LeaveCalendar({ leaveRequests }: LeaveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = getYear(currentDate);

  // Generate year options (5 years back, 2 years forward)
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 5; y <= currentYear + 2; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate padding days for the start of the month
  const startPadding = monthStart.getDay();
  const paddingDays = Array.from({ length: startPadding }, (_, i) => null);

  // Get leaves for a specific day
  const getLeavesForDay = (day: Date) => {
    return leaveRequests.filter((request) => {
      const startDate = parseISO(request.start_date);
      const endDate = parseISO(request.end_date);
      return isWithinInterval(day, { start: startDate, end: endDate });
    });
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleYearChange = (year: string) => setCurrentDate(setYear(currentDate, parseInt(year)));
  const handleToday = () => setCurrentDate(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "pending": return "bg-amber-500";
      case "rejected": return "bg-red-500";
      case "cancelled": return "bg-gray-400";
      default: return "bg-blue-500";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Leave Calendar
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {format(currentDate, "MMMM")}
            </span>
            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((_, index) => (
            <div key={`pad-${index}`} className="aspect-square" />
          ))}
          
          {daysInMonth.map((day) => {
            const leaves = getLeavesForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "aspect-square p-1 border rounded-md relative",
                  isToday && "ring-2 ring-primary",
                  leaves.length > 0 && "bg-muted/50"
                )}
              >
                <span className={cn(
                  "text-xs font-medium",
                  isToday && "text-primary font-bold"
                )}>
                  {format(day, "d")}
                </span>
                
                {/* Leave indicators */}
                <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                  {leaves.slice(0, 2).map((leave, idx) => (
                    <div
                      key={`${leave.id}-${idx}`}
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        getStatusColor(leave.status)
                      )}
                      title={`${leave.leave_type?.name || "Leave"} (${leave.status})`}
                    />
                  ))}
                  {leaves.length > 2 && (
                    <span className="text-[8px] text-muted-foreground">+{leaves.length - 2}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-400" />
            <span className="text-xs text-muted-foreground">Cancelled</span>
          </div>
        </div>
        
        {/* Upcoming/Recent Leave List */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">
            Leave in {format(currentDate, "MMMM yyyy")}
          </h4>
          {leaveRequests.filter((r) => {
            const start = parseISO(r.start_date);
            const end = parseISO(r.end_date);
            return (
              (start >= monthStart && start <= monthEnd) ||
              (end >= monthStart && end <= monthEnd) ||
              (start <= monthStart && end >= monthEnd)
            );
          }).length === 0 ? (
            <p className="text-sm text-muted-foreground">No leave scheduled this month.</p>
          ) : (
            <div className="space-y-2">
              {leaveRequests
                .filter((r) => {
                  const start = parseISO(r.start_date);
                  const end = parseISO(r.end_date);
                  return (
                    (start >= monthStart && start <= monthEnd) ||
                    (end >= monthStart && end <= monthEnd) ||
                    (start <= monthStart && end >= monthEnd)
                  );
                })
                .slice(0, 5)
                .map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: leave.leave_type?.color || "#3B82F6" }}
                      />
                      <div>
                        <p className="text-sm font-medium">{leave.leave_type?.name || "Leave"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateForDisplay(leave.start_date, "MMM d")}
                          {leave.start_date !== leave.end_date && (
                            <> - {formatDateForDisplay(leave.end_date, "MMM d")}</>
                          )}
                          {" "}({leave.duration} {leave.leave_type?.accrual_unit || "days"})
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        leave.status === "approved" ? "default" :
                        leave.status === "rejected" ? "destructive" :
                        "outline"
                      }
                      className="capitalize"
                    >
                      {leave.status}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

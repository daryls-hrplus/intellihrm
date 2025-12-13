import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { AppraisalInterview } from "@/hooks/useAppraisalInterviews";
import { cn } from "@/lib/utils";

interface AppraisalInterviewCalendarProps {
  interviews: AppraisalInterview[];
  onSelectDate?: (date: Date) => void;
  onSelectInterview?: (interview: AppraisalInterview) => void;
  selectedDate?: Date;
}

export function AppraisalInterviewCalendar({
  interviews,
  onSelectDate,
  onSelectInterview,
  selectedDate,
}: AppraisalInterviewCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const interviewsByDate = useMemo(() => {
    const map = new Map<string, AppraisalInterview[]>();
    interviews.forEach((interview) => {
      const dateKey = format(new Date(interview.scheduled_at), "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(interview);
    });
    return map;
  }, [interviews]);

  const getInterviewsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return interviewsByDate.get(dateKey) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500";
      case "confirmed":
        return "bg-green-500";
      case "completed":
        return "bg-primary";
      case "cancelled":
        return "bg-destructive";
      case "rescheduled":
        return "bg-yellow-500";
      default:
        return "bg-muted";
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Interview Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayInterviews = getInterviewsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  isToday && "border-primary",
                  isSelected && "bg-primary/10 border-primary",
                  "hover:bg-accent"
                )}
                onClick={() => onSelectDate?.(day)}
              >
                <div className={cn(
                  "text-xs font-medium mb-1",
                  isToday && "text-primary"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayInterviews.slice(0, 2).map((interview) => (
                    <div
                      key={interview.id}
                      className={cn(
                        "text-[10px] px-1 py-0.5 rounded truncate text-white cursor-pointer",
                        getStatusColor(interview.status)
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectInterview?.(interview);
                      }}
                      title={`${format(new Date(interview.scheduled_at), "h:mm a")} - ${
                        interview.participant?.employee?.full_name || "Interview"
                      }`}
                    >
                      {format(new Date(interview.scheduled_at), "h:mm a")}
                    </div>
                  ))}
                  {dayInterviews.length > 2 && (
                    <div className="text-[10px] text-muted-foreground text-center">
                      +{dayInterviews.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>Rescheduled</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-destructive" />
            <span>Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

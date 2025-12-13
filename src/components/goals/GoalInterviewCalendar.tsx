import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { GoalInterview } from "@/hooks/useGoalInterviews";
import { cn } from "@/lib/utils";

interface GoalInterviewCalendarProps {
  interviews: GoalInterview[];
  onSelectInterview: (interview: GoalInterview) => void;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500",
  confirmed: "bg-green-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500",
};

export function GoalInterviewCalendar({ interviews, onSelectInterview }: GoalInterviewCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getInterviewsForDay = (day: Date) => {
    return interviews.filter((interview) =>
      isSameDay(new Date(interview.scheduled_at), day)
    );
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate padding days for the start of the month
  const startPadding = monthStart.getDay();
  const paddingDays = Array(startPadding).fill(null);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-lg">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="p-2 min-h-[80px]" />
          ))}

          {daysInMonth.map((day) => {
            const dayInterviews = getInterviewsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "p-2 min-h-[80px] border rounded-lg",
                  !isSameMonth(day, currentMonth) && "bg-muted/50",
                  isToday && "border-primary"
                )}
              >
                <div
                  className={cn(
                    "text-sm font-medium mb-1",
                    isToday && "text-primary"
                  )}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayInterviews.slice(0, 2).map((interview) => (
                    <button
                      key={interview.id}
                      onClick={() => onSelectInterview(interview)}
                      className="w-full text-left"
                    >
                      <div
                        className={cn(
                          "text-xs p-1 rounded truncate text-white flex items-center gap-1",
                          statusColors[interview.status]
                        )}
                      >
                        <Target className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {format(new Date(interview.scheduled_at), "HH:mm")}
                        </span>
                      </div>
                    </button>
                  ))}
                  {dayInterviews.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{dayInterviews.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

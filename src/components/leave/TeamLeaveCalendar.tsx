import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, setYear, getYear, isWithinInterval, parseISO, isBefore } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: string;
  full_name: string;
}

interface LeaveType {
  id: string;
  name: string;
  color: string;
}

interface TeamLeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  duration: number;
  status: string;
  employee_id: string;
  employee?: {
    full_name: string;
  } | null;
  leave_type?: {
    id: string;
    name: string;
    color: string;
    accrual_unit: string;
  } | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TeamLeaveCalendar() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<TeamLeaveRequest[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("all");
  
  const currentYear = getYear(currentDate);

  // Generate year options (5 years back, 2 years forward)
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 5; y <= currentYear + 2; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!profile?.id) return;
      setLoading(true);
      
      try {
        // Get direct reports - cast to any to avoid deep type recursion in profiles table
        const { data: profilesData } = await (supabase as any)
          .from("profiles")
          .select("id, full_name")
          .eq("manager_id", profile.id);
        
        const directReports: TeamMember[] = profilesData || [];
        setTeamMembers(directReports);
        
        // Get leave types
        const typesResult = await supabase
          .from("leave_types")
          .select("id, name, color")
          .eq("is_active", true);
        
        const types = (typesResult.data || []) as LeaveType[];
        setLeaveTypes(types);
        
        // Get team leave requests
        if (directReports.length > 0) {
          const employeeIds = directReports.map(m => m.id);
          const requestsResult = await supabase
            .from("leave_requests")
            .select("id, start_date, end_date, duration, status, employee_id, leave_type_id")
            .in("employee_id", employeeIds)
            .in("status", ["pending", "approved"]);
          
          const requests = requestsResult.data || [];
          
          // Enrich with employee and leave type data
          const enrichedRequests: TeamLeaveRequest[] = requests.map((r: any) => {
            const employee = directReports.find(m => m.id === r.employee_id);
            const leaveType = types.find(t => t.id === r.leave_type_id);
            return {
              id: r.id,
              start_date: r.start_date,
              end_date: r.end_date,
              duration: r.duration,
              status: r.status,
              employee_id: r.employee_id,
              employee: employee ? { full_name: employee.full_name } : null,
              leave_type: leaveType ? { ...leaveType, accrual_unit: "days" } : null,
            };
          });
          
          setLeaveRequests(enrichedRequests);
        }
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [profile?.id]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = monthStart.getDay();
  const paddingDays = Array.from({ length: startPadding }, (_, i) => null);

  // Filter leave requests
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((r) => {
      if (selectedEmployee !== "all" && r.employee_id !== selectedEmployee) return false;
      if (selectedLeaveType !== "all" && r.leave_type?.id !== selectedLeaveType) return false;
      return true;
    });
  }, [leaveRequests, selectedEmployee, selectedLeaveType]);

  // Get leaves for a specific day
  const getLeavesForDay = (day: Date) => {
    return filteredRequests.filter((request) => {
      const startDate = parseISO(request.start_date);
      const endDate = parseISO(request.end_date);
      return isWithinInterval(day, { start: startDate, end: endDate });
    });
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleYearChange = (year: string) => setCurrentDate(setYear(currentDate, parseInt(year)));
  const handleToday = () => setCurrentDate(new Date());

  // Status determines the visual style (border/background), leave type determines color
  const getLeaveStyle = (leave: TeamLeaveRequest, day: Date) => {
    const isInPast = isBefore(day, new Date());
    const leaveColor = leave.leave_type?.color || "#3B82F6";
    
    if (leave.status === "pending") {
      // Pending - dashed border
      return {
        backgroundColor: `${leaveColor}20`,
        borderColor: leaveColor,
        borderStyle: "dashed" as const,
        borderWidth: "2px",
      };
    } else if (leave.status === "approved" && isInPast) {
      // Taken - solid fill
      return {
        backgroundColor: leaveColor,
        color: "white",
      };
    } else {
      // Approved but future - solid border
      return {
        backgroundColor: `${leaveColor}30`,
        borderColor: leaveColor,
        borderStyle: "solid" as const,
        borderWidth: "2px",
      };
    }
  };

  // Get unique leave types that appear in the filtered requests
  const usedLeaveTypes = useMemo(() => {
    const typeIds = new Set(filteredRequests.map(r => r.leave_type?.id).filter(Boolean));
    return leaveTypes.filter(t => typeIds.has(t.id));
  }, [filteredRequests, leaveTypes]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No direct reports found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Team Leave Calendar
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Leave Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leave Types</SelectItem>
              {leaveTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                    {type.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  "min-h-[80px] p-1 border rounded-md relative",
                  isToday && "ring-2 ring-primary",
                  leaves.length > 0 && "bg-muted/30"
                )}
              >
                <span className={cn(
                  "text-xs font-medium",
                  isToday && "text-primary font-bold"
                )}>
                  {format(day, "d")}
                </span>
                
                {/* Leave entries */}
                <div className="mt-1 space-y-0.5 overflow-hidden">
                  {leaves.slice(0, 3).map((leave) => (
                    <div
                      key={leave.id}
                      className="text-[10px] px-1 py-0.5 rounded truncate"
                      style={getLeaveStyle(leave, day)}
                      title={`${leave.employee?.full_name} - ${leave.leave_type?.name} (${leave.status})`}
                    >
                      {leave.employee?.full_name?.split(" ")[0]}
                    </div>
                  ))}
                  {leaves.length > 3 && (
                    <div className="text-[10px] text-muted-foreground text-center">
                      +{leaves.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t space-y-3">
          {/* Status Legend */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-blue-500" />
                <span className="text-xs text-muted-foreground">Taken (Past)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-blue-500/30 border-2 border-blue-500" />
                <span className="text-xs text-muted-foreground">Approved (Future)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-blue-500/20 border-2 border-dashed border-blue-500" />
                <span className="text-xs text-muted-foreground">Pending Request</span>
              </div>
            </div>
          </div>
          
          {/* Leave Type Legend */}
          {usedLeaveTypes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Leave Types</p>
              <div className="flex flex-wrap gap-4">
                {usedLeaveTypes.map((type) => (
                  <div key={type.id} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                    <span className="text-xs text-muted-foreground">{type.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Team Leave List for Month */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">
            Team Leave in {format(currentDate, "MMMM yyyy")}
          </h4>
          {filteredRequests.filter((r) => {
            const start = parseISO(r.start_date);
            const end = parseISO(r.end_date);
            return (
              (start >= monthStart && start <= monthEnd) ||
              (end >= monthStart && end <= monthEnd) ||
              (start <= monthStart && end >= monthEnd)
            );
          }).length === 0 ? (
            <p className="text-sm text-muted-foreground">No team leave scheduled this month.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredRequests
                .filter((r) => {
                  const start = parseISO(r.start_date);
                  const end = parseISO(r.end_date);
                  return (
                    (start >= monthStart && start <= monthEnd) ||
                    (end >= monthStart && end <= monthEnd) ||
                    (start <= monthStart && end >= monthEnd)
                  );
                })
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
                        <p className="text-sm font-medium">{leave.employee?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {leave.leave_type?.name} • {format(parseISO(leave.start_date), "MMM d")}
                          {leave.start_date !== leave.end_date && (
                            <> - {format(parseISO(leave.end_date), "MMM d")}</>
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

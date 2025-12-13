import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Wallet,
  History,
  Loader2
} from "lucide-react";
import { format, parseISO, isWithinInterval, startOfYear, endOfYear } from "date-fns";

interface LeaveApprovalContextProps {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  duration: number;
  departmentId?: string;
  companyId?: string;
}

interface LeaveHistory {
  id: string;
  start_date: string;
  end_date: string;
  duration: number;
  status: string;
  leave_type: {
    name: string;
    color: string;
  };
}

interface DepartmentOverlap {
  id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  duration: number;
  leave_type_name: string;
  status: string;
}

interface LeaveBalance {
  id: string;
  current_balance: number;
  accrued_amount: number;
  used_amount: number;
  carried_forward: number;
  leave_type: {
    name: string;
    color: string;
    accrual_unit: string;
  };
}

export function LeaveApprovalContext({
  employeeId,
  leaveTypeId,
  startDate,
  endDate,
  duration,
  departmentId,
  companyId,
}: LeaveApprovalContextProps) {
  const [loading, setLoading] = useState(true);
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([]);
  const [departmentOverlaps, setDepartmentOverlaps] = useState<DepartmentOverlap[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [employeeName, setEmployeeName] = useState<string>("");

  useEffect(() => {
    const fetchContextData = async () => {
      if (!employeeId) return;
      
      setLoading(true);
      try {
        // Get employee name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", employeeId)
          .single();
        
        if (profile) {
          setEmployeeName(profile.full_name || "Unknown");
        }

        // Get leave history for current year
        const yearStart = format(startOfYear(new Date()), "yyyy-MM-dd");
        const yearEnd = format(endOfYear(new Date()), "yyyy-MM-dd");
        
        const { data: history } = await supabase
          .from("leave_requests")
          .select(`
            id,
            start_date,
            end_date,
            duration,
            status,
            leave_type:leave_types(name, color)
          `)
          .eq("employee_id", employeeId)
          .gte("start_date", yearStart)
          .lte("end_date", yearEnd)
          .in("status", ["approved", "pending"])
          .order("start_date", { ascending: false });

        if (history) {
          setLeaveHistory(history as unknown as LeaveHistory[]);
        }

        // Get current leave balance for requested type
        const { data: balance } = await supabase
          .from("leave_balances")
          .select(`
            id,
            current_balance,
            accrued_amount,
            used_amount,
            carried_forward,
            leave_type:leave_types(name, color, accrual_unit)
          `)
          .eq("employee_id", employeeId)
          .eq("leave_type_id", leaveTypeId)
          .eq("year", new Date().getFullYear())
          .single();

        if (balance) {
          setLeaveBalance(balance as unknown as LeaveBalance);
        }

        // Get department overlaps if department is provided
        if (departmentId) {
          // First get employees in the same department
          const { data: deptEmployees } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("department_id", departmentId)
            .neq("id", employeeId);

          if (deptEmployees && deptEmployees.length > 0) {
            const employeeIds = deptEmployees.map((e) => e.id);
            const employeeMap = new Map(deptEmployees.map((e) => [e.id, e.full_name]));

            // Get overlapping leave requests
            const { data: overlaps } = await supabase
              .from("leave_requests")
              .select(`
                id,
                employee_id,
                start_date,
                end_date,
                duration,
                status,
                leave_type:leave_types(name)
              `)
              .in("employee_id", employeeIds)
              .in("status", ["approved", "pending"])
              .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

            if (overlaps) {
              // Filter for actual overlaps
              const requestStart = parseISO(startDate);
              const requestEnd = parseISO(endDate);
              
              const filteredOverlaps = overlaps
                .filter((o) => {
                  const oStart = parseISO(o.start_date);
                  const oEnd = parseISO(o.end_date);
                  // Check if date ranges overlap
                  return (oStart <= requestEnd && oEnd >= requestStart);
                })
                .map((o) => ({
                  id: o.id,
                  employee_name: employeeMap.get(o.employee_id) || "Unknown",
                  start_date: o.start_date,
                  end_date: o.end_date,
                  duration: o.duration,
                  leave_type_name: (o.leave_type as any)?.name || "Unknown",
                  status: o.status,
                }));

              setDepartmentOverlaps(filteredOverlaps);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch leave context:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContextData();
  }, [employeeId, leaveTypeId, startDate, endDate, departmentId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const hasOverlaps = departmentOverlaps.length > 0;
  const exceedsBalance = leaveBalance && duration > leaveBalance.current_balance;
  const ytdUsed = leaveHistory
    .filter((h) => h.status === "approved")
    .reduce((sum, h) => sum + h.duration, 0);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Leave Context for {employeeName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="balance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="balance" className="text-xs">
              <Wallet className="h-3 w-3 mr-1" />
              Balance
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="h-3 w-3 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="overlaps" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Overlaps
              {hasOverlaps && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                  {departmentOverlaps.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="space-y-3">
            {leaveBalance ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: leaveBalance.leave_type.color || "#3B82F6" }} 
                    />
                    <span className="font-medium">{leaveBalance.leave_type.name}</span>
                  </div>
                  <Badge variant={exceedsBalance ? "destructive" : "default"}>
                    {leaveBalance.current_balance} {leaveBalance.leave_type.accrual_unit} available
                  </Badge>
                </div>

                {exceedsBalance && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    Request ({duration} {leaveBalance.leave_type.accrual_unit}) exceeds available balance!
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded bg-muted/50 p-2 text-center">
                    <div className="text-xs text-muted-foreground">Accrued</div>
                    <div className="font-medium">{leaveBalance.accrued_amount}</div>
                  </div>
                  <div className="rounded bg-muted/50 p-2 text-center">
                    <div className="text-xs text-muted-foreground">Used</div>
                    <div className="font-medium">{leaveBalance.used_amount}</div>
                  </div>
                  <div className="rounded bg-muted/50 p-2 text-center">
                    <div className="text-xs text-muted-foreground">Carried</div>
                    <div className="font-medium">{leaveBalance.carried_forward}</div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">This Request</span>
                  <span className="font-medium">{duration} {leaveBalance.leave_type.accrual_unit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">After Approval</span>
                  <span className={`font-medium ${exceedsBalance ? "text-destructive" : "text-green-600"}`}>
                    {(leaveBalance.current_balance - duration).toFixed(1)} {leaveBalance.leave_type.accrual_unit}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No balance record found for this leave type.
              </p>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Year-to-Date Usage</span>
              <Badge variant="outline">{ytdUsed} days used</Badge>
            </div>

            {leaveHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No leave requests this year.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {leaveHistory.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: request.leave_type?.color || "#3B82F6" }} 
                      />
                      <span>{request.leave_type?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {format(parseISO(request.start_date), "MMM d")}
                        {request.start_date !== request.end_date && (
                          <> - {format(parseISO(request.end_date), "MMM d")}</>
                        )}
                      </span>
                      <Badge 
                        variant={request.status === "approved" ? "default" : "outline"}
                        className="text-[10px] h-5"
                      >
                        {request.duration}d · {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overlaps" className="space-y-2">
            {hasOverlaps ? (
              <>
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 p-2 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  {departmentOverlaps.length} team member(s) have overlapping leave
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {departmentOverlaps.map((overlap) => (
                    <div 
                      key={overlap.id} 
                      className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{overlap.employee_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {format(parseISO(overlap.start_date), "MMM d")}
                          {overlap.start_date !== overlap.end_date && (
                            <> - {format(parseISO(overlap.end_date), "MMM d")}</>
                          )}
                        </span>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {overlap.leave_type_name}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 p-2 rounded">
                <CheckCircle className="h-4 w-4" />
                No overlapping leave in the department
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

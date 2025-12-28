import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  LayoutGrid, 
  List, 
  CalendarClock, 
  Clock,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { parseISO, isFuture } from "date-fns";

interface TeamMember {
  id: string;
  full_name: string;
  employee_number?: string;
}

interface LeaveBalance {
  id: string;
  leave_type_id: string;
  year: number;
  opening_balance: number;
  accrued_amount: number;
  used_amount: number;
  carried_forward: number;
  adjustment_amount: number;
  current_balance: number;
  leave_type?: {
    id: string;
    name: string;
    color: string;
    accrual_unit: string;
  } | null;
}

interface LeaveRequest {
  id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  duration: number;
  status: string;
}

export function TeamMemberBalances() {
  const { profile } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [balanceYear, setBalanceYear] = useState<string>(new Date().getFullYear().toString());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch direct reports
  const { data: teamMembers = [], isLoading: loadingTeam } = useQuery({
    queryKey: ["team-members", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, employee_number")
        .eq("manager_id", profile.id)
        .order("full_name");
      if (error) throw error;
      return (data || []) as TeamMember[];
    },
    enabled: !!profile?.id,
  });

  // Auto-select first employee when team loads
  useEffect(() => {
    if (teamMembers.length > 0 && !selectedEmployee) {
      setSelectedEmployee(teamMembers[0].id);
    }
  }, [teamMembers, selectedEmployee]);

  // Fetch available years for selected employee
  const { data: availableYears = [] } = useQuery({
    queryKey: ["employee-balance-years", selectedEmployee],
    queryFn: async () => {
      if (!selectedEmployee) return [];
      const { data, error } = await supabase
        .from("leave_balances")
        .select("year")
        .eq("employee_id", selectedEmployee)
        .order("year", { ascending: false });
      if (error) throw error;
      const years = [...new Set(data.map((d) => d.year))];
      const currentYear = new Date().getFullYear();
      if (!years.includes(currentYear)) {
        years.unshift(currentYear);
      }
      return years.sort((a, b) => b - a);
    },
    enabled: !!selectedEmployee,
  });

  // Fetch balances for selected employee and year
  const { data: balances = [], isLoading: loadingBalances } = useQuery({
    queryKey: ["employee-balances", selectedEmployee, balanceYear],
    queryFn: async () => {
      if (!selectedEmployee) return [];
      const { data, error } = await supabase
        .from("leave_balances")
        .select("*, leave_type:leave_types(*)")
        .eq("employee_id", selectedEmployee)
        .eq("year", parseInt(balanceYear));
      if (error) throw error;
      return data as LeaveBalance[];
    },
    enabled: !!selectedEmployee,
  });

  // Fetch leave requests for selected employee
  const { data: leaveRequests = [] } = useQuery({
    queryKey: ["employee-leave-requests", selectedEmployee],
    queryFn: async () => {
      if (!selectedEmployee) return [];
      const { data, error } = await supabase
        .from("leave_requests")
        .select("id, leave_type_id, start_date, end_date, duration, status")
        .eq("employee_id", selectedEmployee)
        .in("status", ["pending", "approved"]);
      if (error) throw error;
      return data as LeaveRequest[];
    },
    enabled: !!selectedEmployee,
  });

  // Calculate pending and booked leave per leave type
  const leaveStatusByType = useMemo(() => {
    const filterYear = parseInt(balanceYear);
    const yearStart = new Date(filterYear, 0, 1);
    const yearEnd = new Date(filterYear, 11, 31);
    
    const result = new Map<string, { pending: number; booked: number }>();
    
    leaveRequests.forEach((request) => {
      const startDate = parseISO(request.start_date);
      const endDate = parseISO(request.end_date);
      
      const overlapsYear = startDate <= yearEnd && endDate >= yearStart;
      if (!overlapsYear) return;
      
      if (!result.has(request.leave_type_id)) {
        result.set(request.leave_type_id, { pending: 0, booked: 0 });
      }
      
      const entry = result.get(request.leave_type_id)!;
      
      if (request.status === "pending") {
        entry.pending += request.duration || 0;
      } else if (request.status === "approved" && isFuture(startDate)) {
        entry.booked += request.duration || 0;
      }
    });
    
    return result;
  }, [leaveRequests, balanceYear]);

  const selectedMember = teamMembers.find((m) => m.id === selectedEmployee);

  if (loadingTeam) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
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
    <div className="space-y-4">
      {/* Employee Selection */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                      {member.employee_number && (
                        <span className="text-muted-foreground ml-2">
                          ({member.employee_number})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Select value={balanceYear} onValueChange={setBalanceYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balances Display */}
      {loadingBalances ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : balances.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No leave balances found for {selectedMember?.full_name} in {balanceYear}.
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {balances.map((balance) => {
            const leaveStatus = leaveStatusByType.get(balance.leave_type_id) || { pending: 0, booked: 0 };
            const availableBalance = balance.current_balance - leaveStatus.booked - leaveStatus.pending;
            
            return (
              <Card key={balance.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: balance.leave_type?.color || "#3B82F6" }} 
                      />
                      <CardTitle className="text-base">
                        {balance.leave_type?.name || "Unknown"}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {balance.leave_type?.accrual_unit || "days"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-foreground">
                      {balance.current_balance}
                    </div>
                    <span className="text-xs text-muted-foreground">Current Balance</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <CalendarClock className="h-3 w-3 mr-1" />
                      {leaveStatus.booked} booked
                    </Badge>
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {leaveStatus.pending} pending
                    </Badge>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Available</span>
                      <span className="font-semibold text-primary">{availableBalance}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <div>
                      <span className="block text-xs">Opening</span>
                      <span className="font-medium text-foreground">{balance.opening_balance}</span>
                    </div>
                    <div>
                      <span className="block text-xs">Accrued</span>
                      <span className="font-medium text-foreground">{balance.accrued_amount}</span>
                    </div>
                    <div>
                      <span className="block text-xs">Used</span>
                      <span className="font-medium text-foreground">{balance.used_amount}</span>
                    </div>
                    <div>
                      <span className="block text-xs">Carried</span>
                      <span className="font-medium text-foreground">{balance.carried_forward}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead className="text-right">Opening</TableHead>
                <TableHead className="text-right">Accrued</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead className="text-right">Carried</TableHead>
                <TableHead className="text-right">Adj.</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Booked</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.map((balance) => {
                const leaveStatus = leaveStatusByType.get(balance.leave_type_id) || { pending: 0, booked: 0 };
                const availableBalance = balance.current_balance - leaveStatus.booked - leaveStatus.pending;
                
                return (
                  <TableRow key={balance.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: balance.leave_type?.color || "#3B82F6" }} 
                        />
                        <span>{balance.leave_type?.name || "Unknown"}</span>
                        <Badge variant="outline" className="capitalize text-xs">
                          {balance.leave_type?.accrual_unit || "days"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{balance.opening_balance}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">+{balance.accrued_amount}</TableCell>
                    <TableCell className="text-right font-mono text-red-600">-{balance.used_amount}</TableCell>
                    <TableCell className="text-right font-mono">{balance.carried_forward}</TableCell>
                    <TableCell className="text-right font-mono">
                      {balance.adjustment_amount >= 0 ? "+" : ""}{balance.adjustment_amount}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">{balance.current_balance}</TableCell>
                    <TableCell className="text-right font-mono text-blue-600">
                      {leaveStatus.booked > 0 ? leaveStatus.booked : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-amber-600">
                      {leaveStatus.pending > 0 ? leaveStatus.pending : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-primary">
                      {availableBalance}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

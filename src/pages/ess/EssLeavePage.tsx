import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement, LeaveBalance } from "@/hooks/useLeaveManagement";
import { useLeaveYearAllocations } from "@/hooks/useLeaveYearAllocations";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  CalendarPlus, 
  CalendarDays,
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Send,
  CalendarCheck,
  CalendarClock,
  LayoutGrid,
  List,
  GitBranch
} from "lucide-react";
import { format, differenceInDays, startOfYear, isPast, isToday, isFuture, parseISO, getYear } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LeaveWorkflowProgressDialog } from "@/components/leave/LeaveWorkflowProgressDialog";
import { LeaveBalanceSummary } from "@/components/leave/LeaveBalanceSummary";
import { LeaveCalendar } from "@/components/leave/LeaveCalendar";

export default function EssLeavePage() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  
  // Fetch department from employee position
  useEffect(() => {
    const fetchDepartment = async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from("employee_positions")
        .select("position:positions(department_id)")
        .eq("employee_id", profile.id)
        .eq("is_active", true)
        .eq("is_primary", true)
        .maybeSingle();
      if (data?.position?.department_id) {
        setDepartmentId(data.position.department_id);
      }
    };
    fetchDepartment();
  }, [profile?.id]);
  
  const {
    leaveTypes, 
    leaveBalances, 
    leaveRequests, 
    createLeaveRequest,
    loadingTypes,
    loadingBalances, 
    loadingRequests 
  } = useLeaveManagement();
  const { startWorkflow, isLoading: workflowLoading } = useWorkflow();
  
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [balanceYear, setBalanceYear] = useState<string>(new Date().getFullYear().toString());
  const [balanceViewMode, setBalanceViewMode] = useState<"grid" | "list">("grid");
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [selectedRequestForProgress, setSelectedRequestForProgress] = useState<{id: string; number?: string} | null>(null);

  // Fetch available balance years for the user
  const { data: availableBalanceYears = [] } = useQuery({
    queryKey: ["available-balance-years", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("leave_balances")
        .select("year")
        .eq("employee_id", profile.id)
        .order("year", { ascending: false });
      if (error) throw error;
      const years = [...new Set(data.map((d) => d.year))];
      // Always include current year
      const currentYear = new Date().getFullYear();
      if (!years.includes(currentYear)) {
        years.unshift(currentYear);
      }
      return years.sort((a, b) => b - a);
    },
    enabled: !!profile?.id,
  });

  // Fetch balances for the selected balance year
  const { data: filteredBalances = [], isLoading: loadingFilteredBalances } = useQuery({
    queryKey: ["leave-balances-by-year", profile?.id, balanceYear],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("leave_balances")
        .select("*, leave_type:leave_types(*), leave_year:leave_years(*)")
        .eq("employee_id", profile.id)
        .eq("year", parseInt(balanceYear));
      if (error) throw error;
      return data as LeaveBalance[];
    },
    enabled: !!profile?.id,
  });
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    start_half: "full" as "full" | "first_half" | "second_half",
    end_half: "full" as "full" | "first_half" | "second_half",
    reason: "",
    contact_during_leave: "",
    handover_notes: "",
    travel_location: "in_country" as "in_country" | "out_of_country",
    travel_destination: "",
  });

  const selectedType = leaveTypes.find((t) => t.id === formData.leave_type_id);
  const selectedBalance = leaveBalances.find((b) => b.leave_type_id === formData.leave_type_id);

  // Calculate booked leave (pending or approved requests for this year)
  const bookedLeave = useMemo(() => {
    if (!formData.leave_type_id) return 0;
    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date());
    
    return leaveRequests
      .filter((r) => 
        r.leave_type_id === formData.leave_type_id &&
        (r.status === "pending" || r.status === "approved") &&
        new Date(r.start_date) >= yearStart
      )
      .reduce((sum, r) => sum + (r.duration || 0), 0);
  }, [leaveRequests, formData.leave_type_id]);

  // Calculate balance summary values
  const balanceSummary = useMemo(() => {
    if (!selectedBalance) return null;
    
    return {
      openingBalance: selectedBalance.carried_forward || 0,
      entitlement: (selectedBalance.accrued_amount || 0) + (selectedBalance.adjustment_amount || 0),
      earnedYTD: selectedBalance.accrued_amount || 0,
      takenYTD: selectedBalance.used_amount || 0,
      currentBalance: selectedBalance.current_balance || 0,
      bookedPending: bookedLeave,
    };
  }, [selectedBalance, bookedLeave]);

  // Get available years from leave requests (including years where leave spans into)
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear); // Always include current year
    
    leaveRequests.forEach((r) => {
      if (r.status === "approved") {
        const startYear = getYear(parseISO(r.start_date));
        const endYear = getYear(parseISO(r.end_date));
        years.add(startYear);
        years.add(endYear);
      }
    });
    
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [leaveRequests]);

  // Filter leave taken (approved leave where any part falls within selected year)
  const leaveTaken = useMemo(() => {
    const filterYear = parseInt(selectedYear);
    const yearStart = new Date(filterYear, 0, 1); // Jan 1 of filter year
    const yearEnd = new Date(filterYear, 11, 31); // Dec 31 of filter year
    
    return leaveRequests
      .filter((r) => {
        if (r.status !== "approved") return false;
        const startDate = parseISO(r.start_date);
        const endDate = parseISO(r.end_date);
        
        // Check if leave period overlaps with the selected year
        const leaveOverlapsYear = startDate <= yearEnd && endDate >= yearStart;
        if (!leaveOverlapsYear) return false;
        
        // Only show if leave has started (past or today)
        return isPast(startDate) || isToday(startDate);
      })
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }, [leaveRequests, selectedYear]);

  // Get IDs of leave taken for fetching allocations
  const leaveTakenIds = useMemo(() => leaveTaken.map((l) => l.id), [leaveTaken]);
  
  // Fetch year allocations for cross-year leave display
  const { data: yearAllocations = [] } = useLeaveYearAllocations(leaveTakenIds);
  
  // Create a map for quick lookup
  const allocationsByRequest = useMemo(() => {
    const map = new Map<string, typeof yearAllocations>();
    yearAllocations.forEach((alloc) => {
      if (!map.has(alloc.leave_request_id)) {
        map.set(alloc.leave_request_id, []);
      }
      map.get(alloc.leave_request_id)!.push(alloc);
    });
    return map;
  }, [yearAllocations]);

  // Calculate pending and booked leave per leave type for the balance year
  const leaveStatusByType = useMemo(() => {
    const filterYear = parseInt(balanceYear);
    const yearStart = new Date(filterYear, 0, 1);
    const yearEnd = new Date(filterYear, 11, 31);
    const today = new Date();
    
    const result = new Map<string, { pending: number; booked: number }>();
    
    leaveRequests.forEach((request) => {
      const startDate = parseISO(request.start_date);
      const endDate = parseISO(request.end_date);
      
      // Check if leave overlaps with the selected balance year
      const overlapsYear = startDate <= yearEnd && endDate >= yearStart;
      if (!overlapsYear) return;
      
      if (!result.has(request.leave_type_id)) {
        result.set(request.leave_type_id, { pending: 0, booked: 0 });
      }
      
      const entry = result.get(request.leave_type_id)!;
      
      if (request.status === "pending") {
        // Pending approval
        entry.pending += request.duration || 0;
      } else if (request.status === "approved" && isFuture(startDate)) {
        // Approved but not yet started
        entry.booked += request.duration || 0;
      }
    });
    
    return result;
  }, [leaveRequests, balanceYear]);

  // Filter upcoming approved leave
  const upcomingLeave = useMemo(() => {
    return leaveRequests
      .filter((r) => {
        if (r.status !== "approved") return false;
        const startDate = parseISO(r.start_date);
        return isFuture(startDate);
      })
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  }, [leaveRequests]);

  // Calculate duration
  const calculateDuration = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    
    const daysDiff = differenceInDays(formData.end_date, formData.start_date) + 1;
    let duration = daysDiff;

    // Adjust for half days
    if (formData.start_half !== "full") duration -= 0.5;
    if (formData.end_half !== "full" && formData.start_date !== formData.end_date) duration -= 0.5;

    return Math.max(0, duration);
  };

  const duration = calculateDuration();
  const isValid = formData.leave_type_id && formData.start_date && formData.end_date && duration > 0;

  const resetForm = () => {
    setFormData({
      leave_type_id: "",
      start_date: undefined,
      end_date: undefined,
      start_half: "full",
      end_half: "full",
      reason: "",
      contact_during_leave: "",
      handover_notes: "",
      travel_location: "in_country",
      travel_destination: "",
    });
  };

  const handleSubmit = async () => {
    if (!isValid || !profile) return;

    setSubmitting(true);
    try {
      // Create the leave request
      const result = await createLeaveRequest.mutateAsync({
        leave_type_id: formData.leave_type_id,
        start_date: format(formData.start_date!, "yyyy-MM-dd"),
        end_date: format(formData.end_date!, "yyyy-MM-dd"),
        start_half: formData.start_half,
        end_half: formData.end_half,
        duration,
        reason: formData.reason || undefined,
        contact_during_leave: formData.contact_during_leave || undefined,
        handover_notes: formData.handover_notes || undefined,
        travel_location: formData.travel_location,
        travel_destination: formData.travel_location === "out_of_country" ? formData.travel_destination || undefined : undefined,
        status: "pending",
      });

      // Start workflow for the leave request
      if (result?.id) {
        const workflowInstance = await startWorkflow(
          "LEAVE_REQUEST",
          "leave_request",
          result.id,
          {
            employee_id: profile.id,
            employee_name: profile.full_name,
            leave_type: selectedType?.name,
            leave_type_id: formData.leave_type_id,
            start_date: format(formData.start_date!, "yyyy-MM-dd"),
            end_date: format(formData.end_date!, "yyyy-MM-dd"),
            department_id: departmentId,
            duration: duration,
            accrual_unit: selectedType?.accrual_unit || "days",
            available_balance: selectedBalance?.current_balance || 0,
            company_id: profile.company_id,
            reason: formData.reason,
          }
        );

        if (workflowInstance) {
          toast.success("Leave request submitted for approval");
        }
      }

      resetForm();
      setShowApplyDialog(false);
    } catch (error) {
      console.error("Failed to submit leave request:", error);
      toast.error("Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
      approved: { variant: "default", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> },
      cancelled: { variant: "secondary", icon: <XCircle className="h-3 w-3 mr-1" /> },
      withdrawn: { variant: "secondary", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      draft: { variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: t("pages.myLeave.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("pages.myLeave.title")}</h1>
              <p className="text-muted-foreground">{t("pages.myLeave.subtitle")}</p>
            </div>
          </div>
          <Button onClick={() => setShowApplyDialog(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            {t("pages.myLeave.applyLeave")}
          </Button>
        </div>

        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList>
            <TabsTrigger value="balances">My Balances</TabsTrigger>
            <TabsTrigger value="taken">Leave Taken</TabsTrigger>
            <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
            <TabsTrigger value="requests">Request History</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <LeaveCalendar leaveRequests={leaveRequests} />
          </TabsContent>

          <TabsContent value="balances">
            <div className="space-y-4">
              {/* Filter and View Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Year:</span>
                  <Select value={balanceYear} onValueChange={setBalanceYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBalanceYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant={balanceViewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setBalanceViewMode("grid")}
                    className="h-7 px-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={balanceViewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setBalanceViewMode("list")}
                    className="h-7 px-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {loadingFilteredBalances ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredBalances.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No leave balances found for {balanceYear}. 
                    {parseInt(balanceYear) === new Date().getFullYear() && " Contact HR to set up your leave entitlements."}
                  </CardContent>
                </Card>
              ) : balanceViewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBalances.map((balance) => {
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
                          
                          {/* Booked and Pending indicators - always show */}
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
                          
                          {/* Available after commitments - always show */}
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
                      {filteredBalances.map((balance) => {
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
          </TabsContent>

          <TabsContent value="taken">
            <div className="space-y-6">
              {/* Currently on Leave / Upcoming */}
              {upcomingLeave.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      Upcoming Approved Leave
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingLeave.map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-3 rounded-lg bg-background border">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: leave.leave_type?.color || "#3B82F6" }} 
                            />
                            <div>
                              <p className="font-medium">{leave.leave_type?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDateForDisplay(leave.start_date, "MMM d, yyyy")}
                                {leave.start_date !== leave.end_date && (
                                  <> - {formatDateForDisplay(leave.end_date, "MMM d, yyyy")}</>
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{leave.duration} {leave.leave_type?.accrual_unit || "days"}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Leave Taken History */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarCheck className="h-4 w-4" />
                      Leave History
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">
                        Total in {selectedYear}: <span className="font-semibold text-foreground">
                          {leaveTaken.reduce((sum, l) => {
                            const allocations = allocationsByRequest.get(l.id) || [];
                            const yearAlloc = allocations.find((a) => a.year === parseInt(selectedYear));
                            return sum + (yearAlloc?.allocated_days ?? l.duration ?? 0);
                          }, 0)} days
                        </span>
                      </div>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
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
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Total Duration</TableHead>
                        <TableHead>Days in {selectedYear}</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingRequests ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ) : leaveTaken.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No leave taken in {selectedYear}.
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaveTaken.map((leave) => {
                          const endDate = parseISO(leave.end_date);
                          const startDate = parseISO(leave.start_date);
                          const isOngoing = !isPast(endDate) && (isToday(startDate) || isPast(startDate));
                          const isCrossYear = getYear(startDate) !== getYear(endDate);
                          const allocations = allocationsByRequest.get(leave.id) || [];
                          const yearAllocation = allocations.find((a) => a.year === parseInt(selectedYear));
                          const daysInSelectedYear = yearAllocation?.allocated_days ?? leave.duration;
                          
                          return (
                            <TableRow key={leave.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-3 w-3 rounded-full" 
                                    style={{ backgroundColor: leave.leave_type?.color || "#3B82F6" }} 
                                  />
                                  <div>
                                    <span>{leave.leave_type?.name || "Unknown"}</span>
                                    {isCrossYear && (
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        Cross-Year
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDateForDisplay(leave.start_date, "MMM d, yyyy")}
                                {leave.start_date !== leave.end_date && (
                                  <> - {formatDateForDisplay(leave.end_date, "MMM d, yyyy")}</>
                                )}
                              </TableCell>
                              <TableCell>
                                {leave.duration} {leave.leave_type?.accrual_unit || "days"}
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{daysInSelectedYear}</span>
                                {isCrossYear && allocations.length > 0 && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({allocations.map((a) => `${a.year}: ${a.allocated_days}d`).join(", ")})
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {isOngoing ? (
                                  <Badge className="bg-green-500">Currently on Leave</Badge>
                                ) : (
                                  <Badge variant="secondary">Completed</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-[100px]">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRequests ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : leaveRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No leave requests found. Apply for your first leave above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaveRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-sm">{request.request_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: request.leave_type?.color || "#3B82F6" }} 
                            />
                            {request.leave_type?.name || "Unknown"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateForDisplay(request.start_date, "MMM d, yyyy")}
                          {request.start_date !== request.end_date && (
                            <> - {formatDateForDisplay(request.end_date, "MMM d, yyyy")}</>
                          )}
                        </TableCell>
                        <TableCell>
                          {request.duration} {request.leave_type?.accrual_unit || "days"}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {request.submitted_at 
                            ? formatDateForDisplay(request.submitted_at, "MMM d, yyyy")
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequestForProgress({ id: request.id, number: request.request_number });
                              setShowProgressDialog(true);
                            }}
                            className="h-8 px-2"
                          >
                            <GitBranch className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Apply Leave Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" />
              Apply for Leave
            </DialogTitle>
            <DialogDescription>
              Submit a leave request. It will be routed for approval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Leave Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="leave_type">Leave Type *</Label>
              <Select
                value={formData.leave_type_id}
                onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => {
                    const balance = leaveBalances.find((b) => b.leave_type_id === type.id);
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                          <span>{type.name}</span>
                          {balance && (
                            <span className="text-muted-foreground">
                              ({balance.current_balance} available)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Leave Balance Summary - shown when leave type is selected */}
            {selectedType && balanceSummary && (
              <LeaveBalanceSummary
                leaveTypeName={selectedType.name}
                leaveTypeColor={selectedType.color}
                accrualUnit={selectedType.accrual_unit}
                openingBalance={balanceSummary.openingBalance}
                entitlement={balanceSummary.entitlement}
                earnedYTD={balanceSummary.earnedYTD}
                takenYTD={balanceSummary.takenYTD}
                currentBalance={balanceSummary.currentBalance}
                bookedPending={balanceSummary.bookedPending}
              />
            )}

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(formData.start_date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => {
                        setFormData({ 
                          ...formData, 
                          start_date: date,
                          end_date: formData.end_date && date && date > formData.end_date ? date : formData.end_date 
                        });
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Select
                  value={formData.start_half}
                  onValueChange={(value: "full" | "first_half" | "second_half") => 
                    setFormData({ ...formData, start_half: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Day</SelectItem>
                    <SelectItem value="first_half">First Half</SelectItem>
                    <SelectItem value="second_half">Second Half</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(formData.end_date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => setFormData({ ...formData, end_date: date })}
                      disabled={(date) => date < (formData.start_date || new Date())}
                    />
                  </PopoverContent>
                </Popover>
                <Select
                  value={formData.end_half}
                  onValueChange={(value: "full" | "first_half" | "second_half") => 
                    setFormData({ ...formData, end_half: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Day</SelectItem>
                    <SelectItem value="first_half">First Half</SelectItem>
                    <SelectItem value="second_half">Second Half</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration Display */}
            {duration > 0 && (
              <div className="rounded-lg bg-primary/5 p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold text-primary">
                  {duration} {selectedType?.accrual_unit || "days"}
                </p>
                {selectedBalance && duration > selectedBalance.current_balance && (
                  <p className="text-sm text-destructive mt-1">
                    Exceeds available balance ({selectedBalance.current_balance} {selectedType?.accrual_unit})
                  </p>
                )}
              </div>
            )}

            {/* Additional Info */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Optional: Provide a reason for your leave request"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact During Leave</Label>
              <Input
                id="contact"
                value={formData.contact_during_leave}
                onChange={(e) => setFormData({ ...formData, contact_during_leave: e.target.value })}
                placeholder="Phone number or email for emergencies"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="handover">Handover Notes</Label>
              <Textarea
                id="handover"
                value={formData.handover_notes}
                onChange={(e) => setFormData({ ...formData, handover_notes: e.target.value })}
                placeholder="Any handover instructions for your team"
                rows={2}
              />
            </div>

            {/* Travel Location */}
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Location During Leave
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="travel_location"
                    value="in_country"
                    checked={formData.travel_location === "in_country"}
                    onChange={() => setFormData({ ...formData, travel_location: "in_country", travel_destination: "" })}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm">In Country</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="travel_location"
                    value="out_of_country"
                    checked={formData.travel_location === "out_of_country"}
                    onChange={() => setFormData({ ...formData, travel_location: "out_of_country" })}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm">Out of Country</span>
                </label>
              </div>
              {formData.travel_location === "out_of_country" && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="travel_destination">Travel Destination</Label>
                  <Input
                    id="travel_destination"
                    value={formData.travel_destination}
                    onChange={(e) => setFormData({ ...formData, travel_destination: e.target.value })}
                    placeholder="Country or location you'll be visiting"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!isValid || submitting || workflowLoading}
              >
                {submitting || workflowLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workflow Progress Dialog */}
      {selectedRequestForProgress && (
        <LeaveWorkflowProgressDialog
          open={showProgressDialog}
          onOpenChange={(open) => {
            setShowProgressDialog(open);
            if (!open) setSelectedRequestForProgress(null);
          }}
          leaveRequestId={selectedRequestForProgress.id}
          leaveRequestNumber={selectedRequestForProgress.number}
        />
      )}
    </AppLayout>
  );
}

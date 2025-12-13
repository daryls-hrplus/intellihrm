import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useAuth } from "@/contexts/AuthContext";
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
  Send
} from "lucide-react";
import { format, differenceInDays, startOfYear } from "date-fns";
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
import { LeaveBalanceSummary } from "@/components/leave/LeaveBalanceSummary";

export default function EssLeavePage() {
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
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    start_half: "full" as "full" | "first_half" | "second_half",
    end_half: "full" as "full" | "first_half" | "second_half",
    reason: "",
    contact_during_leave: "",
    handover_notes: "",
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
            { label: "Employee Self Service", href: "/ess" },
            { label: "Leave Requests" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Requests</h1>
              <p className="text-muted-foreground">View your leave balances and request time off</p>
            </div>
          </div>
          <Button onClick={() => setShowApplyDialog(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Apply for Leave
          </Button>
        </div>

        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList>
            <TabsTrigger value="balances">My Balances</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="balances">
            {loadingBalances ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : leaveBalances.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No leave balances found. Contact HR to set up your leave entitlements.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {leaveBalances.map((balance) => (
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
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {balance.current_balance}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
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
                        <div>
                          <span className="block text-xs">Adjustments</span>
                          <span className="font-medium text-foreground">{balance.adjustment_amount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRequests ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : leaveRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                          {format(new Date(request.start_date), "MMM d, yyyy")}
                          {request.start_date !== request.end_date && (
                            <> - {format(new Date(request.end_date), "MMM d, yyyy")}</>
                          )}
                        </TableCell>
                        <TableCell>
                          {request.duration} {request.leave_type?.accrual_unit || "days"}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {request.submitted_at 
                            ? format(new Date(request.submitted_at), "MMM d, yyyy")
                            : "-"
                          }
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
    </AppLayout>
  );
}

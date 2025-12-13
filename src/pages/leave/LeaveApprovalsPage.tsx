import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement, LeaveRequest } from "@/hooks/useLeaveManagement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Textarea } from "@/components/ui/textarea";
import { CalendarCheck, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LeaveApprovalsPage() {
  const { allLeaveRequests, loadingAllRequests, updateLeaveRequestStatus } = useLeaveManagement();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const filteredRequests = allLeaveRequests.filter((r) => 
    statusFilter === "all" ? true : r.status === statusFilter
  );

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    await updateLeaveRequestStatus.mutateAsync({
      id: selectedRequest.id,
      status: actionType === "approve" ? "approved" : "rejected",
      review_notes: reviewNotes || undefined,
    });

    setSelectedRequest(null);
    setReviewNotes("");
    setActionType(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
      approved: { variant: "default", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> },
      cancelled: { variant: "secondary", icon: <XCircle className="h-3 w-3 mr-1" /> },
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
            { label: "Leave Management", href: "/leave" },
            { label: "Leave Approvals" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Approvals</h1>
              <p className="text-muted-foreground">Review and approve team leave requests</p>
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request #</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAllRequests ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">{request.request_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.employee?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{request.employee?.email}</p>
                      </div>
                    </TableCell>
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
                      {format(new Date(request.start_date), "MMM d")}
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
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRequest(request);
                            setActionType(null);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActionType("approve");
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/90"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActionType("reject");
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Action Dialog */}
        <Dialog 
          open={!!selectedRequest && !!actionType} 
          onOpenChange={(open) => { if (!open) { setSelectedRequest(null); setActionType(null); } }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" ? "Approve" : "Reject"} Leave Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Employee</span>
                  <span className="font-medium">{selectedRequest?.employee?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Leave Type</span>
                  <span className="font-medium">{selectedRequest?.leave_type?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dates</span>
                  <span className="font-medium">
                    {selectedRequest?.start_date && format(new Date(selectedRequest.start_date), "MMM d")}
                    {selectedRequest?.start_date !== selectedRequest?.end_date && (
                      <> - {selectedRequest?.end_date && format(new Date(selectedRequest.end_date), "MMM d, yyyy")}</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">{selectedRequest?.duration} {selectedRequest?.leave_type?.accrual_unit}</span>
                </div>
                {selectedRequest?.reason && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Reason</span>
                    <p className="mt-1">{selectedRequest.reason}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes (Optional)</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes for the employee..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setSelectedRequest(null); setActionType(null); }}>
                Cancel
              </Button>
              <Button
                variant={actionType === "approve" ? "default" : "destructive"}
                onClick={handleAction}
                disabled={updateLeaveRequestStatus.isPending}
              >
                {updateLeaveRequestStatus.isPending 
                  ? "Processing..." 
                  : actionType === "approve" ? "Approve" : "Reject"
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog 
          open={!!selectedRequest && !actionType} 
          onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Request #</span>
                  <span className="font-mono">{selectedRequest?.request_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Employee</span>
                  <span className="font-medium">{selectedRequest?.employee?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Leave Type</span>
                  <span className="font-medium">{selectedRequest?.leave_type?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dates</span>
                  <span className="font-medium">
                    {selectedRequest?.start_date && format(new Date(selectedRequest.start_date), "MMM d, yyyy")}
                    {selectedRequest?.start_date !== selectedRequest?.end_date && (
                      <> - {selectedRequest?.end_date && format(new Date(selectedRequest.end_date), "MMM d, yyyy")}</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">{selectedRequest?.duration} {selectedRequest?.leave_type?.accrual_unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {selectedRequest && getStatusBadge(selectedRequest.status)}
                </div>
                {selectedRequest?.reason && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Reason</span>
                    <p className="mt-1">{selectedRequest.reason}</p>
                  </div>
                )}
                {selectedRequest?.contact_during_leave && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Contact During Leave</span>
                    <p className="mt-1">{selectedRequest.contact_during_leave}</p>
                  </div>
                )}
                {selectedRequest?.handover_notes && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Handover Notes</span>
                    <p className="mt-1">{selectedRequest.handover_notes}</p>
                  </div>
                )}
                {selectedRequest?.review_notes && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Review Notes</span>
                    <p className="mt-1">{selectedRequest.review_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

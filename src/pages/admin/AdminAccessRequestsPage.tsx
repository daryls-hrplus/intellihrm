import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, Clock, FileText, ArrowLeft, Download, CalendarIcon, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { NavLink } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const MENU_MODULES = [
  { code: "dashboard", name: "Dashboard" },
  { code: "workforce", name: "Workforce Management" },
  { code: "leave", name: "Leave Management" },
  { code: "compensation", name: "Compensation" },
  { code: "benefits", name: "Benefits" },
  { code: "performance", name: "Performance" },
  { code: "training", name: "Training" },
  { code: "succession", name: "Succession Planning" },
  { code: "recruitment", name: "Recruitment" },
  { code: "hse", name: "Health & Safety" },
  { code: "employee_relations", name: "Employee Relations" },
  { code: "property", name: "Company Property" },
];

interface AccessRequest {
  id: string;
  user_id: string;
  user_email: string;
  requested_modules: string[];
  reason: string;
  status: string;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export default function AdminAccessRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<"approved" | "rejected" | null>(null);
  const [batchNotes, setBatchNotes] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, dateFrom, dateTo, searchQuery]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("access_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (searchQuery.trim()) {
        query = query.ilike("user_email", `%${searchQuery.trim()}%`);
      }

      if (dateFrom) {
        query = query.gte("created_at", dateFrom.toISOString());
      }

      if (dateTo) {
        // Add one day to include the entire end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt("created_at", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setRequests(
        (data || []).map((r) => ({
          ...r,
          requested_modules: Array.isArray(r.requested_modules)
            ? (r.requested_modules as string[])
            : [],
        }))
      );
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load access requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (action: "approved" | "rejected") => {
    if (!selectedRequest || !user) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("access_requests")
        .update({
          status: action,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes.trim() || null,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      // Send email notification (non-blocking)
      supabase.functions
        .invoke("send-access-request-notification", {
          body: {
            requestId: selectedRequest.id,
            status: action,
            reviewNotes: reviewNotes.trim() || undefined,
          },
        })
        .then((res) => {
          if (res.error) {
            console.error("Email notification failed:", res.error);
          } else {
            console.log("Email notification sent");
          }
        });

      toast.success(`Request ${action} successfully`);
      setSelectedRequest(null);
      setReviewNotes("");
      fetchRequests();
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error("Failed to process request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchReview = async () => {
    if (!batchAction || selectedIds.size === 0 || !user) return;

    setIsProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      
      const { error } = await supabase
        .from("access_requests")
        .update({
          status: batchAction,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: batchNotes.trim() || null,
        })
        .in("id", ids);

      if (error) throw error;

      // Send email notifications for each request (non-blocking)
      ids.forEach((requestId) => {
        supabase.functions
          .invoke("send-access-request-notification", {
            body: {
              requestId,
              status: batchAction,
              reviewNotes: batchNotes.trim() || undefined,
            },
          })
          .then((res) => {
            if (res.error) {
              console.error("Email notification failed:", res.error);
            }
          });
      });

      toast.success(`${ids.length} request(s) ${batchAction} successfully`);
      setSelectedIds(new Set());
      setBatchAction(null);
      setBatchNotes("");
      fetchRequests();
    } catch (error) {
      console.error("Error processing batch:", error);
      toast.error("Failed to process requests");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const allPendingSelected = pendingRequests.length > 0 && pendingRequests.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingRequests.map((r) => r.id)));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getModuleName = (code: string) =>
    MENU_MODULES.find((m) => m.code === code)?.name || code;

  const exportToCSV = async () => {
    try {
      // Fetch all requests for export (not filtered)
      const { data, error } = await supabase
        .from("access_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const exportData = (data || []).map((r) => ({
        id: r.id,
        user_email: r.user_email,
        requested_modules: Array.isArray(r.requested_modules)
          ? (r.requested_modules as string[]).map(getModuleName).join("; ")
          : "",
        reason: r.reason || "",
        status: r.status,
        review_notes: r.review_notes || "",
        created_at: new Date(r.created_at).toLocaleString(),
        reviewed_at: r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : "",
      }));

      const headers = [
        "Request ID",
        "User Email",
        "Requested Modules",
        "Reason",
        "Status",
        "Review Notes",
        "Created At",
        "Reviewed At",
      ];

      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          [
            row.id,
            `"${row.user_email}"`,
            `"${row.requested_modules}"`,
            `"${row.reason.replace(/"/g, '""')}"`,
            row.status,
            `"${row.review_notes.replace(/"/g, '""')}"`,
            row.created_at,
            row.reviewed_at,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `access-requests-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Access requests exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export access requests");
    }
  };

  const pendingCount = pendingRequests.length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Access Requests" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink
              to="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </NavLink>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                Access Requests
              </h1>
              <p className="text-muted-foreground">
                Review and manage employee permission requests
              </p>
            </div>
          </div>

          {pendingCount > 0 && (
            <Badge className="bg-warning text-warning-foreground">
              {pendingCount} Pending
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle>All Requests</CardTitle>
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-[200px] h-9"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "MMM d, yyyy") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {(dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateFrom(undefined);
                      setDateTo(undefined);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear dates
                  </Button>
                )}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedIds.size > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedIds.size} request(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setBatchAction("rejected")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject All
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setBatchAction("approved")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve All
                  </Button>
                </div>
              </div>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No access requests found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {statusFilter === "pending" && pendingRequests.length > 0 && (
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={allPendingSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all pending"
                        />
                      </TableHead>
                    )}
                    <TableHead>User</TableHead>
                    <TableHead>Requested Modules</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      {statusFilter === "pending" && pendingRequests.length > 0 && (
                        <TableCell>
                          {request.status === "pending" && (
                            <Checkbox
                              checked={selectedIds.has(request.id)}
                              onCheckedChange={() => toggleSelect(request.id)}
                              aria-label={`Select ${request.user_email}`}
                            />
                          )}
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        {request.user_email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {request.requested_modules.slice(0, 2).map((mod) => (
                            <Badge key={mod} variant="outline" className="text-xs">
                              {getModuleName(mod)}
                            </Badge>
                          ))}
                          {request.requested_modules.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{request.requested_modules.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {request.reason}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.status === "pending" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewNotes("");
                            }}
                          >
                            Review
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedRequest(request)}
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedRequest?.status === "pending"
                  ? "Review Access Request"
                  : "Access Request Details"}
              </DialogTitle>
              <DialogDescription>
                {selectedRequest?.user_email}
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Requested Modules</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedRequest.requested_modules.map((mod) => (
                      <Badge key={mod} variant="secondary">
                        {getModuleName(mod)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Reason</Label>
                  <p className="mt-1 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {selectedRequest.reason}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Submitted</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(selectedRequest.created_at).toLocaleString()}
                  </p>
                </div>

                {selectedRequest.status === "pending" ? (
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Review Notes (optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes for the employee..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                ) : (
                  selectedRequest.review_notes && (
                    <div>
                      <Label className="text-sm font-medium">Review Notes</Label>
                      <p className="mt-1 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {selectedRequest.review_notes}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            <DialogFooter>
              {selectedRequest?.status === "pending" ? (
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReview("rejected")}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleReview("approved")}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setSelectedRequest(null)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Batch Action Dialog */}
        <Dialog open={!!batchAction} onOpenChange={() => setBatchAction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {batchAction === "approved" ? "Approve" : "Reject"} {selectedIds.size} Request(s)
              </DialogTitle>
              <DialogDescription>
                This action will {batchAction === "approved" ? "approve" : "reject"} all selected requests and notify the employees.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="batch-notes" className="text-sm font-medium">
                  Notes for all requests (optional)
                </Label>
                <Textarea
                  id="batch-notes"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="Add notes that will be sent to all selected employees..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setBatchAction(null)}>
                Cancel
              </Button>
              <Button
                variant={batchAction === "rejected" ? "destructive" : "default"}
                onClick={handleBatchReview}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {batchAction === "approved" ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Confirm {batchAction === "approved" ? "Approval" : "Rejection"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
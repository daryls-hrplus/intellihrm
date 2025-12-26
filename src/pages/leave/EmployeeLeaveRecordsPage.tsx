import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement, LeaveRequest } from "@/hooks/useLeaveManagement";
import { useLanguage } from "@/hooks/useLanguage";
import { useLeaveCompanyFilter, LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Send,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

export default function EmployeeLeaveRecordsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { allLeaveRequests, loadingAllRequests, leaveTypes, updateLeaveRequestStatus } = useLeaveManagement(selectedCompanyId);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | "post" | null>(null);
  const [isBulkPosting, setIsBulkPosting] = useState(false);

  // Filter logic
  const filteredRequests = useMemo(() => {
    let result = [...allLeaveRequests];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.employee?.full_name?.toLowerCase().includes(term) ||
        r.request_number?.toLowerCase().includes(term) ||
        r.leave_type?.name?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(r => r.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(r => r.leave_type_id === typeFilter);
    }

    // Date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

      result = result.filter(r => {
        const requestDate = new Date(r.start_date);
        switch (dateRangeFilter) {
          case "this_month":
            return requestDate >= startOfMonth;
          case "this_quarter":
            return requestDate >= startOfQuarter;
          case "this_year":
            return requestDate >= startOfYear;
          default:
            return true;
        }
      });
    }

    return result;
  }, [allLeaveRequests, searchTerm, statusFilter, typeFilter, dateRangeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedRequests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRequests.map(r => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Action handlers
  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === "post") {
      // Post to payroll/balances
      toast.success("Leave record posted successfully");
      setSelectedRequest(null);
      setActionType(null);
      return;
    }

    await updateLeaveRequestStatus.mutateAsync({
      id: selectedRequest.id,
      status: actionType === "approve" ? "approved" : "rejected",
      review_notes: reviewNotes || undefined,
    });

    setSelectedRequest(null);
    setReviewNotes("");
    setActionType(null);
  };

  const handleBulkPost = async () => {
    setIsBulkPosting(true);
    try {
      // Simulate bulk posting
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${selectedIds.size} leave records posted successfully`);
      setSelectedIds(new Set());
    } finally {
      setIsBulkPosting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
      approved: { variant: "default", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> },
      cancelled: { variant: "secondary", icon: <XCircle className="h-3 w-3 mr-1" /> },
      posted: { variant: "default", icon: <Send className="h-3 w-3 mr-1" /> },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleExport = () => {
    toast.success("Exporting leave records...");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("leave.title"), href: "/leave" },
            { label: t("leave.employeeRecords.title", "Employee Leave Records") },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("leave.employeeRecords.title", "Employee Leave Records")}
              </h1>
              <p className="text-muted-foreground">
                {t("leave.employeeRecords.subtitle", "View and manage leave transactions for all employees")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t("common.export", "Export")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("leave.employeeRecords.searchPlaceholder", "Search by employee, request number...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("leave.status", "Status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all", "All")}</SelectItem>
              <SelectItem value="pending">{t("leave.status.pending", "Pending")}</SelectItem>
              <SelectItem value="approved">{t("leave.status.approved", "Approved")}</SelectItem>
              <SelectItem value="rejected">{t("leave.status.rejected", "Rejected")}</SelectItem>
              <SelectItem value="cancelled">{t("leave.status.cancelled", "Cancelled")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("leave.type", "Leave Type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all", "All Types")}</SelectItem>
              {leaveTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: type.color }} />
                    {type.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t("leave.dateRange", "Date Range")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allTime", "All Time")}</SelectItem>
              <SelectItem value="this_month">{t("common.thisMonth", "This Month")}</SelectItem>
              <SelectItem value="this_quarter">{t("common.thisQuarter", "This Quarter")}</SelectItem>
              <SelectItem value="this_year">{t("common.thisYear", "This Year")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <span className="text-sm font-medium">
              {selectedIds.size} {t("leave.employeeRecords.recordsSelected", "records selected")}
            </span>
            <Button size="sm" onClick={handleBulkPost} disabled={isBulkPosting}>
              <Send className="mr-2 h-4 w-4" />
              {isBulkPosting 
                ? t("leave.employeeRecords.posting", "Posting...") 
                : t("leave.employeeRecords.postSelected", "Post Selected")
              }
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
              {t("common.clearSelection", "Clear Selection")}
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.size === paginatedRequests.length && paginatedRequests.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>{t("leave.employeeRecords.requestNumber", "Request #")}</TableHead>
                <TableHead>{t("leave.employeeRecords.employee", "Employee")}</TableHead>
                <TableHead>{t("leave.employeeRecords.leaveType", "Leave Type")}</TableHead>
                <TableHead>{t("leave.employeeRecords.dates", "Dates")}</TableHead>
                <TableHead>{t("leave.employeeRecords.duration", "Duration")}</TableHead>
                <TableHead>{t("leave.common.status", "Status")}</TableHead>
                <TableHead>{t("leave.employeeRecords.submitted", "Submitted")}</TableHead>
                <TableHead className="w-[100px]">{t("common.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAllRequests ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {t("common.loading", "Loading...")}
                  </TableCell>
                </TableRow>
              ) : paginatedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {t("leave.employeeRecords.noRecords", "No leave records found")}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(request.id)}
                        onCheckedChange={() => toggleSelect(request.id)}
                      />
                    </TableCell>
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
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDateForDisplay(request.start_date, "MMM d")}
                        {request.start_date !== request.end_date && (
                          <> - {formatDateForDisplay(request.end_date, "MMM d, yyyy")}</>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.duration} {request.leave_type?.accrual_unit || "days"}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.submitted_at
                        ? formatDateForDisplay(request.submitted_at, "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedRequest(request);
                            setActionType(null);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("common.view", "View Details")}
                          </DropdownMenuItem>
                          {request.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setSelectedRequest(request);
                                setActionType("approve");
                              }}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                {t("leave.approve", "Approve")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedRequest(request);
                                setActionType("reject");
                              }}>
                                <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                {t("leave.reject", "Reject")}
                              </DropdownMenuItem>
                            </>
                          )}
                          {request.status === "approved" && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedRequest(request);
                              setActionType("post");
                            }}>
                              <Send className="mr-2 h-4 w-4" />
                              {t("leave.post", "Post to Balance")}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Action Dialog */}
        <Dialog
          open={!!selectedRequest && !!actionType}
          onOpenChange={(open) => { if (!open) { setSelectedRequest(null); setActionType(null); } }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" && t("leave.approvals.approveRequest", "Approve Request")}
                {actionType === "reject" && t("leave.approvals.rejectRequest", "Reject Request")}
                {actionType === "post" && t("leave.employeeRecords.postRequest", "Post Leave Record")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeRecords.employee", "Employee")}</span>
                  <span className="font-medium">{selectedRequest?.employee?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeRecords.leaveType", "Leave Type")}</span>
                  <span className="font-medium">{selectedRequest?.leave_type?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeRecords.dates", "Dates")}</span>
                  <span className="font-medium">
                    {selectedRequest?.start_date && formatDateForDisplay(selectedRequest.start_date, "MMM d")}
                    {selectedRequest?.start_date !== selectedRequest?.end_date && (
                      <> - {selectedRequest?.end_date && formatDateForDisplay(selectedRequest.end_date, "MMM d, yyyy")}</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeRecords.duration", "Duration")}</span>
                  <span className="font-medium">{selectedRequest?.duration} {selectedRequest?.leave_type?.accrual_unit}</span>
                </div>
              </div>
              {actionType !== "post" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("leave.approvals.reviewNotes", "Review Notes")}</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder={t("leave.approvals.reviewNotesPlaceholder", "Add notes...")}
                    rows={3}
                  />
                </div>
              )}
              {actionType === "post" && (
                <p className="text-sm text-muted-foreground">
                  {t("leave.employeeRecords.postConfirmation", "This will deduct the leave from the employee's balance and mark the record as posted.")}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setSelectedRequest(null); setActionType(null); }}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                variant={actionType === "reject" ? "destructive" : "default"}
                onClick={handleAction}
                disabled={updateLeaveRequestStatus.isPending}
              >
                {updateLeaveRequestStatus.isPending
                  ? t("common.processing", "Processing...")
                  : actionType === "approve" ? t("leave.approve", "Approve")
                  : actionType === "reject" ? t("leave.reject", "Reject")
                  : t("leave.post", "Post")}
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
              <DialogTitle>{t("leave.employeeRecords.requestDetails", "Leave Request Details")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeRecords.requestNumber", "Request #")}</span>
                  <span className="font-mono">{selectedRequest?.request_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeRecords.employee", "Employee")}</span>
                  <span className="font-medium">{selectedRequest?.employee?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeRecords.leaveType", "Leave Type")}</span>
                  <span className="font-medium">{selectedRequest?.leave_type?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeRecords.dates", "Dates")}</span>
                  <span className="font-medium">
                    {selectedRequest?.start_date && formatDateForDisplay(selectedRequest.start_date, "MMM d, yyyy")}
                    {selectedRequest?.start_date !== selectedRequest?.end_date && (
                      <> - {selectedRequest?.end_date && formatDateForDisplay(selectedRequest.end_date, "MMM d, yyyy")}</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("leave.employeeRecords.duration", "Duration")}</span>
                  <span className="font-medium">{selectedRequest?.duration} {selectedRequest?.leave_type?.accrual_unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("leave.common.status", "Status")}</span>
                  {selectedRequest && getStatusBadge(selectedRequest.status)}
                </div>
                {selectedRequest?.reason && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">{t("leave.reason", "Reason")}</span>
                    <p className="mt-1">{selectedRequest.reason}</p>
                  </div>
                )}
                {selectedRequest?.review_notes && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">{t("leave.approvals.reviewNotes", "Review Notes")}</span>
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

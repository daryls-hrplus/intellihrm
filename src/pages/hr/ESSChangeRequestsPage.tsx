import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, FileText, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { RequestMetricsCards } from "@/components/hr/ess-requests/RequestMetricsCards";
import { RequestFilters } from "@/components/hr/ess-requests/RequestFilters";
import { RequestTableRow } from "@/components/hr/ess-requests/RequestTableRow";
import { RequestDetailsDialog } from "@/components/hr/ess-requests/RequestDetailsDialog";

interface ChangeRequest {
  id: string;
  employee_id: string;
  company_id: string | null;
  request_type: string;
  entity_id: string | null;
  entity_table: string;
  change_action: string;
  current_values: Record<string, any> | null;
  new_values: Record<string, any>;
  status: string;
  requested_at: string;
  requested_by: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  applied_at: string | null;
  request_notes?: string | null;
  document_urls?: string[] | null;
  employee?: {
    id: string;
    full_name?: string;
    first_name?: string;
    first_last_name?: string;
    employee_id?: string;
    avatar_url?: string;
  };
}

export default function ESSChangeRequestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all change requests with enhanced profile data
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["ess-change-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_data_change_requests")
        .select(`
          *,
          employee:profiles!employee_data_change_requests_employee_id_fkey(
            id, first_name, first_last_name, full_name, employee_id, avatar_url
          )
        `)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      return data as ChangeRequest[];
    },
  });

  // Filter requests based on status, type, and search query
  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    
    return requests.filter((request) => {
      // Status filter
      if (statusFilter !== "all" && request.status !== statusFilter) return false;
      
      // Type filter
      if (typeFilter !== "all" && request.request_type !== typeFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const employeeName = (request.employee?.full_name || 
          `${request.employee?.first_name || ''} ${request.employee?.first_last_name || ''}`).toLowerCase();
        const employeeId = (request.employee?.employee_id || '').toLowerCase();
        
        if (!employeeName.includes(query) && !employeeId.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [requests, statusFilter, typeFilter, searchQuery]);

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      const { data: request, error: fetchError } = await supabase
        .from("employee_data_change_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (fetchError) throw fetchError;

      const newValues = request.new_values as Record<string, any>;
      
      if (request.change_action === "create") {
        if (request.entity_table === "employee_contacts") {
          const payload = { ...newValues, employee_id: request.employee_id } as any;
          const { error } = await supabase.from("employee_contacts").insert([payload]);
          if (error) throw error;
        } else if (request.entity_table === "employee_addresses") {
          const payload = { ...newValues, employee_id: request.employee_id } as any;
          const { error } = await supabase.from("employee_addresses").insert([payload]);
          if (error) throw error;
        } else if (request.entity_table === "employee_emergency_contacts") {
          const payload = { ...newValues, employee_id: request.employee_id } as any;
          const { error } = await supabase.from("employee_emergency_contacts").insert([payload]);
          if (error) throw error;
        }
      } else if (request.change_action === "update" && request.entity_id) {
        if (request.entity_table === "employee_contacts") {
          const { error } = await supabase.from("employee_contacts").update(newValues as any).eq("id", request.entity_id);
          if (error) throw error;
        } else if (request.entity_table === "employee_addresses") {
          const { error } = await supabase.from("employee_addresses").update(newValues as any).eq("id", request.entity_id);
          if (error) throw error;
        } else if (request.entity_table === "employee_emergency_contacts") {
          const { error } = await supabase.from("employee_emergency_contacts").update(newValues as any).eq("id", request.entity_id);
          if (error) throw error;
        } else if (request.entity_table === "profiles") {
          const allowedFields = ["full_name", "first_name", "last_name"];
          const safeUpdate: Record<string, any> = {};
          for (const field of allowedFields) {
            if (newValues[field] !== undefined) {
              safeUpdate[field] = newValues[field];
            }
          }
          if (Object.keys(safeUpdate).length > 0) {
            const { error } = await supabase.from("profiles").update(safeUpdate).eq("id", request.entity_id);
            if (error) throw error;
          }
        }
      } else if (request.change_action === "delete" && request.entity_id) {
        if (request.entity_table === "employee_contacts") {
          const { error } = await supabase.from("employee_contacts").delete().eq("id", request.entity_id);
          if (error) throw error;
        } else if (request.entity_table === "employee_addresses") {
          const { error } = await supabase.from("employee_addresses").delete().eq("id", request.entity_id);
          if (error) throw error;
        } else if (request.entity_table === "employee_emergency_contacts") {
          const { error } = await supabase.from("employee_emergency_contacts").delete().eq("id", request.entity_id);
          if (error) throw error;
        }
      }

      const { error: updateError } = await supabase
        .from("employee_data_change_requests")
        .update({
          status: "applied",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          review_notes: notes,
          applied_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-change-requests"] });
      toast.success("Change request approved and applied");
      closeDialogs();
    },
    onError: (error) => {
      console.error("Approval error:", error);
      toast.error("Failed to approve change request");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      const { error } = await supabase
        .from("employee_data_change_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          review_notes: notes,
        })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ess-change-requests"] });
      toast.success("Change request rejected");
      closeDialogs();
    },
    onError: () => toast.error("Failed to reject change request"),
  });

  const closeDialogs = () => {
    setIsApproveDialogOpen(false);
    setIsRejectDialogOpen(false);
    setIsViewDialogOpen(false);
    setSelectedRequest(null);
    setReviewNotes("");
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      personal_contact: "Personal Contact",
      emergency_contact: "Emergency Contact",
      address: "Address",
      name_change: "Name Change",
      banking: "Banking Details",
      qualification: "Qualification",
      dependent: "Dependent",
      government_id: "Government ID",
      medical_info: "Medical Information",
      marital_status: "Marital Status",
    };
    return labels[type] || type;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: "Add",
      update: "Update",
      delete: "Delete",
    };
    return labels[action] || action;
  };

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        <Breadcrumbs
          items={[
            { label: "HR Hub", href: "/hr-hub" },
            { label: "ESS Change Requests" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Employee Change Requests</h1>
            <p className="text-muted-foreground">
              Review and approve employee self-service data change requests
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Metrics Cards */}
        <RequestMetricsCards requests={requests} />

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Change Requests
                  {pendingCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                      {pendingCount} pending
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Employees submit changes here for HR approval before updating master data
                </CardDescription>
              </div>
              
              {/* Filters */}
              <RequestFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No change requests found</p>
                {(statusFilter !== "all" || typeFilter !== "all" || searchQuery) && (
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <RequestTableRow
                      key={request.id}
                      request={request}
                      onView={() => {
                        setSelectedRequest(request);
                        setIsViewDialogOpen(true);
                      }}
                      onApprove={() => {
                        setSelectedRequest(request);
                        setIsApproveDialogOpen(true);
                      }}
                      onReject={() => {
                        setSelectedRequest(request);
                        setIsRejectDialogOpen(true);
                      }}
                      getRequestTypeLabel={getRequestTypeLabel}
                      getActionLabel={getActionLabel}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <RequestDetailsDialog
          request={selectedRequest}
          isOpen={isViewDialogOpen}
          onClose={closeDialogs}
          onApprove={() => {
            setIsViewDialogOpen(false);
            setIsApproveDialogOpen(true);
          }}
          onReject={() => {
            setIsViewDialogOpen(false);
            setIsRejectDialogOpen(true);
          }}
          getRequestTypeLabel={getRequestTypeLabel}
          getActionLabel={getActionLabel}
        />

        {/* Approve Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Change Request</DialogTitle>
              <DialogDescription>
                This will apply the requested changes to the employee's record.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedRequest && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium">
                    {getRequestTypeLabel(selectedRequest.request_type)} - {getActionLabel(selectedRequest.change_action)}
                  </p>
                  <p className="text-muted-foreground mt-1">
                    For: {selectedRequest.employee?.full_name || 'Unknown Employee'}
                  </p>
                </div>
              )}
              <div className="grid gap-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
              <Button
                onClick={() => {
                  if (selectedRequest) {
                    approveMutation.mutate({
                      requestId: selectedRequest.id,
                      notes: reviewNotes,
                    });
                  }
                }}
                disabled={approveMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve & Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Change Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  The employee will be notified that their change request was rejected.
                </AlertDescription>
              </Alert>
              <div className="grid gap-2">
                <Label>Rejection Reason *</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialogs}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedRequest) {
                    rejectMutation.mutate({
                      requestId: selectedRequest.id,
                      notes: reviewNotes,
                    });
                  }
                }}
                disabled={rejectMutation.isPending || !reviewNotes.trim()}
              >
                <X className="h-4 w-4 mr-2" />
                Reject Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

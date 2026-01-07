import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, Clock, User, FileText, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
}

export default function ESSChangeRequestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  // Fetch all change requests
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["ess-change-requests", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("employee_data_change_requests")
        .select(`
          *,
          employee:profiles!employee_data_change_requests_employee_id_fkey(
            id, first_name, last_name, employee_id
          )
        `)
        .order("requested_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      // First, get the full request details
      const { data: request, error: fetchError } = await supabase
        .from("employee_data_change_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (fetchError) throw fetchError;

      // Apply the change based on entity_table and change_action
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
          // Only allow updating specific whitelisted fields on profiles
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

      // Update the request status
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      applied: "default",
      rejected: "destructive",
      cancelled: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const renderValueComparison = (current: Record<string, any> | null, newValues: Record<string, any>) => {
    const allKeys = new Set([
      ...Object.keys(current || {}),
      ...Object.keys(newValues),
    ]);

    return (
      <div className="space-y-2">
        {Array.from(allKeys).map((key) => {
          const oldVal = current?.[key];
          const newVal = newValues[key];
          const hasChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

          if (key === "employee_id" || key === "id" || key === "created_at" || key === "updated_at") {
            return null;
          }

          return (
            <div key={key} className={`p-2 rounded ${hasChanged ? "bg-muted" : ""}`}>
              <span className="text-xs font-medium text-muted-foreground capitalize">
                {key.replace(/_/g, " ")}
              </span>
              <div className="flex items-center gap-2 mt-1">
                {current && oldVal !== undefined && (
                  <>
                    <span className="text-sm line-through text-muted-foreground">
                      {String(oldVal || "—")}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </>
                )}
                <span className={`text-sm ${hasChanged ? "font-medium text-primary" : ""}`}>
                  {String(newVal || "—")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto p-6">
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

        {pendingCount > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              You have <strong>{pendingCount}</strong> pending change request{pendingCount > 1 ? "s" : ""} awaiting review.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Change Requests
                </CardTitle>
                <CardDescription>
                  Employees submit changes here for HR approval before updating master data
                </CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : requests?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No change requests found</p>
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
                  {requests?.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {request.employee?.first_name} {request.employee?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {request.employee?.employee_id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRequestTypeLabel(request.request_type)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getActionLabel(request.change_action)}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.requested_at), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            View
                          </Button>
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsApproveDialogOpen(true);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsRejectDialogOpen(true);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={!!selectedRequest && !isApproveDialogOpen && !isRejectDialogOpen} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Change Request Details</DialogTitle>
              <DialogDescription>
                {selectedRequest && (
                  <>
                    {getRequestTypeLabel(selectedRequest.request_type)} — {getActionLabel(selectedRequest.change_action)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <span className="text-sm font-medium">Requested Changes</span>
                  <div className="mt-2 border rounded-lg p-3">
                    {renderValueComparison(
                      selectedRequest.current_values,
                      selectedRequest.new_values
                    )}
                  </div>
                </div>
                {selectedRequest.review_notes && (
                  <div>
                    <span className="text-sm font-medium">Review Notes</span>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedRequest.review_notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

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
                <div className="border rounded-lg p-3">
                  {renderValueComparison(
                    selectedRequest.current_values,
                    selectedRequest.new_values
                  )}
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

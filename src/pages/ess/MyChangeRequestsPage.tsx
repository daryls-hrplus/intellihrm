import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Clock, CheckCircle, XCircle, Loader2, Eye, FileIcon, ExternalLink, Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ChangeRequest {
  id: string;
  request_type: string;
  entity_table: string;
  change_action: string;
  current_values: Record<string, any> | null;
  new_values: Record<string, any>;
  status: string;
  review_notes: string | null;
  request_notes: string | null;
  document_urls: string[] | null;
  created_at: string;
  applied_at: string | null;
  reviewed_at: string | null;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  personal_contact: "Personal Contact",
  emergency_contact: "Emergency Contact",
  address: "Address",
  qualification: "Qualification",
  banking: "Banking Details",
  name_change: "Name Change",
  dependent: "Dependents",
  government_id: "Government IDs",
  medical_info: "Medical Information",
  marital_status: "Marital Status",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Add New",
  update: "Update",
  delete: "Remove",
};

export default function MyChangeRequestsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<ChangeRequest | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["my-change-requests", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_data_change_requests")
        .select("*")
        .eq("employee_id", profile?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ChangeRequest[];
    },
    enabled: !!profile?.id,
  });

  // Cancel request mutation
  const cancelMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("employee_data_change_requests")
        .update({ 
          status: "cancelled",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("employee_id", profile?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-change-requests", profile?.id] });
      toast.success("Request cancelled successfully");
      setRequestToCancel(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel request");
    },
  });

  const handleCancelRequest = (request: ChangeRequest) => {
    setRequestToCancel(request);
  };

  const confirmCancelRequest = () => {
    if (requestToCancel) {
      cancelMutation.mutate(requestToCancel.id);
    }
  };

  const pendingRequests = requests?.filter((r) => r.status === "pending" || r.status === "info_required") || [];
  const completedRequests = requests?.filter((r) => r.status === "applied" || r.status === "rejected" || r.status === "cancelled") || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "applied":
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "info_required":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-900/40 dark:text-amber-300">
            <Clock className="h-3 w-3 mr-1" />
            Info Required
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300">
            <Ban className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const renderRequestCard = (request: ChangeRequest) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {REQUEST_TYPE_LABELS[request.request_type] || request.request_type}
              </span>
              <Badge variant="secondary" className="text-xs">
                {ACTION_LABELS[request.change_action] || request.change_action}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Submitted {formatDateForDisplay(request.created_at, "MMM d, yyyy 'at' h:mm a")}
            </p>
            {request.document_urls && request.document_urls.length > 0 && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <FileIcon className="h-3 w-3" />
                {request.document_urls.length} document(s) attached
              </p>
            )}
            {request.status === "rejected" && request.review_notes && (
              <p className="text-sm text-destructive mt-2">
                Reason: {request.review_notes}
              </p>
            )}
            {request.status === "info_required" && request.review_notes && (
              <p className="text-sm text-amber-600 mt-2">
                Info needed: {request.review_notes}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(request.status)}
            <Button variant="ghost" size="icon" onClick={() => setSelectedRequest(request)}>
              <Eye className="h-4 w-4" />
            </Button>
            {(request.status === "pending" || request.status === "info_required") && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleCancelRequest(request)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Ban className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: "My Change Requests" },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8" />
            My Change Requests
          </h1>
          <p className="text-muted-foreground">
            View the status of your submitted data change requests
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No pending requests</h3>
                  <p className="text-muted-foreground">
                    You don't have any change requests waiting for approval
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(renderRequestCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No completed requests</h3>
                  <p className="text-muted-foreground">
                    Your processed requests will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedRequests.map(renderRequestCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest && (REQUEST_TYPE_LABELS[selectedRequest.request_type] || selectedRequest.request_type)}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && ACTION_LABELS[selectedRequest.change_action]} request details
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Submitted</span>
                  <p className="font-medium">
                    {formatDateForDisplay(selectedRequest.created_at, "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>

                {selectedRequest.change_action === "update" && selectedRequest.current_values && (
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Changes Requested</span>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedRequest.new_values).map(([key, newValue]) => {
                        const oldValue = selectedRequest.current_values?.[key];
                        if (formatValue(oldValue) === formatValue(newValue)) return null;
                        return (
                          <div key={key} className="grid grid-cols-3 gap-2 py-1 border-b last:border-0">
                            <span className="font-medium capitalize">{key.replace(/_/g, " ")}</span>
                            <span className="text-muted-foreground line-through">{formatValue(oldValue)}</span>
                            <span className="text-primary">{formatValue(newValue)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedRequest.change_action === "create" && (
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">New Record Details</span>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedRequest.new_values).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1 border-b last:border-0">
                          <span className="font-medium capitalize">{key.replace(/_/g, " ")}</span>
                          <span>{formatValue(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.request_notes && (
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Your Notes</span>
                    <p className="text-sm p-3 bg-muted rounded-md">{selectedRequest.request_notes}</p>
                  </div>
                )}

                {selectedRequest.document_urls && selectedRequest.document_urls.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Attached Documents</span>
                    <div className="space-y-2">
                      {selectedRequest.document_urls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <FileIcon className="h-4 w-4" />
                          <span className="text-sm flex-1 truncate">Document {index + 1}</span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.status === "rejected" && selectedRequest.review_notes && (
                  <div className="p-3 bg-destructive/10 rounded-md">
                    <span className="text-sm font-medium text-destructive">Rejection Reason</span>
                    <p className="text-sm mt-1">{selectedRequest.review_notes}</p>
                  </div>
                )}

                {selectedRequest.applied_at && (
                  <div>
                    <span className="text-sm text-muted-foreground">Approved On</span>
                    <p className="font-medium">
                      {formatDateForDisplay(selectedRequest.applied_at, "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!requestToCancel} onOpenChange={() => setRequestToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Change Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this{" "}
              <span className="font-medium">
                {requestToCancel && (REQUEST_TYPE_LABELS[requestToCancel.request_type] || requestToCancel.request_type)}
              </span>{" "}
              request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Ban className="h-4 w-4 mr-2" />
              )}
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

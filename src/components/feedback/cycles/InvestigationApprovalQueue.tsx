import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle, Eye, FileSearch } from "lucide-react";
import { InvestigationResponseViewer } from "./InvestigationResponseViewer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow, addDays } from "date-fns";

interface InvestigationRequest {
  id: string;
  cycle_id: string;
  target_employee_id: string | null;
  requested_by: string;
  request_type: string;
  request_reason: string;
  legal_reference: string | null;
  status: string;
  created_at: string;
  expires_at: string | null;
  access_count: number;
  target_employee?: {
    id: string;
    first_name: string | null;
  } | null;
  requester?: {
    id: string;
    first_name: string | null;
  } | null;
  review_cycle?: {
    id: string;
    name: string;
  } | null;
}

interface InvestigationApprovalQueueProps {
  companyId: string;
}

export function InvestigationApprovalQueue({ companyId }: InvestigationApprovalQueueProps) {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<InvestigationRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'deny' | null>(null);
  const [expirationDays, setExpirationDays] = useState(7);
  const [notes, setNotes] = useState("");
  const [viewResponsesRequest, setViewResponsesRequest] = useState<InvestigationRequest | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['investigation-requests-queue', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_investigation_requests')
        .select(`
          *,
          target_employee:profiles!feedback_investigation_requests_target_employee_id_fkey(id, first_name),
          requester:profiles!feedback_investigation_requests_requested_by_fkey(id, first_name),
          review_cycle:review_cycles(id, name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as InvestigationRequest[];
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      expiresAt, 
      denialReason 
    }: { 
      requestId: string; 
      status: 'approved' | 'denied'; 
      expiresAt?: string; 
      denialReason?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('feedback_investigation_requests')
        .update({
          status,
          approved_by: user.user.id,
          approved_at: new Date().toISOString(),
          expires_at: expiresAt,
          denial_reason: denialReason,
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'approved' 
          ? "Investigation request approved" 
          : "Investigation request denied"
      );
      queryClient.invalidateQueries({ queryKey: ['investigation-requests-queue'] });
      setSelectedRequest(null);
      setActionType(null);
      setNotes("");
    },
    onError: (error) => {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
    },
  });

  const handleApprove = () => {
    if (!selectedRequest) return;
    const expiresAt = addDays(new Date(), expirationDays).toISOString();
    updateRequestMutation.mutate({
      requestId: selectedRequest.id,
      status: 'approved',
      expiresAt,
    });
  };

  const handleDeny = () => {
    if (!selectedRequest || !notes) return;
    updateRequestMutation.mutate({
      requestId: selectedRequest.id,
      status: 'denied',
      denialReason: notes,
    });
  };

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const otherRequests = requests?.filter(r => r.status !== 'pending') || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-success">Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      harassment: 'Harassment Allegation',
      discrimination: 'Discrimination Claim',
      misconduct: 'Misconduct Investigation',
      policy_violation: 'Policy Violation',
      legal_hold: 'Legal Hold',
      other: 'Other',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center text-muted-foreground">
            Loading investigation requests...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <CardTitle className="text-lg">Pending Investigation Requests</CardTitle>
            </div>
            <CardDescription>
              Review and approve or deny requests to access individual 360 feedback responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No pending investigation requests</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {getTypeLabel(request.request_type)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {request.legal_reference || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType(null);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-success hover:bg-success/90"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType('approve');
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType('deny');
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Decisions */}
        {otherRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Decisions</CardTitle>
              <CardDescription>Previously reviewed investigation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Target Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Access Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherRequests.slice(0, 10).map((request) => {
                    const isApprovedAndValid = request.status === 'approved' && 
                      request.expires_at && new Date(request.expires_at) > new Date();
                    
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {getTypeLabel(request.request_type)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {request.target_employee?.first_name || 'Unknown'}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {request.expires_at 
                            ? format(new Date(request.expires_at), 'MMM d, yyyy')
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          {request.access_count}
                        </TableCell>
                        <TableCell className="text-right">
                          {isApprovedAndValid && request.target_employee_id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewResponsesRequest(request)}
                            >
                              <FileSearch className="h-4 w-4 mr-1" />
                              View Responses
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review/Action Dialog */}
      <Dialog 
        open={!!selectedRequest} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
            setActionType(null);
            setNotes("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' && <CheckCircle className="h-5 w-5 text-success" />}
              {actionType === 'deny' && <XCircle className="h-5 w-5 text-destructive" />}
              {!actionType && <Eye className="h-5 w-5" />}
              {actionType === 'approve' ? 'Approve Investigation Request' : 
               actionType === 'deny' ? 'Deny Investigation Request' : 
               'Review Investigation Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Grant access to individual 360 feedback responses'
                : actionType === 'deny'
                ? 'Deny access to individual responses'
                : 'Review the details of this investigation request'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Request Details */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">{getTypeLabel(selectedRequest.request_type)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="ml-2 font-medium">{selectedRequest.legal_reference || 'None'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="ml-2 font-medium">
                      {format(new Date(selectedRequest.created_at), 'PPpp')}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Justification:</span>
                  <p className="mt-1 text-sm p-3 rounded bg-background border">
                    {selectedRequest.request_reason}
                  </p>
                </div>
              </div>

              {actionType === 'approve' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiration">Access Duration</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="expiration"
                        type="number"
                        min={1}
                        max={30}
                        value={expirationDays}
                        onChange={(e) => setExpirationDays(parseInt(e.target.value) || 7)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Access expires: {format(addDays(new Date(), expirationDays), 'PPP')}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      By approving, you confirm this is a legitimate investigation and understand that 
                      all access will be logged and may be audited.
                    </p>
                  </div>
                </div>
              )}

              {actionType === 'deny' && (
                <div className="space-y-2">
                  <Label htmlFor="denial-reason">
                    Denial Reason <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="denial-reason"
                    placeholder="Explain why this request is being denied..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedRequest(null);
                setActionType(null);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            {!actionType && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setActionType('deny')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Deny
                </Button>
                <Button
                  className="bg-success hover:bg-success/90"
                  onClick={() => setActionType('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </>
            )}
            {actionType === 'approve' && (
              <Button
                className="bg-success hover:bg-success/90"
                onClick={handleApprove}
                disabled={updateRequestMutation.isPending}
              >
                {updateRequestMutation.isPending ? "Approving..." : "Confirm Approval"}
              </Button>
            )}
            {actionType === 'deny' && (
              <Button
                variant="destructive"
                onClick={handleDeny}
                disabled={!notes || updateRequestMutation.isPending}
              >
                {updateRequestMutation.isPending ? "Denying..." : "Confirm Denial"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Investigation Response Viewer */}
      {viewResponsesRequest && viewResponsesRequest.target_employee_id && (
        <InvestigationResponseViewer
          open={!!viewResponsesRequest}
          onOpenChange={(open) => !open && setViewResponsesRequest(null)}
          requestId={viewResponsesRequest.id}
          cycleId={viewResponsesRequest.cycle_id}
          targetEmployeeId={viewResponsesRequest.target_employee_id}
          targetEmployeeName={viewResponsesRequest.target_employee?.first_name || 'Unknown'}
        />
      )}
    </>
  );
}

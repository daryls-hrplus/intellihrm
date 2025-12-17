import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus, 
  Loader2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PenLine,
  Shield,
  AlertTriangle,
  History,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { formatDateForDisplay } from "@/utils/dateUtils";

// Helper to send email notifications
const sendHeadcountNotification = async (params: {
  requestId: string;
  action: "submitted" | "approved" | "rejected";
  positionTitle: string;
  currentHeadcount: number;
  requestedHeadcount: number;
  reason: string;
  reviewNotes?: string;
  requesterEmail: string;
  requesterName: string;
  reviewerName?: string;
  governanceBodyName?: string;
}) => {
  try {
    const { error } = await supabase.functions.invoke("send-headcount-notification", {
      body: params,
    });
    if (error) {
      console.error("Email notification error:", error);
    }
  } catch (err) {
    console.error("Failed to send email notification:", err);
  }
};

interface Position {
  id: string;
  title: string;
  code: string;
  authorized_headcount: number;
  department?: {
    id: string;
    name: string;
    company_id: string;
  };
}

interface HeadcountRequest {
  id: string;
  position_id: string;
  requested_by: string;
  current_headcount: number;
  requested_headcount: number;
  reason: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  governance_body_id: string | null;
  created_at: string;
  position?: Position;
  requester?: {
    full_name: string | null;
    email: string;
  };
  reviewer?: {
    full_name: string | null;
    email: string;
  } | null;
  governance_body?: {
    name: string;
    body_type: string;
  } | null;
}

interface Signature {
  id: string;
  headcount_request_id: string;
  signer_id: string;
  signature_type: string;
  signature_hash: string;
  notes: string | null;
  signed_at: string;
  signer?: {
    full_name: string | null;
    email: string;
  };
  governance_body?: {
    name: string;
  } | null;
}

interface GovernanceBody {
  id: string;
  name: string;
  body_type: string;
  can_approve_headcount: boolean;
}

interface StatusHistory {
  id: string;
  headcount_request_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
  changer?: {
    full_name: string | null;
    email: string;
  } | null;
}

interface HeadcountRequestWorkflowProps {
  companyId: string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-600" },
  approved: { label: "Approved", icon: CheckCircle, color: "text-green-600" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600" },
};

export function HeadcountRequestWorkflow({ companyId }: HeadcountRequestWorkflowProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HeadcountRequest[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [governanceBodies, setGovernanceBodies] = useState<GovernanceBody[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canApprove, setCanApprove] = useState(false);

  // Create request dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formPositionId, setFormPositionId] = useState("");
  const [formRequestedHeadcount, setFormRequestedHeadcount] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formGovernanceBodyId, setFormGovernanceBodyId] = useState("");

  // Review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HeadcountRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [reviewNotes, setReviewNotes] = useState("");
  const [signatureAcknowledged, setSignatureAcknowledged] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch departments for this company
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("id")
        .eq("company_id", companyId);

      if (deptError) throw deptError;
      const deptIds = (deptData || []).map(d => d.id);

      if (deptIds.length > 0) {
        // Fetch positions
        const { data: posData, error: posError } = await supabase
          .from("positions")
          .select(`
            id, title, code, authorized_headcount,
            department:departments(id, name, company_id)
          `)
          .in("department_id", deptIds)
          .eq("is_active", true);

        if (posError) throw posError;
        setPositions(posData || []);

        // Fetch headcount requests
        const posIds = (posData || []).map(p => p.id);
        if (posIds.length > 0) {
          const { data: reqData, error: reqError } = await supabase
            .from("headcount_requests")
            .select(`
              *,
              position:positions(id, title, code, authorized_headcount, department:departments(id, name, company_id)),
              requester:profiles!headcount_requests_requested_by_fkey(full_name, email),
              reviewer:profiles!headcount_requests_reviewed_by_fkey(full_name, email),
              governance_body:governance_bodies(name, body_type)
            `)
            .in("position_id", posIds)
            .order("created_at", { ascending: false });

          if (reqError) throw reqError;
          setRequests(reqData || []);

          // Fetch signatures for these requests
          const reqIds = (reqData || []).map(r => r.id);
          if (reqIds.length > 0) {
            const { data: sigData, error: sigError } = await supabase
              .from("headcount_request_signatures")
              .select(`
                *,
                signer:profiles(full_name, email),
                governance_body:governance_bodies(name)
              `)
              .in("headcount_request_id", reqIds)
              .order("signed_at", { ascending: false });

            if (sigError) throw sigError;
            setSignatures(sigData || []);

            // Fetch status history for these requests
            const { data: histData, error: histError } = await supabase
              .from("headcount_request_history")
              .select(`
                *,
                changer:profiles(full_name, email)
              `)
              .in("headcount_request_id", reqIds)
              .order("created_at", { ascending: true });

            if (histError) throw histError;
            setStatusHistory(histData || []);
          }
        }
      }

      // Fetch governance bodies with approval authority
      const { data: gbData, error: gbError } = await supabase
        .from("governance_bodies")
        .select("id, name, body_type, can_approve_headcount")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .eq("can_approve_headcount", true);

      if (gbError) throw gbError;
      setGovernanceBodies(gbData || []);

      // Check if current user can approve
      if (user) {
        const { data: memberData } = await supabase
          .from("governance_members")
          .select(`
            governance_body:governance_bodies(can_approve_headcount, company_id)
          `)
          .eq("employee_id", user.id)
          .eq("is_active", true);

        const hasApprovalAuth = (memberData || []).some(
          m => (m.governance_body as any)?.can_approve_headcount && (m.governance_body as any)?.company_id === companyId
        );
        setCanApprove(hasApprovalAuth);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load headcount requests");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return email[0].toUpperCase();
  };

  const generateSignatureHash = async (signerId: string, requestId: string, timestamp: string) => {
    const data = `${signerId}|${requestId}|${timestamp}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const openCreateDialog = () => {
    setFormPositionId("");
    setFormRequestedHeadcount("");
    setFormReason("");
    setFormGovernanceBodyId(governanceBodies.length > 0 ? governanceBodies[0].id : "");
    setCreateDialogOpen(true);
  };

  const handleCreateRequest = async () => {
    if (!formPositionId || !formRequestedHeadcount || !formReason.trim()) {
      toast.error("Position, requested headcount, and reason are required");
      return;
    }

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsProcessing(true);
    try {
      const selectedPosition = positions.find(p => p.id === formPositionId);
      if (!selectedPosition) throw new Error("Position not found");

      // Get user profile for email
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      const { data: requestData, error } = await supabase
        .from("headcount_requests")
        .insert({
          position_id: formPositionId,
          requested_by: user.id,
          current_headcount: selectedPosition.authorized_headcount,
          requested_headcount: parseInt(formRequestedHeadcount),
          reason: formReason.trim(),
          governance_body_id: formGovernanceBodyId || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Send email notification
      const governanceBody = governanceBodies.find(gb => gb.id === formGovernanceBodyId);
      sendHeadcountNotification({
        requestId: requestData.id,
        action: "submitted",
        positionTitle: selectedPosition.title,
        currentHeadcount: selectedPosition.authorized_headcount,
        requestedHeadcount: parseInt(formRequestedHeadcount),
        reason: formReason.trim(),
        requesterEmail: userProfile?.email || user.email || "",
        requesterName: userProfile?.full_name || userProfile?.email || "Unknown",
        governanceBodyName: governanceBody?.name,
      });

      toast.success("Headcount request submitted");
      setCreateDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Create error:", error);
      toast.error(error.message || "Failed to create request");
    } finally {
      setIsProcessing(false);
    }
  };

  const openReviewDialog = (request: HeadcountRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes("");
    setSignatureAcknowledged(false);
    setReviewDialogOpen(true);
  };

  const handleReview = async () => {
    if (!selectedRequest || !user || !signatureAcknowledged) {
      toast.error("Please acknowledge the digital signature");
      return;
    }

    setIsProcessing(true);
    try {
      const timestamp = new Date().toISOString();
      const signatureHash = await generateSignatureHash(user.id, selectedRequest.id, timestamp);

      // Get reviewer profile
      const { data: reviewerProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      // Create digital signature
      const { error: sigError } = await supabase
        .from("headcount_request_signatures")
        .insert({
          headcount_request_id: selectedRequest.id,
          signer_id: user.id,
          governance_body_id: selectedRequest.governance_body_id,
          signature_type: reviewAction === "approve" ? "approval" : "rejection",
          signature_hash: signatureHash,
          notes: reviewNotes.trim() || null,
          signed_at: timestamp,
        });

      if (sigError) throw sigError;

      // Update request status
      const newStatus = reviewAction === "approve" ? "approved" : "rejected";
      const { error: updateError } = await supabase
        .from("headcount_requests")
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: timestamp,
          review_notes: reviewNotes.trim() || null,
        })
        .eq("id", selectedRequest.id);

      if (updateError) throw updateError;

      // If approved, update the position's authorized headcount
      if (reviewAction === "approve") {
        const { error: posError } = await supabase
          .from("positions")
          .update({
            authorized_headcount: selectedRequest.requested_headcount,
          })
          .eq("id", selectedRequest.position_id);

        if (posError) throw posError;
      }

      // Send email notification
      sendHeadcountNotification({
        requestId: selectedRequest.id,
        action: reviewAction === "approve" ? "approved" : "rejected",
        positionTitle: selectedRequest.position?.title || "Unknown Position",
        currentHeadcount: selectedRequest.current_headcount,
        requestedHeadcount: selectedRequest.requested_headcount,
        reason: selectedRequest.reason,
        reviewNotes: reviewNotes.trim() || undefined,
        requesterEmail: selectedRequest.requester?.email || "",
        requesterName: selectedRequest.requester?.full_name || selectedRequest.requester?.email || "Unknown",
        reviewerName: reviewerProfile?.full_name || reviewerProfile?.email || "Reviewer",
        governanceBodyName: selectedRequest.governance_body?.name,
      });

      toast.success(`Request ${reviewAction === "approve" ? "approved" : "rejected"} with digital signature`);
      setReviewDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Review error:", error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsProcessing(false);
    }
  };

  const getSignaturesForRequest = (requestId: string) =>
    signatures.filter(s => s.headcount_request_id === requestId);

  const getHistoryForRequest = (requestId: string) =>
    statusHistory.filter(h => h.headcount_request_id === requestId);

  const pendingRequests = requests.filter(r => r.status === "pending");
  const processedRequests = requests.filter(r => r.status !== "pending");

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Headcount Change Requests
          </h3>
          <p className="text-sm text-muted-foreground">
            Submit and track requests to change position headcount
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {canApprove && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">You have approval authority for headcount requests</span>
        </div>
      )}

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="processed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Processed ({processedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending headcount requests
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  signatures={getSignaturesForRequest(request.id)}
                  history={getHistoryForRequest(request.id)}
                  canApprove={canApprove}
                  onApprove={() => openReviewDialog(request, "approve")}
                  onReject={() => openReviewDialog(request, "reject")}
                  getInitials={getInitials}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="processed">
          {processedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No processed requests yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {processedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  signatures={getSignaturesForRequest(request.id)}
                  history={getHistoryForRequest(request.id)}
                  canApprove={false}
                  getInitials={getInitials}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Request Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Headcount Request</DialogTitle>
            <DialogDescription>
              Request a change to position headcount for governance approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Position *</Label>
              <Select value={formPositionId} onValueChange={setFormPositionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.title} ({pos.department?.name}) - Current: {pos.authorized_headcount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Requested Headcount *</Label>
              <Input
                type="number"
                min="0"
                value={formRequestedHeadcount}
                onChange={(e) => setFormRequestedHeadcount(e.target.value)}
                placeholder="New authorized headcount"
              />
              {formPositionId && (
                <p className="text-xs text-muted-foreground">
                  Current: {positions.find(p => p.id === formPositionId)?.authorized_headcount || 0}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Submit To</Label>
              <Select value={formGovernanceBodyId} onValueChange={setFormGovernanceBodyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select governance body" />
                </SelectTrigger>
                <SelectContent>
                  {governanceBodies.map((gb) => (
                    <SelectItem key={gb.id} value={gb.id}>
                      {gb.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Business Justification *</Label>
              <Textarea
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder="Explain why this headcount change is needed..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog with Digital Signature */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === "approve" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {reviewAction === "approve" ? "Approve" : "Reject"} Request
            </DialogTitle>
            <DialogDescription>
              This action requires your digital signature
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="font-medium">{selectedRequest.position?.title}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span>Current: {selectedRequest.current_headcount}</span>
                  <span>→</span>
                  <span className="font-medium">Requested: {selectedRequest.requested_headcount}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedRequest.reason}</p>
              </div>

              <div className="space-y-2">
                <Label>Review Notes</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  rows={3}
                />
              </div>

              <div className="p-4 rounded-lg border-2 border-dashed space-y-3">
                <div className="flex items-center gap-2">
                  <PenLine className="h-5 w-5 text-primary" />
                  <span className="font-medium">Digital Signature</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  By checking the box below, you are applying your digital signature to this {reviewAction === "approve" ? "approval" : "rejection"}. 
                  This signature is legally binding and will be recorded with a cryptographic hash.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signatureAcknowledged}
                    onChange={(e) => setSignatureAcknowledged(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    I, {user?.email}, hereby {reviewAction === "approve" ? "approve" : "reject"} this headcount change request. 
                    I understand this action is recorded and cannot be undone.
                  </span>
                </label>
              </div>

              {!signatureAcknowledged && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Please acknowledge the digital signature to proceed</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={isProcessing || !signatureAcknowledged}
              variant={reviewAction === "approve" ? "default" : "destructive"}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <PenLine className="h-4 w-4 mr-2" />
              Sign & {reviewAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Request Card Component
interface RequestCardProps {
  request: HeadcountRequest;
  signatures: Signature[];
  history: StatusHistory[];
  canApprove: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  getInitials: (name: string | null, email: string) => string;
}

function RequestCard({ request, signatures, history, canApprove, onApprove, onReject, getInitials }: RequestCardProps) {
  const statusInfo = statusConfig[request.status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  const headcountChange = request.requested_headcount - request.current_headcount;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {request.position?.title}
              <Badge variant="outline">{request.position?.code}</Badge>
            </CardTitle>
            <CardDescription>
              {request.position?.department?.name}
            </CardDescription>
          </div>
          <Badge 
            variant={request.status === "approved" ? "default" : request.status === "rejected" ? "destructive" : "secondary"}
            className="flex items-center gap-1"
          >
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-lg font-semibold">{request.current_headcount}</p>
          </div>
          <div className="text-2xl text-muted-foreground">→</div>
          <div>
            <p className="text-xs text-muted-foreground">Requested</p>
            <p className="text-lg font-semibold">{request.requested_headcount}</p>
          </div>
          <Badge 
            variant={headcountChange > 0 ? "default" : "destructive"}
            className="ml-auto"
          >
            {headcountChange > 0 ? "+" : ""}{headcountChange}
          </Badge>
        </div>

        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm">{request.reason}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {getInitials(request.requester?.full_name || null, request.requester?.email || "")}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">
              Requested by {request.requester?.full_name || request.requester?.email}
            </span>
          </div>
          <span className="text-muted-foreground">
            {formatDateForDisplay(request.created_at, "MMM d, yyyy")}
          </span>
        </div>

        {request.governance_body && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Submitted to: {request.governance_body.name}
          </div>
        )}

        {/* Status History Timeline */}
        {history.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Status History
            </p>
            <div className="relative pl-4 space-y-3">
              {/* Timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
              
              {history.map((item, index) => {
                const itemStatusInfo = statusConfig[item.new_status] || statusConfig.pending;
                const ItemIcon = itemStatusInfo.icon;
                return (
                  <div key={item.id} className="relative flex gap-3">
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-[-12px] w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center",
                      item.new_status === "approved" ? "border-green-500" : 
                      item.new_status === "rejected" ? "border-red-500" : "border-amber-500"
                    )}>
                      <ItemIcon className={cn(
                        "h-2 w-2",
                        item.new_status === "approved" ? "text-green-500" : 
                        item.new_status === "rejected" ? "text-red-500" : "text-amber-500"
                      )} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant={item.new_status === "approved" ? "default" : item.new_status === "rejected" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {item.old_status ? `${item.old_status} → ${item.new_status}` : item.new_status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateForDisplay(item.created_at, "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      {item.changer && (
                        <p className="text-xs text-muted-foreground mt-1">
                          by {item.changer.full_name || item.changer.email}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Digital Signatures */}
        {signatures.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              Digital Signatures ({signatures.length})
            </p>
            <div className="space-y-2">
              {signatures.map((sig) => (
                <div 
                  key={sig.id} 
                  className={cn(
                    "p-2 rounded-lg text-sm flex items-center justify-between",
                    sig.signature_type === "approval" ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={sig.signature_type === "approval" ? "default" : "destructive"} className="text-xs">
                      {sig.signature_type}
                    </Badge>
                    <span>{sig.signer?.full_name || sig.signer?.email}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {sig.signature_hash.slice(0, 8)}...{sig.signature_hash.slice(-8)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Actions */}
        {canApprove && request.status === "pending" && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button size="sm" onClick={onApprove} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={onReject} className="flex-1">
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {/* Review Info */}
        {request.reviewer && (
          <div className="text-sm text-muted-foreground border-t pt-3">
            Reviewed by {request.reviewer.full_name || request.reviewer.email} on{" "}
            {request.reviewed_at && formatDateForDisplay(request.reviewed_at, "MMM d, yyyy 'at' h:mm a")}
            {request.review_notes && (
              <p className="mt-1 italic">"{request.review_notes}"</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

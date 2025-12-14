import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Briefcase,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkflow } from "@/hooks/useWorkflow";
import { format } from "date-fns";

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
  workflow_instance_id: string | null;
  created_at: string;
  position?: Position;
  workflow_instance?: {
    id: string;
    status: string;
  } | null;
}

interface JobRequisition {
  id: string;
  requisition_number: string;
  title: string;
  status: string;
  openings: number;
  created_at: string;
  headcount_request_id: string | null;
}

const statusConfig: Record<string, { label: string; icon: any; color: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending Approval", icon: Clock, color: "text-amber-600", variant: "secondary" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-600", variant: "secondary" },
  approved: { label: "Approved", icon: CheckCircle, color: "text-green-600", variant: "default" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600", variant: "destructive" },
  draft: { label: "Draft", icon: FileText, color: "text-muted-foreground", variant: "outline" },
};

export default function MssRecruitmentPage() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const { startWorkflow, isLoading: workflowLoading } = useWorkflow();
  const [requests, setRequests] = useState<HeadcountRequest[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create request dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formPositionId, setFormPositionId] = useState("");
  const [formRequestedHeadcount, setFormRequestedHeadcount] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formJustification, setFormJustification] = useState("");

  useEffect(() => {
    if (user && profile?.company_id) {
      fetchData();
    }
  }, [user, profile?.company_id]);

  const fetchData = async () => {
    if (!profile?.company_id) return;
    
    setIsLoading(true);
    try {
      // Fetch departments for this company
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("id")
        .eq("company_id", profile.company_id);

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

        // Fetch headcount requests for this user
        const { data: reqData, error: reqError } = await supabase
          .from("headcount_requests")
          .select(`
            *,
            position:positions(id, title, code, authorized_headcount, department:departments(id, name, company_id)),
            workflow_instance:workflow_instances(id, status)
          `)
          .eq("requested_by", user?.id)
          .order("created_at", { ascending: false });

        if (reqError) throw reqError;
        setRequests(reqData || []);

        // Fetch job requisitions created from approved headcount requests
        const approvedRequestIds = (reqData || [])
          .filter(r => r.status === "approved")
          .map(r => r.id);

        if (approvedRequestIds.length > 0) {
          const { data: reqsData, error: reqsError } = await supabase
            .from("job_requisitions")
            .select("id, requisition_number, title, status, openings, created_at, headcount_request_id")
            .in("headcount_request_id", approvedRequestIds);

          if (!reqsError) {
            setRequisitions(reqsData || []);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setFormPositionId("");
    setFormRequestedHeadcount("");
    setFormReason("");
    setFormJustification("");
    setCreateDialogOpen(true);
  };

  const handleCreateRequest = async () => {
    if (!formPositionId || !formRequestedHeadcount || !formReason.trim()) {
      toast.error("Position, requested headcount, and reason are required");
      return;
    }

    if (!user || !profile?.company_id) {
      toast.error("You must be logged in");
      return;
    }

    setIsProcessing(true);
    try {
      const selectedPosition = positions.find(p => p.id === formPositionId);
      if (!selectedPosition) throw new Error("Position not found");

      const requestedHeadcount = parseInt(formRequestedHeadcount);
      const headcountChange = requestedHeadcount - selectedPosition.authorized_headcount;

      // Create the headcount request
      const { data: requestData, error } = await supabase
        .from("headcount_requests")
        .insert({
          position_id: formPositionId,
          requested_by: user.id,
          current_headcount: selectedPosition.authorized_headcount,
          requested_headcount: requestedHeadcount,
          reason: formReason.trim(),
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Start the workflow for approval
      const workflowInstance = await startWorkflow(
        "headcount_request",
        "headcount_requests",
        requestData.id,
        {
          position_id: formPositionId,
          position_title: selectedPosition.title,
          department_name: selectedPosition.department?.name,
          current_headcount: selectedPosition.authorized_headcount,
          requested_headcount: requestedHeadcount,
          headcount_change: headcountChange,
          reason: formReason.trim(),
          justification: formJustification.trim(),
          requester_name: profile.full_name || profile.email,
        }
      );

      // Update headcount request with workflow instance ID
      if (workflowInstance) {
        await supabase
          .from("headcount_requests")
          .update({ workflow_instance_id: workflowInstance.id })
          .eq("id", requestData.id);
      }

      toast.success("Headcount request submitted for approval");
      setCreateDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Create error:", error);
      toast.error(error.message || "Failed to create request");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (request: HeadcountRequest) => {
    // Check workflow status if available
    const workflowStatus = request.workflow_instance?.status;
    const status = workflowStatus || request.status;
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRequisitionForRequest = (requestId: string) => {
    return requisitions.find(r => r.headcount_request_id === requestId);
  };

  const pendingRequests = requests.filter(r => 
    r.status === "pending" || 
    (r.workflow_instance?.status && !["approved", "rejected", "cancelled"].includes(r.workflow_instance.status))
  );
  const processedRequests = requests.filter(r => 
    r.status !== "pending" && 
    (!r.workflow_instance?.status || ["approved", "rejected", "cancelled"].includes(r.workflow_instance.status))
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('navigation.mss'), href: "/mss" },
            { label: t('mss.recruitment.title') },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('mss.recruitment.title')}</h1>
            <p className="text-muted-foreground">
              {t('mss.recruitment.subtitle')}
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t('mss.recruitment.newHeadcountRequest')}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('mss.recruitment.pendingApproval')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('mss.recruitment.approved')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === "approved").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('mss.recruitment.rejected')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {requests.filter(r => r.status === "rejected").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('mss.recruitment.jobRequisitionsCreated')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {requisitions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="processed">
              Processed ({processedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="requisitions">
              Job Requisitions ({requisitions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pending Headcount Requests</CardTitle>
                <CardDescription>
                  Requests awaiting approval through the workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending requests
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((request) => {
                        const change = request.requested_headcount - request.current_headcount;
                        return (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              {request.position?.title || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {request.position?.department?.name || "-"}
                            </TableCell>
                            <TableCell>{request.current_headcount}</TableCell>
                            <TableCell>{request.requested_headcount}</TableCell>
                            <TableCell>
                              <Badge variant={change > 0 ? "default" : "destructive"}>
                                {change > 0 ? `+${change}` : change}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(request)}</TableCell>
                            <TableCell>
                              {format(new Date(request.created_at), "MMM d, yyyy")}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processed">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Processed Requests</CardTitle>
                <CardDescription>
                  Approved and rejected headcount requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {processedRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No processed requests
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Processed</TableHead>
                        <TableHead>Job Requisition</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedRequests.map((request) => {
                        const change = request.requested_headcount - request.current_headcount;
                        const requisition = getRequisitionForRequest(request.id);
                        return (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              {request.position?.title || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {request.position?.department?.name || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={change > 0 ? "default" : "destructive"}>
                                {change > 0 ? `+${change}` : change}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(request)}</TableCell>
                            <TableCell>
                              {request.reviewed_at 
                                ? format(new Date(request.reviewed_at), "MMM d, yyyy")
                                : "-"
                              }
                            </TableCell>
                            <TableCell>
                              {requisition ? (
                                <Badge variant="outline" className="gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {requisition.requisition_number}
                                </Badge>
                              ) : request.status === "approved" ? (
                                <span className="text-muted-foreground text-sm">
                                  Pending creation
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requisitions">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job Requisitions</CardTitle>
                <CardDescription>
                  Job requisitions created from approved headcount requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requisitions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No job requisitions created yet
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requisition #</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Openings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requisitions.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">
                            {req.requisition_number}
                          </TableCell>
                          <TableCell>{req.title}</TableCell>
                          <TableCell>{req.openings}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{req.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(req.created_at), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Request Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Headcount Request</DialogTitle>
              <DialogDescription>
                Request additional headcount for a position. This will be routed through the approval workflow.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select value={formPositionId} onValueChange={setFormPositionId}>
                  <SelectTrigger id="position">
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

              {formPositionId && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Headcount:</span>
                      <span className="ml-2 font-medium">
                        {positions.find(p => p.id === formPositionId)?.authorized_headcount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="requestedHeadcount">Requested Headcount *</Label>
                <Input
                  id="requestedHeadcount"
                  type="number"
                  min="0"
                  value={formRequestedHeadcount}
                  onChange={(e) => setFormRequestedHeadcount(e.target.value)}
                  placeholder="Enter new total headcount"
                />
                {formPositionId && formRequestedHeadcount && (
                  <p className="text-sm text-muted-foreground">
                    Net change:{" "}
                    <span className={
                      parseInt(formRequestedHeadcount) - (positions.find(p => p.id === formPositionId)?.authorized_headcount || 0) > 0
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }>
                      {parseInt(formRequestedHeadcount) - (positions.find(p => p.id === formPositionId)?.authorized_headcount || 0) > 0 ? "+" : ""}
                      {parseInt(formRequestedHeadcount) - (positions.find(p => p.id === formPositionId)?.authorized_headcount || 0)}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Business Reason *</Label>
                <Textarea
                  id="reason"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Explain the business need for this headcount change"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Additional Justification</Label>
                <Textarea
                  id="justification"
                  value={formJustification}
                  onChange={(e) => setFormJustification(e.target.value)}
                  placeholder="Any additional details to support your request (budget impact, timeline, etc.)"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRequest} 
                disabled={isProcessing || workflowLoading}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

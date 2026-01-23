import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Check, X, RotateCcw, History, BookOpen, Award, ClipboardList, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface TrainingRequestsTabProps {
  companyId: string;
}

interface TrainingRequest {
  id: string;
  request_number: string;
  request_type: string;
  training_name: string;
  provider_name: string | null;
  start_date: string | null;
  end_date: string | null;
  estimated_cost: number | null;
  currency: string;
  status: string;
  business_justification: string | null;
  employee: { full_name: string } | null;
  created_at: string;
  source_type: string | null;
  source_module: string | null;
  source_reference_id: string | null;
  current_approval_level: number | null;
  max_approval_levels: number | null;
}

interface ApprovalHistory {
  id: string;
  approval_level: number;
  action: string;
  comments: string | null;
  created_at: string;
  approver: { full_name: string } | null;
}

export function TrainingRequestsTab({ companyId }: TrainingRequestsTabProps) {
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [formData, setFormData] = useState({
    employee_id: "",
    request_type: "external",
    training_name: "",
    provider_name: "",
    start_date: "",
    end_date: "",
    estimated_cost: "",
    currency: "USD",
    location: "",
    business_justification: "",
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    const client = supabase as any;
    
    const [requestsRes, employeesRes] = await Promise.all([
      client
        .from("training_requests")
        .select("*, employee:profiles!training_requests_employee_id_fkey(full_name)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
      client
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", companyId)
        .eq("is_active", true),
    ]);

    if (requestsRes.data) setRequests(requestsRes.data as TrainingRequest[]);
    if (employeesRes.data) setEmployees(employeesRes.data);
    setLoading(false);
  };

  const loadApprovalHistory = async (requestId: string) => {
    const client = supabase as any;
    const { data } = await client
      .from("training_request_approvals")
      .select("*, approver:profiles!training_request_approvals_approver_id_fkey(full_name)")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });
    
    if (data) setApprovalHistory(data as ApprovalHistory[]);
  };

  const handleViewHistory = async (request: TrainingRequest) => {
    setSelectedRequest(request);
    await loadApprovalHistory(request.id);
    setHistoryDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.training_name) {
      toast.error("Employee and training name are required");
      return;
    }

    const { error } = await supabase.from("training_requests").insert({
      company_id: companyId,
      employee_id: formData.employee_id,
      request_type: formData.request_type,
      training_name: formData.training_name,
      provider_name: formData.provider_name || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      currency: formData.currency,
      location: formData.location || null,
      business_justification: formData.business_justification || null,
      source_type: "manual",
      source_module: "Training Requests",
    });

    if (error) {
      toast.error("Failed to create request");
    } else {
      toast.success("Training request created");
      setDialogOpen(false);
      resetForm();
      loadData();
    }
  };

  const handleStatusChange = async (id: string, action: string, comments?: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    const currentLevel = request.current_approval_level || 1;
    const maxLevels = request.max_approval_levels || 1;
    
    let newStatus = request.status;
    let newLevel = currentLevel;

    if (action === "approved") {
      if (currentLevel >= maxLevels) {
        newStatus = "approved";
      } else {
        newLevel = currentLevel + 1;
        newStatus = `pending_level_${newLevel}`;
      }
    } else if (action === "rejected") {
      newStatus = "rejected";
    } else if (action === "returned") {
      newStatus = "returned";
      newLevel = 1;
    }

    // Update request status
    const { error: updateError } = await supabase
      .from("training_requests")
      .update({ 
        status: newStatus, 
        current_approval_level: newLevel,
        approved_at: newStatus === "approved" ? new Date().toISOString() : null 
      })
      .eq("id", id);

    if (updateError) {
      toast.error("Failed to update status");
      return;
    }

    // Record approval action
    const { error: historyError } = await supabase
      .from("training_request_approvals")
      .insert({
        request_id: id,
        approval_level: currentLevel,
        action: action,
        comments: comments || null,
      });

    if (historyError) {
      console.error("Failed to record approval history:", historyError);
    }

    toast.success(`Request ${action}`);
    loadData();
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      request_type: "external",
      training_name: "",
      provider_name: "",
      start_date: "",
      end_date: "",
      estimated_cost: "",
      currency: "USD",
      location: "",
      business_justification: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      pending_level_1: "secondary",
      pending_level_2: "secondary",
      pending_level_3: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "outline",
      returned: "outline",
    };
    const labels: Record<string, string> = {
      pending_level_1: "Pending L1",
      pending_level_2: "Pending L2",
      pending_level_3: "Pending L3",
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const getSourceBadge = (sourceType: string | null, sourceModule: string | null) => {
    if (!sourceType || sourceType === "manual") return null;
    
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: typeof BookOpen }> = {
      onboarding: { label: "Onboarding", variant: "secondary", icon: ClipboardList },
      appraisal: { label: "Appraisal", variant: "default", icon: Award },
      recertification: { label: "Recertification", variant: "outline", icon: GraduationCap },
      competency_gap: { label: "Gap Analysis", variant: "secondary", icon: BookOpen },
    };
    
    const sourceConfig = config[sourceType] || { label: sourceModule || sourceType, variant: "outline", icon: BookOpen };
    const Icon = sourceConfig.icon;
    
    return (
      <Badge variant={sourceConfig.variant} className="text-xs flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {sourceConfig.label}
      </Badge>
    );
  };

  const getApprovalProgress = (request: TrainingRequest) => {
    const current = request.current_approval_level || 1;
    const max = request.max_approval_levels || 1;
    
    if (max <= 1) return null;
    if (request.status === "approved" || request.status === "rejected") return null;
    
    return (
      <span className="text-xs text-muted-foreground">
        Level {current}/{max}
      </span>
    );
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Training Requests</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Request</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Training Request</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee *</Label>
                  <Select value={formData.employee_id} onValueChange={(v) => setFormData({ ...formData, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Request Type</Label>
                  <Select value={formData.request_type} onValueChange={(v) => setFormData({ ...formData, request_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="external">External Training</SelectItem>
                      <SelectItem value="internal">Internal Training</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Training Name *</Label>
                  <Input value={formData.training_name} onChange={(e) => setFormData({ ...formData, training_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Input value={formData.provider_name} onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Cost</Label>
                  <Input type="number" value={formData.estimated_cost} onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Business Justification</Label>
                  <Textarea value={formData.business_justification} onChange={(e) => setFormData({ ...formData, business_justification: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Create Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request #</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Training</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-sm">{req.request_number}</TableCell>
                  <TableCell>{req.employee?.full_name}</TableCell>
                  <TableCell>{req.training_name}</TableCell>
                  <TableCell>
                    {getSourceBadge(req.source_type, req.source_module)}
                  </TableCell>
                  <TableCell className="capitalize">{req.request_type}</TableCell>
                  <TableCell>
                    {req.start_date && formatDateForDisplay(req.start_date, "MMM d, yyyy")}
                    {req.end_date && ` - ${formatDateForDisplay(req.end_date, "MMM d, yyyy")}`}
                  </TableCell>
                  <TableCell>{req.estimated_cost ? `${req.currency} ${req.estimated_cost.toLocaleString()}` : "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(req.status)}
                      {getApprovalProgress(req)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(req.status === "pending" || req.status.startsWith("pending_level")) && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(req.id, "approved")} title="Approve">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(req.id, "rejected")} title="Reject">
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(req.id, "returned")} title="Return for Revision">
                            <RotateCcw className="h-4 w-4 text-amber-600" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleViewHistory(req)} title="View History">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">No training requests found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Approval History</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedRequest.training_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.employee?.full_name} • {selectedRequest.request_number}
                </p>
                {selectedRequest.source_type && selectedRequest.source_type !== "manual" && (
                  <div className="mt-2">
                    {getSourceBadge(selectedRequest.source_type, selectedRequest.source_module)}
                  </div>
                )}
              </div>
              
              {approvalHistory.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {approvalHistory.map((history, index) => (
                    <AccordionItem key={history.id} value={history.id}>
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            history.action === "approved" ? "default" :
                            history.action === "rejected" ? "destructive" : "outline"
                          }>
                            {history.action}
                          </Badge>
                          <span>Level {history.approval_level}</span>
                          <span className="text-muted-foreground">
                            {formatDateForDisplay(history.created_at, "MMM d, yyyy HH:mm")}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Approver:</span> {history.approver?.full_name || "System"}</p>
                          {history.comments && (
                            <p><span className="text-muted-foreground">Comments:</span> {history.comments}</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-muted-foreground py-4">No approval history yet</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

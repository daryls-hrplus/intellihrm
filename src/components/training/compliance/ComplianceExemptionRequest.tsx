import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, CheckCircle, XCircle, Clock, ShieldOff, Upload } from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface Assignment {
  id: string;
  due_date: string;
  status: string;
  exemption_status: string | null;
  exemption_type: string | null;
  exemption_reason: string | null;
  exemption_start_date: string | null;
  exemption_end_date: string | null;
  exemption_approved_by: string | null;
  exemption_approved_at: string | null;
  compliance: { name: string } | null;
  employee: { id: string; full_name: string } | null;
  approver?: { full_name: string } | null;
}

interface ComplianceExemptionRequestProps {
  companyId: string;
  isApprover?: boolean;
}

const EXEMPTION_TYPES = [
  { value: "medical", label: "Medical Leave", description: "Employee on medical leave" },
  { value: "maternity", label: "Maternity/Paternity", description: "Parental leave exemption" },
  { value: "role_change", label: "Role Change", description: "No longer applicable to new role" },
  { value: "prior_learning", label: "Prior Learning", description: "Already certified externally" },
  { value: "pending_separation", label: "Pending Separation", description: "Employee leaving organization" },
  { value: "other", label: "Other", description: "Other valid reason" },
];

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { variant: "secondary", icon: Clock },
  approved: { variant: "default", icon: CheckCircle },
  rejected: { variant: "destructive", icon: XCircle },
  none: { variant: "outline", icon: ShieldOff },
};

export function ComplianceExemptionRequest({ companyId, isApprover = false }: ComplianceExemptionRequestProps) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [activeTab, setActiveTab] = useState(isApprover ? "pending" : "my-requests");

  const [formData, setFormData] = useState({
    exemption_type: "",
    exemption_reason: "",
    exemption_start_date: "",
    exemption_end_date: "",
  });

  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId, user]);

  const loadData = async () => {
    setLoading(true);

    // Load user's assignments with exemption data
    if (user) {
      const { data: userAssignments } = await supabase
        .from("compliance_training_assignments")
        .select(`
          id, due_date, status, exemption_status, exemption_type, exemption_reason,
          exemption_start_date, exemption_end_date, exemption_approved_by, exemption_approved_at,
          compliance:compliance_training(name),
          employee:profiles!compliance_training_assignments_employee_id_fkey(id, full_name)
        `)
        .eq("employee_id", user.id)
        .order("due_date");

      if (userAssignments) setAssignments(userAssignments);
    }

    // Load pending requests for approvers
    if (isApprover) {
      const { data: pending } = await supabase
        .from("compliance_training_assignments")
        .select(`
          id, due_date, status, exemption_status, exemption_type, exemption_reason,
          exemption_start_date, exemption_end_date, exemption_approved_by, exemption_approved_at,
          compliance:compliance_training(name),
          employee:profiles!compliance_training_assignments_employee_id_fkey(id, full_name)
        `)
        .eq("exemption_status", "pending")
        .order("created_at");

      if (pending) setPendingRequests(pending);
    }

    setLoading(false);
  };

  const openRequestDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      exemption_type: "",
      exemption_reason: "",
      exemption_start_date: "",
      exemption_end_date: "",
    });
    setDialogOpen(true);
  };

  const submitExemptionRequest = async () => {
    if (!selectedAssignment || !formData.exemption_type || !formData.exemption_reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { error } = await supabase
      .from("compliance_training_assignments")
      .update({
        exemption_status: "pending",
        exemption_type: formData.exemption_type,
        exemption_reason: formData.exemption_reason,
        exemption_start_date: formData.exemption_start_date || null,
        exemption_end_date: formData.exemption_end_date || null,
      })
      .eq("id", selectedAssignment.id);

    if (error) {
      toast.error("Failed to submit exemption request");
    } else {
      toast.success("Exemption request submitted for review");
      setDialogOpen(false);
      loadData();
    }
  };

  const openReviewDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setReviewNotes("");
    setReviewDialogOpen(true);
  };

  const processExemptionReview = async (approved: boolean) => {
    if (!selectedAssignment || !user) return;

    const { error } = await supabase
      .from("compliance_training_assignments")
      .update({
        exemption_status: approved ? "approved" : "rejected",
        exemption_approved_by: user.id,
        exemption_approved_at: new Date().toISOString(),
        status: approved ? "exempted" : selectedAssignment.status,
      })
      .eq("id", selectedAssignment.id);

    if (error) {
      toast.error("Failed to process exemption");
    } else {
      toast.success(`Exemption ${approved ? "approved" : "rejected"}`);
      setReviewDialogOpen(false);
      loadData();
    }
  };

  const getStatusBadge = (status: string | null) => {
    const config = STATUS_CONFIG[status || "none"];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "None"}
      </Badge>
    );
  };

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading exemption data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5" />
            Compliance Exemptions
          </CardTitle>
          <CardDescription>
            Request or manage exemptions from compliance training requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {!isApprover && (
                <TabsTrigger value="my-requests">My Requests</TabsTrigger>
              )}
              {isApprover && (
                <>
                  <TabsTrigger value="pending">
                    Pending Review
                    {pendingRequests.length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {pendingRequests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="all">All Exemptions</TabsTrigger>
                </>
              )}
            </TabsList>

            {!isApprover && (
              <TabsContent value="my-requests" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Training</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Exemption Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.compliance?.name}</TableCell>
                        <TableCell>{formatDateForDisplay(a.due_date, "MMM d, yyyy")}</TableCell>
                        <TableCell>{getStatusBadge(a.exemption_status)}</TableCell>
                        <TableCell>
                          {a.exemption_type
                            ? EXEMPTION_TYPES.find((t) => t.value === a.exemption_type)?.label || a.exemption_type
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {(!a.exemption_status || a.exemption_status === "none" || a.exemption_status === "rejected") && (
                            <Button size="sm" variant="outline" onClick={() => openRequestDialog(a)}>
                              <Plus className="h-4 w-4 mr-1" />
                              Request
                            </Button>
                          )}
                          {a.exemption_status === "pending" && (
                            <span className="text-sm text-muted-foreground">Pending review</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {assignments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No compliance assignments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            )}

            {isApprover && (
              <>
                <TabsContent value="pending" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Training</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.employee?.full_name}</TableCell>
                          <TableCell>{a.compliance?.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {EXEMPTION_TYPES.find((t) => t.value === a.exemption_type)?.label || a.exemption_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{a.exemption_reason}</TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => openReviewDialog(a)}>
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {pendingRequests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No pending exemption requests
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="all" className="mt-4">
                  <p className="text-muted-foreground text-center py-8">
                    All exemptions view - coming soon
                  </p>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Request Exemption Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Exemption</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{selectedAssignment?.compliance?.name}</p>
              <p className="text-sm text-muted-foreground">
                Due: {selectedAssignment?.due_date && formatDateForDisplay(selectedAssignment.due_date, "MMM d, yyyy")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Exemption Type *</Label>
              <Select
                value={formData.exemption_type}
                onValueChange={(v) => setFormData({ ...formData, exemption_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exemption type" />
                </SelectTrigger>
                <SelectContent>
                  {EXEMPTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <p>{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                value={formData.exemption_reason}
                onChange={(e) => setFormData({ ...formData, exemption_reason: e.target.value })}
                placeholder="Explain why you are requesting this exemption..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date (if temporary)</Label>
                <Input
                  type="date"
                  value={formData.exemption_start_date}
                  onChange={(e) => setFormData({ ...formData, exemption_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date (if temporary)</Label>
                <Input
                  type="date"
                  value={formData.exemption_end_date}
                  onChange={(e) => setFormData({ ...formData, exemption_end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <FileText className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Supporting documentation may be requested during the review process.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitExemptionRequest}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Exemption Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Exemption Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Employee</Label>
                <p className="font-medium">{selectedAssignment?.employee?.full_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Training</Label>
                <p className="font-medium">{selectedAssignment?.compliance?.name}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Exemption Type</Label>
              <Badge className="mt-1">
                {EXEMPTION_TYPES.find((t) => t.value === selectedAssignment?.exemption_type)?.label}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">Reason Provided</Label>
              <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedAssignment?.exemption_reason}</p>
            </div>
            {selectedAssignment?.exemption_start_date && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Exemption Period</Label>
                  <p>
                    {formatDateForDisplay(selectedAssignment.exemption_start_date, "MMM d, yyyy")}
                    {selectedAssignment.exemption_end_date &&
                      ` - ${formatDateForDisplay(selectedAssignment.exemption_end_date, "MMM d, yyyy")}`}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Review Notes (optional)</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about your decision..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => processExemptionReview(false)}>
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button onClick={() => processExemptionReview(true)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

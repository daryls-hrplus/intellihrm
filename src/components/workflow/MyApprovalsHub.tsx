import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, Eye, Clock, AlertTriangle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface PendingApproval {
  id: string;
  instanceId: string;
  templateName: string;
  category: string;
  requestedBy: string;
  requestedAt: string;
  stepName: string;
  deadline?: string;
  isOverdue: boolean;
  referenceType?: string;
  referenceId?: string;
}

export function MyApprovalsHub() {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [selectedApprovals, setSelectedApprovals] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject">("approve");
  const [bulkComment, setBulkComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (user?.id) {
      fetchApprovals();
    }
  }, [user?.id, categoryFilter]);

  const fetchApprovals = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      let query = (supabase as any)
        .from("workflow_instance_approvals")
        .select(`
          id,
          workflow_instance_id,
          step_id,
          status,
          created_at,
          due_at,
          workflow_instances!inner(
            id,
            category,
            reference_type,
            reference_id,
            initiated_at,
            initiated_by,
            current_step_deadline_at,
            workflow_templates(name),
            profiles!workflow_instances_initiated_by_fkey(full_name)
          ),
          workflow_steps(name)
        `)
        .eq("approver_id", user.id)
        .eq("status", "pending") as any;

      if (categoryFilter !== "all") {
        query = query.eq("workflow_instances.category", categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const approvals: PendingApproval[] = (data || []).map(item => {
        const instance = item.workflow_instances as any;
        const deadline = item.due_at || instance?.current_step_deadline_at;
        const isOverdue = deadline ? new Date(deadline) < new Date() : false;

        return {
          id: item.id,
          instanceId: item.workflow_instance_id,
          templateName: instance?.workflow_templates?.name || "Unknown",
          category: instance?.category || "general",
          requestedBy: instance?.profiles?.full_name || "Unknown",
          requestedAt: instance?.initiated_at || item.created_at,
          stepName: (item.workflow_steps as any)?.name || "Approval",
          deadline,
          isOverdue,
          referenceType: instance?.reference_type,
          referenceId: instance?.reference_id,
        };
      });

      setPendingApprovals(approvals);
    } catch (error) {
      console.error("Failed to fetch approvals:", error);
      toast.error("Failed to load pending approvals");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedApprovals);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedApprovals(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedApprovals.size === pendingApprovals.length) {
      setSelectedApprovals(new Set());
    } else {
      setSelectedApprovals(new Set(pendingApprovals.map(a => a.id)));
    }
  };

  const handleBulkAction = async () => {
    if (selectedApprovals.size === 0) return;
    setIsProcessing(true);

    try {
      const approvalIds = Array.from(selectedApprovals);
      
      // Update each approval
      for (const approvalId of approvalIds) {
        const { error } = await (supabase as any)
          .from("workflow_instance_approvals")
          .update({
            status: bulkAction === "approve" ? "approved" : "rejected",
            action: bulkAction,
            comment: bulkComment || null,
            acted_at: new Date().toISOString(),
          })
          .eq("id", approvalId);

        if (error) throw error;
      }

      toast.success(`Successfully ${bulkAction}d ${approvalIds.length} items`);
      setShowBulkDialog(false);
      setBulkComment("");
      setSelectedApprovals(new Set());
      fetchApprovals();
    } catch (error) {
      console.error("Bulk action failed:", error);
      toast.error("Failed to process bulk action");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSingleAction = async (approvalId: string, action: "approve" | "reject") => {
    try {
      const { error } = await (supabase as any)
        .from("workflow_instance_approvals")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          action,
          acted_at: new Date().toISOString(),
        })
        .eq("id", approvalId);

      if (error) throw error;

      toast.success(`Successfully ${action}d`);
      fetchApprovals();
    } catch (error) {
      toast.error(`Failed to ${action}`);
    }
  };

  const overdueCount = pendingApprovals.filter(a => a.isOverdue).length;
  const categories = [...new Set(pendingApprovals.map(a => a.category))];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your action</p>
          </CardContent>
        </Card>

        <Card className={overdueCount > 0 ? "border-red-200 bg-red-50/50 dark:bg-red-950/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${overdueCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueCount > 0 ? "text-red-600" : ""}`}>{overdueCount}</div>
            <p className="text-xs text-muted-foreground">Past deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedApprovals.size}</div>
            <p className="text-xs text-muted-foreground">Ready for bulk action</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={fetchApprovals}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {selectedApprovals.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => {
                setBulkAction("approve");
                setShowBulkDialog(true);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve ({selectedApprovals.size})
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setBulkAction("reject");
                setShowBulkDialog(true);
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject ({selectedApprovals.size})
            </Button>
          </div>
        )}
      </div>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Items awaiting your review and approval</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium">All caught up!</h3>
              <p className="text-muted-foreground">No pending approvals at this time.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedApprovals.size === pendingApprovals.length && pendingApprovals.length > 0}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Waiting Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map(approval => (
                  <TableRow key={approval.id} className={approval.isOverdue ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedApprovals.has(approval.id)}
                        onCheckedChange={() => toggleSelection(approval.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{approval.templateName}</div>
                      {approval.referenceType && (
                        <div className="text-xs text-muted-foreground">
                          {approval.referenceType}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{approval.category}</Badge>
                    </TableCell>
                    <TableCell>{approval.requestedBy}</TableCell>
                    <TableCell>{approval.stepName}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(approval.requestedAt), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell>
                      {approval.isOverdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSingleAction(approval.id, "approve")}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSingleAction(approval.id, "reject")}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
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

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "approve" ? "Bulk Approve" : "Bulk Reject"} {selectedApprovals.size} Items
            </DialogTitle>
            <DialogDescription>
              This action will {bulkAction} all selected items at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comment (optional)</label>
              <Textarea
                value={bulkComment}
                onChange={e => setBulkComment(e.target.value)}
                placeholder={`Add a comment for this bulk ${bulkAction}...`}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={isProcessing}
              variant={bulkAction === "reject" ? "destructive" : "default"}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {bulkAction === "approve" ? "Approve All" : "Reject All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

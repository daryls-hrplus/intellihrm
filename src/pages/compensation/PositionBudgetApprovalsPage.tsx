import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function PositionBudgetApprovalsPage() {
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [comments, setComments] = useState("");

  const { data: pendingApprovals = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["my-pending-approvals"],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data } = await supabase
        .from("position_budget_approvals")
        .select(`
          *,
          position_budget_plans(
            id,
            name,
            fiscal_year,
            total_budgeted_amount,
            description,
            start_date,
            end_date,
            companies(name)
          )
        `)
        .eq("status", "pending")
        .or(`approver_id.eq.${userId},approver_id.is.null`)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: allApprovals = [], isLoading: allLoading } = useQuery({
    queryKey: ["all-budget-approvals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("position_budget_approvals")
        .select(`
          *,
          position_budget_plans(
            id,
            name,
            fiscal_year,
            total_budgeted_amount,
            companies(name)
          ),
          profiles:approver_id(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedApproval) return;

      // Update this approval
      await supabase
        .from("position_budget_approvals")
        .update({
          status: "approved",
          decided_at: new Date().toISOString(),
          comments,
        })
        .eq("id", selectedApproval.id);

      // Check if there are more levels
      const { data: nextLevel } = await supabase
        .from("position_budget_approvals")
        .select("*")
        .eq("plan_id", selectedApproval.plan_id)
        .eq("level_order", selectedApproval.level_order + 1)
        .single();

      if (nextLevel) {
        // Activate next level
        await supabase
          .from("position_budget_approvals")
          .update({ submitted_at: new Date().toISOString() })
          .eq("id", nextLevel.id);
      } else {
        // All levels approved, update plan status
        await supabase
          .from("position_budget_plans")
          .update({ status: "approved" })
          .eq("id", selectedApproval.plan_id);
      }
    },
    onSuccess: () => {
      toast.success("Budget approved");
      setShowApproveDialog(false);
      setSelectedApproval(null);
      setComments("");
      queryClient.invalidateQueries({ queryKey: ["my-pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["all-budget-approvals"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!selectedApproval) return;

      // Update this approval
      await supabase
        .from("position_budget_approvals")
        .update({
          status: "rejected",
          decided_at: new Date().toISOString(),
          comments,
        })
        .eq("id", selectedApproval.id);

      // Update plan status
      await supabase
        .from("position_budget_plans")
        .update({ status: "rejected" })
        .eq("id", selectedApproval.plan_id);
    },
    onSuccess: () => {
      toast.success("Budget rejected");
      setShowRejectDialog(false);
      setSelectedApproval(null);
      setComments("");
      queryClient.invalidateQueries({ queryKey: ["my-pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["all-budget-approvals"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject");
    },
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "$0";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { class: string; icon: any }> = {
      pending: { class: "bg-warning/10 text-warning", icon: Clock },
      approved: { class: "bg-success/10 text-success", icon: CheckCircle },
      rejected: { class: "bg-destructive/10 text-destructive", icon: XCircle },
      skipped: { class: "bg-muted text-muted-foreground", icon: AlertCircle },
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <Badge className={style.class}>
        <Icon className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Compensation", href: "/compensation" },
            { label: "Position-Based Budgeting", href: "/compensation/position-budget" },
            { label: "Approvals" },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/compensation/position-budget">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <FileCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Budget Approvals
              </h1>
              <p className="text-muted-foreground">
                Review and approve budget plans through the workflow
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Approval
              {pendingApprovals.length > 0 && (
                <Badge className="ml-2 bg-warning/10 text-warning">{pendingApprovals.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Approval History</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Awaiting Your Review</CardTitle>
                <CardDescription>
                  Budget plans that require your approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : pendingApprovals.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-success/50 mb-4" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.map((approval: any) => (
                      <div
                        key={approval.id}
                        className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{approval.position_budget_plans?.name}</p>
                              <Badge variant="outline">Level {approval.level_order}: {approval.level_name}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{approval.position_budget_plans?.companies?.name}</span>
                              <span>FY {approval.position_budget_plans?.fiscal_year}</span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(approval.position_budget_plans?.total_budgeted_amount)}
                              </span>
                            </div>
                            {approval.position_budget_plans?.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {approval.position_budget_plans.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Link to={`/compensation/position-budget/${approval.position_budget_plans?.id}`}>
                              <Button variant="outline" size="sm">
                                View Plan
                                <ArrowRight className="ml-2 h-3 w-3" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                setSelectedApproval(approval);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedApproval(approval);
                                setShowApproveDialog(true);
                              }}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Submitted: {approval.submitted_at ? format(new Date(approval.submitted_at), "MMM d, yyyy 'at' h:mm a") : "Not yet submitted"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
                <CardDescription>
                  All budget approval records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Approver</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Decided</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allApprovals.map((approval: any) => (
                        <TableRow key={approval.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{approval.position_budget_plans?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                FY {approval.position_budget_plans?.fiscal_year}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {approval.level_order}: {approval.level_name}
                          </TableCell>
                          <TableCell>
                            {approval.profiles?.full_name || "-"}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(approval.position_budget_plans?.total_budgeted_amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(approval.status)}</TableCell>
                          <TableCell>
                            {approval.decided_at
                              ? format(new Date(approval.decided_at), "MMM d, yyyy")
                              : "-"}
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

        {/* Approve Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Budget Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedApproval?.position_budget_plans?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Total Budget: {formatCurrency(selectedApproval?.position_budget_plans?.total_budgeted_amount)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Comments (optional)</Label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any approval comments..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Budget Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="font-medium text-destructive">This will reject the entire budget plan</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedApproval?.position_budget_plans?.name}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Rejection Reason *</Label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate()}
                disabled={!comments || rejectMutation.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

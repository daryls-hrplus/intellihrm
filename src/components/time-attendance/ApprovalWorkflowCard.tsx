import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, RotateCcw, Clock, Send, Users, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ApprovalWorkflowCardProps {
  companyId: string | null;
  currentUserId: string | null;
}

interface PendingApproval {
  id: string;
  period_start: string;
  period_end: string;
  current_approval_level: number;
  max_approval_levels: number;
  workflow_status: string;
  total_employees: number;
  total_regular_hours: number;
  total_overtime_hours: number;
  timekeeper: {
    first_name: string;
    first_last_name: string;
  };
  current_approver: {
    first_name: string;
    first_last_name: string;
  } | null;
}

interface ApprovalHistory {
  id: string;
  approval_level: number;
  action: string;
  comments: string | null;
  approved_at: string;
  approver: {
    first_name: string;
    first_last_name: string;
  };
}

export function ApprovalWorkflowCard({ companyId, currentUserId }: ApprovalWorkflowCardProps) {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return'>('approve');
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (companyId && currentUserId) {
      loadPendingApprovals();
    }
  }, [companyId, currentUserId]);

  const loadPendingApprovals = async () => {
    if (!companyId || !currentUserId) return;

    setLoading(true);
    try {
      // Get pending approvals where current user is the approver
      const { data, error } = await supabase
        .from('timekeeper_period_finalizations')
        .select(`
          id,
          period_start,
          period_end,
          current_approval_level,
          max_approval_levels,
          workflow_status,
          total_employees,
          total_regular_hours,
          total_overtime_hours,
          timekeeper:timekeeper_id (first_name, first_last_name),
          current_approver:current_approver_id (first_name, first_last_name)
        `)
        .eq('company_id', companyId)
        .eq('current_approver_id', currentUserId)
        .in('workflow_status', ['pending_level_1', 'pending_level_2', 'pending_level_3']);

      if (error) throw error;

      setPendingApprovals((data as unknown as PendingApproval[]) || []);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const loadApprovalHistory = async (finalizationId: string) => {
    const { data, error } = await supabase
      .from('timesheet_approval_history')
      .select(`
        id,
        approval_level,
        action,
        comments,
        approved_at,
        approver:approver_id (first_name, first_last_name)
      `)
      .eq('finalization_id', finalizationId)
      .order('approved_at', { ascending: true });

    if (error) {
      console.error('Error loading history:', error);
      return;
    }

    setApprovalHistory((data as unknown as ApprovalHistory[]) || []);
  };

  const handleSelectApproval = async (approval: PendingApproval) => {
    setSelectedApproval(approval);
    await loadApprovalHistory(approval.id);
  };

  const openActionDialog = (type: 'approve' | 'reject' | 'return') => {
    setActionType(type);
    setComments('');
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedApproval || !currentUserId) return;

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-timesheet-approval', {
        body: {
          finalizationId: selectedApproval.id,
          approverId: currentUserId,
          action: actionType,
          comments: comments || undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        setActionDialogOpen(false);
        setSelectedApproval(null);
        loadPendingApprovals();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error processing action:', error);
      toast.error(error.message || 'Failed to process action');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_level_1':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Level 1 Pending</Badge>;
      case 'pending_level_2':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Level 2 Pending</Badge>;
      case 'pending_level_3':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">Level 3 Pending</Badge>;
      case 'approved_for_payroll':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Ready for Payroll</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'returned':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600">Returned</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-5 w-5 animate-spin mr-2" />
            Loading pending approvals...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pending Timesheet Approvals
          </CardTitle>
          <CardDescription>
            Review and approve timesheets submitted by timekeepers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No pending approvals at this time</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Approval Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((approval) => (
                  <TableRow 
                    key={approval.id}
                    className={selectedApproval?.id === approval.id ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      {format(new Date(approval.period_start), 'MMM d')} - {format(new Date(approval.period_end), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {approval.timekeeper?.first_name} {approval.timekeeper?.first_last_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {approval.total_employees || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Regular: {(approval.total_regular_hours || 0).toFixed(1)}h</div>
                        <div className="text-muted-foreground">OT: {(approval.total_overtime_hours || 0).toFixed(1)}h</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      Level {approval.current_approval_level} of {approval.max_approval_levels}
                    </TableCell>
                    <TableCell>{getStatusBadge(approval.workflow_status)}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSelectApproval(approval)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedApproval && (
        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
            <CardDescription>
              Period: {format(new Date(selectedApproval.period_start), 'MMMM d')} - {format(new Date(selectedApproval.period_end), 'MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold">{selectedApproval.total_employees || 0}</div>
                <div className="text-sm text-muted-foreground">Employees</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold">{(selectedApproval.total_regular_hours || 0).toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Regular Hours</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold">{(selectedApproval.total_overtime_hours || 0).toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Overtime Hours</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold">Level {selectedApproval.current_approval_level}/{selectedApproval.max_approval_levels}</div>
                <div className="text-sm text-muted-foreground">Approval Progress</div>
              </div>
            </div>

            {/* Approval History */}
            {approvalHistory.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Approval History</h4>
                <div className="space-y-2">
                  {approvalHistory.map((history) => (
                    <div key={history.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                      <span className="text-sm">Level {history.approval_level}</span>
                      {getActionBadge(history.action)}
                      <span className="text-sm">
                        by {history.approver?.first_name} {history.approver?.first_last_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(history.approved_at), 'MMM d, h:mm a')}
                      </span>
                      {history.comments && (
                        <span className="text-sm italic text-muted-foreground">"{history.comments}"</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What happens next */}
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  {selectedApproval.current_approval_level < selectedApproval.max_approval_levels ? (
                    <p>Approving will send this to <strong>Level {selectedApproval.current_approval_level + 1}</strong> approver.</p>
                  ) : (
                    <p>This is the <strong>final approval level</strong>. Approving will summarize pay elements and send to payroll.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => openActionDialog('return')}
                disabled={selectedApproval.current_approval_level === 1}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Return to Previous
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => openActionDialog('reject')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={() => openActionDialog('approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                {selectedApproval.current_approval_level < selectedApproval.max_approval_levels ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Approve & Send to Next
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Final Approve & Send to Payroll
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Confirm Approval'}
              {actionType === 'reject' && 'Reject Timesheet Batch'}
              {actionType === 'return' && 'Return to Previous Level'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && selectedApproval && (
                selectedApproval.current_approval_level < selectedApproval.max_approval_levels
                  ? 'This will send the timesheet batch to the next approval level.'
                  : 'This will finalize the batch, create payroll summary records, and mark as ready for payroll.'
              )}
              {actionType === 'reject' && 'This will reject the entire batch. The timekeeper will need to review and resubmit.'}
              {actionType === 'return' && 'This will return the batch to the previous approver for further review.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium">
              {actionType === 'approve' ? 'Comments (optional)' : 'Reason (required for reject/return)'}
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                actionType === 'approve' 
                  ? 'Add any notes for the next approver...'
                  : 'Please provide a reason...'
              }
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing || ((actionType === 'reject' || actionType === 'return') && !comments.trim())}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {processing ? 'Processing...' : (
                actionType === 'approve' ? 'Confirm Approval' :
                actionType === 'reject' ? 'Confirm Rejection' : 'Confirm Return'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

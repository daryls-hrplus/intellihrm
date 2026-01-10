import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Building2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useHeadcountRequests } from './hooks/usePositionSeats';
import type { HeadcountChangeRequest, HeadcountRequestStatus } from './types';
import { REQUEST_STATUS_CONFIG, REQUEST_TYPE_CONFIG } from './types';

interface HeadcountRequestsWorkflowPanelProps {
  companyId: string;
}

export function HeadcountRequestsWorkflowPanel({ companyId }: HeadcountRequestsWorkflowPanelProps) {
  const { requests, isLoading, updateRequestStatus } = useHeadcountRequests(companyId);
  const [selectedRequest, setSelectedRequest] = useState<HeadcountChangeRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'UNDER_REVIEW');
  const completedRequests = requests.filter(r => ['APPROVED', 'REJECTED', 'EXECUTED', 'CANCELLED'].includes(r.status));

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    
    setIsProcessing(true);
    try {
      const newStatus: HeadcountRequestStatus = actionType === 'approve' ? 'APPROVED' : 'REJECTED';
      await updateRequestStatus(selectedRequest.id, newStatus, reviewNotes);
      setSelectedRequest(null);
      setActionType(null);
      setReviewNotes('');
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionDialog = (request: HeadcountChangeRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setReviewNotes('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Headcount Change Requests
        </CardTitle>
        <CardDescription>
          Review and approve headcount increase/decrease requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No pending requests</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <RequestCard 
                      key={request.id} 
                      request={request}
                      onApprove={() => openActionDialog(request, 'approve')}
                      onReject={() => openActionDialog(request, 'reject')}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No completed requests</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {completedRequests.map((request) => (
                    <RequestCard 
                      key={request.id} 
                      request={request}
                      readonly
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Action Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {actionType === 'approve' ? 'Approve' : 'Reject'} Request
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Approving will initiate the headcount change process.'
                : 'Rejecting will cancel this request.'}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="py-4 space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedRequest.position?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.request_type}: {selectedRequest.current_headcount} → {selectedRequest.requested_headcount}
                </p>
              </div>

              {selectedRequest.displacement_required && actionType === 'approve' && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800 dark:text-red-400">
                      Displacement Required
                    </p>
                    <p className="text-red-700 dark:text-red-500">
                      Approving will trigger displacement workflows for affected employees.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Review Notes {actionType === 'reject' && '*'}</Label>
                <Textarea
                  placeholder={actionType === 'approve' 
                    ? 'Optional notes...' 
                    : 'Explain why this request is being rejected...'}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedRequest(null);
              setActionType(null);
            }}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={isProcessing || (actionType === 'reject' && !reviewNotes.trim())}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface RequestCardProps {
  request: HeadcountChangeRequest;
  onApprove?: () => void;
  onReject?: () => void;
  readonly?: boolean;
}

function RequestCard({ request, onApprove, onReject, readonly }: RequestCardProps) {
  const statusConfig = REQUEST_STATUS_CONFIG[request.status];
  const typeConfig = REQUEST_TYPE_CONFIG[request.request_type];
  const isIncrease = request.request_type === 'INCREASE';

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-colors",
      !readonly && "hover:bg-muted/50"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{request.position?.title}</span>
            <Badge variant="outline" className="text-xs">
              {request.position?.code}
            </Badge>
            <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {isIncrease ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={isIncrease ? 'text-green-600' : 'text-red-600'}>
                {request.current_headcount} → {request.requested_headcount}
              </span>
              <Badge variant="outline" className="text-xs ml-1">
                {request.change_amount > 0 ? '+' : ''}{request.change_amount}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(request.effective_date), 'MMM d, yyyy')}
            </div>
          </div>

          {request.displacement_required && (
            <div className="flex items-center gap-1 mt-2">
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Displacement Required
              </Badge>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {request.business_justification}
          </p>

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            Requested by {request.requester?.full_name}
            <span>•</span>
            {format(new Date(request.requested_at), 'MMM d, yyyy')}
          </div>

          {request.review_notes && (
            <div className="mt-2 p-2 rounded bg-muted text-sm">
              <span className="font-medium">Review Notes:</span> {request.review_notes}
            </div>
          )}
        </div>

        {!readonly && (
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              size="sm" 
              variant="outline"
              onClick={onReject}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button 
              size="sm"
              onClick={onApprove}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

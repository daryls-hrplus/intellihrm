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
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  RotateCcw,
  PlayCircle,
  GitBranch,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useHeadcountWorkflow, HeadcountRequestWithWorkflow } from './hooks/useHeadcountWorkflow';
import { REQUEST_STATUS_CONFIG, REQUEST_TYPE_CONFIG } from './types';

interface HeadcountRequestsWorkflowPanelProps {
  companyId: string;
}

export function HeadcountRequestsWorkflowPanel({ companyId }: HeadcountRequestsWorkflowPanelProps) {
  const { 
    requests, 
    isLoading, 
    approveRequest, 
    rejectRequest, 
    returnRequest,
    executeRequest,
    getRequestTimeline
  } = useHeadcountWorkflow(companyId);
  
  const [selectedRequest, setSelectedRequest] = useState<HeadcountRequestWithWorkflow | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return' | 'execute' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const pendingRequests = requests.filter(r => 
    ['PENDING', 'UNDER_REVIEW'].includes(r.status)
  );
  const completedRequests = requests.filter(r => 
    ['APPROVED', 'REJECTED', 'EXECUTED', 'CANCELLED'].includes(r.status)
  );

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    
    setIsProcessing(true);
    try {
      let success = false;
      switch (actionType) {
        case 'approve':
          success = await approveRequest(selectedRequest.id, reviewNotes);
          break;
        case 'reject':
          success = await rejectRequest(selectedRequest.id, reviewNotes);
          break;
        case 'return':
          success = await returnRequest(selectedRequest.id, reviewNotes);
          break;
        case 'execute':
          success = await executeRequest(selectedRequest.id);
          break;
      }
      
      if (success) {
        setSelectedRequest(null);
        setActionType(null);
        setReviewNotes('');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionDialog = (request: HeadcountRequestWithWorkflow, action: typeof actionType) => {
    setSelectedRequest(request);
    setActionType(action);
    setReviewNotes('');
  };

  const openTimeline = async (request: HeadcountRequestWithWorkflow) => {
    setSelectedRequest(request);
    setShowTimeline(true);
    setLoadingTimeline(true);
    try {
      const data = await getRequestTimeline(request.id);
      setTimeline(data);
    } finally {
      setLoadingTimeline(false);
    }
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
          <GitBranch className="h-5 w-5" />
          Headcount Change Workflow
        </CardTitle>
        <CardDescription>
          Multi-level approval workflow for headcount changes (Manager → HR → Finance)
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
                      onReturn={() => openActionDialog(request, 'return')}
                      onViewTimeline={() => openTimeline(request)}
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
                      onViewTimeline={() => openTimeline(request)}
                      onExecute={request.status === 'APPROVED' ? () => openActionDialog(request, 'execute') : undefined}
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
              {actionType === 'approve' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {actionType === 'reject' && <XCircle className="h-5 w-5 text-red-600" />}
              {actionType === 'return' && <RotateCcw className="h-5 w-5 text-amber-600" />}
              {actionType === 'execute' && <PlayCircle className="h-5 w-5 text-purple-600" />}
              {actionType === 'approve' ? 'Approve' : 
               actionType === 'reject' ? 'Reject' : 
               actionType === 'return' ? 'Return for Revision' :
               'Execute'} Request
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'This will advance the request to the next approval level or complete it.'}
              {actionType === 'reject' && 'This will permanently reject the request.'}
              {actionType === 'return' && 'This will return the request to the requester for revisions.'}
              {actionType === 'execute' && 'This will apply the approved headcount changes.'}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="py-4 space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedRequest.position?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.request_type}: {selectedRequest.current_headcount} → {selectedRequest.requested_headcount}
                </p>
                {selectedRequest.workflow_instance && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <GitBranch className="h-3 w-3" />
                    <span>Step {selectedRequest.workflow_instance.current_step_order}: {selectedRequest.current_step_name}</span>
                  </div>
                )}
              </div>

              {selectedRequest.displacement_required && actionType === 'approve' && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800 dark:text-red-400">
                      Displacement Required
                    </p>
                    <p className="text-red-700 dark:text-red-500">
                      Execution will trigger displacement workflows for affected employees.
                    </p>
                  </div>
                </div>
              )}

              {actionType !== 'execute' && (
                <div className="space-y-2">
                  <Label>
                    Comments {(actionType === 'reject' || actionType === 'return') && '*'}
                  </Label>
                  <Textarea
                    placeholder={
                      actionType === 'approve' ? 'Optional approval notes...' : 
                      actionType === 'reject' ? 'Explain why this request is being rejected...' :
                      'Explain what needs to be revised...'
                    }
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
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
              variant={actionType === 'reject' ? 'destructive' : 
                       actionType === 'execute' ? 'default' : 'default'}
              onClick={handleAction}
              disabled={isProcessing || ((actionType === 'reject' || actionType === 'return') && !reviewNotes.trim())}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </>
              ) : actionType === 'reject' ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              ) : actionType === 'return' ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline Dialog */}
      <Dialog open={showTimeline} onOpenChange={setShowTimeline}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Workflow Timeline
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.position?.title} - {selectedRequest?.request_type}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px]">
            {loadingTimeline ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : timeline.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No workflow history yet</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        event.event_type === 'approved' && "bg-green-100 text-green-600",
                        event.event_type === 'rejected' && "bg-red-100 text-red-600",
                        event.event_type === 'returned' && "bg-amber-100 text-amber-600",
                        event.event_type === 'initiated' && "bg-blue-100 text-blue-600",
                        !['approved', 'rejected', 'returned', 'initiated'].includes(event.event_type) && "bg-muted text-muted-foreground"
                      )}>
                        {event.event_type === 'approved' && <CheckCircle className="h-4 w-4" />}
                        {event.event_type === 'rejected' && <XCircle className="h-4 w-4" />}
                        {event.event_type === 'returned' && <RotateCcw className="h-4 w-4" />}
                        {event.event_type === 'initiated' && <PlayCircle className="h-4 w-4" />}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-sm capitalize">
                        {event.event_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      {event.comment && (
                        <p className="text-sm mt-1 p-2 bg-muted rounded">
                          {event.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface RequestCardProps {
  request: HeadcountRequestWithWorkflow;
  onApprove?: () => void;
  onReject?: () => void;
  onReturn?: () => void;
  onExecute?: () => void;
  onViewTimeline?: () => void;
  readonly?: boolean;
}

function RequestCard({ request, onApprove, onReject, onReturn, onExecute, onViewTimeline, readonly }: RequestCardProps) {
  const statusConfig = REQUEST_STATUS_CONFIG[request.status];
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

          {/* Workflow Progress */}
          {request.workflow_instance && (
            <div className="flex items-center gap-2 mt-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Step {request.workflow_instance.current_step_order}: {request.current_step_name || 'Pending'}
              </span>
              {request.workflow_instance.sla_status === 'warning' && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                  SLA Warning
                </Badge>
              )}
              {request.workflow_instance.sla_status === 'critical' && (
                <Badge variant="destructive" className="text-xs">
                  SLA Critical
                </Badge>
              )}
            </div>
          )}

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

        <div className="flex flex-col items-end gap-2 shrink-0">
          {onViewTimeline && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onViewTimeline}
              className="text-muted-foreground"
            >
              <History className="h-4 w-4" />
            </Button>
          )}
          
          {!readonly && (
            <div className="flex items-center gap-2">
              {onReturn && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onReturn}
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              {onReject && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onReject}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              )}
              {onApprove && (
                <Button 
                  size="sm"
                  onClick={onApprove}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              )}
            </div>
          )}

          {readonly && onExecute && (
            <Button 
              size="sm"
              onClick={onExecute}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Execute
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

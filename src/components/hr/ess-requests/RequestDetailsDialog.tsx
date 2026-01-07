import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, FileText, ExternalLink, Download, Clock, CheckCircle2, XCircle, User, Shield, MessageSquare, HelpCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useApprovalPolicyLookup } from "@/hooks/useESSApprovalPolicy";

interface ChangeRequest {
  id: string;
  employee_id: string;
  request_type: string;
  change_action: string;
  current_values: Record<string, any> | null;
  new_values: Record<string, any>;
  status: string;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  applied_at: string | null;
  request_notes?: string | null;
  document_urls?: string[] | null;
  employee?: {
    id: string;
    full_name?: string;
    first_name?: string;
    first_last_name?: string;
    employee_id?: string;
    avatar_url?: string;
  };
}

interface RequestDetailsDialogProps {
  request: ChangeRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo?: () => void;
  getRequestTypeLabel: (type: string) => string;
  getActionLabel: (action: string) => string;
}

export function RequestDetailsDialog({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
  getRequestTypeLabel,
  getActionLabel,
}: RequestDetailsDialogProps) {
  const { approvalMode, requiresDocumentation } = useApprovalPolicyLookup(request?.request_type || '');
  
  if (!request) return null;

  const employeeName = request.employee?.full_name || 
    `${request.employee?.first_name || ''} ${request.employee?.first_last_name || ''}`.trim() || 
    'Unknown Employee';

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; className?: string }> = {
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> },
      approved: { variant: "default", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
      applied: { variant: "default", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
      rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> },
      info_required: { variant: "outline", icon: <HelpCircle className="h-3 w-3 mr-1" />, className: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400" },
      cancelled: { variant: "outline", icon: <XCircle className="h-3 w-3 mr-1" /> },
    };
    const { variant, icon, className } = config[status] || { variant: "outline" as const, icon: null };
    const labels: Record<string, string> = {
      pending: "pending",
      approved: "approved",
      applied: "applied",
      rejected: "rejected",
      info_required: "info required",
      cancelled: "cancelled",
    };
    return (
      <Badge variant={variant} className={className || "capitalize"}>
        {icon}{labels[status] || status}
      </Badge>
    );
  };

  const getPolicyLabel = () => {
    switch (approvalMode) {
      case 'auto_approve': return 'Auto Approve';
      case 'hr_review': return 'HR Review';
      case 'workflow': return 'Workflow Approval';
      default: return 'HR Review';
    }
  };

  const renderValueComparison = () => {
    const current = request.current_values;
    const newValues = request.new_values;
    const allKeys = new Set([
      ...Object.keys(current || {}),
      ...Object.keys(newValues),
    ]);

    return (
      <div className="space-y-2">
        {Array.from(allKeys).map((key) => {
          const oldVal = current?.[key];
          const newVal = newValues[key];
          const hasChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

          if (key === "employee_id" || key === "id" || key === "created_at" || key === "updated_at") {
            return null;
          }

          return (
            <div key={key} className={`p-2 rounded ${hasChanged ? "bg-muted" : ""}`}>
              <span className="text-xs font-medium text-muted-foreground capitalize">
                {key.replace(/_/g, " ")}
              </span>
              <div className="flex items-center gap-2 mt-1">
                {current && oldVal !== undefined && (
                  <>
                    <span className="text-sm line-through text-muted-foreground">
                      {String(oldVal || "—")}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </>
                )}
                <span className={`text-sm ${hasChanged ? "font-medium text-primary" : ""}`}>
                  {String(newVal || "—")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getDocumentName = (url: string) => {
    try {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1]);
    } catch {
      return 'Document';
    }
  };

  const timelineEvents = [
    {
      label: "Request Submitted",
      timestamp: request.requested_at,
      icon: <Clock className="h-3 w-3" />,
      completed: true,
    },
    ...(request.document_urls && request.document_urls.length > 0 ? [{
      label: `${request.document_urls.length} Document(s) Attached`,
      timestamp: request.requested_at,
      icon: <FileText className="h-3 w-3" />,
      completed: true,
    }] : []),
    ...(request.status === 'info_required' ? [{
      label: "Additional Info Requested",
      timestamp: request.reviewed_at,
      icon: <HelpCircle className="h-3 w-3" />,
      completed: true,
    }] : []),
    {
      label: request.status === 'pending' ? "Awaiting HR Review" : 
             request.status === 'rejected' ? "Rejected by HR" : 
             request.status === 'info_required' ? "Awaiting Employee Response" : "Reviewed by HR",
      timestamp: request.reviewed_at,
      icon: <User className="h-3 w-3" />,
      completed: request.status !== 'pending',
    },
    ...(request.status === 'applied' ? [{
      label: "Changes Applied",
      timestamp: request.applied_at,
      icon: <CheckCircle2 className="h-3 w-3" />,
      completed: true,
    }] : []),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getRequestTypeLabel(request.request_type)} Request
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {employeeName}
            {request.employee?.employee_id && (
              <span className="text-muted-foreground">• {request.employee.employee_id}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Status & Policy Row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {getStatusBadge(request.status)}
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {getPolicyLabel()}
                </Badge>
                {requiresDocumentation && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Docs Required
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
              </span>
            </div>

            <Separator />

            {/* Requested Changes */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Requested Changes ({getActionLabel(request.change_action)})
              </h4>
              <div className="border rounded-lg p-3 bg-muted/30">
                {renderValueComparison()}
              </div>
            </div>

            {/* Employee Notes */}
            {request.request_notes && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Employee Notes
                </h4>
                <div className="border rounded-lg p-3 bg-muted/30">
                  <p className="text-sm">{request.request_notes}</p>
                </div>
              </div>
            )}

            {/* Attached Documents */}
            {request.document_urls && request.document_urls.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Attached Documents ({request.document_urls.length})
                </h4>
                <div className="space-y-2">
                  {request.document_urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm truncate">{getDocumentName(url)}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HR Review Notes (if reviewed) */}
            {request.review_notes && (
              <div>
                <h4 className="text-sm font-semibold mb-2">HR Review Notes</h4>
                <div className="border rounded-lg p-3 bg-muted/30">
                  <p className="text-sm">{request.review_notes}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Timeline */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Timeline</h4>
              <div className="relative pl-4 space-y-3">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`
                      absolute left-0 w-2 h-2 rounded-full mt-1.5
                      ${event.completed ? 'bg-primary' : 'bg-muted-foreground/30'}
                    `} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${event.completed ? '' : 'text-muted-foreground'}`}>
                        {event.label}
                      </p>
                      {event.timestamp && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {request.status === 'pending' && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onRequestInfo && (
              <Button variant="secondary" onClick={onRequestInfo}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Request Info
              </Button>
            )}
            <Button variant="destructive" onClick={onReject}>
              Reject
            </Button>
            <Button onClick={onApprove}>
              Approve & Apply
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

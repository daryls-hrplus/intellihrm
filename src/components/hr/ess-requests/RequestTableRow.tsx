import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, X, Paperclip, AlertTriangle, HelpCircle } from "lucide-react";
import { format, differenceInHours } from "date-fns";

interface ChangeRequest {
  id: string;
  employee_id: string;
  request_type: string;
  change_action: string;
  status: string;
  requested_at: string;
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

interface RequestTableRowProps {
  request: ChangeRequest;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo?: () => void;
  getRequestTypeLabel: (type: string) => string;
  getActionLabel: (action: string) => string;
}

const HIGH_RISK_TYPES = ['banking', 'government_id', 'name_change'];

export function RequestTableRow({
  request,
  onView,
  onApprove,
  onReject,
  onRequestInfo,
  getRequestTypeLabel,
  getActionLabel,
}: RequestTableRowProps) {
  const employeeName = request.employee?.full_name || 
    `${request.employee?.first_name || ''} ${request.employee?.first_last_name || ''}`.trim() || 
    'Unknown';

  const initials = employeeName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const hoursAgo = differenceInHours(new Date(), new Date(request.requested_at));
  const isOverdue = request.status === 'pending' && hoursAgo > 48;
  const isHighRisk = HIGH_RISK_TYPES.includes(request.request_type);
  const hasDocuments = request.document_urls && request.document_urls.length > 0;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { 
        label: "Pending", 
        className: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300" 
      },
      applied: { 
        label: "Applied", 
        className: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300" 
      },
      rejected: { 
        label: "Rejected", 
        className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300" 
      },
      info_required: { 
        label: "Info Required", 
        className: "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-900/40 dark:text-amber-300" 
      },
      cancelled: { 
        label: "Cancelled", 
        className: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300" 
      },
    };
    const config = statusConfig[status] || { label: status, className: "" };
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <TableRow className={isOverdue ? 'bg-destructive/5' : undefined}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={request.employee?.avatar_url} alt={employeeName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate">{employeeName}</p>
            <p className="text-xs text-muted-foreground">
              {request.employee?.employee_id || 'No ID'}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 flex-wrap">
          <span>{getRequestTypeLabel(request.request_type)}</span>
          {isHighRisk && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-400 dark:bg-orange-900/40 dark:text-orange-300 text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    High Risk
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This change type requires extra verification</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {hasDocuments && (
            <Badge variant="outline" className="text-xs gap-1">
              <Paperclip className="h-3 w-3" />
              {request.document_urls!.length}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{getActionLabel(request.change_action)}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm">{format(new Date(request.requested_at), "MMM d, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(request.requested_at), "h:mm a")}
          </span>
          {isOverdue && (
            <Badge variant="destructive" className="mt-1 text-xs w-fit">
              Overdue
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(request.status)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onView}>
            View
          </Button>
          {request.status === "pending" && (
            <>
              {onRequestInfo && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="outline" onClick={onRequestInfo}>
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Request more information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button size="sm" variant="default" onClick={onApprove}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={onReject}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

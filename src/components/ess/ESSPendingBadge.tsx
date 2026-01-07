import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock } from "lucide-react";
import { useESSChangeRequest } from "@/hooks/useESSChangeRequest";
import { useAuth } from "@/contexts/AuthContext";

interface ESSPendingBadgeProps {
  entityId: string | null;
  entityTable: string;
  showTooltip?: boolean;
}

export function ESSPendingBadge({ entityId, entityTable, showTooltip = true }: ESSPendingBadgeProps) {
  const { profile } = useAuth();
  const { hasPendingRequest, getPendingRequest } = useESSChangeRequest(profile?.id || "");

  if (!hasPendingRequest(entityId, entityTable)) {
    return null;
  }

  const pendingRequest = getPendingRequest(entityId, entityTable);

  const badge = (
    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
      <Clock className="h-3 w-3" />
      Pending
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>A change request for this record is pending HR approval</p>
          {pendingRequest?.created_at && (
            <p className="text-xs text-muted-foreground mt-1">
              Submitted: {new Date(pendingRequest.created_at).toLocaleDateString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

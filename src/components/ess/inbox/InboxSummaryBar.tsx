import { Badge } from "@/components/ui/badge";
import { InboxCounts } from "@/hooks/useEssInbox";
import { Inbox, AlertCircle, Clock, CheckCircle } from "lucide-react";

interface InboxSummaryBarProps {
  counts: InboxCounts;
}

export function InboxSummaryBar({ counts }: InboxSummaryBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2">
        <Inbox className="h-5 w-5 text-primary" />
        <span className="font-medium">{counts.total} Total</span>
      </div>
      
      {counts.responseRequired > 0 && (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <Badge variant="destructive" className="text-xs">
            {counts.responseRequired} Response Required
          </Badge>
        </div>
      )}
      
      {counts.pending > 0 && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary" className="text-xs">
            {counts.pending} Awaiting Review
          </Badge>
        </div>
      )}
      
      {counts.total === 0 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm">All caught up!</span>
        </div>
      )}
    </div>
  );
}

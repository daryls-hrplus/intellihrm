import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Paperclip,
  Award,
} from "lucide-react";
import { usePerformanceEvidence, PerformanceEvidence } from "@/hooks/capabilities/usePerformanceEvidence";
import { formatDistanceToNow } from "date-fns";

interface AppraisalEvidenceSummaryProps {
  employeeId: string;
  cycleId?: string;
  goalId?: string;
  capabilityId?: string;
  responsibilityId?: string;
  compact?: boolean;
}

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "text-yellow-600", label: "Pending" },
  validated: { icon: CheckCircle2, color: "text-green-600", label: "Validated" },
  rejected: { icon: XCircle, color: "text-destructive", label: "Rejected" },
  disputed: { icon: Clock, color: "text-orange-600", label: "Disputed" },
};

export function AppraisalEvidenceSummary({
  employeeId,
  cycleId,
  goalId,
  capabilityId,
  responsibilityId,
  compact = false,
}: AppraisalEvidenceSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { evidence, loading, fetchEvidence, getAttachmentUrl } = usePerformanceEvidence();

  useEffect(() => {
    if (employeeId) {
      fetchEvidence({
        employee_id: employeeId,
        appraisal_cycle_id: cycleId,
        goal_id: goalId,
        capability_id: capabilityId,
        responsibility_id: responsibilityId,
      });
    }
  }, [employeeId, cycleId, goalId, capabilityId, responsibilityId]);

  const filteredEvidence = evidence.filter((e) => {
    if (goalId && e.goal_id !== goalId) return false;
    if (capabilityId && e.capability_id !== capabilityId) return false;
    if (responsibilityId && e.responsibility_id !== responsibilityId) return false;
    return true;
  });

  const validatedCount = filteredEvidence.filter(e => e.validation_status === "validated").length;
  const pendingCount = filteredEvidence.filter(e => e.validation_status === "pending").length;

  if (loading) {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <FileText className="h-3 w-3" />
        Loading...
      </div>
    );
  }

  if (filteredEvidence.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs gap-1">
          <FileText className="h-3 w-3" />
          {filteredEvidence.length} evidence
        </Badge>
        {validatedCount > 0 && (
          <Badge variant="outline" className="text-xs gap-1 text-green-600 border-green-500/30">
            <CheckCircle2 className="h-3 w-3" />
            {validatedCount} validated
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between h-8 px-2 text-xs"
        >
          <div className="flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-primary" />
            <span>
              {filteredEvidence.length} Evidence Item{filteredEvidence.length !== 1 ? "s" : ""}
            </span>
            {validatedCount > 0 && (
              <Badge variant="outline" className="text-xs h-5 px-1.5 text-green-600">
                {validatedCount} validated
              </Badge>
            )}
            {pendingCount > 0 && (
              <Badge variant="outline" className="text-xs h-5 px-1.5 text-yellow-600">
                {pendingCount} pending
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <ScrollArea className="max-h-[200px] mt-2">
          <div className="space-y-2">
            {filteredEvidence.map((ev) => {
              const statusConfig = STATUS_CONFIG[ev.validation_status];
              const StatusIcon = statusConfig?.icon || Clock;

              return (
                <div
                  key={ev.id}
                  className="p-2 rounded border bg-muted/30 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {ev.evidence_type.replace("_", " ")}
                        </Badge>
                        <StatusIcon className={`h-3 w-3 ${statusConfig?.color}`} />
                      </div>
                      <p className="font-medium truncate">{ev.title}</p>
                      {ev.description && (
                        <p className="text-muted-foreground line-clamp-1 mt-0.5">
                          {ev.description}
                        </p>
                      )}
                      <p className="text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(ev.submitted_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {ev.external_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => window.open(ev.external_url!, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      {ev.attachment_path && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={async () => {
                            const url = await getAttachmentUrl(ev.attachment_path!);
                            if (url) window.open(url, "_blank");
                          }}
                        >
                          <Paperclip className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}

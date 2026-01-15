import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  Link as LinkIcon, 
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Paperclip,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface EvidenceItem {
  id: string;
  title: string;
  description?: string;
  type: "document" | "file" | "link" | "text" | "image" | "video";
  status: "pending" | "validated" | "rejected";
  submittedAt: string;
  attachmentType?: string;
  attachmentPath?: string;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
}

interface ItemEvidenceProps {
  evidence: EvidenceItem[];
  isEmployeeView?: boolean;
  isPreview?: boolean;
  onUpload?: () => void;
  className?: string;
}

const FILE_TYPE_ICONS: Record<string, typeof FileText> = {
  document: FileText,
  file: FileText,
  link: LinkIcon,
  text: FileText,
  image: FileImage,
  video: FileVideo,
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    iconColor: "text-amber-600",
  },
  validated: {
    label: "Validated",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    iconColor: "text-green-600",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    iconColor: "text-red-600",
  },
};

export function ItemEvidence({
  evidence,
  isEmployeeView = false,
  isPreview = false,
  onUpload,
  className,
}: ItemEvidenceProps) {
  const hasEvidence = evidence.length > 0;
  const validatedCount = evidence.filter((e) => e.status === "validated").length;
  const pendingCount = evidence.filter((e) => e.status === "pending").length;

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (!hasEvidence && !isEmployeeView) {
    return null; // Don't show section if no evidence and not employee view
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">
            Evidence {hasEvidence && `(${evidence.length} items)`}
          </span>
          {hasEvidence && (
            <div className="flex gap-1">
              {validatedCount > 0 && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                  {validatedCount} validated
                </Badge>
              )}
              {pendingCount > 0 && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                  {pendingCount} pending
                </Badge>
              )}
            </div>
          )}
        </div>
        {isEmployeeView && onUpload && (
          <Button variant="outline" size="sm" onClick={onUpload} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Evidence
          </Button>
        )}
      </div>

      {!hasEvidence ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
          <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {isEmployeeView 
              ? "No evidence uploaded yet. Upload documents, links, or other materials to support your self-assessment."
              : "No evidence has been submitted for this item."}
          </p>
          {isPreview && (
            <p className="text-xs mt-1 italic">
              [Sample - In actual appraisals, evidence will appear here]
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {evidence.map((item) => {
            const TypeIcon = FILE_TYPE_ICONS[item.type] || FileText;
            const statusConfig = STATUS_CONFIG[item.status];
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border bg-background/50",
                  item.status === "rejected" && "opacity-60"
                )}
              >
                <div className="rounded-lg bg-muted p-2 shrink-0">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <Badge className={cn("shrink-0 text-xs", statusConfig.color)}>
                      <StatusIcon className={cn("h-3 w-3 mr-1", statusConfig.iconColor)} />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Submitted {formatDate(item.submittedAt)}</span>
                    {item.attachmentType && (
                      <span className="uppercase">{item.attachmentType}</span>
                    )}
                    {item.validatedBy && item.status === "validated" && (
                      <span className="text-green-600">
                        Validated by {item.validatedBy}
                      </span>
                    )}
                  </div>

                  {item.status === "rejected" && item.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                      <strong>Rejection reason:</strong> {item.rejectionReason}
                    </div>
                  )}
                </div>

                {item.attachmentPath && (
                  <Button variant="ghost" size="icon" className="shrink-0" asChild>
                    <a href={item.attachmentPath} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            );
          })}

          {isPreview && (
            <p className="text-xs text-center text-muted-foreground italic pt-2">
              [Sample evidence for preview - actual evidence will come from employee submissions]
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// Sample evidence for template previews
export const SAMPLE_EVIDENCE: EvidenceItem[] = [
  {
    id: "sample-1",
    title: "Q3 Performance Presentation.pdf",
    description: "Presentation demonstrating advanced communication skills in client setting",
    type: "document",
    status: "validated",
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    attachmentType: "pdf",
    validatedBy: "Jane Doe",
  },
  {
    id: "sample-2",
    title: "Team Workshop Recording",
    description: "Led training session for new team members on best practices",
    type: "video",
    status: "pending",
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    attachmentType: "mp4",
  },
];

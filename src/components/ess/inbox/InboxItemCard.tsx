import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InboxItem, InboxItemType } from "@/hooks/useEssInbox";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Receipt, 
  ClipboardCheck, 
  GitPullRequest, 
  FileText, 
  GraduationCap,
  AlertCircle,
  Clock,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const typeConfig: Record<InboxItemType, { icon: React.ElementType; label: string }> = {
  leave: { icon: Calendar, label: 'Leave' },
  rod: { icon: RefreshCw, label: 'Resumption' },
  expense: { icon: Receipt, label: 'Expense' },
  change_request: { icon: GitPullRequest, label: 'Change Request' },
  appraisal: { icon: ClipboardCheck, label: 'Appraisal' },
  document: { icon: FileText, label: 'Document' },
  idp: { icon: GraduationCap, label: 'Development' },
};

interface InboxItemCardProps {
  item: InboxItem;
}

export function InboxItemCard({ item }: InboxItemCardProps) {
  const navigate = useNavigate();
  const config = typeConfig[item.type];
  const Icon = config.icon;
  
  const isUrgent = item.urgency === 'response_required';

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
        isUrgent
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`p-2.5 rounded-lg ${
          isUrgent 
            ? "bg-destructive/10 text-destructive" 
            : "bg-muted text-muted-foreground"
        }`}>
          {isUrgent ? <AlertCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
        
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{item.title}</span>
            <Badge 
              variant={isUrgent ? "destructive" : "secondary"} 
              className="text-xs"
            >
              {config.label}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground truncate">
            {item.description}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
            {item.dueDate && (
              <>
                <span>•</span>
                <span className={isUrgent ? "text-destructive" : ""}>
                  Due {new Date(item.dueDate).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
          
          {isUrgent && item.metadata?.reviewNotes && (
            <p className="text-xs text-destructive mt-1">
              Note: {String(item.metadata.reviewNotes)}
            </p>
          )}
        </div>
      </div>
      
      <Button
        variant={isUrgent ? "default" : "ghost"}
        size="sm"
        onClick={() => navigate(item.actionPath)}
        className="ml-4 shrink-0"
      >
        {item.actionLabel}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// Version timeline visualization for article history

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  RotateCcw,
  GitBranch,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleVersion, ArticleStatus } from "@/services/kb/types";

interface VersionTimelineProps {
  versions: ArticleVersion[];
  currentVersionId?: string;
  onSelectVersion?: (version: ArticleVersion) => void;
  onCompare?: (oldVersion: ArticleVersion, newVersion: ArticleVersion) => void;
  onRollback?: (version: ArticleVersion) => void;
  maxHeight?: string;
}

const STATUS_STYLES: Record<ArticleStatus, { icon: typeof FileText; color: string; label: string }> = {
  draft: { icon: FileText, color: 'text-slate-500', label: 'Draft' },
  pending_review: { icon: Clock, color: 'text-amber-500', label: 'Pending Review' },
  in_review: { icon: Eye, color: 'text-blue-500', label: 'In Review' },
  changes_requested: { icon: XCircle, color: 'text-orange-500', label: 'Changes Requested' },
  approved: { icon: CheckCircle2, color: 'text-green-500', label: 'Approved' },
  published: { icon: CheckCircle2, color: 'text-emerald-600', label: 'Published' },
  retired: { icon: Clock, color: 'text-slate-400', label: 'Retired' },
  archived: { icon: FileText, color: 'text-slate-300', label: 'Archived' },
};

export function VersionTimeline({
  versions,
  currentVersionId,
  onSelectVersion,
  onCompare,
  onRollback,
  maxHeight = "400px",
}: VersionTimelineProps) {
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <ScrollArea className={`pr-4`} style={{ maxHeight }}>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {sortedVersions.map((version, index) => {
            const statusConfig = STATUS_STYLES[version.status];
            const StatusIcon = statusConfig.icon;
            const isCurrent = version.id === currentVersionId;
            const isRollback = version.change_type === 'rollback';
            const prevVersion = sortedVersions[index + 1];
            
            return (
              <div key={version.id} className="relative pl-10">
                {/* Timeline dot */}
                <div 
                  className={cn(
                    "absolute left-2 w-5 h-5 rounded-full flex items-center justify-center",
                    isCurrent ? "bg-primary" : "bg-muted",
                    "border-2 border-background"
                  )}
                >
                  {isRollback ? (
                    <RotateCcw className="h-3 w-3 text-primary-foreground" />
                  ) : (
                    <StatusIcon className={cn("h-3 w-3", isCurrent ? "text-primary-foreground" : statusConfig.color)} />
                  )}
                </div>
                
                {/* Version card */}
                <div 
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    isCurrent && "border-primary bg-primary/5",
                    !isCurrent && "hover:bg-muted/50 cursor-pointer"
                  )}
                  onClick={() => onSelectVersion?.(version)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-sm">
                          v{version.version_number}
                        </span>
                        <Badge 
                          variant={version.status === 'published' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {statusConfig.label}
                        </Badge>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {isRollback && (
                          <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Rollback
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      
                      {version.change_summary && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {version.change_summary}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {prevVersion && onCompare && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompare(prevVersion, version);
                          }}
                        >
                          <GitBranch className="h-3 w-3 mr-1" />
                          Compare
                        </Button>
                      )}
                      
                      {version.status === 'published' && !isCurrent && onRollback && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRollback(version);
                          }}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {version.change_type && (
                      <span className="capitalize">{version.change_type} change</span>
                    )}
                    {version.published_at && (
                      <span>Published {format(new Date(version.published_at), 'MMM d')}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}

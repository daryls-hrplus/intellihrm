import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { GitBranch, Database, FileText } from 'lucide-react';
import { useEvidenceLineage } from '@/hooks/feedback/useModuleEvidence';

interface EvidenceLineagePopoverProps {
  snapshotId?: string;
}

export function EvidenceLineagePopover({ snapshotId }: EvidenceLineagePopoverProps) {
  const { data: lineage, isLoading } = useEvidenceLineage(snapshotId);

  if (!snapshotId) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <GitBranch className="h-3 w-3 mr-1" />
          View Source
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-medium">
            <GitBranch className="h-4 w-4" />
            Evidence Lineage
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : lineage && lineage.length > 0 ? (
            <div className="space-y-2">
              {lineage.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded"
                >
                  <div className="flex flex-col items-center">
                    {getSourceIcon(link.source_table)}
                    {index < lineage.length - 1 && (
                      <div className="w-px h-4 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs">
                      {formatSourceTable(link.source_table)}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      ID: {link.source_id.slice(0, 8)}...
                    </div>
                    {link.contribution_weight && (
                      <div className="text-xs text-muted-foreground">
                        Weight: {(link.contribution_weight * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No lineage data available
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            This shows the source data that contributed to this signal.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getSourceIcon(sourceTable: string) {
  switch (sourceTable) {
    case 'feedback_360_responses':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'appraisal_responses':
      return <FileText className="h-4 w-4 text-green-500" />;
    default:
      return <Database className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatSourceTable(sourceTable: string): string {
  const labels: Record<string, string> = {
    feedback_360_responses: '360 Feedback Response',
    appraisal_responses: 'Appraisal Response',
    continuous_performance_signals: 'Continuous Feedback',
    project_feedback: 'Project Feedback',
  };
  return labels[sourceTable] || sourceTable.replace(/_/g, ' ');
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Archive, ChevronDown, Database, Clock, CheckCircle, Trash2, User } from "lucide-react";
import { OrphanEntry } from "@/types/orphanTypes";
import { useState } from "react";
import { format } from "date-fns";

interface MigrationBatch {
  timestamp: string;
  count: number;
  codes: string[];
}

interface MigrationBatchesPanelProps {
  batches: MigrationBatch[];
  orphans: OrphanEntry[];
  onArchiveBatch: (codes: string[]) => void;
  onKeepBatch: (codes: string[]) => void;
  onDeleteBatch: (codes: string[]) => void;
}

export function MigrationBatchesPanel({
  batches,
  orphans,
  onArchiveBatch,
  onKeepBatch,
  onDeleteBatch
}: MigrationBatchesPanelProps) {
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  const toggleExpanded = (timestamp: string) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(timestamp)) {
      newExpanded.delete(timestamp);
    } else {
      newExpanded.add(timestamp);
    }
    setExpandedBatches(newExpanded);
  };

  if (batches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Migration Batches Detected</CardTitle>
          <CardDescription>
            No large batches (&gt;10 entries) of simultaneously-created features were found.
            This indicates orphaned entries were created individually rather than in bulk migrations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalBatchEntries = batches.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Batches
          </CardTitle>
          <CardDescription>
            Groups of features created at the same timestamp, likely from automated migrations.
            These can often be archived in bulk if they're no longer needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {batches.length} batches detected
            </Badge>
            <Badge variant="outline">
              {totalBatchEntries} total entries
            </Badge>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {batches.map((batch, index) => {
            const batchOrphans = orphans.filter(o => batch.codes.includes(o.featureCode));
            const formattedDate = format(new Date(batch.timestamp), "MMM d, yyyy 'at' HH:mm:ss");
            const isExpanded = expandedBatches.has(batch.timestamp);
            
            // Get unique creators for this batch
            const batchCreators = new Set(
              batchOrphans.map(o => o.createdByName).filter((name): name is string => !!name)
            );

            return (
              <Card key={index}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(batch.timestamp)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-base">{formattedDate}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {batch.count} features created simultaneously
                              {batchCreators.size > 0 && (
                                <span className="flex items-center gap-1 mt-1">
                                  <User className="h-3 w-3" />
                                  By: {Array.from(batchCreators).slice(0, 3).join(', ')}
                                  {batchCreators.size > 3 && ` +${batchCreators.size - 3} more`}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                            {batch.count} entries
                          </Badge>
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-end gap-2 mb-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => onKeepBatch(batch.codes)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Keep Entire Batch
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onArchiveBatch(batch.codes)}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive Entire Batch
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => onDeleteBatch(batch.codes)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Entire Batch
                          </Button>
                        </div>
                        <div className="grid gap-1 max-h-[200px] overflow-y-auto">
                          {batchOrphans.slice(0, 20).map(orphan => (
                            <div 
                              key={orphan.id}
                              className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm"
                            >
                              <code className="font-mono text-xs truncate flex-1">
                                {orphan.featureCode}
                              </code>
                              {orphan.createdByName ? (
                                <Badge variant="outline" className="text-xs mx-2 bg-blue-50 text-blue-700 border-blue-200">
                                  <User className="h-3 w-3 mr-1" />
                                  {orphan.createdByName}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs mx-2 bg-muted">
                                  <Database className="h-3 w-3 mr-1" />
                                  {orphan.source === 'auto_migration' ? 'Migration' : 
                                   orphan.source === 'manual_entry' ? 'Manual' :
                                   orphan.source === 'registry' ? 'Registry' : 'System'}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {orphan.moduleCode || 'unassigned'}
                              </Badge>
                            </div>
                          ))}
                          {batchOrphans.length > 20 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              ... and {batchOrphans.length - 20} more entries
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

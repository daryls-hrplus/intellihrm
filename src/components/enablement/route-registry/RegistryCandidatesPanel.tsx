import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, FileCode, ExternalLink, CheckCircle, Archive, Trash2 } from "lucide-react";
import { OrphanEntry } from "@/types/orphanTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RegistryCandidatesPanelProps {
  candidates: OrphanEntry[];
  onKeep: (orphan: OrphanEntry) => void;
  onArchive: (orphan: OrphanEntry) => void;
  onDelete: (orphan: OrphanEntry) => void;
  isProcessing?: boolean;
}

export function RegistryCandidatesPanel({
  candidates,
  onKeep,
  onArchive,
  onDelete,
  isProcessing = false
}: RegistryCandidatesPanelProps) {
  const groupedByModule = candidates.reduce((acc, candidate) => {
    const module = candidate.moduleCode || 'unassigned';
    if (!acc[module]) acc[module] = [];
    acc[module].push(candidate);
    return acc;
  }, {} as Record<string, OrphanEntry[]>);

  if (candidates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Registry Candidates</CardTitle>
          <CardDescription>
            All orphaned entries have been categorized as duplicates, stale, or incomplete.
            No entries qualify for addition to the Feature Registry.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Registry Candidates
          </CardTitle>
          <CardDescription>
            These orphaned database entries have complete data (route + description) and may represent 
            legitimate features that should be added to the Feature Registry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {candidates.length} candidates
            </Badge>
            <Badge variant="outline">
              {Object.keys(groupedByModule).length} modules
            </Badge>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {Object.entries(groupedByModule).map(([moduleCode, entries]) => (
            <Card key={moduleCode}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">
                    {entries[0]?.moduleName || moduleCode}
                  </CardTitle>
                  <Badge variant="secondary">
                    {entries.length} candidates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries.map(entry => (
                    <div 
                      key={entry.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-sm font-mono font-medium text-primary">
                              {entry.featureCode}
                            </code>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Registry Candidate
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mt-1">
                            {entry.featureName}
                          </p>
                          {entry.routePath && (
                            <p className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />
                              {entry.routePath}
                            </p>
                          )}
                          {entry.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {entry.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => onKeep(entry)}
                                  disabled={isProcessing}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Mark as reviewed and keep</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => onArchive(entry)}
                                  disabled={isProcessing}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Archive this entry</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => onDelete(entry)}
                                  disabled={isProcessing}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete permanently</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            To add these to the Feature Registry, update <code className="text-xs bg-muted px-1 py-0.5 rounded">src/lib/featureRegistry.ts</code> with the feature definitions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

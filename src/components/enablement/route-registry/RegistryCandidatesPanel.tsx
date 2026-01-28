import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, FileCode, ExternalLink } from "lucide-react";
import { OrphanEntry } from "@/types/orphanTypes";

interface RegistryCandidatesPanelProps {
  candidates: OrphanEntry[];
}

export function RegistryCandidatesPanel({
  candidates
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
                        <FileCode className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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

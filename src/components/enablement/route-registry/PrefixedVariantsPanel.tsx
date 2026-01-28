import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive, Trash2, GitMerge, CheckCircle } from "lucide-react";
import { OrphanDuplicate, OrphanEntry } from "@/types/orphanTypes";
import { cn } from "@/lib/utils";

interface PrefixedVariantsPanelProps {
  prefixedVariants: OrphanDuplicate[];
  onArchive: (orphan: OrphanEntry) => void;
  onDelete: (orphan: OrphanEntry) => void;
  onKeep: (orphan: OrphanEntry) => void;
}

export function PrefixedVariantsPanel({
  prefixedVariants,
  onArchive,
  onDelete,
  onKeep
}: PrefixedVariantsPanelProps) {
  if (prefixedVariants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Prefixed Variants Detected</CardTitle>
          <CardDescription>
            All orphaned entries have unique base codes. No admin_/ess_/mss_ variant patterns found.
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
            <GitMerge className="h-5 w-5" />
            Prefixed Variants
          </CardTitle>
          <CardDescription>
            Features with the same base code but different prefixes (e.g., admin_announcements vs announcements).
            Consider keeping only the base version and removing prefixed variants.
          </CardDescription>
        </CardHeader>
      </Card>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {prefixedVariants.map((cluster, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cluster.featureName}</CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {cluster.entries.length} variants
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {cluster.mergeRecommendation}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cluster.entries.map((entry, entryIndex) => (
                    <div 
                      key={entry.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border",
                        cluster.suggestedPrimary === entry.featureCode 
                          ? "bg-green-50 border-green-200" 
                          : "bg-muted/50"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono truncate">
                            {entry.featureCode}
                          </code>
                          {cluster.suggestedPrimary === entry.featureCode && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Keep
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {entry.routePath || 'No route'}
                        </p>
                      </div>
                      {cluster.suggestedPrimary !== entry.featureCode && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => onKeep(entry)}
                            title="Mark as reviewed and keep"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onArchive(entry)}
                            title="Archive"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => onDelete(entry)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

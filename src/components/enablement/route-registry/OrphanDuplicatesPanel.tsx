import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Archive, Trash2, ExternalLink, Copy, GitMerge, Route, CheckCircle } from "lucide-react";
import { OrphanEntry, OrphanDuplicate, OrphanRouteConflict } from "@/types/orphanTypes";

interface OrphanDuplicatesPanelProps {
  duplicates: OrphanDuplicate[];
  routeConflicts: OrphanRouteConflict[];
  onArchive: (orphan: OrphanEntry) => void;
  onDelete: (orphan: OrphanEntry) => void;
  onKeep: (orphan: OrphanEntry) => void;
  onViewDuplicate: (duplicate: OrphanDuplicate) => void;
}

export function OrphanDuplicatesPanel({
  duplicates,
  routeConflicts,
  onArchive,
  onDelete,
  onKeep,
  onViewDuplicate
}: OrphanDuplicatesPanelProps) {
  if (duplicates.length === 0 && routeConflicts.length === 0) {
    return (
      <Alert>
        <Copy className="h-4 w-4" />
        <AlertTitle>No Duplicates Found</AlertTitle>
        <AlertDescription>
          All orphaned entries have unique names and routes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Duplicate Names */}
      {duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Duplicate Feature Names ({duplicates.length} clusters)
            </CardTitle>
            <CardDescription>
              Features with the same name but different feature codes. Consider merging or deleting duplicates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {duplicates.map((duplicate, index) => (
                  <Card key={index} className="border-dashed">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => onViewDuplicate(duplicate)}
                          className="text-base flex items-center gap-2 font-semibold hover:text-primary hover:underline cursor-pointer text-left"
                        >
                          <GitMerge className="h-4 w-4 text-blue-500" />
                          "{duplicate.featureName}"
                        </button>
                        <Badge variant="outline">
                          {duplicate.entries.length} entries
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {duplicate.mergeRecommendation}
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto ml-2 text-xs"
                          onClick={() => onViewDuplicate(duplicate)}
                        >
                          View Details →
                        </Button>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Feature Code</TableHead>
                            <TableHead>Module</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {duplicate.entries.map((entry, entryIndex) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-mono text-sm">
                                <div className="flex items-center gap-2">
                                  {entry.featureCode}
                                  {entry.featureCode === duplicate.suggestedPrimary && (
                                    <Badge variant="secondary" className="text-xs">
                                      Primary
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{entry.moduleCode || 'unassigned'}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {entry.routePath || 'N/A'}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {entry.createdAt.toLocaleDateString()}
                              </TableCell>
                              <TableCell>
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
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Route Conflicts */}
      {routeConflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Route Path Conflicts ({routeConflicts.length} conflicts)
            </CardTitle>
            <CardDescription>
              Multiple features share the same route path. Only one should exist per route.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {routeConflicts.map((conflict, index) => (
                  <Card key={index} className="border-dashed border-destructive/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="font-mono text-sm">{conflict.routePath}</span>
                        </CardTitle>
                        <Badge variant="destructive">
                          {conflict.entries.length} entries
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-destructive">
                        {conflict.conflictReason}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Feature Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Module</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {conflict.entries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-mono text-sm">
                                {entry.featureCode}
                              </TableCell>
                              <TableCell className="truncate max-w-[150px]">
                                {entry.featureName}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{entry.moduleCode || 'unassigned'}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {entry.source}
                                </Badge>
                              </TableCell>
                              <TableCell>
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
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

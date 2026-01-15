import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Archive, Trash2, ExternalLink, FolderOpen, Copy } from "lucide-react";
import { OrphanEntry, OrphanSource, OrphanRecommendation, OrphanDuplicate } from "@/types/orphanTypes";
import { cn } from "@/lib/utils";

interface ModuleGroup {
  moduleCode: string;
  moduleName: string;
  orphans: OrphanEntry[];
  count: number;
  recommendations: {
    keep: number;
    archive: number;
    delete: number;
    merge: number;
    review: number;
  };
}

interface OrphanModuleAccordionProps {
  moduleGroups: ModuleGroup[];
  selectedOrphans: Set<string>;
  onToggleSelection: (id: string) => void;
  onArchive: (orphan: OrphanEntry) => void;
  onDelete: (orphan: OrphanEntry) => void;
  onViewDuplicate: (duplicate: OrphanDuplicate) => void;
  duplicates: OrphanDuplicate[];
  getRecommendationBadge: (recommendation: OrphanRecommendation) => React.ReactNode;
  getSourceBadge: (source: OrphanSource) => React.ReactNode;
}

export function OrphanModuleAccordion({
  moduleGroups,
  selectedOrphans,
  onToggleSelection,
  onArchive,
  onDelete,
  onViewDuplicate,
  duplicates,
  getRecommendationBadge,
  getSourceBadge
}: OrphanModuleAccordionProps) {
  const handlePreviewRoute = (routePath: string | null) => {
    if (routePath) {
      window.open(routePath, '_blank');
    }
  };
  
  // Find duplicate info for an orphan
  const findDuplicateForOrphan = (orphan: OrphanEntry): OrphanDuplicate | null => {
    if (!orphan.hasDuplicate) return null;
    return duplicates.find(d => 
      d.entries.some(e => e.id === orphan.id) ||
      d.featureName.toLowerCase() === orphan.featureName.toLowerCase()
    ) || null;
  };
  
  const handleDuplicateClick = (orphan: OrphanEntry) => {
    const duplicate = findDuplicateForOrphan(orphan);
    if (duplicate) {
      onViewDuplicate(duplicate);
    }
  };

  return (
    <Accordion type="multiple" className="space-y-2">
      {moduleGroups.map(group => (
        <AccordionItem 
          key={group.moduleCode} 
          value={group.moduleCode}
          className="border rounded-lg"
        >
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{group.moduleName}</span>
                <Badge variant="secondary">{group.count} orphans</Badge>
              </div>
              <div className="flex gap-2">
                {group.recommendations.keep > 0 && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                    Keep: {group.recommendations.keep}
                  </Badge>
                )}
                {group.recommendations.archive > 0 && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
                    Archive: {group.recommendations.archive}
                  </Badge>
                )}
                {group.recommendations.delete > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                    Delete: {group.recommendations.delete}
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Feature Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.orphans.map(orphan => (
                    <TableRow 
                      key={orphan.id}
                      className={cn(selectedOrphans.has(orphan.id) && "bg-muted")}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedOrphans.has(orphan.id)}
                          onChange={() => onToggleSelection(orphan.id)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {orphan.featureCode}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">
                            {orphan.featureName}
                          </p>
                          {orphan.hasDuplicate && orphan.duplicateOf && orphan.duplicateOf.length > 0 ? (
                            <button
                              onClick={() => handleDuplicateClick(orphan)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer mt-1"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Duplicate found: {orphan.duplicateOf[0]} - Click for details</span>
                            </button>
                          ) : (
                            <p className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                              {orphan.recommendationReason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {orphan.routePath ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-mono text-xs h-auto py-1 px-2"
                            onClick={() => handlePreviewRoute(orphan.routePath)}
                          >
                            {orphan.routePath}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">No route</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getSourceBadge(orphan.source)}
                      </TableCell>
                      <TableCell>
                        {getRecommendationBadge(orphan.recommendation)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onArchive(orphan)}
                            title="Archive (soft delete)"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => onDelete(orphan)}
                            title="Delete permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

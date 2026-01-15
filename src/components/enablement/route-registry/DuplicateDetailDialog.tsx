import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Archive,
  Trash2,
  ExternalLink,
  GitMerge,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Copy
} from "lucide-react";
import { OrphanEntry, DuplicateAnalysis, OrphanDuplicate } from "@/types/orphanTypes";
import { analyzeDuplicate } from "@/hooks/useDuplicateAnalysis";
import { cn } from "@/lib/utils";

interface DuplicateDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicate: OrphanDuplicate | null;
  onArchive: (orphan: OrphanEntry) => void;
  onDelete: (orphan: OrphanEntry) => void;
}

export function DuplicateDetailDialog({
  open,
  onOpenChange,
  duplicate,
  onArchive,
  onDelete
}: DuplicateDetailDialogProps) {
  if (!duplicate) return null;
  
  const analysis = analyzeDuplicate(duplicate);
  
  const getRecommendationColor = () => {
    switch (analysis.recommendation) {
      case 'keep_both': return 'bg-green-50 border-green-200 text-green-800';
      case 'merge': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'rename_one': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'review': return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };
  
  const getRecommendationIcon = () => {
    switch (analysis.recommendation) {
      case 'keep_both': return <CheckCircle2 className="h-4 w-4" />;
      case 'merge': return <GitMerge className="h-4 w-4" />;
      case 'rename_one': return <ArrowRight className="h-4 w-4" />;
      case 'review': return <AlertTriangle className="h-4 w-4" />;
    }
  };
  
  const getRecommendationLabel = () => {
    switch (analysis.recommendation) {
      case 'keep_both': return 'Keep Both';
      case 'merge': return 'Merge (Delete Duplicates)';
      case 'rename_one': return 'Rename One';
      case 'review': return 'Needs Review';
    }
  };
  
  const handlePreviewRoute = (routePath: string | null) => {
    if (routePath) {
      window.open(routePath, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicate Analysis: "{duplicate.featureName}"
          </DialogTitle>
          <DialogDescription>
            {duplicate.entries.length} entries found with this name
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Recommendation Banner */}
            <Alert className={cn("border-2", getRecommendationColor())}>
              <div className="flex items-start gap-3">
                {getRecommendationIcon()}
                <div className="flex-1">
                  <AlertTitle className="flex items-center gap-2">
                    Recommendation: {getRecommendationLabel()}
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p>{analysis.reason}</p>
                    <p className="font-medium">{analysis.suggestedAction}</p>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
            
            {/* Differences Summary */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={analysis.differences.hasDifferentModules ? "default" : "secondary"}>
                <Layers className="h-3 w-3 mr-1" />
                {analysis.differences.hasDifferentModules 
                  ? `${analysis.differences.moduleList.length} Different Modules` 
                  : 'Same Module'}
              </Badge>
              <Badge variant={analysis.differences.hasDifferentRoutePatterns ? "default" : "secondary"}>
                {analysis.differences.hasDifferentRoutePatterns 
                  ? `${analysis.differences.routePatternList.length} Different Routes` 
                  : 'Same Route Pattern'}
              </Badge>
              <Badge variant={analysis.differences.hasDifferentDescriptions ? "default" : "secondary"}>
                {analysis.differences.hasDifferentDescriptions 
                  ? 'Different Descriptions' 
                  : 'Similar Descriptions'}
              </Badge>
            </div>
            
            <Separator />
            
            {/* Side by Side Comparison */}
            <div>
              <h4 className="font-medium mb-3">Entry Comparison</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Feature Code</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Route Path</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duplicate.entries.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {index + 1}
                        {entry.featureCode === duplicate.suggestedPrimary && (
                          <Badge variant="secondary" className="ml-2 text-xs">Primary</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.featureCode}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.moduleCode || 'unassigned'}</Badge>
                      </TableCell>
                      <TableCell>
                        {entry.routePath ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-mono text-xs h-auto py-1 px-2"
                            onClick={() => handlePreviewRoute(entry.routePath)}
                          >
                            {entry.routePath}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">No route</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {entry.source.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
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
            </div>
            
            <Separator />
            
            {/* Detailed Entry Cards */}
            <div>
              <h4 className="font-medium mb-3">Detailed View</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {duplicate.entries.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-bold">
                        Entry {index + 1}
                      </Badge>
                      {entry.featureCode === duplicate.suggestedPrimary && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Suggested Primary
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Feature Code:</span>
                        <span className="col-span-2 font-mono">{entry.featureCode}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Module:</span>
                        <span className="col-span-2">{entry.moduleName || entry.moduleCode || 'Unassigned'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Route:</span>
                        <span className="col-span-2 font-mono text-xs">
                          {entry.routePath || 'No route defined'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="col-span-2 text-xs">
                          {entry.description || 'No description'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Source:</span>
                        <span className="col-span-2 capitalize">{entry.source.replace('_', ' ')}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="col-span-2">{entry.createdAt.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      {entry.routePath && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewRoute(entry.routePath)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Route
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onArchive(entry)}
                      >
                        <Archive className="h-3 w-3 mr-1" />
                        Archive
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(entry)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

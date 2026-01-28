import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Undo2, User, Calendar, MessageSquare, Info, Archive, Trash2, Database } from "lucide-react";
import { OrphanEntry } from "@/types/orphanTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KeptEntriesPanelProps {
  keptEntries: OrphanEntry[];
  onUndoKeep: (orphanId: string) => Promise<void>;
  onArchive: (orphan: OrphanEntry) => void;
  onDelete: (orphan: OrphanEntry) => void;
  isProcessing: boolean;
}

export function KeptEntriesPanel({
  keptEntries,
  onUndoKeep,
  onArchive,
  onDelete,
  isProcessing
}: KeptEntriesPanelProps) {
  if (keptEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Reviewed & Kept Features
          </CardTitle>
          <CardDescription>
            Features that have been reviewed and intentionally retained in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No features have been marked as "Kept" yet. When you review orphaned entries 
              and decide to retain them, they will appear here with their audit trail.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Reviewed & Kept Features
        </CardTitle>
        <CardDescription>
          {keptEntries.length} feature(s) reviewed and intentionally retained in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {keptEntries.map(entry => (
              <div 
                key={entry.id}
                className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-green-50/50 border-green-200"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="font-mono">
                      {entry.featureCode}
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Kept
                    </Badge>
                    {entry.moduleCode && (
                      <Badge variant="outline" className="text-xs">
                        {entry.moduleCode}
                      </Badge>
                    )}
                    {entry.createdByName ? (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <User className="h-3 w-3 mr-1" />
                        Created by {entry.createdByName}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-muted">
                        <Database className="h-3 w-3 mr-1" />
                        {entry.source === 'auto_migration' ? 'Migration' : 
                         entry.source === 'manual_entry' ? 'Manual' :
                         entry.source === 'registry' ? 'Registry' : 'System'}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium">{entry.featureName}</p>
                  
                  {entry.routePath && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {entry.routePath}
                    </p>
                  )}
                  
                  {entry.reviewNotes && (
                    <div className="flex items-start gap-2 mt-2 p-2 rounded bg-white border">
                      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm italic text-muted-foreground">
                        "{entry.reviewNotes}"
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    {entry.reviewedBy && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Reviewed by user
                      </span>
                    )}
                    {entry.reviewedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(entry.reviewedAt, 'PPP')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUndoKeep(entry.id)}
                    disabled={isProcessing}
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Undo
                  </Button>
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
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

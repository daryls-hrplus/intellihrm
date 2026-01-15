import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Wrench, Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { FixPreview } from "@/hooks/useValidationFixer";
import { cn } from "@/lib/utils";

interface FixPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: FixPreview | null;
  isFixing: boolean;
  onConfirm: () => void;
}

export function FixPreviewDialog({
  open,
  onOpenChange,
  preview,
  isFixing,
  onConfirm
}: FixPreviewDialogProps) {
  if (!preview) return null;

  const hasFeaturesToCreate = preview.featuresToCreate.length > 0;
  const hasTasksToUpdate = preview.tasksToUpdate > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Fix Preview
          </DialogTitle>
          <DialogDescription>
            Review the changes that will be made to fix validation issues
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4 text-green-600" />
                <span className="font-medium">Features to Create</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {preview.featuresToCreate.length}
              </p>
              <p className="text-xs text-muted-foreground">
                New application_features entries
              </p>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Tasks to Update</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {preview.tasksToUpdate}
              </p>
              <p className="text-xs text-muted-foreground">
                implementation_tasks with feature_code
              </p>
            </div>
          </div>

          {/* Features to Create List */}
          {hasFeaturesToCreate && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Features
              </h4>
              <ScrollArea className="h-[150px] rounded-lg border">
                <div className="p-3 space-y-2">
                  {preview.featuresToCreate.map((feature, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {feature.generatedFeatureCode}
                        </code>
                        <p className="text-xs text-muted-foreground truncate">
                          {feature.adminRoute}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {feature.area}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Legacy Tasks List */}
          {hasTasksToUpdate && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Tasks to Migrate
              </h4>
              <ScrollArea className="h-[150px] rounded-lg border">
                <div className="p-3 space-y-2">
                  {preview.legacyTasks.slice(0, 20).map((task, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs">{task.area}</span>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {task.adminRoute}
                        </p>
                      </div>
                      {task.matchingFeatureCode ? (
                        <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700">
                          Has match
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-50 text-yellow-700">
                          Will create
                        </Badge>
                      )}
                    </div>
                  ))}
                  {preview.legacyTasks.length > 20 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      ... and {preview.legacyTasks.length - 20} more
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Warning */}
          {hasTasksToUpdate && (
            <div className={cn(
              "flex items-start gap-2 rounded-lg p-3",
              "bg-warning/10 border border-warning/30"
            )}>
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">This will modify your database</p>
                <p className="text-muted-foreground">
                  Features will be created in application_features and tasks will be updated with feature_codes.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isFixing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isFixing || !preview.canAutoFix}>
            {isFixing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fixing...
              </>
            ) : (
              <>
                <Wrench className="h-4 w-4 mr-2" />
                Fix All Issues
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

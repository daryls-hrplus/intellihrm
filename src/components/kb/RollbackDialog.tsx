// Rollback dialog for restoring previous article versions

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RotateCcw, AlertTriangle, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { ArticleVersion } from "@/services/kb/types";

interface RollbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetVersion: ArticleVersion | null;
  currentVersion: ArticleVersion | null;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function RollbackDialog({
  open,
  onOpenChange,
  targetVersion,
  currentVersion,
  onConfirm,
  isLoading,
}: RollbackDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason("");
  };

  if (!targetVersion || !currentVersion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Rollback Article
          </DialogTitle>
          <DialogDescription>
            This will create a new version with the content from the selected version.
            The rollback will go through the approval workflow before publishing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current version info */}
          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <FileText className="h-4 w-4" />
              Current Version
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">v{currentVersion.version_number}</Badge>
              <span className="text-sm text-muted-foreground">
                {currentVersion.title}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Target version info */}
          <div className="p-3 rounded-lg border border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <Calendar className="h-4 w-4" />
              Restore to Version
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500 text-amber-700">
                v{targetVersion.version_number}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(targetVersion.created_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            {targetVersion.change_summary && (
              <p className="text-sm text-muted-foreground mt-2">
                {targetVersion.change_summary}
              </p>
            )}
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will create a new draft version (v{currentVersion.major_version}.{currentVersion.minor_version}.{currentVersion.patch_version + 1}) 
              with the content from v{targetVersion.version_number}. 
              No content will be lost - all versions are preserved.
            </AlertDescription>
          </Alert>

          {/* Reason input */}
          <div className="space-y-2">
            <Label htmlFor="rollback-reason">
              Rollback Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rollback-reason"
              placeholder="Explain why you're rolling back to this version..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This reason will be recorded in the version history for audit purposes.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? (
              <>Creating Rollback...</>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Create Rollback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { CheckCircle, Loader2 } from "lucide-react";
import { OrphanEntry } from "@/types/orphanTypes";

interface KeepActionDialogProps {
  open: boolean;
  orphan?: OrphanEntry;
  count?: number;
  isProcessing: boolean;
  onConfirm: (notes?: string) => Promise<void>;
  onCancel: () => void;
}

export function KeepActionDialog({
  open,
  orphan,
  count,
  isProcessing,
  onConfirm,
  onCancel
}: KeepActionDialogProps) {
  const [notes, setNotes] = useState("");
  
  const isBulk = count !== undefined && count > 0;
  
  const handleConfirm = async () => {
    await onConfirm(notes.trim() || undefined);
    setNotes("");
  };

  const handleCancel = () => {
    setNotes("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {isBulk 
              ? `Mark ${count} Feature(s) as Reviewed & Kept`
              : "Mark as Reviewed & Keep"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? "These entries will be marked as intentionally retained and excluded from future orphan scans."
              : "This entry will be marked as intentionally retained and excluded from future orphan scans."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isBulk && orphan && (
            <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Feature Code:</span>
                <Badge variant="secondary" className="font-mono">
                  {orphan.featureCode}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Name:</span>
                <span className="text-sm">{orphan.featureName}</span>
              </div>
              {orphan.routePath && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Route:</span>
                  <span className="font-mono text-xs">{orphan.routePath}</span>
                </div>
              )}
            </div>
          )}

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {isBulk
                ? `${count} feature(s) will be retained. You can undo this action later from the "Kept" tab.`
                : "This feature will be retained in the database. You can undo this action later from the \"Kept\" tab."}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="keep-notes">Reason for keeping (optional)</Label>
            <Textarea
              id="keep-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Planned for Q3 release, required for compliance reporting..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This note will be recorded in the audit trail.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Kept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

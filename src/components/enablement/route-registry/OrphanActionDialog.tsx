import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Archive, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { OrphanEntry } from "@/types/orphanTypes";

interface OrphanActionDialogProps {
  open: boolean;
  type: 'archive' | 'delete' | 'archive_bulk' | 'delete_bulk';
  orphan?: OrphanEntry;
  count?: number;
  isProcessing: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function OrphanActionDialog({
  open,
  type,
  orphan,
  count,
  isProcessing,
  onConfirm,
  onCancel
}: OrphanActionDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  
  const isDelete = type === 'delete' || type === 'delete_bulk';
  const isBulk = type === 'archive_bulk' || type === 'delete_bulk';
  const requiresTyping = isBulk && isDelete && (count ?? 0) > 5;
  const canConfirm = !requiresTyping || confirmText === "DELETE";

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await onConfirm();
    setConfirmText("");
  };

  const handleCancel = () => {
    setConfirmText("");
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isDelete ? (
              <Trash2 className="h-5 w-5 text-destructive" />
            ) : (
              <Archive className="h-5 w-5 text-yellow-600" />
            )}
            {isBulk 
              ? `${isDelete ? 'Delete' : 'Archive'} ${count} Orphan(s)`
              : `${isDelete ? 'Delete' : 'Archive'} Feature`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {!isBulk && orphan && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Feature Code:</span>
                    <Badge variant="secondary" className="font-mono">
                      {orphan.featureCode}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{orphan.featureName}</span>
                  </div>
                  {orphan.routePath && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Route:</span>
                      <span className="font-mono text-sm">{orphan.routePath}</span>
                    </div>
                  )}
                </div>
              )}

              {isDelete ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {isBulk 
                      ? `This will permanently delete ${count} feature(s) from the database. This action cannot be undone.`
                      : "This will permanently delete this feature from the database. This action cannot be undone."}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <Archive className="h-4 w-4" />
                  <AlertDescription>
                    {isBulk
                      ? `This will archive ${count} feature(s) by setting them as inactive. They can be restored later if needed.`
                      : "This will archive this feature by setting it as inactive. It can be restored later if needed."}
                  </AlertDescription>
                </Alert>
              )}

              {requiresTyping && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Type "DELETE" to confirm bulk deletion:
                  </p>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="Type DELETE to confirm"
                    className="font-mono"
                  />
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isProcessing}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm || isProcessing}
            className={isDelete ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isDelete ? 'Delete' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

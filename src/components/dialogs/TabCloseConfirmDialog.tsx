import React from "react";
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
import { WorkspaceTab } from "@/contexts/TabContext";
import { FileWarning } from "lucide-react";

interface TabCloseConfirmDialogProps {
  open: boolean;
  tab: WorkspaceTab | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog for closing a tab with unsaved changes.
 * 
 * Replaces the browser's native confirm() dialog with a branded,
 * accessible modal.
 */
export function TabCloseConfirmDialog({
  open,
  tab,
  onConfirm,
  onCancel,
}: TabCloseConfirmDialogProps) {
  if (!tab) return null;

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <FileWarning className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            You have unsaved changes in "{tab.title}". 
            Closing this tab will discard your changes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Keep Open
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Discard & Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

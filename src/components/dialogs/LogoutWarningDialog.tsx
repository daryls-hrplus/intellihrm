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
import { AlertTriangle } from "lucide-react";

interface LogoutWarningDialogProps {
  open: boolean;
  tabsWithChanges: WorkspaceTab[];
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Warning dialog shown when user attempts to logout with unsaved changes.
 * 
 * Enterprise standard: Workday, Salesforce pattern - always warn before
 * discarding user work.
 */
export function LogoutWarningDialog({
  open,
  tabsWithChanges,
  onConfirm,
  onCancel,
}: LogoutWarningDialogProps) {
  const tabCount = tabsWithChanges.length;
  const tabNames = tabsWithChanges.map(t => t.title);

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            You have unsaved changes in {tabCount} tab{tabCount > 1 ? "s" : ""}. 
            Logging out will discard these changes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {tabNames.length > 0 && (
          <div className="my-2 rounded-md border border-border bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Tabs with unsaved changes:
            </p>
            <ul className="space-y-1">
              {tabNames.map((name, index) => (
                <li key={index} className="text-sm text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Discard & Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

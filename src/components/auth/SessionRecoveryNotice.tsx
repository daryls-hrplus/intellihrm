import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SessionRecoveryNoticeProps {
  restoredTabCount: number;
  hadUnsavedChanges: boolean;
}

/**
 * Component that shows a toast notification when session is recovered.
 * 
 * Displays appropriate messaging based on whether there were unsaved
 * changes that may have been lost due to session timeout.
 */
export function SessionRecoveryNotice({
  restoredTabCount,
  hadUnsavedChanges,
}: SessionRecoveryNoticeProps) {
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (hasShown || restoredTabCount === 0) return;

    // Small delay to ensure app is ready
    const timer = setTimeout(() => {
      if (hadUnsavedChanges) {
        toast.warning("Session Restored", {
          description: `${restoredTabCount} tab${restoredTabCount > 1 ? "s" : ""} recovered. Some changes may not have been saved due to session timeout.`,
          duration: 6000,
        });
      } else {
        toast.success("Session Restored", {
          description: `${restoredTabCount} tab${restoredTabCount > 1 ? "s" : ""} recovered.`,
          duration: 4000,
        });
      }
      setHasShown(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [restoredTabCount, hadUnsavedChanges, hasShown]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Hook version for programmatic usage
 */
export function useSessionRecoveryNotice() {
  const showRecoveryNotice = (tabCount: number, hadUnsavedChanges: boolean) => {
    if (tabCount === 0) return;

    if (hadUnsavedChanges) {
      toast.warning("Session Restored", {
        description: `${tabCount} tab${tabCount > 1 ? "s" : ""} recovered. Some changes may not have been saved due to session timeout.`,
        duration: 6000,
      });
    } else {
      toast.success("Session Restored", {
        description: `${tabCount} tab${tabCount > 1 ? "s" : ""} recovered.`,
        duration: 4000,
      });
    }
  };

  return { showRecoveryNotice };
}

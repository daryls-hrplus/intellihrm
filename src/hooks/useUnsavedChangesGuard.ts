import { useEffect, useCallback } from "react";
import { useTabContext } from "@/contexts/TabContext";

export function useUnsavedChangesGuard() {
  const { activeTabId, setUnsavedChanges, getActiveTab } = useTabContext();

  /**
   * Mark the current tab as having unsaved changes
   */
  const markDirty = useCallback(() => {
    if (activeTabId) {
      setUnsavedChanges(activeTabId, true);
    }
  }, [activeTabId, setUnsavedChanges]);

  /**
   * Mark the current tab as clean (no unsaved changes)
   */
  const markClean = useCallback(() => {
    if (activeTabId) {
      setUnsavedChanges(activeTabId, false);
    }
  }, [activeTabId, setUnsavedChanges]);

  /**
   * Check if current tab has unsaved changes
   */
  const hasUnsavedChanges = useCallback((): boolean => {
    const activeTab = getActiveTab();
    return activeTab?.hasUnsavedChanges ?? false;
  }, [getActiveTab]);

  // Warn on page unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const activeTab = getActiveTab();
      if (activeTab?.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [getActiveTab]);

  return {
    markDirty,
    markClean,
    hasUnsavedChanges,
  };
}

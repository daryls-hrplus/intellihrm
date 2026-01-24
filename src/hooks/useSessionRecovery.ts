import { useEffect, useRef, useCallback } from "react";
import { useTabContext } from "@/contexts/TabContext";
import { useSessionRecoveryNotice } from "@/components/auth/SessionRecoveryNotice";

const STORAGE_KEY = "hrplus_workspace_tabs";
const SESSION_METADATA_KEY = "hrplus_session_metadata";

interface SessionMetadata {
  lastSaveTimestamp: number;
  tabCount: number;
  hadUnsavedChanges: boolean;
}

/**
 * Hook to detect and handle session recovery scenarios.
 * 
 * Monitors session storage for previously saved tabs and displays
 * appropriate notifications when tabs are restored after:
 * - Page refresh
 * - Session timeout and re-login
 * - Browser crash recovery
 * 
 * @example
 * ```typescript
 * // Use in ProtectedLayout or similar authenticated wrapper
 * useSessionRecovery();
 * ```
 */
export function useSessionRecovery() {
  const { tabs } = useTabContext();
  const { showRecoveryNotice } = useSessionRecoveryNotice();
  const hasShownNotice = useRef(false);
  const initialTabCount = useRef<number | null>(null);

  // Track initial tab count on mount (from restored session)
  useEffect(() => {
    if (initialTabCount.current === null) {
      // Check if this is a session recovery by looking at metadata
      const metadataJson = sessionStorage.getItem(SESSION_METADATA_KEY);
      
      if (metadataJson) {
        try {
          const metadata: SessionMetadata = JSON.parse(metadataJson);
          
          // If we have metadata and tabs were restored
          if (tabs.length > 1 && !hasShownNotice.current) {
            // Count non-dashboard tabs
            const restoredCount = tabs.filter(t => !t.isPinned).length;
            
            if (restoredCount > 0) {
              showRecoveryNotice(restoredCount, metadata.hadUnsavedChanges);
              hasShownNotice.current = true;
            }
          }
          
          // Clear metadata after processing
          sessionStorage.removeItem(SESSION_METADATA_KEY);
        } catch (e) {
          console.error("Failed to parse session metadata:", e);
        }
      }
      
      initialTabCount.current = tabs.length;
    }
  }, [tabs, showRecoveryNotice]);

  // Save session metadata before potential session loss
  const saveSessionMetadata = useCallback(() => {
    const metadata: SessionMetadata = {
      lastSaveTimestamp: Date.now(),
      tabCount: tabs.filter(t => !t.isPinned).length,
      hadUnsavedChanges: tabs.some(t => t.hasUnsavedChanges),
    };
    
    sessionStorage.setItem(SESSION_METADATA_KEY, JSON.stringify(metadata));
  }, [tabs]);

  // Save metadata periodically and before unload
  useEffect(() => {
    // Save on visibility change (when user switches tabs or minimizes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveSessionMetadata();
      }
    };

    // Save before page unload
    const handleBeforeUnload = () => {
      saveSessionMetadata();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Also save periodically (every 30 seconds)
    const interval = setInterval(saveSessionMetadata, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(interval);
    };
  }, [saveSessionMetadata]);

  return {
    saveSessionMetadata,
  };
}

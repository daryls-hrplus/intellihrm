import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTabContext, WorkspaceTab, DASHBOARD_TAB_ID } from "@/contexts/TabContext";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "hrplus_workspace_tabs";

interface UseLogoutWithTabValidationReturn {
  /**
   * Initiate logout - will show warning if unsaved changes exist
   */
  logout: () => void;
  /**
   * Whether the warning dialog should be shown
   */
  showWarning: boolean;
  /**
   * List of tabs with unsaved changes
   */
  tabsWithChanges: WorkspaceTab[];
  /**
   * Confirm logout and proceed (discards unsaved changes)
   */
  confirmLogout: () => Promise<void>;
  /**
   * Cancel the logout action
   */
  cancelLogout: () => void;
}

/**
 * Hook for handling logout with unsaved changes validation.
 * 
 * Checks all open tabs for unsaved changes before logging out.
 * If any tabs have unsaved changes, presents a warning dialog.
 * 
 * Enterprise standard: Workday, Salesforce pattern
 * 
 * @example
 * ```typescript
 * const { logout, showWarning, tabsWithChanges, confirmLogout, cancelLogout } = useLogoutWithTabValidation();
 * 
 * // In logout button
 * <Button onClick={logout}>Logout</Button>
 * 
 * // Render warning dialog
 * <LogoutWarningDialog
 *   open={showWarning}
 *   tabsWithChanges={tabsWithChanges}
 *   onConfirm={confirmLogout}
 *   onCancel={cancelLogout}
 * />
 * ```
 */
export function useLogoutWithTabValidation(): UseLogoutWithTabValidationReturn {
  const { tabs, closeAllExcept } = useTabContext();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const [showWarning, setShowWarning] = useState(false);
  const [tabsWithChanges, setTabsWithChanges] = useState<WorkspaceTab[]>([]);

  const clearTabStorage = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(`${STORAGE_KEY}_active`);
  }, []);

  const executeLogout = useCallback(async () => {
    // Clear tab storage before logout
    clearTabStorage();
    
    // Close all tabs except dashboard
    closeAllExcept(DASHBOARD_TAB_ID);
    
    // Sign out
    await signOut();
    
    // Navigate to login
    navigate("/auth/login", { replace: true });
  }, [clearTabStorage, closeAllExcept, signOut, navigate]);

  const logout = useCallback(() => {
    // Check for tabs with unsaved changes
    const unsavedTabs = tabs.filter(t => t.hasUnsavedChanges && !t.isPinned);
    
    if (unsavedTabs.length > 0) {
      setTabsWithChanges(unsavedTabs);
      setShowWarning(true);
      return;
    }
    
    // No unsaved changes, proceed immediately
    executeLogout();
  }, [tabs, executeLogout]);

  const confirmLogout = useCallback(async () => {
    setShowWarning(false);
    setTabsWithChanges([]);
    await executeLogout();
  }, [executeLogout]);

  const cancelLogout = useCallback(() => {
    setShowWarning(false);
    setTabsWithChanges([]);
  }, []);

  return {
    logout,
    showWarning,
    tabsWithChanges,
    confirmLogout,
    cancelLogout,
  };
}

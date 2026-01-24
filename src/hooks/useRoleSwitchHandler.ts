import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTabContext, DASHBOARD_TAB_ID } from "@/contexts/TabContext";
import { useTabPermissionValidator } from "./useTabPermissionValidator";
import { useTabsClosedNotice } from "@/components/auth/TabsClosedNotice";

interface ModulePermission {
  moduleCode: string;
  canView: boolean;
}

interface UseRoleSwitchHandlerReturn {
  /**
   * Handle role switch - validates tabs and closes unauthorized ones
   */
  handleRoleSwitch: (newPermissions: ModulePermission[]) => void;
  /**
   * Handle company context switch - validates tabs for new company
   */
  handleCompanySwitch: (companyId: string, allowedCompanyIds: string[]) => void;
  /**
   * List of tab names that were closed in the last switch
   */
  closedTabNames: string[];
  /**
   * Clear the closed tabs notice
   */
  clearClosedTabs: () => void;
}

/**
 * Hook for handling role and company context switches.
 * 
 * Automatically validates all open tabs when context changes and closes
 * any tabs the user no longer has permission to access.
 * 
 * Enterprise pattern: Matches Workday/Salesforce behavior where switching
 * roles immediately revalidates the workspace.
 * 
 * @example
 * ```typescript
 * const { handleRoleSwitch, handleCompanySwitch } = useRoleSwitchHandler();
 * 
 * // When role changes
 * handleRoleSwitch(newPermissions);
 * 
 * // When company context changes
 * handleCompanySwitch(newCompanyId, userAllowedCompanyIds);
 * ```
 */
export function useRoleSwitchHandler(): UseRoleSwitchHandlerReturn {
  const { focusTab } = useTabContext();
  const { validateTabsForPermissions, validateTabsForCompany, closeInvalidTabs } = useTabPermissionValidator();
  const { showTabsClosedNotice } = useTabsClosedNotice();
  const navigate = useNavigate();
  
  const [closedTabNames, setClosedTabNames] = useState<string[]>([]);

  const handleRoleSwitch = useCallback((newPermissions: ModulePermission[]) => {
    const { invalidTabs } = validateTabsForPermissions(newPermissions);
    
    if (invalidTabs.length > 0) {
      const names = closeInvalidTabs(invalidTabs);
      setClosedTabNames(names);
      showTabsClosedNotice(names);
      
      // Navigate to dashboard
      focusTab(DASHBOARD_TAB_ID);
      navigate("/dashboard");
    }
  }, [validateTabsForPermissions, closeInvalidTabs, focusTab, navigate, showTabsClosedNotice]);

  const handleCompanySwitch = useCallback((companyId: string, allowedCompanyIds: string[]) => {
    const { invalidTabs } = validateTabsForCompany(companyId, allowedCompanyIds);
    
    if (invalidTabs.length > 0) {
      const names = closeInvalidTabs(invalidTabs);
      setClosedTabNames(names);
      showTabsClosedNotice(names);
      
      // Navigate to dashboard
      focusTab(DASHBOARD_TAB_ID);
      navigate("/dashboard");
    }
  }, [validateTabsForCompany, closeInvalidTabs, focusTab, navigate, showTabsClosedNotice]);

  const clearClosedTabs = useCallback(() => {
    setClosedTabNames([]);
  }, []);

  return {
    handleRoleSwitch,
    handleCompanySwitch,
    closedTabNames,
    clearClosedTabs,
  };
}

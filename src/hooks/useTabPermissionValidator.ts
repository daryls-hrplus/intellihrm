import { useCallback } from "react";
import { useTabContext, WorkspaceTab, DASHBOARD_TAB_ID } from "@/contexts/TabContext";

interface TabValidationResult {
  /**
   * Tabs that remain accessible under new permissions
   */
  validTabs: WorkspaceTab[];
  /**
   * Tabs that should be closed due to permission changes
   */
  invalidTabs: WorkspaceTab[];
}

interface ModulePermission {
  moduleCode: string;
  canView: boolean;
}

/**
 * Hook for validating tab permissions when role or company context changes.
 * 
 * Enterprise pattern: When user switches roles or companies, validates all
 * open tabs and identifies which ones should be closed due to permission changes.
 * 
 * @example
 * ```typescript
 * const { validateTabsForPermissions, closeInvalidTabs } = useTabPermissionValidator();
 * 
 * // On role change
 * const { invalidTabs } = validateTabsForPermissions(newPermissions);
 * if (invalidTabs.length > 0) {
 *   closeInvalidTabs(invalidTabs);
 *   toast.info(`${invalidTabs.length} tabs closed due to permission changes`);
 * }
 * ```
 */
export function useTabPermissionValidator() {
  const { tabs, closeTab, focusTab } = useTabContext();

  /**
   * Validate tabs against a set of module permissions
   */
  const validateTabsForPermissions = useCallback((
    permissions: ModulePermission[]
  ): TabValidationResult => {
    const validTabs: WorkspaceTab[] = [];
    const invalidTabs: WorkspaceTab[] = [];

    const permissionMap = new Map(
      permissions.map(p => [p.moduleCode, p.canView])
    );

    tabs.forEach(tab => {
      // Pinned tabs (like Dashboard) are always valid
      if (tab.isPinned) {
        validTabs.push(tab);
        return;
      }

      // Check if module is accessible
      const hasAccess = permissionMap.get(tab.moduleCode) ?? false;
      
      if (hasAccess) {
        validTabs.push(tab);
      } else {
        invalidTabs.push(tab);
      }
    });

    return { validTabs, invalidTabs };
  }, [tabs]);

  /**
   * Validate tabs for a specific company context
   */
  const validateTabsForCompany = useCallback((
    companyId: string,
    allowedCompanyIds: string[]
  ): TabValidationResult => {
    const validTabs: WorkspaceTab[] = [];
    const invalidTabs: WorkspaceTab[] = [];

    const isAllowed = allowedCompanyIds.includes(companyId);

    tabs.forEach(tab => {
      if (tab.isPinned) {
        validTabs.push(tab);
        return;
      }

      // If tab has a context that's company-scoped, validate it
      if (tab.contextType === "company" && tab.contextId) {
        if (isAllowed && tab.contextId === companyId) {
          validTabs.push(tab);
        } else if (!isAllowed) {
          invalidTabs.push(tab);
        } else {
          validTabs.push(tab);
        }
      } else {
        // Non-company-scoped tabs remain valid
        validTabs.push(tab);
      }
    });

    return { validTabs, invalidTabs };
  }, [tabs]);

  /**
   * Close invalid tabs and focus dashboard
   */
  const closeInvalidTabs = useCallback((invalidTabs: WorkspaceTab[]) => {
    invalidTabs.forEach(tab => {
      closeTab(tab.id);
    });

    // Focus dashboard after closing invalid tabs
    if (invalidTabs.length > 0) {
      focusTab(DASHBOARD_TAB_ID);
    }

    return invalidTabs.map(t => t.title);
  }, [closeTab, focusTab]);

  return {
    validateTabsForPermissions,
    validateTabsForCompany,
    closeInvalidTabs,
  };
}

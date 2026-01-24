import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { useTabContext, OpenTabConfig } from "@/contexts/TabContext";

interface NavigateToTabConfig {
  route: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  moduleCode: string;
  contextId?: string;
  contextType?: string;
  forceNew?: boolean;
}

export function useWorkspaceNavigation() {
  const navigate = useNavigate();
  const { openTab, focusTab, findTabByContext, tabs } = useTabContext();

  /**
   * Navigate to a new or existing tab
   * - If a tab with the same contextType and contextId exists, focus it
   * - Otherwise, open a new tab
   */
  const navigateToTab = useCallback((config: NavigateToTabConfig) => {
    // Check for existing tab with same context
    if (config.contextType && config.contextId && !config.forceNew) {
      const existingTab = findTabByContext(config.contextType, config.contextId);
      if (existingTab) {
        focusTab(existingTab.id);
        navigate(existingTab.route);
        return existingTab.id;
      }
    }

    // Check for existing tab with same route (non-context pages)
    if (!config.contextId && !config.forceNew) {
      const existingTab = tabs.find(t => t.route === config.route && !t.contextId);
      if (existingTab) {
        focusTab(existingTab.id);
        navigate(existingTab.route);
        return existingTab.id;
      }
    }

    // Open new tab
    const tabId = openTab({
      route: config.route,
      title: config.title,
      subtitle: config.subtitle,
      icon: config.icon,
      moduleCode: config.moduleCode,
      contextId: config.contextId,
      contextType: config.contextType,
      forceNew: config.forceNew,
    });

    navigate(config.route);
    return tabId;
  }, [navigate, openTab, focusTab, findTabByContext, tabs]);

  /**
   * Navigate to a list/dashboard page as a new tab
   */
  const navigateToList = useCallback((config: {
    route: string;
    title: string;
    moduleCode: string;
    icon?: LucideIcon;
  }) => {
    return navigateToTab({
      route: config.route,
      title: config.title,
      moduleCode: config.moduleCode,
      icon: config.icon,
    });
  }, [navigateToTab]);

  /**
   * Navigate to a record detail page
   */
  const navigateToRecord = useCallback((config: {
    route: string;
    title: string;
    subtitle: string;
    moduleCode: string;
    contextType: string;
    contextId: string;
    icon?: LucideIcon;
    forceNew?: boolean;
  }) => {
    return navigateToTab({
      route: config.route,
      title: config.title,
      subtitle: config.subtitle,
      moduleCode: config.moduleCode,
      contextType: config.contextType,
      contextId: config.contextId,
      icon: config.icon,
      forceNew: config.forceNew,
    });
  }, [navigateToTab]);

  /**
   * Navigate to a setup/configuration page
   */
  const navigateToSetup = useCallback((config: {
    route: string;
    title: string;
    moduleCode: string;
    icon?: LucideIcon;
  }) => {
    return navigateToTab({
      route: config.route,
      title: config.title,
      subtitle: "Setup",
      moduleCode: config.moduleCode,
      icon: config.icon,
    });
  }, [navigateToTab]);

  return {
    navigateToTab,
    navigateToList,
    navigateToRecord,
    navigateToSetup,
  };
}

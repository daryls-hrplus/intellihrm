import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTabContext, DASHBOARD_TAB_ID } from "@/contexts/TabContext";
import { findRouteTabConfig } from "@/constants/routeTabMapping";

/**
 * Synchronizes React Router URL changes with the workspace tab system.
 * 
 * When sidebar navigation (NavLink) changes the URL, this hook ensures
 * the correct tab is created or focused in the workspace tab bar.
 */
export function useRouteToTabSync() {
  const location = useLocation();
  const { tabs, activeTabId, openTab, focusTab } = useTabContext();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const pathname = location.pathname;

    // Skip if same path (prevents infinite loops)
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    // Dashboard is always the pinned tab
    if (pathname === "/" || pathname === "/dashboard") {
      if (activeTabId !== DASHBOARD_TAB_ID) {
        focusTab(DASHBOARD_TAB_ID);
      }
      return;
    }

    // Find matching route config
    const routeConfig = findRouteTabConfig(pathname);
    if (!routeConfig) return;

    // Get module root path (e.g., /help from /help/kb)
    const moduleRoot = "/" + pathname.split("/")[1];

    // Check if a tab already exists for this module
    const existingTab = tabs.find(
      (t) =>
        t.route === pathname ||
        t.route === moduleRoot ||
        t.route.startsWith(moduleRoot + "/")
    );

    if (existingTab) {
      // Focus existing tab if not already active
      if (activeTabId !== existingTab.id) {
        focusTab(existingTab.id);
      }
    } else {
      // Create new tab for this module
      openTab({
        route: pathname,
        title: routeConfig.title,
        moduleCode: routeConfig.moduleCode,
        icon: routeConfig.icon,
      });
    }
  }, [location.pathname, tabs, activeTabId, openTab, focusTab]);
}

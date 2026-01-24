import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface WorkspaceTab {
  id: string;
  route: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  moduleCode: string;
  contextId?: string;
  contextType?: string;
  isPinned: boolean;
  hasUnsavedChanges: boolean;
  openedAt: Date;
  lastActiveAt: Date;
  /** Tab-scoped state storage that persists across tab switches */
  state?: Record<string, unknown>;
}

export interface OpenTabConfig {
  route: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  moduleCode: string;
  contextId?: string;
  contextType?: string;
  isPinned?: boolean;
  forceNew?: boolean;
}

interface TabContextValue {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  openTab: (config: OpenTabConfig) => string;
  closeTab: (tabId: string) => void;
  focusTab: (tabId: string) => void;
  updateTabTitle: (tabId: string, title: string, subtitle?: string) => void;
  setUnsavedChanges: (tabId: string, hasChanges: boolean) => void;
  closeAllExcept: (tabId: string) => void;
  closeOthers: (tabId: string) => void;
  getActiveTab: () => WorkspaceTab | undefined;
  findTabByContext: (contextType: string, contextId: string) => WorkspaceTab | undefined;
  /** Get tab-scoped state for a specific tab */
  getTabState: <T = Record<string, unknown>>(tabId: string) => T | undefined;
  /** Set entire tab state (replaces existing) */
  setTabState: (tabId: string, state: Record<string, unknown>) => void;
  /** Update tab state (merges with existing) */
  updateTabState: (tabId: string, partialState: Record<string, unknown>) => void;
  /** Check if any tab has unsaved changes */
  hasAnyUnsavedChanges: () => boolean;
  /** Get all tabs with unsaved changes */
  getTabsWithUnsavedChanges: () => WorkspaceTab[];
}

const TabContext = createContext<TabContextValue | null>(null);

const DASHBOARD_TAB_ID = "dashboard";
const STORAGE_KEY = "hrplus_workspace_tabs";

interface SerializedTab {
  id: string;
  route: string;
  title: string;
  subtitle?: string;
  moduleCode: string;
  contextId?: string;
  contextType?: string;
  isPinned: boolean;
  /** Persisted tab state - limited to 50KB per tab */
  state?: Record<string, unknown>;
  /** Flag to detect if tab had unsaved changes (for session recovery) */
  hadUnsavedChanges?: boolean;
}

function generateTabId(): string {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createDashboardTab(): WorkspaceTab {
  return {
    id: DASHBOARD_TAB_ID,
    route: "/dashboard",
    title: "Dashboard",
    moduleCode: "dashboard",
    isPinned: true,
    hasUnsavedChanges: false,
    openedAt: new Date(),
    lastActiveAt: new Date(),
  };
}

const MAX_STATE_SIZE_BYTES = 50 * 1024; // 50KB per tab

function serializeTabs(tabs: WorkspaceTab[]): string {
  const serializable: SerializedTab[] = tabs.map(tab => {
    // Limit state size to prevent storage bloat
    let stateToSave = tab.state;
    if (stateToSave) {
      const stateJson = JSON.stringify(stateToSave);
      if (stateJson.length > MAX_STATE_SIZE_BYTES) {
        console.warn(`Tab "${tab.title}" state exceeds 50KB limit, state will not be persisted`);
        stateToSave = undefined;
      }
    }

    return {
      id: tab.id,
      route: tab.route,
      title: tab.title,
      subtitle: tab.subtitle,
      moduleCode: tab.moduleCode,
      contextId: tab.contextId,
      contextType: tab.contextType,
      isPinned: tab.isPinned,
      state: stateToSave,
      hadUnsavedChanges: tab.hasUnsavedChanges,
    };
  });
  return JSON.stringify(serializable);
}

function deserializeTabs(json: string): WorkspaceTab[] {
  try {
    const parsed: SerializedTab[] = JSON.parse(json);
    const now = new Date();
    return parsed.map(tab => ({
      id: tab.id,
      route: tab.route,
      title: tab.title,
      subtitle: tab.subtitle,
      moduleCode: tab.moduleCode,
      contextId: tab.contextId,
      contextType: tab.contextType,
      isPinned: tab.isPinned,
      state: tab.state, // Restore persisted state
      hasUnsavedChanges: false, // Always reset to false on restore
      openedAt: now,
      lastActiveAt: now,
    }));
  } catch {
    return [];
  }
}

interface TabProviderProps {
  children: ReactNode;
}

export function TabProvider({ children }: TabProviderProps) {
  const [tabs, setTabs] = useState<WorkspaceTab[]>(() => {
    // Try to restore from session storage
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const restored = deserializeTabs(stored);
      // Ensure dashboard tab exists
      const hasDashboard = restored.some(t => t.id === DASHBOARD_TAB_ID);
      if (!hasDashboard) {
        restored.unshift(createDashboardTab());
      }
      return restored;
    }
    return [createDashboardTab()];
  });

  const [activeTabId, setActiveTabId] = useState<string | null>(() => {
    const storedActiveId = sessionStorage.getItem(`${STORAGE_KEY}_active`);
    return storedActiveId || DASHBOARD_TAB_ID;
  });

  // Persist tabs to session storage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, serializeTabs(tabs));
  }, [tabs]);

  useEffect(() => {
    if (activeTabId) {
      sessionStorage.setItem(`${STORAGE_KEY}_active`, activeTabId);
    }
  }, [activeTabId]);

  const findTabByContext = useCallback((contextType: string, contextId: string): WorkspaceTab | undefined => {
    return tabs.find(t => t.contextType === contextType && t.contextId === contextId);
  }, [tabs]);

  const openTab = useCallback((config: OpenTabConfig): string => {
    // Check for existing tab with same context (unless forceNew is true)
    if (!config.forceNew && config.contextType && config.contextId) {
      const existing = tabs.find(
        t => t.contextType === config.contextType && t.contextId === config.contextId
      );
      if (existing) {
        setActiveTabId(existing.id);
        setTabs(prev => prev.map(t =>
          t.id === existing.id ? { ...t, lastActiveAt: new Date() } : t
        ));
        return existing.id;
      }
    }

    // Check for existing tab with same route (for non-context tabs)
    if (!config.forceNew && !config.contextId) {
      const existing = tabs.find(t => t.route === config.route && !t.contextId);
      if (existing) {
        setActiveTabId(existing.id);
        setTabs(prev => prev.map(t =>
          t.id === existing.id ? { ...t, lastActiveAt: new Date() } : t
        ));
        return existing.id;
      }
    }

    const newTab: WorkspaceTab = {
      id: generateTabId(),
      route: config.route,
      title: config.title,
      subtitle: config.subtitle,
      icon: config.icon,
      moduleCode: config.moduleCode,
      contextId: config.contextId,
      contextType: config.contextType,
      isPinned: config.isPinned || false,
      hasUnsavedChanges: false,
      openedAt: new Date(),
      lastActiveAt: new Date(),
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    return newTab.id;
  }, [tabs]);

  const closeTab = useCallback((tabId: string) => {
    const tabToClose = tabs.find(t => t.id === tabId);
    if (!tabToClose || tabToClose.isPinned) return;

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    
    setTabs(newTabs);

    // Focus logic: try last active, then previous tab, then dashboard
    if (activeTabId === tabId) {
      const remainingTabs = newTabs.filter(t => t.id !== tabId);
      if (remainingTabs.length > 0) {
        // Sort by lastActiveAt and pick the most recent
        const sortedByActive = [...remainingTabs].sort(
          (a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime()
        );
        setActiveTabId(sortedByActive[0].id);
      } else {
        setActiveTabId(DASHBOARD_TAB_ID);
      }
    }
  }, [tabs, activeTabId]);

  const focusTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      setTabs(prev => prev.map(t =>
        t.id === tabId ? { ...t, lastActiveAt: new Date() } : t
      ));
    }
  }, [tabs]);

  const updateTabTitle = useCallback((tabId: string, title: string, subtitle?: string) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, title, subtitle: subtitle ?? t.subtitle } : t
    ));
  }, []);

  const setUnsavedChanges = useCallback((tabId: string, hasChanges: boolean) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, hasUnsavedChanges: hasChanges } : t
    ));
  }, []);

  const closeAllExcept = useCallback((tabId: string) => {
    setTabs(prev => prev.filter(t => t.id === tabId || t.isPinned));
    setActiveTabId(tabId);
  }, []);

  const closeOthers = useCallback((tabId: string) => {
    setTabs(prev => prev.filter(t => t.id === tabId || t.isPinned));
    setActiveTabId(tabId);
  }, []);

  const getActiveTab = useCallback((): WorkspaceTab | undefined => {
    return tabs.find(t => t.id === activeTabId);
  }, [tabs, activeTabId]);

  // Tab state management methods
  const getTabState = useCallback(<T = Record<string, unknown>>(tabId: string): T | undefined => {
    const tab = tabs.find(t => t.id === tabId);
    return tab?.state as T | undefined;
  }, [tabs]);

  const setTabState = useCallback((tabId: string, state: Record<string, unknown>) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, state } : t
    ));
  }, []);

  const updateTabState = useCallback((tabId: string, partialState: Record<string, unknown>) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, state: { ...t.state, ...partialState } } : t
    ));
  }, []);

  const hasAnyUnsavedChanges = useCallback((): boolean => {
    return tabs.some(t => t.hasUnsavedChanges);
  }, [tabs]);

  const getTabsWithUnsavedChanges = useCallback((): WorkspaceTab[] => {
    return tabs.filter(t => t.hasUnsavedChanges);
  }, [tabs]);

  const value: TabContextValue = {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    focusTab,
    updateTabTitle,
    setUnsavedChanges,
    closeAllExcept,
    closeOthers,
    getActiveTab,
    findTabByContext,
    getTabState,
    setTabState,
    updateTabState,
    hasAnyUnsavedChanges,
    getTabsWithUnsavedChanges,
  };

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabContext(): TabContextValue {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabContext must be used within a TabProvider");
  }
  return context;
}

export { DASHBOARD_TAB_ID };

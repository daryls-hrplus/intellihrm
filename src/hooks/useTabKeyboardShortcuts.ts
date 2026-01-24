import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTabContext } from "@/contexts/TabContext";

export function useTabKeyboardShortcuts() {
  const { tabs, activeTabId, closeTab, focusTab } = useTabContext();
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    // Ctrl/Cmd + W - Close current tab
    if (modKey && e.key === "w") {
      e.preventDefault();
      const activeTab = tabs.find(t => t.id === activeTabId);
      if (activeTab && !activeTab.isPinned) {
        closeTab(activeTabId!);
        // Navigate to next tab
        const remainingTabs = tabs.filter(t => t.id !== activeTabId);
        if (remainingTabs.length > 0) {
          const sortedByActive = [...remainingTabs].sort(
            (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
          );
          focusTab(sortedByActive[0].id);
          navigate(sortedByActive[0].route);
        }
      }
    }

    // Ctrl/Cmd + Tab - Cycle to next tab
    if (modKey && e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const currentIndex = tabs.findIndex(t => t.id === activeTabId);
      const nextIndex = (currentIndex + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      focusTab(nextTab.id);
      navigate(nextTab.route);
    }

    // Ctrl/Cmd + Shift + Tab - Cycle to previous tab
    if (modKey && e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      const currentIndex = tabs.findIndex(t => t.id === activeTabId);
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      const prevTab = tabs[prevIndex];
      focusTab(prevTab.id);
      navigate(prevTab.route);
    }

    // Ctrl/Cmd + 1-9 - Jump to tab by position
    if (modKey && e.key >= "1" && e.key <= "9") {
      e.preventDefault();
      const tabIndex = parseInt(e.key) - 1;
      if (tabIndex < tabs.length) {
        const targetTab = tabs[tabIndex];
        focusTab(targetTab.id);
        navigate(targetTab.route);
      }
    }
  }, [tabs, activeTabId, closeTab, focusTab, navigate]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

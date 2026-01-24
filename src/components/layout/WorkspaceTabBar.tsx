import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Home, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabContext, DASHBOARD_TAB_ID, WorkspaceTab } from "@/contexts/TabContext";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function WorkspaceTabBar() {
  const { tabs, activeTabId, focusTab, closeTab, closeOthers, closeAllExcept } = useTabContext();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollArrows = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkScrollArrows();
    window.addEventListener("resize", checkScrollArrows);
    return () => window.removeEventListener("resize", checkScrollArrows);
  }, [tabs]);

  useEffect(() => {
    // Scroll active tab into view
    const activeElement = document.querySelector(`[data-tab-id="${activeTabId}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTabId]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollArrows, 300);
    }
  };

  const handleTabClick = (tab: WorkspaceTab) => {
    focusTab(tab.id);
    navigate(tab.route);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.hasUnsavedChanges) {
      // TODO: Show unsaved changes dialog
      if (!confirm("You have unsaved changes. Close anyway?")) {
        return;
      }
    }
    closeTab(tabId);
    
    // Navigate to next tab
    const remainingTabs = tabs.filter(t => t.id !== tabId);
    if (remainingTabs.length > 0 && activeTabId === tabId) {
      const sortedByActive = [...remainingTabs].sort(
        (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      );
      navigate(sortedByActive[0].route);
    }
  };

  const getTabIcon = (tab: WorkspaceTab) => {
    if (tab.id === DASHBOARD_TAB_ID) {
      return <Home className="h-3.5 w-3.5" />;
    }
    if (tab.icon) {
      const Icon = tab.icon;
      return <Icon className="h-3.5 w-3.5" />;
    }
    return null;
  };

  const formatTabTitle = (tab: WorkspaceTab): string => {
    if (tab.subtitle) {
      return `${tab.title} - ${tab.subtitle}`;
    }
    return tab.title;
  };

  if (tabs.length <= 1) {
    return null; // Don't show tab bar if only dashboard
  }

  return (
    <div className="relative flex items-center bg-muted/30 border-b border-border mb-4 -mx-4 lg:-mx-8 px-2">
      {/* Left scroll arrow */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-none border-r border-border"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Scrollable tab container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center overflow-x-auto scrollbar-hide"
        onScroll={checkScrollArrows}
      >
        {tabs.map((tab) => (
          <ContextMenu key={tab.id}>
            <ContextMenuTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    data-tab-id={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={cn(
                      "group relative flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                      "border-r border-border hover:bg-muted/50",
                      "min-w-[120px] max-w-[200px]",
                      activeTabId === tab.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {/* Active tab indicator */}
                    {activeTabId === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}

                    {/* Unsaved indicator */}
                    {tab.hasUnsavedChanges && (
                      <div className="absolute top-1 left-1 h-2 w-2 rounded-full bg-orange-500" />
                    )}

                    {/* Tab icon */}
                    {getTabIcon(tab)}

                    {/* Tab title */}
                    <span className="truncate flex-1 text-left">
                      {tab.title}
                    </span>

                    {/* Close button (not for pinned tabs) */}
                    {!tab.isPinned && (
                      <button
                        onClick={(e) => handleCloseTab(e, tab.id)}
                        className={cn(
                          "ml-1 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive",
                          "opacity-0 group-hover:opacity-100 transition-opacity"
                        )}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium">{formatTabTitle(tab)}</p>
                  {tab.contextType && (
                    <p className="text-xs text-muted-foreground capitalize">{tab.contextType}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {!tab.isPinned && (
                <>
                  <ContextMenuItem onClick={() => closeTab(tab.id)}>
                    Close
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => closeOthers(tab.id)}>
                    Close Others
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              <ContextMenuItem onClick={() => closeAllExcept(tab.id)}>
                Close All Except This
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      {/* Right scroll arrow */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-none border-l border-border"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

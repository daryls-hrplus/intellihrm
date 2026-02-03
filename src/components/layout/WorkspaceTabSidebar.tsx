import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Home, ChevronUp, ChevronDown, FileText } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
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
import { TabCloseConfirmDialog } from "@/components/dialogs/TabCloseConfirmDialog";
import { SortableTab } from "./SortableTab";

export function WorkspaceTabSidebar() {
  const { tabs, activeTabId, focusTab, closeTab, closeOthers, closeAllExcept, reorderTabs, recentlyClosed, reopenLastClosedTab, openTab } = useTabContext();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showUpArrow, setShowUpArrow] = useState(false);
  const [showDownArrow, setShowDownArrow] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const [pendingCloseTab, setPendingCloseTab] = useState<WorkspaceTab | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const checkScrollArrows = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowUpArrow(container.scrollTop > 0);
      setShowDownArrow(container.scrollTop < container.scrollHeight - container.clientHeight - 1);
    }
  };

  useEffect(() => {
    checkScrollArrows();
    window.addEventListener("resize", checkScrollArrows);
    return () => window.removeEventListener("resize", checkScrollArrows);
  }, [tabs]);

  useEffect(() => {
    const activeElement = document.querySelector(`[data-tab-id="${activeTabId}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeTabId]);

  const scroll = (direction: "up" | "down") => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ top: direction === "up" ? -150 : 150, behavior: "smooth" });
      setTimeout(checkScrollArrows, 300);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex(t => t.id === active.id);
      const newIndex = tabs.findIndex(t => t.id === over.id);
      
      // Prevent moving before pinned Dashboard
      if (newIndex === 0 && tabs[0].isPinned) return;
      
      reorderTabs(arrayMove(tabs, oldIndex, newIndex));
    }
  };

  const handleTabClick = (tab: WorkspaceTab) => {
    focusTab(tab.id);
    navigate(tab.route);
    setAnnouncement(`Now viewing ${tab.title}`);
  };

  const executeCloseTab = (tabId: string) => {
    closeTab(tabId);
    const remainingTabs = tabs.filter(t => t.id !== tabId);
    if (remainingTabs.length > 0 && activeTabId === tabId) {
      const sortedByActive = [...remainingTabs].sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
      navigate(sortedByActive[0].route);
      setAnnouncement(`Closed tab. Now viewing ${sortedByActive[0].title}`);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    if (tab.hasUnsavedChanges) {
      setPendingCloseTab(tab);
      return;
    }
    executeCloseTab(tabId);
  };

  const getTabIcon = (tab: WorkspaceTab) => {
    if (tab.id === DASHBOARD_TAB_ID) return <Home className="h-5 w-5" aria-hidden="true" />;
    if (tab.icon) {
      const Icon = tab.icon;
      return <Icon className="h-5 w-5" aria-hidden="true" />;
    }
    // Fallback icon
    return <FileText className="h-5 w-5" aria-hidden="true" />;
  };

  const formatTabTitle = (tab: WorkspaceTab): string => tab.subtitle ? `${tab.title} - ${tab.subtitle}` : tab.title;

  const activeTab = activeId ? tabs.find(t => t.id === activeId) : null;

  if (tabs.length <= 1) return null;

  return (
    <>
      <aside className="fixed right-0 top-0 h-screen w-14 bg-muted/30 border-l border-border z-40 hidden lg:flex flex-col" role="tablist" aria-label="Workspace tabs">
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>

        {/* Scroll up arrow */}
        {showUpArrow && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-full shrink-0 rounded-none border-b border-border" 
            onClick={() => scroll("up")} 
            aria-label="Scroll tabs up"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={tabs.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div 
              ref={scrollContainerRef} 
              className="flex-1 flex flex-col items-center py-2 gap-1 overflow-y-auto scrollbar-hide" 
              onScroll={checkScrollArrows}
            >
              {tabs.map((tab) => (
                <SortableTab key={tab.id} tab={tab} orientation="vertical">
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button
                            role="tab"
                            id={`tab-${tab.id}`}
                            aria-selected={activeTabId === tab.id}
                            data-tab-id={tab.id}
                            onClick={() => handleTabClick(tab)}
                            className={cn(
                              "group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors",
                              "hover:bg-muted/80",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                              activeTabId === tab.id 
                                ? "bg-background text-foreground shadow-sm border-l-2 border-l-primary" 
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {/* Unsaved changes indicator */}
                            {tab.hasUnsavedChanges && (
                              <div 
                                className="absolute top-0.5 left-0.5 h-2 w-2 rounded-full bg-orange-500" 
                                aria-hidden="true" 
                                title="Unsaved changes" 
                              />
                            )}
                            
                            {getTabIcon(tab)}
                            
                            {/* Close button overlay */}
                            {!tab.isPinned && (
                              <button 
                                onClick={(e) => handleCloseTab(e, tab.id)} 
                                className={cn(
                                  "absolute -top-1 -right-1 p-0.5 rounded-full",
                                  "bg-background border border-border shadow-sm",
                                  "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50",
                                  "opacity-0 group-hover:opacity-100 transition-opacity",
                                  "focus:opacity-100"
                                )} 
                                aria-label={`Close ${tab.title} tab`} 
                                tabIndex={-1}
                              >
                                <X className="h-3 w-3" aria-hidden="true" />
                              </button>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="font-medium">{formatTabTitle(tab)}</p>
                          {tab.contextType && (
                            <p className="text-xs text-muted-foreground capitalize">{tab.contextType}</p>
                          )}
                          {tab.hasUnsavedChanges && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Has unsaved changes</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      {!tab.isPinned && (
                        <>
                          <ContextMenuItem onClick={() => tab.hasUnsavedChanges ? setPendingCloseTab(tab) : executeCloseTab(tab.id)}>
                            Close
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => closeOthers(tab.id)}>Close Others</ContextMenuItem>
                          <ContextMenuSeparator />
                        </>
                      )}
                      <ContextMenuItem onClick={() => closeAllExcept(tab.id)}>Close All Except This</ContextMenuItem>
                      {tab.contextId && (
                        <>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => openTab({ 
                            route: tab.route, 
                            title: tab.title, 
                            subtitle: tab.subtitle, 
                            moduleCode: tab.moduleCode, 
                            contextId: tab.contextId, 
                            contextType: tab.contextType, 
                            icon: tab.icon, 
                            forceNew: true 
                          })}>
                            Open Duplicate Tab
                          </ContextMenuItem>
                        </>
                      )}
                      {recentlyClosed.length > 0 && (
                        <>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={reopenLastClosedTab}>
                            Reopen Closed Tab ({recentlyClosed.length})
                          </ContextMenuItem>
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                </SortableTab>
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeTab && (
              <div className="flex items-center justify-center w-10 h-10 bg-background border rounded-md shadow-lg">
                {getTabIcon(activeTab)}
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Scroll down arrow */}
        {showDownArrow && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-full shrink-0 rounded-none border-t border-border" 
            onClick={() => scroll("down")} 
            aria-label="Scroll tabs down"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </aside>
      
      <TabCloseConfirmDialog 
        open={pendingCloseTab !== null} 
        tab={pendingCloseTab} 
        onConfirm={() => { 
          if (pendingCloseTab) { 
            executeCloseTab(pendingCloseTab.id); 
            setPendingCloseTab(null); 
          } 
        }} 
        onCancel={() => setPendingCloseTab(null)} 
      />
    </>
  );
}

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { WorkspaceTab } from "@/contexts/TabContext";

interface SortableTabProps {
  tab: WorkspaceTab;
  children: React.ReactNode;
}

export function SortableTab({ tab, children }: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tab.id,
    disabled: tab.isPinned, // Pinned tabs (Dashboard) cannot be moved
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: tab.isPinned ? "default" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "touch-none",
        isDragging && "shadow-lg ring-2 ring-primary/20 rounded"
      )}
    >
      {children}
    </div>
  );
}

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NavLink } from "react-router-dom";
import { GripVertical, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useDraggableOrderWithPersistence } from "@/hooks/useDraggableOrderWithPersistence";

export interface ModuleCardItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  tabCode: string;
}

interface SortableModuleCardProps {
  module: ModuleCardItem;
  index: number;
  isDragging?: boolean;
}

function SortableModuleCard({ module, index, isDragging }: SortableModuleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentDragging,
  } = useSortable({ id: module.tabCode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    animationDelay: `${(index + 4) * 50}ms`,
  };

  const Icon = module.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-border bg-card shadow-card transition-all animate-slide-up",
        isCurrentDragging && "opacity-50 scale-105 shadow-lg z-50",
        isDragging && !isCurrentDragging && "transition-transform"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all cursor-grab active:cursor-grabbing z-10"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <NavLink
        to={module.href}
        className="block p-6 hover:border-primary/20 rounded-xl transition-all"
      >
        <div className="flex items-start gap-4">
          <div className={`rounded-lg p-3 ${module.color} shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {module.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {module.description}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </NavLink>
    </div>
  );
}

function ModuleCardOverlay({ module }: { module: ModuleCardItem }) {
  const Icon = module.icon;

  return (
    <div className="rounded-xl border border-primary bg-card shadow-2xl p-6 cursor-grabbing">
      <div className="flex items-start gap-4">
        <div className={`rounded-lg p-3 ${module.color} shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground">
            {module.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {module.description}
          </p>
        </div>
      </div>
    </div>
  );
}

interface DraggableModuleCardsProps {
  modules: ModuleCardItem[];
  preferenceKey: string;
  showResetButton?: boolean;
}

export function DraggableModuleCards({ 
  modules, 
  preferenceKey,
  showResetButton = true 
}: DraggableModuleCardsProps) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);

  const getModuleId = useCallback((module: ModuleCardItem) => module.tabCode, []);

  const { orderedItems, updateOrder, resetOrder, isLoading } = useDraggableOrderWithPersistence({
    items: modules,
    preferenceKey,
    getItemId: getModuleId,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = orderedItems.findIndex((m) => m.tabCode === active.id);
      const newIndex = orderedItems.findIndex((m) => m.tabCode === over.id);
      const newModules = arrayMove(orderedItems, oldIndex, newIndex);
      updateOrder(newModules);
    }
  };

  const activeModule = activeId ? orderedItems.find((m) => m.tabCode === activeId) : null;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-6 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg p-3 bg-muted h-11 w-11" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showResetButton && (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetOrder}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("common.resetOrder")}
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedItems.map((m) => m.tabCode)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orderedItems.map((module, index) => (
              <SortableModuleCard
                key={module.tabCode}
                module={module}
                index={index}
                isDragging={!!activeId}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeModule ? <ModuleCardOverlay module={activeModule} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

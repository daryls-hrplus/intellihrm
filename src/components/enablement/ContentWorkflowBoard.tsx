import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Video,
  BookOpen,
  MousePointer,
  Package,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useEnablementContentStatus, useEnablementReleases } from "@/hooks/useEnablementData";
import type { EnablementContentStatus, WorkflowColumn } from "@/types/enablement";
import { WorkflowColumnComponent } from "./WorkflowColumn";
import { ContentItemCard } from "./ContentItemCard";
import { AddContentItemDialog } from "./AddContentItemDialog";

const WORKFLOW_COLUMNS: { id: WorkflowColumn; label: string; color: string; description?: string }[] = [
  { id: "development_backlog", label: "Dev Backlog", color: "bg-slate-500/10", description: "New features awaiting development" },
  { id: "in_development", label: "In Development", color: "bg-blue-500/10", description: "Active development work" },
  { id: "testing_review", label: "Testing/Review", color: "bg-amber-500/10", description: "QA and stakeholder review" },
  { id: "documentation", label: "Documentation", color: "bg-purple-500/10", description: "Technical docs & user guides" },
  { id: "ready_for_enablement", label: "Ready for Enablement", color: "bg-cyan-500/10", description: "Approved for enablement artifacts" },
  { id: "published", label: "Published", color: "bg-green-500/10", description: "Live and available" },
  { id: "maintenance", label: "Maintenance", color: "bg-orange-500/10", description: "Updates and revisions" },
];

interface ContentWorkflowBoardProps {
  releaseId?: string;
}

export function ContentWorkflowBoard({ releaseId }: ContentWorkflowBoardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { contentItems, isLoading, moveToColumn } = useEnablementContentStatus(releaseId);
  const { releases } = useEnablementReleases();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredItems = useMemo(() => {
    return contentItems.filter((item) => {
      const matchesSearch =
        item.feature_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.module_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
      // Case-insensitive module matching
      const matchesModule = moduleFilter === "all" || 
        item.module_code.toLowerCase() === moduleFilter.toLowerCase();
      return matchesSearch && matchesPriority && matchesModule;
    });
  }, [contentItems, searchQuery, priorityFilter, moduleFilter]);

  const itemsByColumn = useMemo(() => {
    const grouped: Record<WorkflowColumn, EnablementContentStatus[]> = {
      development_backlog: [],
      in_development: [],
      testing_review: [],
      documentation: [],
      ready_for_enablement: [],
      published: [],
      maintenance: [],
      archived: [],
    };

    filteredItems.forEach((item) => {
      if (grouped[item.workflow_status]) {
        grouped[item.workflow_status].push(item);
      }
    });

    return grouped;
  }, [filteredItems]);

  const modules = useMemo(() => {
    // Normalize to uppercase for display and deduplicate case variations
    const uniqueModules = new Set(
      contentItems.map((item) => item.module_code.toUpperCase())
    );
    return Array.from(uniqueModules).sort();
  }, [contentItems]);

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return contentItems.find((item) => item.id === activeId);
  }, [activeId, contentItems]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const targetColumn = over.id as WorkflowColumn;
      if (WORKFLOW_COLUMNS.some((col) => col.id === targetColumn)) {
        const result = await moveToColumn(active.id as string, targetColumn);
        if (!result.success && result.error) {
          toast({
            title: "Cannot Move Item",
            description: result.error,
            variant: "destructive",
          });
        }
      }
    }

    setActiveId(null);
  };

  const getColumnStats = (column: WorkflowColumn) => {
    const items = itemsByColumn[column] || [];
    const critical = items.filter((i) => i.priority === "critical").length;
    const high = items.filter((i) => i.priority === "high").length;
    return { total: items.length, critical, high };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map((module) => (
              <SelectItem key={module} value={module}>
                {module}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AddContentItemDialog releaseId={releaseId} />
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {WORKFLOW_COLUMNS.map((column) => {
            const stats = getColumnStats(column.id);
            return (
              <WorkflowColumnComponent
                key={column.id}
                id={column.id}
                title={column.label}
                items={itemsByColumn[column.id] || []}
                stats={stats}
                colorClass={column.color}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeItem ? <ContentItemCard item={activeItem} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

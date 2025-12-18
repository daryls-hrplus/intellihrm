import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Flame } from "lucide-react";
import type { EnablementContentStatus, WorkflowColumn } from "@/types/enablement";
import { ContentItemCard } from "./ContentItemCard";
import { cn } from "@/lib/utils";

interface WorkflowColumnComponentProps {
  id: WorkflowColumn;
  title: string;
  items: EnablementContentStatus[];
  stats: { total: number; critical: number; high: number };
  colorClass: string;
}

export function WorkflowColumnComponent({
  id,
  title,
  items,
  stats,
  colorClass,
}: WorkflowColumnComponentProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-h-[500px] transition-all",
        colorClass,
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {stats.total}
          </Badge>
        </div>
        {(stats.critical > 0 || stats.high > 0) && (
          <div className="flex gap-2 mt-1">
            {stats.critical > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                {stats.critical}
              </Badge>
            )}
            {stats.high > 0 && (
              <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                <Flame className="h-3 w-3 mr-1" />
                {stats.high}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-2">
        <ScrollArea className="h-[420px]">
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 p-1">
              {items.map((item) => (
                <ContentItemCard key={item.id} item={item} />
              ))}
              {items.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Drop items here
                </div>
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

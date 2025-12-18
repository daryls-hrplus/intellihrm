import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  Video,
  BookOpen,
  MousePointer,
  Package,
  Calendar,
  Sparkles,
  GripVertical,
} from "lucide-react";
import type { EnablementContentStatus } from "@/types/enablement";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ContentItemCardProps {
  item: EnablementContentStatus;
  isDragging?: boolean;
}

const PRIORITY_COLORS = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-blue-500 text-white",
  low: "bg-gray-500 text-white",
};

const TOOL_ICONS = {
  scorm_lite: Package,
  rise: BookOpen,
  both: Sparkles,
};

export function ContentItemCard({ item, isDragging }: ContentItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate completion percentage
  const statuses = [
    item.documentation_status,
    item.scorm_lite_status,
    item.rise_course_status,
    item.video_status,
    item.dap_guide_status,
  ];
  const completed = statuses.filter((s) => s === "complete").length;
  const completionPercent = Math.round((completed / statuses.length) * 100);

  const ToolIcon = item.recommended_tool
    ? TOOL_ICONS[item.recommended_tool]
    : FileText;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing bg-card transition-shadow hover:shadow-md",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg ring-2 ring-primary"
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {item.feature_code.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {item.module_code}
              </p>
            </div>
          </div>
          <Badge className={cn("text-xs flex-shrink-0", PRIORITY_COLORS[item.priority])}>
            {item.priority}
          </Badge>
        </div>

        {/* AI Recommendation */}
        {item.recommended_tool && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span>
                    AI: {item.recommended_tool === "scorm_lite" ? "SCORM-Lite" : "Rise"}
                  </span>
                  {item.complexity_score && (
                    <Badge variant="outline" className="ml-1 text-xs h-5">
                      {item.complexity_score}/10
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px]">{item.ai_change_impact || "AI recommendation based on feature complexity"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Content Status Icons */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <ContentStatusIcon
              icon={FileText}
              status={item.documentation_status}
              label="Documentation"
            />
            <ContentStatusIcon
              icon={Package}
              status={item.scorm_lite_status}
              label="SCORM-Lite"
            />
            <ContentStatusIcon
              icon={BookOpen}
              status={item.rise_course_status}
              label="Rise Course"
            />
            <ContentStatusIcon
              icon={Video}
              status={item.video_status}
              label="Video"
            />
            <ContentStatusIcon
              icon={MousePointer}
              status={item.dap_guide_status}
              label="DAP Guide"
            />
          </TooltipProvider>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-1.5" />
        </div>

        {/* Due Date */}
        {item.due_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Due {formatDistanceToNow(new Date(item.due_date), { addSuffix: true })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContentStatusIcon({
  icon: Icon,
  status,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  status: string;
  label: string;
}) {
  const statusColors = {
    not_started: "text-muted-foreground/40",
    in_progress: "text-blue-500",
    complete: "text-green-500",
    na: "text-muted-foreground/20",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-default">
          <Icon
            className={cn(
              "h-4 w-4",
              statusColors[status as keyof typeof statusColors] || statusColors.not_started
            )}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {label}: {status.replace(/_/g, " ")}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

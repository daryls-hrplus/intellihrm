import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  ExternalLink,
  ClipboardList,
  Code,
  FileCheck,
  Rocket,
} from "lucide-react";
import { useEnablementChecklists, useContentChecklistProgress, StageChecklistItem } from "@/hooks/useEnablementChecklists";
import { cn } from "@/lib/utils";

interface StageChecklistProps {
  contentStatusId?: string;
  stage: "backlog" | "planning" | "development" | "review" | "published" | "maintenance";
  compact?: boolean;
  onNavigate?: (path: string) => void;
}

const STAGE_CONFIG = {
  backlog: { 
    label: "Backlog", 
    icon: ClipboardList, 
    color: "text-slate-600",
    bgColor: "bg-slate-100 dark:bg-slate-800"
  },
  planning: { 
    label: "Planning", 
    icon: ClipboardList, 
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30"
  },
  development: { 
    label: "Development", 
    icon: Code, 
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  review: { 
    label: "Review", 
    icon: FileCheck, 
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30"
  },
  published: { 
    label: "Published", 
    icon: Rocket, 
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30"
  },
  maintenance: { 
    label: "Maintenance", 
    icon: FileCheck, 
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30"
  },
};

// Navigation links for each task (when applicable)
const TASK_LINKS: Record<string, string> = {
  "Create release version": "/enablement?tab=releases",
  "Run AI Content Gap Analysis": "/enablement/ai-tools",
  "Run Compliance Impact Detector": "/enablement/ai-tools",
  "Prioritize content items": "/enablement?tab=workflow",
  "Capture screenshots": "/enablement/ai-tools",
  "Generate documentation draft": "/enablement/docs-generator",
  "Apply template formatting": "/enablement/template-library",
  "Export to required formats": "/enablement/ai-tools",
};

export function StageChecklist({ contentStatusId, stage, compact = false, onNavigate }: StageChecklistProps) {
  const [isOpen, setIsOpen] = useState(!compact);
  const { checklists, isLoading: checklistsLoading } = useEnablementChecklists(stage);
  const { progress, toggleTaskCompletion, getCompletionStats, isLoading: progressLoading } = useContentChecklistProgress(contentStatusId);

  const config = STAGE_CONFIG[stage];
  const Icon = config.icon;
  const stats = getCompletionStats(checklists);
  const isLoading = checklistsLoading || progressLoading;

  const isTaskCompleted = (itemId: string) => {
    return progress.find(p => p.checklist_item_id === itemId && p.is_completed) !== undefined;
  };

  const handleTaskClick = (item: StageChecklistItem) => {
    if (contentStatusId) {
      toggleTaskCompletion(item.id, isTaskCompleted(item.id));
    }
  };

  const handleNavigate = (taskName: string) => {
    const link = TASK_LINKS[taskName];
    if (link && onNavigate) {
      onNavigate(link);
    }
  };

  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto">
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", config.color)} />
              <span className="font-medium">{config.label}</span>
              <Badge variant={stats.allRequiredComplete ? "default" : "secondary"} className="text-xs">
                {stats.completed}/{stats.total}
              </Badge>
            </div>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          <Progress value={stats.percent} className="h-1.5 mb-3" />
          <div className="space-y-2">
            {checklists.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                isCompleted={isTaskCompleted(item.id)}
                onToggle={() => handleTaskClick(item)}
                onNavigate={() => handleNavigate(item.task_name)}
                disabled={!contentStatusId}
                compact
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Card className={cn("border-l-4", config.bgColor)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.color)} />
            {config.label} Checklist
          </CardTitle>
          <div className="flex items-center gap-2">
            {!stats.allRequiredComplete && stats.requiredTotal > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {stats.requiredTotal - stats.requiredCompleted} required
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Complete all required tasks before moving to next stage
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Badge variant={stats.allRequiredComplete ? "default" : "secondary"}>
              {stats.completed}/{stats.total} complete
            </Badge>
          </div>
        </div>
        <Progress value={stats.percent} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {checklists.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  isCompleted={isTaskCompleted(item.id)}
                  onToggle={() => handleTaskClick(item)}
                  onNavigate={() => handleNavigate(item.task_name)}
                  disabled={!contentStatusId}
                />
              ))}
              {checklists.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No checklist items defined</p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

interface ChecklistItemProps {
  item: StageChecklistItem;
  isCompleted: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  disabled?: boolean;
  compact?: boolean;
}

function ChecklistItem({ item, isCompleted, onToggle, onNavigate, disabled, compact }: ChecklistItemProps) {
  const hasLink = TASK_LINKS[item.task_name];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-2 rounded-lg transition-colors",
        isCompleted ? "bg-muted/50" : "hover:bg-muted/30",
        disabled && "opacity-60"
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => !disabled && onToggle()}
        disabled={disabled}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium text-sm",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {item.task_name}
          </span>
          {item.is_required && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              Required
            </Badge>
          )}
        </div>
        {!compact && item.task_description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.task_description}
          </p>
        )}
      </div>
      {hasLink && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate();
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go to tool</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// All stages checklist panel for overview
export function AllStagesChecklist({ contentStatusId, onNavigate }: { contentStatusId?: string; onNavigate?: (path: string) => void }) {
  const stages: Array<"backlog" | "planning" | "development" | "review" | "published" | "maintenance"> = [
    "backlog", "planning", "development", "review", "published", "maintenance"
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Stage Checklists
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {stages.map((stage) => (
          <StageChecklist
            key={stage}
            stage={stage}
            contentStatusId={contentStatusId}
            compact
            onNavigate={onNavigate}
          />
        ))}
      </CardContent>
    </Card>
  );
}

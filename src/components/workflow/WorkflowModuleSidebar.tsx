import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WORKFLOW_MODULES, type WorkflowModule } from "@/constants/workflowModuleStructure";

interface WorkflowModuleSidebarProps {
  selectedModuleId: string;
  onModuleSelect: (moduleId: string) => void;
  enabledCounts: Record<string, number>;
}

export function WorkflowModuleSidebar({
  selectedModuleId,
  onModuleSelect,
  enabledCounts,
}: WorkflowModuleSidebarProps) {
  const getModuleTotalWorkflows = (module: WorkflowModule) => {
    return module.categories.reduce((acc, cat) => acc + cat.workflows.length, 0);
  };

  return (
    <div className="w-64 border-r bg-muted/30">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Modules
        </h3>
      </div>
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="p-2 space-y-1">
          {WORKFLOW_MODULES.map((module) => {
            const Icon = module.icon;
            const totalWorkflows = getModuleTotalWorkflows(module);
            const enabledCount = enabledCounts[module.id] || 0;
            const isSelected = selectedModuleId === module.id;

            return (
              <button
                key={module.id}
                onClick={() => onModuleSelect(module.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )} />
                <span className="flex-1 text-sm font-medium truncate">
                  {module.name}
                </span>
                <Badge
                  variant={isSelected ? "secondary" : "outline"}
                  className={cn(
                    "text-xs min-w-[40px] justify-center",
                    isSelected && "bg-primary-foreground/20 text-primary-foreground border-0"
                  )}
                >
                  {enabledCount}/{totalWorkflows}
                </Badge>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

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
    <div className="w-56 border-r bg-background flex-shrink-0">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
          Modules
        </h3>
      </div>
      <ScrollArea className="h-[500px]">
        <div className="p-2 space-y-0.5">
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
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors text-sm",
                  isSelected
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )} />
                <span className="flex-1 truncate">
                  {module.name}
                </span>
                <span className={cn(
                  "text-xs tabular-nums px-1.5 py-0.5 rounded",
                  isSelected 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {totalWorkflows}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

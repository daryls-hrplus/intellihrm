import { Button } from "@/components/ui/button";
import { CheckSquare, XSquare, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModuleQuickActionsProps {
  moduleCode: string;
  onGrantAll: (moduleCode: string) => void;
  onRevokeAll: (moduleCode: string) => void;
  onViewOnly: (moduleCode: string) => void;
  disabled?: boolean;
}

export function ModuleQuickActions({
  moduleCode,
  onGrantAll,
  onRevokeAll,
  onViewOnly,
  disabled = false,
}: ModuleQuickActionsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 px-4 py-2 bg-muted/30 border-b">
        <span className="text-xs text-muted-foreground mr-2">Quick Actions:</span>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
              onClick={() => onGrantAll(moduleCode)}
              disabled={disabled}
            >
              <CheckSquare className="h-3 w-3" />
              Grant All
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enable all permissions (View, Create, Edit, Delete) for all tabs in this module</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-800"
              onClick={() => onRevokeAll(moduleCode)}
              disabled={disabled}
            >
              <XSquare className="h-3 w-3" />
              Revoke All
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disable all permissions for all tabs in this module</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
              onClick={() => onViewOnly(moduleCode)}
              disabled={disabled}
            >
              <Eye className="h-3 w-3" />
              View Only
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enable View permission only; disable Create, Edit, and Delete</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

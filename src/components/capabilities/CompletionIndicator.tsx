import { LucideIcon, CheckCircle2, Circle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CompletionIndicatorProps {
  label: string;
  complete: boolean;
  count?: number;
  icon: LucideIcon;
}

export function CompletionIndicator({
  label,
  complete,
  count,
  icon: Icon,
}: CompletionIndicatorProps) {
  const displayValue = count !== undefined && count > 0 ? count : complete ? "✓" : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1 transition-colors cursor-default",
              complete
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground/50"
            )}
          >
            {complete ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Circle className="h-3.5 w-3.5" />
            )}
            <Icon className="h-3 w-3" />
            {displayValue && (
              <span className="font-medium text-xs">{displayValue}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {complete
              ? `${label}: ${count !== undefined ? `${count} linked` : "Configured"}`
              : `${label}: Not configured`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

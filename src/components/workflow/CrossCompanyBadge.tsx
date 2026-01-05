import { Building2, ArrowRight, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CrossCompanyPathEntry } from "@/hooks/useWorkflow";

interface CrossCompanyBadgeProps {
  isCrossCompany: boolean;
  originCompanyName?: string;
  currentCompanyName?: string;
  crossCompanyPath?: CrossCompanyPathEntry[];
  className?: string;
}

export function CrossCompanyBadge({
  isCrossCompany,
  originCompanyName,
  currentCompanyName,
  crossCompanyPath = [],
  className = "",
}: CrossCompanyBadgeProps) {
  if (!isCrossCompany) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700 ${className}`}
          >
            <Globe className="h-3 w-3 mr-1" />
            Cross-Company Approval
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium text-sm">Cross-Company Workflow</p>
            <p className="text-xs text-muted-foreground">
              This approval request involves multiple companies in the approval chain.
            </p>
            
            {originCompanyName && (
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span>Originated from: <strong>{originCompanyName}</strong></span>
              </div>
            )}
            
            {currentCompanyName && currentCompanyName !== originCompanyName && (
              <div className="flex items-center gap-2 text-xs">
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span>Currently at: <strong>{currentCompanyName}</strong></span>
              </div>
            )}

            {crossCompanyPath.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium mb-1">Approval Route:</p>
                <div className="space-y-1">
                  {crossCompanyPath.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs">
                      {index > 0 && <ArrowRight className="h-2 w-2 text-muted-foreground" />}
                      <span>{entry.company_name}</span>
                      <span className="text-muted-foreground">(Step {entry.step_order})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

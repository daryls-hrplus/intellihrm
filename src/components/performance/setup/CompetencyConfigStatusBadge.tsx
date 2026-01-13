import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  hasIndicators: boolean;
  jobCount: number;
  skillCount: number;
}

export function CompetencyConfigStatusBadge({ hasIndicators, jobCount, skillCount }: Props) {
  const isFullyConfigured = hasIndicators && jobCount > 0;
  const isPartiallyConfigured = hasIndicators || jobCount > 0 || skillCount > 0;
  
  if (isFullyConfigured) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fully configured - has behavioral indicators and linked to jobs</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (isPartiallyConfigured) {
    const missing: string[] = [];
    if (!hasIndicators) missing.push("behavioral indicators");
    if (jobCount === 0) missing.push("job links");
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="default" className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              Partial
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Missing: {missing.join(", ")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="default" className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Not Ready
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Not configured - needs behavioral indicators and job links</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

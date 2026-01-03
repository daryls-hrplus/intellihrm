import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

interface SignalConfidenceIndicatorProps {
  confidence: number;
  evidenceCount?: number;
  raterGroupCount?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SignalConfidenceIndicator({
  confidence,
  evidenceCount,
  raterGroupCount,
  showLabel = false,
  size = "md",
  className,
}: SignalConfidenceIndicatorProps) {
  const getConfidenceLevel = () => {
    if (confidence >= 0.8) return { level: "high", label: "High Confidence", color: "text-emerald-600" };
    if (confidence >= 0.5) return { level: "medium", label: "Medium Confidence", color: "text-amber-600" };
    return { level: "low", label: "Low Confidence", color: "text-red-600" };
  };

  const { level, label, color } = getConfidenceLevel();

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const Icon = level === "high" ? ShieldCheck : level === "medium" ? ShieldQuestion : ShieldAlert;

  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <p className="font-medium">{label}</p>
      <p>Confidence Score: {(confidence * 100).toFixed(0)}%</p>
      {evidenceCount !== undefined && <p>Evidence Count: {evidenceCount} responses</p>}
      {raterGroupCount !== undefined && <p>Rater Groups: {raterGroupCount}</p>}
      <p className="text-muted-foreground mt-2 max-w-[200px]">
        {level === "high"
          ? "This signal is based on sufficient evidence from multiple rater groups."
          : level === "medium"
          ? "This signal has moderate evidence. Consider gathering more feedback for stronger confidence."
          : "This signal has limited evidence. Interpret with caution."}
      </p>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5 cursor-help", className)}>
            <Icon className={cn(iconSizes[size], color)} />
            {showLabel && (
              <span className={cn("text-xs font-medium", color)}>
                {(confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px]">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

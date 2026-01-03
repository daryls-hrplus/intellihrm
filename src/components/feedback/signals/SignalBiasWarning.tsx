import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

interface SignalBiasWarningProps {
  biasLevel: "low" | "medium" | "high";
  biasFactors: string[];
  variant?: "badge" | "alert" | "inline";
  className?: string;
}

export function SignalBiasWarning({
  biasLevel,
  biasFactors,
  variant = "badge",
  className,
}: SignalBiasWarningProps) {
  const getBiasConfig = () => {
    switch (biasLevel) {
      case "high":
        return {
          label: "High Bias Risk",
          color: "bg-red-100 text-red-800 border-red-200",
          alertVariant: "destructive" as const,
          icon: AlertTriangle,
          iconColor: "text-red-600",
        };
      case "medium":
        return {
          label: "Moderate Bias Risk",
          color: "bg-amber-100 text-amber-800 border-amber-200",
          alertVariant: "default" as const,
          icon: Info,
          iconColor: "text-amber-600",
        };
      default:
        return {
          label: "Low Bias Risk",
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          alertVariant: "default" as const,
          icon: CheckCircle,
          iconColor: "text-emerald-600",
        };
    }
  };

  const config = getBiasConfig();
  const Icon = config.icon;

  if (variant === "badge") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn("cursor-help", config.color, className)}
            >
              <Icon className={cn("h-3 w-3 mr-1", config.iconColor)} />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[300px]">
            <div className="space-y-2">
              <p className="font-medium">{config.label}</p>
              {biasFactors.length > 0 ? (
                <ul className="text-xs space-y-1">
                  {biasFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="text-muted-foreground">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No specific bias indicators detected.
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "alert") {
    if (biasLevel === "low" && biasFactors.length === 0) {
      return null; // Don't show alert for low bias with no factors
    }

    return (
      <Alert variant={config.alertVariant} className={className}>
        <Icon className="h-4 w-4" />
        <AlertTitle>{config.label}</AlertTitle>
        <AlertDescription>
          {biasFactors.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 mt-2">
              {biasFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          ) : (
            <p>Consider additional perspectives when interpreting this signal.</p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Inline variant
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <Icon className={cn("h-4 w-4", config.iconColor)} />
      <span className={config.iconColor}>{config.label}</span>
      {biasFactors.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground cursor-help underline decoration-dotted">
                ({biasFactors.length} factor{biasFactors.length !== 1 ? "s" : ""})
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[300px]">
              <ul className="text-xs space-y-1">
                {biasFactors.map((factor, index) => (
                  <li key={index}>• {factor}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

import { Sparkles, Brain, Zap, MessageSquare, TrendingUp, Target, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIFeatureHighlightProps {
  children: React.ReactNode;
  compact?: boolean;
}

export function AIFeatureHighlight({ children, compact }: AIFeatureHighlightProps) {
  return (
    <div className={cn(
      "rounded-lg border border-primary/20 bg-primary/5",
      compact ? "p-3" : "p-4"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">AI-Powered Intelligence</span>
      </div>
      <div className={cn("space-y-1", compact ? "text-xs" : "text-sm")}>{children}</div>
    </div>
  );
}

type AICapabilityType = "predictive" | "prescriptive" | "automated" | "conversational" | "analytics" | "compliance";

interface AICapabilityProps {
  type: AICapabilityType;
  children: React.ReactNode;
}

const AI_TYPE_CONFIG: Record<AICapabilityType, { icon: typeof Sparkles; label: string; color: string }> = {
  predictive: { icon: TrendingUp, label: "Predictive", color: "text-blue-500" },
  prescriptive: { icon: Target, label: "Prescriptive", color: "text-green-500" },
  automated: { icon: Zap, label: "Automated", color: "text-amber-500" },
  conversational: { icon: MessageSquare, label: "Conversational", color: "text-purple-500" },
  analytics: { icon: Brain, label: "Analytics", color: "text-cyan-500" },
  compliance: { icon: Shield, label: "Compliance", color: "text-red-500" },
};

export function AICapability({ type, children }: AICapabilityProps) {
  const config = AI_TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-2 text-muted-foreground">
      <Icon className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0", config.color)} />
      <span>
        <span className={cn("font-medium", config.color)}>{config.label}:</span> {children}
      </span>
    </div>
  );
}

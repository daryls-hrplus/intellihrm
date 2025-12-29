import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  User,
  UserCheck,
  GraduationCap,
  Award,
  Users,
  FileCheck,
} from "lucide-react";
import { ValidationConfidence, ValidationSourceType } from "@/hooks/capabilities/useSkillValidationConfidence";

interface SkillValidationConfidenceIndicatorProps {
  confidence: ValidationConfidence;
  sources?: ValidationSourceType[];
  lastValidatedDate?: string | null;
  onRequestValidation?: () => void;
  showRequestButton?: boolean;
  size?: "sm" | "md" | "lg";
}

const CONFIDENCE_CONFIG: Record<ValidationConfidence, {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  low: {
    icon: ShieldAlert,
    label: "Low Confidence",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    description: "Self-declared only, no external validation",
  },
  medium: {
    icon: Shield,
    label: "Medium Confidence",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    description: "Manager validated or training completed",
  },
  high: {
    icon: ShieldCheck,
    label: "High Confidence",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    description: "Formally assessed with certification and manager validation",
  },
};

const SOURCE_CONFIG: Record<ValidationSourceType, {
  icon: React.ElementType;
  label: string;
}> = {
  self: { icon: User, label: "Self-declared" },
  manager: { icon: UserCheck, label: "Manager validated" },
  training: { icon: GraduationCap, label: "Training completed" },
  assessment: { icon: FileCheck, label: "Formal assessment" },
  certification: { icon: Award, label: "Certification" },
  peer: { icon: Users, label: "Peer validated" },
};

export function SkillValidationConfidenceIndicator({
  confidence,
  sources = [],
  lastValidatedDate,
  onRequestValidation,
  showRequestButton = false,
  size = "md",
}: SkillValidationConfidenceIndicatorProps) {
  const config = CONFIDENCE_CONFIG[confidence];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${config.bgColor} ${config.color} border-none ${sizeClasses[size]} cursor-help`}
            >
              <Icon className={`${iconSizes[size]} mr-1`} />
              {config.label}
            </Badge>
            {showRequestButton && confidence === "low" && onRequestValidation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRequestValidation}
                className="h-6 text-xs"
              >
                Request Validation
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3">
          <div className="space-y-2">
            <p className="font-medium flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {config.label}
            </p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
            
            {sources.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-1">Validation Sources:</p>
                <div className="flex flex-wrap gap-1">
                  {sources.map((source) => {
                    const sourceConfig = SOURCE_CONFIG[source];
                    const SourceIcon = sourceConfig.icon;
                    return (
                      <Badge
                        key={source}
                        variant="secondary"
                        className="text-xs"
                      >
                        <SourceIcon className="h-3 w-3 mr-1" />
                        {sourceConfig.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {lastValidatedDate && (
              <p className="text-xs text-muted-foreground pt-1">
                Last validated: {new Date(lastValidatedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for use in tables/lists
export function SkillConfidenceDot({
  confidence,
  showLabel = false,
}: {
  confidence: ValidationConfidence;
  showLabel?: boolean;
}) {
  const config = CONFIDENCE_CONFIG[confidence];

  const dotColors = {
    low: "bg-orange-500",
    medium: "bg-blue-500",
    high: "bg-green-500",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5 cursor-help">
            <span className={`w-2 h-2 rounded-full ${dotColors[confidence]}`} />
            {showLabel && (
              <span className={`text-xs ${config.color}`}>
                {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, Star, Trophy, Lightbulb, GraduationCap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Industry-aligned proficiency levels based on Dreyfus Model + SFIA Framework
export const DEFAULT_PROFICIENCY_LEVELS = [
  {
    level: 1,
    name: "Novice",
    shortDescription: "Basic awareness, requires significant guidance",
    fullDescription: "Follows explicit rules and instructions. Needs close supervision. Cannot adapt to new situations independently.",
    behavioralIndicators: [
      "Follows documented procedures step-by-step",
      "Requires regular check-ins and guidance",
      "Asks questions to clarify expectations",
      "Learning foundational concepts",
    ],
    appraisalGuidance: "Use for employees new to this skill who are still learning the basics. Expect hands-on mentoring.",
    icon: Lightbulb,
    color: "text-slate-500",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  {
    level: 2,
    name: "Beginner",
    shortDescription: "Can perform with some guidance, developing skills",
    fullDescription: "Recognizes patterns in recurring situations. Still rule-bound but gaining context. Shows initiative in familiar scenarios.",
    behavioralIndicators: [
      "Handles routine tasks with minimal supervision",
      "Recognizes when to ask for help",
      "Beginning to see patterns and connections",
      "Can explain basic concepts to others",
    ],
    appraisalGuidance: "Employee is building confidence. May handle straightforward cases independently but needs support for variations.",
    icon: GraduationCap,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    level: 3,
    name: "Intermediate",
    shortDescription: "Competent, works independently on routine tasks",
    fullDescription: "Works independently on routine tasks. Uses guidelines flexibly. Solves standard problems without assistance.",
    behavioralIndicators: [
      "Completes most work without supervision",
      "Adapts approach based on context",
      "Troubleshoots common issues independently",
      "Contributes to team discussions with insights",
    ],
    appraisalGuidance: "Solid performer for day-to-day work. This is the expected level for most experienced employees in their core skills.",
    icon: Star,
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    level: 4,
    name: "Advanced",
    shortDescription: "Expert level, can guide others, handles complex situations",
    fullDescription: "Sees situations holistically. Mentors others. Handles complex and unusual cases. Recognized as a go-to resource.",
    behavioralIndicators: [
      "Tackles complex problems with confidence",
      "Mentors and coaches team members",
      "Influences decisions with expertise",
      "Anticipates issues before they occur",
    ],
    appraisalGuidance: "Reserve for employees who are clearly above average. They should be mentoring others and handling escalations.",
    icon: Trophy,
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    level: 5,
    name: "Master",
    shortDescription: "Thought leader, innovates, sets standards",
    fullDescription: "Works from intuition. Innovates and creates new approaches. Sets standards for others. Industry-level expertise.",
    behavioralIndicators: [
      "Recognized authority in the field",
      "Creates new methods and best practices",
      "Consulted on strategic decisions",
      "Represents the organization externally",
    ],
    appraisalGuidance: "Very few should reach this level. Reserve for true subject matter experts who innovate and influence beyond their team.",
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
];

interface ProficiencyLevel {
  level: number;
  name: string;
  description?: string;
}

interface ProficiencyLevelPickerProps {
  value?: number;
  onChange: (level: number | undefined) => void;
  allowNone?: boolean;
  nonePlaceholder?: string;
  showDescription?: boolean;
  showAppraisalContext?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
  proficiencyScaleId?: string;
}

export function ProficiencyLevelPicker({
  value,
  onChange,
  allowNone = true,
  nonePlaceholder = "Any level",
  showDescription = true,
  showAppraisalContext = false,
  size = "default",
  className,
  proficiencyScaleId,
}: ProficiencyLevelPickerProps) {
  const [customLevels, setCustomLevels] = useState<ProficiencyLevel[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch custom proficiency scale if provided
  useEffect(() => {
    if (proficiencyScaleId) {
      setLoading(true);
      supabase
        .from("proficiency_scales")
        .select("levels")
        .eq("id", proficiencyScaleId)
        .single()
        .then(({ data, error }) => {
          if (!error && data?.levels && Array.isArray(data.levels)) {
            setCustomLevels(data.levels as unknown as ProficiencyLevel[]);
          }
          setLoading(false);
        });
    }
  }, [proficiencyScaleId]);

  const levels = customLevels || DEFAULT_PROFICIENCY_LEVELS;
  const selectedLevel = levels.find((l) => l.level === value);
  const defaultLevel = DEFAULT_PROFICIENCY_LEVELS.find((l) => l.level === value);

  return (
    <TooltipProvider>
      <Select
        value={value?.toString() || "none"}
        onValueChange={(v) => onChange(v === "none" ? undefined : parseInt(v))}
        disabled={loading}
      >
        <SelectTrigger className={cn(
          size === "sm" && "h-8 text-sm",
          size === "lg" && "h-12 text-base",
          className
        )}>
          <SelectValue placeholder={nonePlaceholder}>
            {value && selectedLevel ? (
              <div className="flex items-center gap-2">
                {defaultLevel?.icon && (
                  <defaultLevel.icon className={cn("h-4 w-4", defaultLevel.color)} />
                )}
                <span>Level {value} - {selectedLevel.name || `Level ${value}`}</span>
              </div>
            ) : (
              nonePlaceholder
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-[400px]">
          {allowNone && (
            <SelectItem value="none">
              <span className="text-muted-foreground">{nonePlaceholder}</span>
            </SelectItem>
          )}
          {DEFAULT_PROFICIENCY_LEVELS.map((level) => {
            const customLevel = customLevels?.find((cl) => cl.level === level.level);
            const displayName = customLevel?.name || level.name;
            const displayDesc = customLevel?.description || level.shortDescription;
            const Icon = level.icon;

            return (
              <SelectItem key={level.level} value={level.level.toString()}>
                <div className="flex items-start gap-3 py-1">
                  <div className={cn("p-1.5 rounded-md mt-0.5", level.bgColor)}>
                    <Icon className={cn("h-4 w-4", level.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Level {level.level}</span>
                      <Badge variant="outline" className={cn("text-xs", level.color)}>
                        {displayName}
                      </Badge>
                    </div>
                    {showDescription && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {displayDesc}
                      </p>
                    )}
                    {showAppraisalContext && (
                      <p className="text-xs text-primary/80 mt-1 italic">
                        💡 {level.appraisalGuidance}
                      </p>
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium">{displayName}</p>
                        <p className="text-sm">{level.fullDescription}</p>
                        <div className="space-y-1 mt-2">
                          <p className="text-xs font-medium text-muted-foreground">Behavioral Indicators:</p>
                          <ul className="text-xs space-y-1">
                            {level.behavioralIndicators.map((indicator, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-primary">•</span>
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </TooltipProvider>
  );
}

// Compact display component for showing proficiency level info
export function ProficiencyLevelBadge({
  level,
  showLabel = true,
  size = "default",
}: {
  level: number;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
}) {
  const levelInfo = DEFAULT_PROFICIENCY_LEVELS.find((l) => l.level === level);
  if (!levelInfo) return <span>{level}</span>;

  const Icon = levelInfo.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center gap-1.5 rounded-md cursor-help",
            levelInfo.bgColor,
            size === "sm" && "px-1.5 py-0.5 text-xs",
            size === "default" && "px-2 py-1 text-sm",
            size === "lg" && "px-3 py-1.5 text-base",
          )}>
            <Icon className={cn(
              levelInfo.color,
              size === "sm" && "h-3 w-3",
              size === "default" && "h-4 w-4",
              size === "lg" && "h-5 w-5",
            )} />
            {showLabel && (
              <span className={cn("font-medium", levelInfo.color)}>
                {levelInfo.name}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">Level {level} - {levelInfo.name}</p>
            <p className="text-sm text-muted-foreground">{levelInfo.shortDescription}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import { DEFAULT_PROFICIENCY_LEVELS } from "@/components/capabilities/ProficiencyLevelPicker";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillProficiencyLevelsPanelProps {
  skillName: string;
  skillIndicators?: { [level: string]: string[] } | null;
  currentLevel?: number;
}

export function SkillProficiencyLevelsPanel({
  skillName,
  skillIndicators,
  currentLevel,
}: SkillProficiencyLevelsPanelProps) {
  return (
    <div className="bg-muted/30 border border-border/50 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground">
          Proficiency Levels for {skillName}
        </h4>
        {currentLevel && (
          <Badge variant="secondary" className="text-[10px]">
            Required: Level {currentLevel}
          </Badge>
        )}
      </div>
      
      <div className="grid gap-2">
        {DEFAULT_PROFICIENCY_LEVELS.map((level) => {
          const Icon = level.icon;
          const isCurrentLevel = currentLevel === level.level;
          const skillSpecificIndicators = skillIndicators?.[level.level.toString()];
          
          return (
            <div
              key={level.level}
              className={cn(
                "flex gap-2 p-2 rounded-md border transition-colors",
                isCurrentLevel 
                  ? "bg-primary/5 border-primary/30" 
                  : "bg-background/50 border-transparent hover:border-border/50"
              )}
            >
              {/* Level indicator */}
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                level.bgColor
              )}>
                <Icon className={cn("h-3 w-3", level.color)} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium",
                    isCurrentLevel ? "text-primary" : "text-foreground"
                  )}>
                    L{level.level} - {level.name}
                  </span>
                  {isCurrentLevel && (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 bg-primary/10 text-primary border-primary/30">
                      Required
                    </Badge>
                  )}
                </div>
                
                {/* Skill-specific indicators if available */}
                {skillSpecificIndicators && skillSpecificIndicators.length > 0 ? (
                  <ul className="space-y-0.5">
                    {skillSpecificIndicators.slice(0, 2).map((indicator, idx) => (
                      <li key={idx} className="text-[10px] text-muted-foreground leading-tight flex gap-1">
                        <span className="text-primary/60">•</span>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {level.shortDescription}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {!skillIndicators && (
        <p className="text-[10px] text-muted-foreground/70 italic text-center">
          Skill-specific indicators not yet generated
        </p>
      )}
    </div>
  );
}

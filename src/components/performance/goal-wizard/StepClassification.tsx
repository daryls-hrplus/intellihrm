import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Building2, Users, UserCircle, Briefcase, Target, Flag, TrendingUp } from "lucide-react";
import { 
  GOAL_LEVELS, 
  GOAL_TYPES, 
  LEVEL_FIELD_CONFIG, 
  TYPE_FIELD_CONFIG,
  GoalLevel,
  GoalType,
} from "./LevelFieldConfig";

const levelIcons: Record<GoalLevel, React.ElementType> = {
  company: Building2,
  department: Users,
  team: UserCircle,
  project: Briefcase,
  individual: Target,
};

const typeIcons: Record<GoalType, React.ElementType> = {
  smart_goal: Target,
  okr_objective: Flag,
  okr_key_result: TrendingUp,
};

interface StepClassificationProps {
  goalLevel: GoalLevel;
  goalType: GoalType;
  onLevelChange: (level: GoalLevel) => void;
  onTypeChange: (type: GoalType) => void;
}

export function StepClassification({
  goalLevel,
  goalType,
  onLevelChange,
  onTypeChange,
}: StepClassificationProps) {
  return (
    <div className="space-y-6">
      {/* Goal Level Selection */}
      <div>
        <h3 className="text-sm font-medium mb-3">Goal Level</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Select the organizational level this goal applies to. This determines which fields are relevant.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GOAL_LEVELS.map(({ value, label }) => {
            const Icon = levelIcons[value];
            const config = LEVEL_FIELD_CONFIG[value];
            const isSelected = goalLevel === value;

            return (
              <Card
                key={value}
                onClick={() => onLevelChange(value)}
                className={cn(
                  "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
                  isSelected 
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      isSelected && "text-primary"
                    )}>
                      {label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                      {config.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Goal Type Selection */}
      <div>
        <h3 className="text-sm font-medium mb-3">Goal Type</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choose the goal framework. SMART goals include detailed criteria; OKRs focus on objectives and key results.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {GOAL_TYPES.map(({ value, label }) => {
            const Icon = typeIcons[value];
            const config = TYPE_FIELD_CONFIG[value];
            const isSelected = goalType === value;

            return (
              <Card
                key={value}
                onClick={() => onTypeChange(value)}
                className={cn(
                  "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
                  isSelected 
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      isSelected && "text-primary"
                    )}>
                      {label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                      {config.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Contextual Help */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Tip:</span>{" "}
          {goalLevel === "company" && "Company goals cascade down to departments and teams, providing strategic alignment."}
          {goalLevel === "department" && "Department goals bridge company strategy and team execution."}
          {goalLevel === "team" && "Team goals are collaborative objectives shared by team members."}
          {goalLevel === "project" && "Project goals are time-bound deliverables with clear milestones."}
          {goalLevel === "individual" && "Individual goals align to your role and contribute to team objectives."}
        </p>
      </div>
    </div>
  );
}

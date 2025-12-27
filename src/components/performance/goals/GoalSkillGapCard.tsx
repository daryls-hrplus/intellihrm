import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Brain, BookOpen, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useGoalAIAnalyzer } from "@/hooks/performance/useGoalAIAnalyzer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InferredSkill {
  skill_name: string;
  skill_category: string;
  proficiency_level: string;
  importance: string;
}

interface GoalSkillGapCardProps {
  goalId: string;
  goalTitle: string;
  goalDescription?: string;
  companyId: string;
  employeeSkills?: { skill_name: string; proficiency_level: number }[];
  onViewTraining?: (skillName: string) => void;
}

export function GoalSkillGapCard({
  goalId,
  goalTitle,
  goalDescription,
  companyId,
  employeeSkills = [],
  onViewTraining,
}: GoalSkillGapCardProps) {
  const { inferSkills, analyzing } = useGoalAIAnalyzer();
  const [skills, setSkills] = useState<InferredSkill[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && !hasLoaded && goalTitle) {
      loadSkills();
    }
  }, [isOpen, hasLoaded, goalTitle]);

  const loadSkills = async () => {
    const result = await inferSkills({
      id: goalId,
      title: goalTitle,
      description: goalDescription,
      company_id: companyId,
    });

    if (result?.skills) {
      setSkills(result.skills);
      setHasLoaded(true);
    }
  };

  const getProficiencyValue = (level: string): number => {
    const levels: Record<string, number> = {
      basic: 25,
      intermediate: 50,
      advanced: 75,
      expert: 100,
    };
    return levels[level.toLowerCase()] || 50;
  };

  const getImportanceColor = (importance: string) => {
    switch (importance.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const hasSkillGap = (skill: InferredSkill): boolean => {
    const employeeSkill = employeeSkills.find(
      (s) => s.skill_name.toLowerCase() === skill.skill_name.toLowerCase()
    );
    if (!employeeSkill) return true;
    return employeeSkill.proficiency_level < getProficiencyValue(skill.proficiency_level);
  };

  const gapSkills = skills.filter(hasSkillGap);

  return (
    <Card className="border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Skill Requirements
                {hasLoaded && gapSkills.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {gapSkills.length} gap{gapSkills.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {analyzing ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : skills.length > 0 ? (
              <>
                {skills.map((skill, index) => {
                  const isGap = hasSkillGap(skill);
                  const employeeSkill = employeeSkills.find(
                    (s) => s.skill_name.toLowerCase() === skill.skill_name.toLowerCase()
                  );

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        isGap ? "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20" : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{skill.skill_name}</span>
                            <Badge variant={getImportanceColor(skill.importance)} className="text-xs">
                              {skill.importance}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {skill.skill_category} • Required: {skill.proficiency_level}
                          </p>
                        </div>
                        {isGap && (
                          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Required level</span>
                          <span>{skill.proficiency_level}</span>
                        </div>
                        <Progress
                          value={getProficiencyValue(skill.proficiency_level)}
                          className="h-1.5"
                        />

                        {employeeSkill && (
                          <>
                            <div className="flex items-center justify-between text-xs mt-1">
                              <span className="text-muted-foreground">Current level</span>
                              <span>{employeeSkill.proficiency_level}%</span>
                            </div>
                            <Progress
                              value={employeeSkill.proficiency_level}
                              className="h-1.5 bg-muted"
                            />
                          </>
                        )}
                      </div>

                      {isGap && onViewTraining && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs gap-1"
                          onClick={() => onViewTraining(skill.skill_name)}
                        >
                          <BookOpen className="h-3 w-3" />
                          Find Training
                        </Button>
                      )}
                    </div>
                  );
                })}

                {gapSkills.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600 py-2">
                    <TrendingUp className="h-4 w-4" />
                    All required skills are at the needed proficiency level
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Click to analyze skill requirements for this goal.
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

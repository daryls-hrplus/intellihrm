import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ChevronDown, ChevronUp, Plus, X, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Default proficiency level definitions matching industry standards
export const DEFAULT_PROFICIENCY_LEVELS = [
  {
    level: 1,
    name: "Novice",
    description: "Limited knowledge, requires close supervision",
    icon: "🌱",
    color: "bg-slate-100 border-slate-300 text-slate-700",
  },
  {
    level: 2,
    name: "Beginner",
    description: "Basic understanding, handles routine tasks",
    icon: "📚",
    color: "bg-blue-100 border-blue-300 text-blue-700",
  },
  {
    level: 3,
    name: "Competent",
    description: "Works independently, applies good judgment",
    icon: "⚡",
    color: "bg-green-100 border-green-300 text-green-700",
  },
  {
    level: 4,
    name: "Proficient",
    description: "Handles complex situations, mentors others",
    icon: "🎯",
    color: "bg-purple-100 border-purple-300 text-purple-700",
  },
  {
    level: 5,
    name: "Expert",
    description: "Recognized authority, innovates and sets standards",
    icon: "🏆",
    color: "bg-amber-100 border-amber-300 text-amber-700",
  },
];

export interface ProficiencyIndicators {
  [level: string]: string[];
}

interface CompetencyBehavioralLevelsEditorProps {
  competencyName: string;
  competencyDescription?: string;
  competencyCategory?: string;
  competencyId?: string;
  indicators: ProficiencyIndicators;
  onIndicatorsChange: (indicators: ProficiencyIndicators) => void;
  readOnly?: boolean;
}

export function CompetencyBehavioralLevelsEditor({
  competencyName,
  competencyDescription,
  competencyCategory,
  competencyId,
  indicators,
  onIndicatorsChange,
  readOnly = false,
}: CompetencyBehavioralLevelsEditorProps) {
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([3])); // Default expand level 3
  const [generating, setGenerating] = useState(false);

  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const getIndicatorsForLevel = (level: number): string[] => {
    return indicators[String(level)] || [];
  };

  const setIndicatorsForLevel = (level: number, newIndicators: string[]) => {
    onIndicatorsChange({
      ...indicators,
      [String(level)]: newIndicators,
    });
  };

  const addIndicator = (level: number) => {
    const current = getIndicatorsForLevel(level);
    if (current.length < 6) {
      setIndicatorsForLevel(level, [...current, ""]);
    }
  };

  const removeIndicator = (level: number, index: number) => {
    const current = getIndicatorsForLevel(level);
    if (current.length > 0) {
      setIndicatorsForLevel(level, current.filter((_, i) => i !== index));
    }
  };

  const updateIndicator = (level: number, index: number, value: string) => {
    const current = getIndicatorsForLevel(level);
    const updated = [...current];
    updated[index] = value;
    setIndicatorsForLevel(level, updated);
  };

  const generateWithAI = async () => {
    if (!competencyName) {
      toast.error("Please enter a competency name first");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("capability-ai-analyzer", {
        body: {
          action: "generate_proficiency_indicators",
          capability: {
            id: competencyId,
            name: competencyName,
            description: competencyDescription || "",
            type: "COMPETENCY",
            code: "",
            category: competencyCategory,
          },
        },
      });

      if (error) throw error;

      if (data?.proficiency_indicators) {
        onIndicatorsChange(data.proficiency_indicators);
        // Expand all levels to show generated content
        setExpandedLevels(new Set([1, 2, 3, 4, 5]));
        toast.success("Behavioral indicators generated successfully");
      } else if (data?.levels) {
        // Transform the levels array format to our object format
        const newIndicators: ProficiencyIndicators = {};
        for (const level of data.levels) {
          newIndicators[String(level.level)] = level.behavioral_indicators || [];
        }
        onIndicatorsChange(newIndicators);
        setExpandedLevels(new Set([1, 2, 3, 4, 5]));
        toast.success("Behavioral indicators generated successfully");
      }
    } catch (error) {
      console.error("Error generating indicators:", error);
      toast.error("Failed to generate behavioral indicators");
    } finally {
      setGenerating(false);
    }
  };

  const hasAnyIndicators = Object.values(indicators).some((arr) => arr.length > 0);
  const totalIndicators = Object.values(indicators).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">Behavioral Indicators by Level</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Define observable behaviors for each proficiency level. These will be shown
                  during appraisals to help managers assess competency levels consistently.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {hasAnyIndicators && (
            <Badge variant="secondary" className="ml-2">
              {totalIndicators} indicators defined
            </Badge>
          )}
        </div>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateWithAI}
            disabled={generating || !competencyName}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {DEFAULT_PROFICIENCY_LEVELS.map((levelDef) => {
          const levelIndicators = getIndicatorsForLevel(levelDef.level);
          const isExpanded = expandedLevels.has(levelDef.level);

          return (
            <Card key={levelDef.level} className={`border ${levelIndicators.length > 0 ? 'border-primary/30' : ''}`}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleLevel(levelDef.level)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{levelDef.icon}</span>
                        <div>
                          <CardTitle className="text-sm font-medium">
                            Level {levelDef.level}: {levelDef.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">{levelDef.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {levelIndicators.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {levelIndicators.length} indicators
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 px-4 space-y-3">
                    {levelIndicators.length === 0 ? (
                      <div className="text-sm text-muted-foreground italic py-2">
                        No behavioral indicators defined for this level.
                        {!readOnly && " Click 'Add Indicator' or use AI generation."}
                      </div>
                    ) : (
                      levelIndicators.map((indicator, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1">
                            <Textarea
                              value={indicator}
                              onChange={(e) => updateIndicator(levelDef.level, index, e.target.value)}
                              placeholder={`Describe observable behavior for Level ${levelDef.level}...`}
                              rows={2}
                              disabled={readOnly}
                              className="resize-none text-sm"
                            />
                          </div>
                          {!readOnly && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeIndicator(levelDef.level, index)}
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                    {!readOnly && levelIndicators.length < 6 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addIndicator(levelDef.level)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Indicator
                      </Button>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {!hasAnyIndicators && !readOnly && (
        <div className="rounded-lg border-2 border-dashed p-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            No behavioral indicators defined yet. Use AI to generate industry-standard indicators
            based on this competency's name and description.
          </p>
          <Button
            type="button"
            variant="default"
            onClick={generateWithAI}
            disabled={generating || !competencyName}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Behavioral Indicators
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

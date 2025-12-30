import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEFAULT_PROFICIENCY_LEVELS } from "@/components/capabilities/CompetencyBehavioralLevelsEditor";

interface ProficiencyIndicators {
  [level: string]: string[];
}

interface CompetencyScoreData {
  rating: number | null;
  comments: string;
  metadata?: {
    selected_level?: number;
    demonstrated_behaviors?: string[];
    evidence?: string;
  };
}

interface CompetencyRatingCardProps {
  competencyId: string;
  competencyName: string;
  competencyCategory?: string;
  weight: number;
  requiredLevel?: number;
  proficiencyIndicators?: ProficiencyIndicators;
  currentScore: CompetencyScoreData;
  isReadOnly?: boolean;
  onChange: (updates: Partial<CompetencyScoreData>) => void;
  segmentName?: string;
  positionTitle?: string;
  hasRoleChange?: boolean;
  hasMultiplePositions?: boolean;
}

export function CompetencyRatingCard({
  competencyId,
  competencyName,
  competencyCategory,
  weight,
  requiredLevel,
  proficiencyIndicators,
  currentScore,
  isReadOnly = false,
  onChange,
  segmentName,
  positionTitle,
  hasRoleChange = false,
  hasMultiplePositions = false,
}: CompetencyRatingCardProps) {
  const [expandedIndicators, setExpandedIndicators] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(
    currentScore.metadata?.selected_level ?? currentScore.rating ?? null
  );
  const [demonstratedBehaviors, setDemonstratedBehaviors] = useState<string[]>(
    currentScore.metadata?.demonstrated_behaviors || []
  );
  const [evidence, setEvidence] = useState(currentScore.metadata?.evidence || "");
  const [comments, setComments] = useState(currentScore.comments || "");

  const hasIndicators = proficiencyIndicators && Object.keys(proficiencyIndicators).length > 0;
  const currentLevelIndicators = selectedLevel ? proficiencyIndicators?.[String(selectedLevel)] || [] : [];

  // Update parent when local state changes
  useEffect(() => {
    if (selectedLevel !== null) {
      // Calculate weighted score
      const weightedScore = (selectedLevel / 5) * weight;
      
      onChange({
        rating: selectedLevel,
        comments,
        metadata: {
          selected_level: selectedLevel,
          demonstrated_behaviors: demonstratedBehaviors,
          evidence,
        },
      });
    }
  }, [selectedLevel, demonstratedBehaviors, evidence, comments]);

  const handleLevelSelect = (level: number) => {
    if (isReadOnly) return;
    
    setSelectedLevel(level);
    // Reset behaviors when level changes
    setDemonstratedBehaviors([]);
    
    // Auto-expand indicators when a level is selected
    if (hasIndicators) {
      setExpandedIndicators(true);
    }
  };

  const toggleBehavior = (behavior: string) => {
    if (isReadOnly) return;
    
    setDemonstratedBehaviors((prev) => {
      if (prev.includes(behavior)) {
        return prev.filter((b) => b !== behavior);
      } else {
        return [...prev, behavior];
      }
    });
  };

  const getLevelDef = (level: number) => {
    return DEFAULT_PROFICIENCY_LEVELS.find((l) => l.level === level) || DEFAULT_PROFICIENCY_LEVELS[0];
  };

  const selectedLevelDef = selectedLevel ? getLevelDef(selectedLevel) : null;
  const meetsRequirement = requiredLevel && selectedLevel ? selectedLevel >= requiredLevel : true;
  const behaviorCheckCount = demonstratedBehaviors.length;
  const totalBehaviorsForLevel = currentLevelIndicators.length;

  return (
    <Card className={`transition-all ${selectedLevel !== null ? 'border-primary/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base">{competencyName}</CardTitle>
            {competencyCategory && (
              <Badge variant="secondary" className="text-xs capitalize">
                {competencyCategory}
              </Badge>
            )}
            {segmentName && hasRoleChange && (
              <Badge variant="secondary" className="text-xs">
                {segmentName}
              </Badge>
            )}
            {positionTitle && hasMultiplePositions && (
              <Badge variant="outline" className="text-xs bg-accent/20">
                {positionTitle}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{weight.toFixed(1)}% weight</Badge>
            {requiredLevel && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge 
                      variant={meetsRequirement ? "default" : "destructive"}
                      className="text-xs"
                    >
                      Required: L{requiredLevel}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Job profile requires Level {requiredLevel} ({getLevelDef(requiredLevel).name})</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Level Selection Cards */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label className="text-sm font-medium">Select Proficiency Level</Label>
            {!hasIndicators && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>This competency doesn't have behavioral indicators defined yet. You can still select a level based on your assessment.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {DEFAULT_PROFICIENCY_LEVELS.map((levelDef) => {
              const isSelected = selectedLevel === levelDef.level;
              const levelIndicators = proficiencyIndicators?.[String(levelDef.level)] || [];
              const hasLevelIndicators = levelIndicators.length > 0;
              
              return (
                <button
                  key={levelDef.level}
                  type="button"
                  onClick={() => handleLevelSelect(levelDef.level)}
                  disabled={isReadOnly}
                  className={`
                    p-3 rounded-lg border-2 text-center transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/10 shadow-sm' 
                      : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                    }
                    ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}
                    ${!hasLevelIndicators ? 'opacity-80' : ''}
                  `}
                >
                  <span className="text-xl block mb-1">{levelDef.icon}</span>
                  <span className={`text-xs font-medium block ${isSelected ? 'text-primary' : ''}`}>
                    L{levelDef.level}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {levelDef.name}
                  </span>
                  {hasLevelIndicators && (
                    <span className="text-[10px] text-muted-foreground/60 block">
                      {levelIndicators.length} indicators
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Selected level description */}
          {selectedLevelDef && (
            <div className={`mt-3 p-3 rounded-lg ${selectedLevelDef.color} border`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedLevelDef.icon}</span>
                <div>
                  <p className="text-sm font-medium">
                    Level {selectedLevelDef.level}: {selectedLevelDef.name}
                  </p>
                  <p className="text-xs opacity-80">{selectedLevelDef.description}</p>
                </div>
                {!meetsRequirement && requiredLevel && (
                  <div className="ml-auto flex items-center gap-1 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">Below required level</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Behavioral Indicators Section */}
        {hasIndicators && selectedLevel !== null && currentLevelIndicators.length > 0 && (
          <Collapsible open={expandedIndicators} onOpenChange={setExpandedIndicators}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Demonstrated Behaviors
                  </span>
                  {behaviorCheckCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {behaviorCheckCount}/{totalBehaviorsForLevel} checked
                    </Badge>
                  )}
                </div>
                {expandedIndicators ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-3">
                  Check the behaviors you have directly observed or have documented evidence for:
                </p>
                {currentLevelIndicators.map((indicator, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-start gap-3 p-2 rounded-md transition-colors
                      ${demonstratedBehaviors.includes(indicator) ? 'bg-primary/5' : 'hover:bg-muted/50'}
                    `}
                  >
                    <Checkbox
                      id={`indicator-${competencyId}-${index}`}
                      checked={demonstratedBehaviors.includes(indicator)}
                      onCheckedChange={() => toggleBehavior(indicator)}
                      disabled={isReadOnly}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`indicator-${competencyId}-${index}`}
                      className={`
                        text-sm cursor-pointer flex-1
                        ${demonstratedBehaviors.includes(indicator) ? 'text-foreground' : 'text-muted-foreground'}
                      `}
                    >
                      {indicator}
                    </label>
                  </div>
                ))}
                
                {behaviorCheckCount === 0 && !isReadOnly && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="text-xs">
                      Consider checking at least one behavior you've observed to support this rating
                    </span>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Evidence Field */}
        <div className="space-y-2">
          <Label htmlFor={`evidence-${competencyId}`} className="text-sm">
            Supporting Evidence
          </Label>
          <Textarea
            id={`evidence-${competencyId}`}
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Describe specific examples or evidence that support this rating..."
            rows={2}
            disabled={isReadOnly}
            className="text-sm"
          />
        </div>

        {/* Comments Field */}
        <div className="space-y-2">
          <Label htmlFor={`comments-${competencyId}`} className="text-sm">
            Additional Comments
          </Label>
          <Textarea
            id={`comments-${competencyId}`}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any additional feedback or development suggestions..."
            rows={2}
            disabled={isReadOnly}
            className="text-sm"
          />
        </div>

        {/* Score display */}
        {selectedLevel !== null && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">Weighted contribution:</span>
            <span className="font-medium">
              {((selectedLevel / 5) * weight).toFixed(1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

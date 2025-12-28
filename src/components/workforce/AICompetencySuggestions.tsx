import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, ChevronDown, ChevronRight, Loader2, RefreshCw, Check, Plus } from "lucide-react";
import { useCapabilityAIAnalyzer } from "@/hooks/capabilities/useCapabilityAIAnalyzer";

interface Capability {
  id: string;
  name: string;
  code: string;
  type: string;
  category: string;
}

interface SuggestedCapability {
  name: string;
  confidence?: number;
  reason?: string;
  matchedCapability?: Capability;
}

interface AICompetencySuggestionsProps {
  jobName: string;
  jobDescription?: string;
  companyId: string;
  availableCompetencies: Capability[];
  existingRequirementIds: string[];
  onSelectCompetency: (capability: Capability) => void;
}

export function AICompetencySuggestions({
  jobName,
  jobDescription,
  companyId,
  availableCompetencies,
  existingRequirementIds,
  onSelectCompetency,
}: AICompetencySuggestionsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestedCapability[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { analyzing, inferSkillsFromText } = useCapabilityAIAnalyzer();

  const fetchSuggestions = async () => {
    const text = `Job Title: ${jobName}\n${jobDescription ? `Description: ${jobDescription}` : ""}`;
    const result = await inferSkillsFromText(text, companyId);
    
    if (result?.skills) {
      // Match AI suggestions to actual competencies in the system
      const matched = result.skills
        .filter((s: any) => s.type === "COMPETENCY" || s.category === "behavioral" || s.category === "leadership")
        .map((s: any) => {
          const matchedCap = availableCompetencies.find(
            (c) =>
              c.name.toLowerCase() === s.name.toLowerCase() ||
              c.code.toLowerCase() === s.name.toLowerCase().replace(/\s+/g, "_")
          );
          return {
            name: s.name,
            confidence: s.confidence,
            reason: s.reason,
            matchedCapability: matchedCap,
          };
        })
        .filter((s: SuggestedCapability) => s.matchedCapability); // Only show if we have a match
      
      setSuggestions(matched);
    }
  };

  useEffect(() => {
    if (jobName && availableCompetencies.length > 0) {
      fetchSuggestions();
    }
  }, [jobName, availableCompetencies.length]);

  const handleAddSuggestion = (suggestion: SuggestedCapability) => {
    if (suggestion.matchedCapability) {
      onSelectCompetency(suggestion.matchedCapability);
      setAddedIds((prev) => new Set([...prev, suggestion.matchedCapability!.id]));
    }
  };

  const isAlreadyAdded = (suggestion: SuggestedCapability) => {
    if (!suggestion.matchedCapability) return false;
    return (
      existingRequirementIds.includes(suggestion.matchedCapability.id) ||
      addedIds.has(suggestion.matchedCapability.id)
    );
  };

  if (!jobName) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-4">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="font-medium">AI Suggested Competencies</span>
                <Badge variant="secondary" className="text-xs">
                  Based on "{jobName}"
                </Badge>
              </div>
            </Button>
          </CollapsibleTrigger>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fetchSuggestions();
            }}
            disabled={analyzing}
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 text-xs">Refresh</span>
          </Button>
        </div>

        <CollapsibleContent>
          <div className="mt-4">
            {analyzing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing job profile for competency suggestions...
              </div>
            ) : suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No matching competencies found. Try adding a job description for better suggestions.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <TooltipProvider key={idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isAlreadyAdded(suggestion) ? "secondary" : "outline"}
                          size="sm"
                          className={`h-8 gap-2 ${
                            isAlreadyAdded(suggestion)
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200"
                              : "hover:bg-purple-100 dark:hover:bg-purple-900/30"
                          }`}
                          onClick={() => !isAlreadyAdded(suggestion) && handleAddSuggestion(suggestion)}
                          disabled={isAlreadyAdded(suggestion)}
                        >
                          {isAlreadyAdded(suggestion) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          {suggestion.matchedCapability?.name || suggestion.name}
                          {suggestion.confidence && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">{suggestion.matchedCapability?.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            Category: {suggestion.matchedCapability?.category}
                          </p>
                          {suggestion.reason && (
                            <p className="text-xs">{suggestion.reason}</p>
                          )}
                          {isAlreadyAdded(suggestion) && (
                            <p className="text-xs text-green-600">Already added to this job</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Click a suggestion to add it as a requirement. Competencies are evaluated in performance appraisals.
          </p>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link2, X, Plus, GraduationCap, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompetencySkillMappings, CompetencySkillMapping } from "@/hooks/useCapabilities";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CompetencySkillLinkerProps {
  competencyId?: string;
  competencyName: string;
  competencyDescription?: string;
  competencyCategory?: string;
  companyId?: string | null;
  isEditing: boolean;
  onMappingsChange?: (mappings: CompetencySkillMapping[]) => void;
}

interface AvailableSkill {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
}

export function CompetencySkillLinker({
  competencyId,
  competencyName,
  competencyDescription,
  competencyCategory,
  companyId,
  isEditing,
  onMappingsChange,
}: CompetencySkillLinkerProps) {
  const { mappings, loading, fetchMappings, addMapping, removeMapping } = useCompetencySkillMappings();
  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loadingSkills, setLoadingSkills] = useState(false);
  
  // AI Suggestions state
  const [suggestingAI, setSuggestingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ 
    skill_id: string; 
    skill_name: string; 
    reasoning: string 
  }>>([]);

  // Pending mappings for new competencies (not yet saved)
  const [pendingMappings, setPendingMappings] = useState<{
    skill: AvailableSkill;
    weight: number;
    is_required: boolean;
    min_proficiency_level: number | null;
  }[]>([]);

  useEffect(() => {
    if (competencyId && isEditing) {
      fetchMappings(competencyId);
    }
    fetchAvailableSkills();
  }, [competencyId, isEditing, companyId]);

  useEffect(() => {
    onMappingsChange?.(mappings);
  }, [mappings, onMappingsChange]);

  const fetchAvailableSkills = async () => {
    setLoadingSkills(true);
    try {
      let query = supabase
        .from("skills_competencies")
        .select("id, name, code, category, description")
        .eq("type", "SKILL")
        .eq("status", "active")
        .order("name");

      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }

      const { data, error } = await query.limit(200);
      if (error) throw error;
      setAvailableSkills(data || []);
    } catch (err) {
      console.error("Error fetching skills:", err);
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleAddSkill = async (skill: AvailableSkill) => {
    setSearchOpen(false);
    setSearchValue("");

    if (competencyId) {
      // Competency exists, add to DB immediately
      const success = await addMapping(competencyId, skill.id, 1, false);
      if (success) {
        await fetchMappings(competencyId);
      }
    } else {
      // Competency not yet created, add to pending
      if (!pendingMappings.find(m => m.skill.id === skill.id)) {
        setPendingMappings(prev => [...prev, {
          skill,
          weight: 1,
          is_required: false,
          min_proficiency_level: null,
        }]);
      }
    }
  };

  const handleRemoveSkill = async (mappingId: string, isFromPending: boolean = false) => {
    if (isFromPending) {
      setPendingMappings(prev => prev.filter((_, i) => `pending-${i}` !== mappingId));
    } else if (competencyId) {
      const success = await removeMapping(mappingId);
      if (success) {
        await fetchMappings(competencyId);
      }
    }
  };

  const handleAISuggest = async () => {
    if (!competencyId || !competencyName) return;
    setSuggestingAI(true);
    setAiSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-skill-mappings", {
        body: {
          competency_id: competencyId,
          competency_name: competencyName,
          competency_description: competencyDescription,
          competency_category: competencyCategory,
        },
      });

      if (error) throw error;

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        // Filter out already mapped skills
        const unmappedSuggestions = data.suggestions.filter(
          (s: any) => !mappings.some((m) => m.skill_id === s.skill_id) &&
                      !pendingMappings.some((m) => m.skill.id === s.skill_id)
        );
        
        // Deduplicate by skill_id
        const seenIds = new Set<string>();
        const deduplicatedSuggestions = unmappedSuggestions.filter((s: any) => {
          if (seenIds.has(s.skill_id)) return false;
          seenIds.add(s.skill_id);
          return true;
        });
        
        setAiSuggestions(deduplicatedSuggestions);
        if (deduplicatedSuggestions.length === 0) {
          toast.info("No new skill suggestions - all suggested skills are already mapped");
        } else {
          toast.success(`Found ${deduplicatedSuggestions.length} skill suggestions`);
        }
      }
    } catch (error: any) {
      console.error("AI suggest error:", error);
      toast.error(error.message || "Failed to get AI suggestions");
    } finally {
      setSuggestingAI(false);
    }
  };

  const handleApplySuggestion = async (suggestion: { skill_id: string; skill_name: string }) => {
    if (!competencyId) return;
    const success = await addMapping(competencyId, suggestion.skill_id, 1, false);
    if (success) {
      await fetchMappings(competencyId);
      setAiSuggestions((prev) => prev.filter((s) => s.skill_id !== suggestion.skill_id));
      toast.success(`Linked "${suggestion.skill_name}"`);
    }
  };

  const linkedSkillIds = new Set([
    ...mappings.map(m => m.skill_id),
    ...pendingMappings.map(m => m.skill.id),
  ]);

  const filteredSkills = availableSkills.filter(skill => 
    !linkedSkillIds.has(skill.id) &&
    (skill.name.toLowerCase().includes(searchValue.toLowerCase()) ||
     skill.code.toLowerCase().includes(searchValue.toLowerCase()))
  );

  const displayMappings = [
    ...mappings.map(m => ({
      id: m.id,
      name: m.skill?.name || "Unknown",
      code: m.skill?.code || "",
      category: m.skill?.category || "",
      weight: m.weight,
      is_required: m.is_required,
      min_proficiency_level: m.min_proficiency_level,
      isPending: false,
    })),
    ...pendingMappings.map((m, i) => ({
      id: `pending-${i}`,
      name: m.skill.name,
      code: m.skill.code,
      category: m.skill.category,
      weight: m.weight,
      is_required: m.is_required,
      min_proficiency_level: m.min_proficiency_level,
      isPending: true,
    })),
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      functional: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      behavioral: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      leadership: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      core: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };
    return colors[category] || colors.core;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Supporting Skills
          </CardTitle>
          <Badge variant="secondary">
            {displayMappings.length} linked
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Link skills that support or contribute to this competency. This enables skill-based learning paths and gap analysis.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Suggestions - Only show for existing competencies */}
        {competencyId && (
          <div className="border rounded-lg p-3 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Suggestions
                {aiSuggestions.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {aiSuggestions.length}
                  </Badge>
                )}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAISuggest}
                disabled={suggestingAI}
                className="gap-2 h-8"
              >
                {suggestingAI ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Suggest
                  </>
                )}
              </Button>
            </div>
            {aiSuggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {aiSuggestions.slice(0, 8).map((suggestion) => (
                  <TooltipProvider key={suggestion.skill_id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border hover:border-primary/50 transition-colors cursor-pointer">
                          <GraduationCap className="h-3 w-3 text-blue-500" />
                          <span className="text-sm font-medium">{suggestion.skill_name}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleApplySuggestion(suggestion)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-medium">{suggestion.skill_name}</p>
                        {suggestion.reasoning && (
                          <p className="text-xs italic mt-1">{suggestion.reasoning}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {aiSuggestions.length > 8 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{aiSuggestions.length - 8} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add Skill Button */}
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              Link a Skill
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search skills..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>
                  {loadingSkills ? "Loading skills..." : "No skills found."}
                </CommandEmpty>
                <CommandGroup heading="Available Skills">
                  {filteredSkills.slice(0, 20).map((skill) => (
                    <CommandItem
                      key={skill.id}
                      value={skill.name}
                      onSelect={() => handleAddSkill(skill)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-xs text-muted-foreground">{skill.code}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={cn("text-xs", getCategoryColor(skill.category))}>
                        {skill.category}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Linked Skills List */}
        {displayMappings.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No skills linked yet</p>
            <p className="text-xs">Link skills that support this competency</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayMappings.map((mapping) => (
              <div
                key={mapping.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  mapping.isPending ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" : "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{mapping.name}</span>
                      <Badge variant="secondary" className={cn("text-xs", getCategoryColor(mapping.category))}>
                        {mapping.category}
                      </Badge>
                      {mapping.is_required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                      {mapping.isPending && (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                          Pending Save
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{mapping.code}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {mapping.min_proficiency_level && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs">
                            L{mapping.min_proficiency_level}+
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          Minimum proficiency level required
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveSkill(mapping.id, mapping.isPending)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info about skill-competency relationships */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground mb-1">How this helps:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Employees can target skills to improve this competency</li>
              <li>Learning paths automatically include supporting skills</li>
              <li>Gap analysis shows which skills need development</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

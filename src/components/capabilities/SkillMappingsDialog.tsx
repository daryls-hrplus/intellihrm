import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Plus, Trash2, Zap, Search, Loader2, Sparkles, Info } from "lucide-react";
import {
  Capability,
  useCompetencySkillMappings,
  useCapabilities,
} from "@/hooks/useCapabilities";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SkillMappingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competency: Capability | null;
}

export function SkillMappingsDialog({
  open,
  onOpenChange,
  competency,
}: SkillMappingsDialogProps) {
  const { mappings, loading, fetchMappings, addMapping, removeMapping } =
    useCompetencySkillMappings();
  const { capabilities: skills, fetchCapabilities } = useCapabilities();

  const [availableSkills, setAvailableSkills] = useState<Capability[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [suggestingAI, setSuggestingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ skill_id: string; skill_name: string; weight: number; reasoning: string }>>([]);

  useEffect(() => {
    if (open && competency) {
      fetchMappings(competency.id);
      fetchCapabilities({ 
        type: "SKILL", 
        status: "active",
        companyId: competency.company_id || undefined,
      }).then((data) => {
        setAvailableSkills(data);
      });
    }
  }, [open, competency, fetchMappings, fetchCapabilities]);

  // Deduplicate skills by name, preferring company-specific over global
  const deduplicatedSkills = useMemo(() => {
    const skillMap = new Map<string, Capability>();
    
    for (const skill of availableSkills) {
      const key = skill.name.toLowerCase();
      const existing = skillMap.get(key);
      
      if (!existing) {
        skillMap.set(key, skill);
      } else {
        const isCurrentCompanySpecific = skill.company_id === competency?.company_id;
        const isExistingGlobal = !existing.company_id;
        
        if (isCurrentCompanySpecific && isExistingGlobal) {
          skillMap.set(key, skill);
        }
      }
    }
    
    return Array.from(skillMap.values());
  }, [availableSkills, competency?.company_id]);

  const filteredSkills = deduplicatedSkills.filter((skill) => {
    const isMapped = mappings.some((m) => m.skill_id === skill.id);
    if (isMapped) return false;

    if (search) {
      const searchLower = search.toLowerCase();
      return (
        skill.name.toLowerCase().includes(searchLower) ||
        skill.code.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Get skill details for showing in tooltip
  const getSkillById = (skillId: string) => {
    return availableSkills.find(s => s.id === skillId);
  };

  const handleAddMapping = async () => {
    if (!competency || !selectedSkill) return;

    setAdding(true);
    // Simplified: no weight, is_required, or min_level at this level
    const success = await addMapping(
      competency.id,
      selectedSkill,
      50, // default weight
      false, // not required
      undefined // no min level
    );

    if (success) {
      await fetchMappings(competency.id);
      setSelectedSkill("");
    }
    setAdding(false);
  };

  const handleRemoveMapping = async (id: string) => {
    const success = await removeMapping(id);
    if (success && competency) {
      await fetchMappings(competency.id);
    }
  };

  const handleAISuggest = async () => {
    if (!competency) return;
    setSuggestingAI(true);
    setAiSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-skill-mappings", {
        body: {
          competency_id: competency.id,
          competency_name: competency.name,
          competency_description: competency.description,
          competency_category: competency.category,
        },
      });

      if (error) throw error;

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        const unmappedSuggestions = data.suggestions.filter(
          (s: any) => !mappings.some((m) => m.skill_id === s.skill_id)
        );
        setAiSuggestions(unmappedSuggestions);
        if (unmappedSuggestions.length === 0) {
          toast.info("No new skill suggestions - all suggested skills are already mapped");
        } else {
          toast.success(`Found ${unmappedSuggestions.length} skill suggestions`);
        }
      }
    } catch (error: any) {
      console.error("AI suggest error:", error);
      toast.error(error.message || "Failed to get AI suggestions");
    } finally {
      setSuggestingAI(false);
    }
  };

  const handleApplySuggestion = async (suggestion: { skill_id: string }) => {
    if (!competency) return;
    setAdding(true);
    const success = await addMapping(
      competency.id,
      suggestion.skill_id,
      50, // default weight
      false,
      undefined
    );
    if (success) {
      await fetchMappings(competency.id);
      setAiSuggestions((prev) => prev.filter((s) => s.skill_id !== suggestion.skill_id));
      toast.success("Skill linked");
    }
    setAdding(false);
  };

  if (!competency) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Skills Linked to: {competency.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Link skills that help develop this competency. Proficiency requirements are set at the job level.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <TooltipProvider>
            <div className="space-y-6">
              {/* AI Suggestions - Compact View */}
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
                    {aiSuggestions.slice(0, 8).map((suggestion) => {
                      const skillDetails = getSkillById(suggestion.skill_id);
                      return (
                        <Tooltip key={suggestion.skill_id}>
                          <TooltipTrigger asChild>
                            <div className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border hover:border-primary/50 transition-colors cursor-pointer">
                              <Zap className="h-3 w-3 text-blue-500" />
                              <span className="text-sm font-medium">{suggestion.skill_name}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleApplySuggestion(suggestion)}
                                disabled={adding}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="font-medium">{suggestion.skill_name}</p>
                            {skillDetails?.description && (
                              <p className="text-xs text-muted-foreground mt-1">{skillDetails.description}</p>
                            )}
                            {suggestion.reasoning && (
                              <p className="text-xs italic mt-1">{suggestion.reasoning}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                    {aiSuggestions.length > 8 && (
                      <span className="text-xs text-muted-foreground self-center">
                        +{aiSuggestions.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Add new skill mapping - Simplified */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Link a Skill
                </h4>

                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Label>Search Skills</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or code..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Select Skill</Label>
                    <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSkills.slice(0, 50).map((skill) => (
                          <SelectItem key={skill.id} value={skill.id}>
                            <div className="flex items-center gap-2">
                              <Zap className="h-3 w-3 text-blue-500" />
                              {skill.name}
                              <Badge variant="outline" className="ml-2 text-xs">
                                {skill.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddMapping}
                      disabled={!selectedSkill || adding}
                    >
                      {adding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Current mappings - Simplified table */}
              <div className="space-y-2">
                <h4 className="font-medium">Linked Skills ({mappings.length})</h4>
                <div className="rounded-md border">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : mappings.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      No skills linked yet. Link skills that help develop this competency.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {mappings.map((mapping) => {
                        const skill = mapping.skill as Capability;
                        return (
                          <div key={mapping.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-3 cursor-pointer">
                                  <Zap className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <span className="font-medium">{skill?.name || "Unknown"}</span>
                                    {skill?.category && (
                                      <Badge variant="outline" className="ml-2 text-xs capitalize">
                                        {skill.category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="font-medium">{skill?.name}</p>
                                {skill?.description ? (
                                  <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                                ) : (
                                  <p className="text-xs text-muted-foreground mt-1 italic">No description available</p>
                                )}
                                {skill?.code && (
                                  <p className="text-xs mt-1">Code: {skill.code}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveMapping(mapping.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TooltipProvider>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

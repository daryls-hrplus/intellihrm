import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
import { Link2, X, Plus, Search, GraduationCap, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompetencySkillMappings, CompetencySkillMapping } from "@/hooks/useCapabilities";
import { cn } from "@/lib/utils";

interface CompetencySkillLinkerProps {
  competencyId?: string;
  competencyName: string;
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
  companyId,
  isEditing,
  onMappingsChange,
}: CompetencySkillLinkerProps) {
  const { mappings, loading, fetchMappings, addMapping, removeMapping } = useCompetencySkillMappings();
  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loadingSkills, setLoadingSkills] = useState(false);

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
